import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../../constants/colors';
import { PHOTOGRAPHER_STYLES } from '../../../constants/serviceData';
import ImagePickerComponent from '../../../components/ImagePickerComponent';
import EquipmentPicker from '../../../components/EquipmentPicker';
import api from '../../../services/api';

export default function PhotographerProfileScreen() {
  const router = useRouter();
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [workImages, setWorkImages] = useState<string[]>([]);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [pricing, setPricing] = useState({
    sixHours: '',
    eightHours: '',
    twelveHours: '',
  });
  const [loading, setLoading] = useState(false);

  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      setSelectedStyles(selectedStyles.filter((s) => s !== style));
    } else {
      setSelectedStyles([...selectedStyles, style]);
    }
  };

  const handleSubmit = async () => {
    if (!yearsOfExperience) {
      Alert.alert('Error', 'Please enter years of experience');
      return;
    }
    if (selectedStyles.length === 0) {
      Alert.alert('Error', 'Please select at least one photography style');
      return;
    }
    if (workImages.length < 5) {
      Alert.alert('Error', 'Please upload at least 5 work samples');
      return;
    }
    if (!pricing.sixHours || !pricing.eightHours || !pricing.twelveHours) {
      Alert.alert('Error', 'Please fill all pricing fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/profile/photographer', {
        yearsOfExperience: parseInt(yearsOfExperience),
        styles: selectedStyles,
        workSamples: workImages,
        equipment,
        pricing,
      });
      Alert.alert('Success', 'Photographer profile saved successfully', [
        {
          text: 'OK',
          onPress: () => router.replace('/profile/advanced-profile'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save profile');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Photographer Profile</Text>

        {/* Years of Experience */}
        <View style={styles.section}>
          <Text style={styles.label}>Years of Experience *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter years"
            placeholderTextColor={Colors.placeholder}
            value={yearsOfExperience}
            onChangeText={setYearsOfExperience}
            keyboardType="number-pad"
          />
        </View>

        {/* Photography Styles */}
        <View style={styles.section}>
          <Text style={styles.label}>Photography Styles * (Select multiple)</Text>
          <View style={styles.stylesGrid}>
            {PHOTOGRAPHER_STYLES.map((style) => (
              <TouchableOpacity
                key={style}
                style={[
                  styles.styleChip,
                  selectedStyles.includes(style) && styles.styleChipActive,
                ]}
                onPress={() => toggleStyle(style)}
              >
                <Text
                  style={[
                    styles.styleChipText,
                    selectedStyles.includes(style) && styles.styleChipTextActive,
                  ]}
                >
                  {style}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Work Samples */}
        <ImagePickerComponent
          minFiles={5}
          maxFiles={10}
          images={workImages}
          onImagesChange={setWorkImages}
          label="Upload Work Samples"
        />

        {/* Equipment */}
        <EquipmentPicker equipment={equipment} onEquipmentChange={setEquipment} />

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.label}>Pricing (INR) *</Text>
          <View style={styles.pricingRow}>
            <View style={styles.pricingField}>
              <Text style={styles.pricingLabel}>6 Hours</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount"
                placeholderTextColor={Colors.placeholder}
                value={pricing.sixHours}
                onChangeText={(text) => setPricing({ ...pricing, sixHours: text })}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.pricingField}>
              <Text style={styles.pricingLabel}>8 Hours</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount"
                placeholderTextColor={Colors.placeholder}
                value={pricing.eightHours}
                onChangeText={(text) => setPricing({ ...pricing, eightHours: text })}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.pricingField}>
              <Text style={styles.pricingLabel}>12 Hours</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount"
                placeholderTextColor={Colors.placeholder}
                value={pricing.twelveHours}
                onChangeText={(text) => setPricing({ ...pricing, twelveHours: text })}
                keyboardType="number-pad"
              />
            </View>
          </View>
        </View>

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
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: Colors.background,
  },
  stylesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  styleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  styleChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  styleChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  styleChipTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  pricingRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pricingField: {
    flex: 1,
  },
  pricingLabel: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 4,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});