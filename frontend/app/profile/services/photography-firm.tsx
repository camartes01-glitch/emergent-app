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
import { PHOTOGRAPHY_FIRM_SERVICES } from '../../../constants/serviceData';
import ImagePickerComponent from '../../../components/ImagePickerComponent';
import api from '../../../services/api';

export default function PhotographyFirmProfileScreen() {
  const router = useRouter();
  const [yearsOfExperience, setYearsOfExperience] = useState('');
  const [workImages, setWorkImages] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [pricing, setPricing] = useState({
    perEvent: '',
    perAlbum: '',
    perVideo: '',
  });
  const [loading, setLoading] = useState(false);

  const toggleService = (service: string) => {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter((s) => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  };

  const handleSubmit = async () => {
    if (!yearsOfExperience) {
      Alert.alert('Error', 'Please enter years of experience');
      return;
    }
    if (workImages.length < 5) {
      Alert.alert('Error', 'Please upload at least 5 work samples');
      return;
    }
    if (selectedServices.length === 0) {
      Alert.alert('Error', 'Please select at least one service type');
      return;
    }
    if (!pricing.perEvent || !pricing.perAlbum || !pricing.perVideo) {
      Alert.alert('Error', 'Please fill all pricing fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/profile/photography-firm', {
        yearsOfExperience: parseInt(yearsOfExperience),
        workSamples: workImages,
        serviceTypes: selectedServices,
        pricing,
      });
      Alert.alert('Success', 'Photography Firm profile saved successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Photography Firm Profile</Text>

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

        {/* Work Samples */}
        <ImagePickerComponent
          minFiles={5}
          maxFiles={10}
          images={workImages}
          onImagesChange={setWorkImages}
          label="Upload Work Samples"
        />

        {/* Service Types */}
        <View style={styles.section}>
          <Text style={styles.label}>Service Types * (Select multiple)</Text>
          <View style={styles.servicesGrid}>
            {PHOTOGRAPHY_FIRM_SERVICES.map((service) => (
              <TouchableOpacity
                key={service}
                style={[
                  styles.serviceChip,
                  selectedServices.includes(service) && styles.serviceChipActive,
                ]}
                onPress={() => toggleService(service)}
              >
                <Text
                  style={[
                    styles.serviceChipText,
                    selectedServices.includes(service) && styles.serviceChipTextActive,
                  ]}
                >
                  {service}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.label}>Pricing (INR) *</Text>
          <View style={styles.pricingColumn}>
            <View style={styles.pricingField}>
              <Text style={styles.pricingLabel}>Per Event</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount"
                placeholderTextColor={Colors.placeholder}
                value={pricing.perEvent}
                onChangeText={(text) => setPricing({ ...pricing, perEvent: text })}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.pricingField}>
              <Text style={styles.pricingLabel}>Per Album</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount"
                placeholderTextColor={Colors.placeholder}
                value={pricing.perAlbum}
                onChangeText={(text) => setPricing({ ...pricing, perAlbum: text })}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.pricingField}>
              <Text style={styles.pricingLabel}>Per Video</Text>
              <TextInput
                style={styles.input}
                placeholder="Amount"
                placeholderTextColor={Colors.placeholder}
                value={pricing.perVideo}
                onChangeText={(text) => setPricing({ ...pricing, perVideo: text })}
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
    marginBottom: 12,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  serviceChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  serviceChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  serviceChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  serviceChipTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  pricingColumn: {
    gap: 12,
  },
  pricingField: {
    marginBottom: 8,
  },
  pricingLabel: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
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