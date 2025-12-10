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
import { WEB_LIVE_QUALITIES } from '../../../constants/serviceData';
import api from '../../../services/api';

export default function WebLiveServicesProfileScreen() {
  const router = useRouter();
  const [workLinks, setWorkLinks] = useState<string[]>(['']);
  const [selectedQualities, setSelectedQualities] = useState<string[]>([]);
  const [pricing, setPricing] = useState({
    sixHours: '',
    eightHours: '',
    twelveHours: '',
  });
  const [loading, setLoading] = useState(false);

  const addLinkField = () => {
    if (workLinks.length < 10) {
      setWorkLinks([...workLinks, '']);
    }
  };

  const updateLink = (index: number, value: string) => {
    const newLinks = [...workLinks];
    newLinks[index] = value;
    setWorkLinks(newLinks);
  };

  const removeLink = (index: number) => {
    setWorkLinks(workLinks.filter((_, i) => i !== index));
  };

  const toggleQuality = (quality: string) => {
    if (selectedQualities.includes(quality)) {
      setSelectedQualities(selectedQualities.filter((q) => q !== quality));
    } else {
      setSelectedQualities([...selectedQualities, quality]);
    }
  };

  const handleSubmit = async () => {
    const validLinks = workLinks.filter((link) => link.trim() !== '');
    if (validLinks.length < 5) {
      Alert.alert('Error', 'Please add at least 5 work links');
      return;
    }
    if (selectedQualities.length === 0) {
      Alert.alert('Error', 'Please select at least one service quality');
      return;
    }
    if (!pricing.sixHours || !pricing.eightHours || !pricing.twelveHours) {
      Alert.alert('Error', 'Please fill all pricing fields');
      return;
    }

    setLoading(true);
    try {
      await api.post('/profile/web-live-services', {
        workLinks: validLinks,
        serviceQualities: selectedQualities,
        pricing,
      });
      Alert.alert('Success', 'Web Live Services profile saved successfully');
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
        <Text style={styles.title}>Web Live Services Profile</Text>

        {/* Work Links */}
        <View style={styles.section}>
          <Text style={styles.label}>Work Links * (Min 5, Max 10)</Text>
          {workLinks.map((link, index) => (
            <View key={index} style={styles.linkRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder={`Link ${index + 1}`}
                placeholderTextColor={Colors.placeholder}
                value={link}
                onChangeText={(text) => updateLink(index, text)}
                autoCapitalize="none"
              />
              {workLinks.length > 1 && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeLink(index)}
                >
                  <Text style={styles.removeButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          {workLinks.length < 10 && (
            <TouchableOpacity style={styles.addButton} onPress={addLinkField}>
              <Text style={styles.addButtonText}>+ Add Link</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Service Quality */}
        <View style={styles.section}>
          <Text style={styles.label}>Service Quality * (Select multiple)</Text>
          <View style={styles.qualitiesGrid}>
            {WEB_LIVE_QUALITIES.map((quality) => (
              <TouchableOpacity
                key={quality}
                style={[
                  styles.qualityChip,
                  selectedQualities.includes(quality) && styles.qualityChipActive,
                ]}
                onPress={() => toggleQuality(quality)}
              >
                <Text
                  style={[
                    styles.qualityChipText,
                    selectedQualities.includes(quality) && styles.qualityChipTextActive,
                  ]}
                >
                  {quality}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.label}>Pricing per Service (INR) *</Text>
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
    marginBottom: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  removeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.error,
    borderRadius: 8,
  },
  removeButtonText: {
    color: Colors.background,
    fontSize: 18,
    fontWeight: 'bold',
  },
  addButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 8,
    marginTop: 8,
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  qualitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  qualityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  qualityChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  qualityChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  qualityChipTextActive: {
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