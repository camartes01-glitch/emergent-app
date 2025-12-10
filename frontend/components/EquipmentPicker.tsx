import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { 
  EQUIPMENT_TYPES,
  CAMERA_BRANDS,
  CAMERA_MODELS,
  LENS_BRANDS,
  GIMBAL_BRANDS,
  GIMBAL_MODELS,
  TRIPOD_BRANDS,
  DRONE_BRANDS,
  DRONE_MODELS,
} from '../constants/serviceData';

interface Equipment {
  id: string;
  type: string;
  name: string;
  model: string;
  serviceNumber: string;
}

interface EquipmentPickerProps {
  equipment: Equipment[];
  onEquipmentChange: (equipment: Equipment[]) => void;
}

export default function EquipmentPicker({
  equipment,
  onEquipmentChange,
}: EquipmentPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [name, setName] = useState('');
  const [model, setModel] = useState('');
  const [serviceNumber, setServiceNumber] = useState('');
  const [showBrandPicker, setShowBrandPicker] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);

  // Get available brands based on equipment type
  const getAvailableBrands = () => {
    switch (selectedType) {
      case 'Camera':
        return CAMERA_BRANDS;
      case 'Lenses':
        return LENS_BRANDS;
      case 'Gimbal':
        return GIMBAL_BRANDS;
      case 'Tripod':
        return TRIPOD_BRANDS;
      case 'Drone':
        return DRONE_BRANDS;
      default:
        return [];
    }
  };

  // Get available models based on brand
  const getAvailableModels = () => {
    if (selectedType === 'Camera' && CAMERA_MODELS[selectedBrand]) {
      return CAMERA_MODELS[selectedBrand];
    }
    if (selectedType === 'Gimbal') {
      return GIMBAL_MODELS;
    }
    if (selectedType === 'Drone') {
      return DRONE_MODELS;
    }
    return [];
  };

  // Auto-fill name when brand and model are selected
  React.useEffect(() => {
    if (selectedBrand && selectedModel) {
      setName(`${selectedBrand} ${selectedModel}`);
    }
  }, [selectedBrand, selectedModel]);

  const addEquipment = () => {
    if (!selectedType || !name || !model) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    const newEquipment: Equipment = {
      id: Date.now().toString(),
      type: selectedType,
      name,
      model,
      serviceNumber,
    };

    onEquipmentChange([...equipment, newEquipment]);
    setModalVisible(false);
    resetForm();
  };

  const removeEquipment = (id: string) => {
    onEquipmentChange(equipment.filter((e) => e.id !== id));
  };

  const resetForm = () => {
    setSelectedType('');
    setName('');
    setModel('');
    setServiceNumber('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Equipment / Gear Listing</Text>

      {equipment.map((item) => (
        <View key={item.id} style={styles.equipmentCard}>
          <View style={styles.equipmentInfo}>
            <Text style={styles.equipmentType}>{item.type}</Text>
            <Text style={styles.equipmentDetails}>
              {item.name} - {item.model}
            </Text>
            {item.serviceNumber && (
              <Text style={styles.serviceNumber}>SN: {item.serviceNumber}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => removeEquipment(item.id)}>
            <Ionicons name="trash" size={20} color={Colors.error} />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add-circle" size={24} color={Colors.primary} />
        <Text style={styles.addButtonText}>Add Equipment</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Equipment</Text>

            <Text style={styles.inputLabel}>Equipment Type *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeScroll}>
              {EQUIPMENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.inputLabel}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Equipment name"
              placeholderTextColor={Colors.placeholder}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.inputLabel}>Model *</Text>
            <TextInput
              style={styles.input}
              placeholder="Model number"
              placeholderTextColor={Colors.placeholder}
              value={model}
              onChangeText={setModel}
            />

            <Text style={styles.inputLabel}>Service Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Service number (optional)"
              placeholderTextColor={Colors.placeholder}
              value={serviceNumber}
              onChangeText={setServiceNumber}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={addEquipment}
              >
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  equipmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentType: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  equipmentDetails: {
    fontSize: 14,
    color: Colors.text,
    marginTop: 4,
  },
  serviceNumber: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 14,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 24,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  typeScroll: {
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  typeButtonTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});