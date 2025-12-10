import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { 
  CAMERA_BRANDS,
  CAMERA_MODELS,
  LENS_BRANDS,
  GIMBAL_BRANDS,
  GIMBAL_MODELS,
  TRIPOD_BRANDS,
  LIGHTING_BRANDS,
} from '../../../constants/serviceData';
import ImagePickerComponent from '../../../components/ImagePickerComponent';
import api from '../../../services/api';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect } from 'react';

interface RentalEquipment {
  id: string;
  category: 'camera' | 'lens' | 'lighting' | 'gimbal' | 'tripod';
  brand: string;
  model: string;
  serviceNumber: string;
  pricing: {
    sixHours: string;
    eightHours: string;
    twelveHours: string;
    twentyFourHours: string;
  };
  images: string[];
}

export default function CameraRentalProfileScreen() {
  const router = useRouter();
  const [equipment, setEquipment] = useState<RentalEquipment[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentEquipment, setCurrentEquipment] = useState<RentalEquipment>({
    id: '',
    category: 'camera',
    brand: '',
    model: '',
    serviceNumber: '',
    pricing: { sixHours: '', eightHours: '', twelveHours: '', twentyFourHours: '' },
    images: [],
  });
  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'camera', label: 'Camera' },
    { value: 'lens', label: 'Lens' },
    { value: 'lighting', label: 'Lighting' },
    { value: 'gimbal', label: 'Gimbal' },
    { value: 'tripod', label: 'Tripod' },
  ];

  // Get available brands based on category
  const getAvailableBrands = () => {
    switch (currentEquipment.category) {
      case 'camera':
        return CAMERA_BRANDS;
      case 'lens':
        return LENS_BRANDS;
      case 'gimbal':
        return GIMBAL_BRANDS;
      case 'tripod':
        return TRIPOD_BRANDS;
      case 'lighting':
        return LIGHTING_BRANDS;
      default:
        return [];
    }
  };

  // Get available models based on brand and category
  const getAvailableModels = () => {
    if (currentEquipment.category === 'camera' && CAMERA_MODELS[currentEquipment.brand]) {
      return CAMERA_MODELS[currentEquipment.brand];
    }
    if (currentEquipment.category === 'gimbal') {
      return GIMBAL_MODELS;
    }
    return [];
  };

  // Auto-fill model when brand and model are selected (for display only)
  useEffect(() => {
    if (currentEquipment.brand && currentEquipment.model) {
      console.log('Camera Rental Auto-fill:', `${currentEquipment.brand} ${currentEquipment.model}`);
    }
  }, [currentEquipment.brand, currentEquipment.model]);

  const addEquipment = () => {
    if (!currentEquipment.brand || !currentEquipment.model || !currentEquipment.serviceNumber) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }
    if (!currentEquipment.pricing.sixHours || !currentEquipment.pricing.twentyFourHours) {
      Alert.alert('Error', 'Please fill all pricing fields');
      return;
    }

    const newEquipment = { ...currentEquipment, id: Date.now().toString() };
    setEquipment([...equipment, newEquipment]);
    setModalVisible(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentEquipment({
      id: '',
      category: 'camera',
      brand: '',
      model: '',
      serviceNumber: '',
      pricing: { sixHours: '', eightHours: '', twelveHours: '', twentyFourHours: '' },
      images: [],
    });
  };

  const removeEquipment = (id: string) => {
    setEquipment(equipment.filter((e) => e.id !== id));
  };

  const handleSubmit = async () => {
    if (equipment.length === 0) {
      Alert.alert('Error', 'Please add at least one equipment');
      return;
    }

    setLoading(true);
    try {
      await api.post('/profile/camera-rental', { equipment });
      
      // Mark service as completed
      const completedStr = await AsyncStorage.getItem('completed_services');
      const completed = completedStr ? JSON.parse(completedStr) : [];
      if (!completed.includes('camera_rental')) {
        completed.push('camera_rental');
        await AsyncStorage.setItem('completed_services', JSON.stringify(completed));
      }
      
      Alert.alert('Success', 'Camera rental profile saved successfully', [
        {
          text: 'OK',
          onPress: () => router.replace('/profile/advanced-profile'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Camera Rental Profile</Text>
        <Text style={styles.subtitle}>Add your rental equipment with pricing</Text>

        {/* Equipment List */}
        {equipment.map((item) => (
          <View key={item.id} style={styles.equipmentCard}>
            <View style={styles.equipmentHeader}>
              <Text style={styles.equipmentCategory}>{item.category.toUpperCase()}</Text>
              <TouchableOpacity onPress={() => removeEquipment(item.id)}>
                <Ionicons name="trash" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
            <Text style={styles.equipmentTitle}>{item.brand} {item.model}</Text>
            <Text style={styles.equipmentSN}>SN: {item.serviceNumber}</Text>
            <Text style={styles.equipmentPrice}>
              ₹{item.pricing.sixHours}/6h | ₹{item.pricing.twentyFourHours}/24h
            </Text>
          </View>
        ))}

        {/* Add Equipment Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
          <Text style={styles.addButtonText}>Add Equipment</Text>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving...' : 'Save Profile'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Equipment Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Equipment</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {/* Category */}
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[
                    styles.categoryChip,
                    currentEquipment.category === cat.value && styles.categoryChipActive,
                  ]}
                  onPress={() =>
                    setCurrentEquipment({ ...currentEquipment, category: cat.value as any })
                  }
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      currentEquipment.category === cat.value &&
                        styles.categoryChipTextActive,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Brand */}
            <Text style={styles.label}>Brand *</Text>
            <TextInput
              style={styles.input}
              placeholder="Select or enter brand"
              placeholderTextColor={Colors.placeholder}
              value={currentEquipment.brand}
              onChangeText={(text) =>
                setCurrentEquipment({ ...currentEquipment, brand: text })
              }
            />

            {/* Model */}
            <Text style={styles.label}>Model Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter model name"
              placeholderTextColor={Colors.placeholder}
              value={currentEquipment.model}
              onChangeText={(text) =>
                setCurrentEquipment({ ...currentEquipment, model: text })
              }
            />

            {/* Service Number */}
            <Text style={styles.label}>Service Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter service number"
              placeholderTextColor={Colors.placeholder}
              value={currentEquipment.serviceNumber}
              onChangeText={(text) =>
                setCurrentEquipment({ ...currentEquipment, serviceNumber: text })
              }
            />

            {/* Pricing */}
            <Text style={styles.label}>Pricing (INR) *</Text>
            <View style={styles.pricingGrid}>
              <View style={styles.pricingField}>
                <Text style={styles.pricingLabel}>6 Hours</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  placeholderTextColor={Colors.placeholder}
                  value={currentEquipment.pricing.sixHours}
                  onChangeText={(text) =>
                    setCurrentEquipment({
                      ...currentEquipment,
                      pricing: { ...currentEquipment.pricing, sixHours: text },
                    })
                  }
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.pricingField}>
                <Text style={styles.pricingLabel}>8 Hours</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  placeholderTextColor={Colors.placeholder}
                  value={currentEquipment.pricing.eightHours}
                  onChangeText={(text) =>
                    setCurrentEquipment({
                      ...currentEquipment,
                      pricing: { ...currentEquipment.pricing, eightHours: text },
                    })
                  }
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.pricingField}>
                <Text style={styles.pricingLabel}>12 Hours</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  placeholderTextColor={Colors.placeholder}
                  value={currentEquipment.pricing.twelveHours}
                  onChangeText={(text) =>
                    setCurrentEquipment({
                      ...currentEquipment,
                      pricing: { ...currentEquipment.pricing, twelveHours: text },
                    })
                  }
                  keyboardType="number-pad"
                />
              </View>
              <View style={styles.pricingField}>
                <Text style={styles.pricingLabel}>24 Hours</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Amount"
                  placeholderTextColor={Colors.placeholder}
                  value={currentEquipment.pricing.twentyFourHours}
                  onChangeText={(text) =>
                    setCurrentEquipment({
                      ...currentEquipment,
                      pricing: { ...currentEquipment.pricing, twentyFourHours: text },
                    })
                  }
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Equipment Images */}
            <ImagePickerComponent
              minFiles={1}
              maxFiles={7}
              images={currentEquipment.images}
              onImagesChange={(images) =>
                setCurrentEquipment({ ...currentEquipment, images })
              }
              label="Equipment Photos"
            />

            {/* Add Button */}
            <TouchableOpacity style={styles.modalAddButton} onPress={addEquipment}>
              <Text style={styles.modalAddButtonText}>Add Equipment</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 24,
  },
  equipmentCard: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  equipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  equipmentCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  equipmentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  equipmentSN: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  equipmentPrice: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 8,
    marginVertical: 16,
  },
  addButtonText: {
    fontSize: 16,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalContent: {
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  categoryChipTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  pricingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pricingField: {
    width: '47%',
  },
  pricingLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  modalAddButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  modalAddButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});