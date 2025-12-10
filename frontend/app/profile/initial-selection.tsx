import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';
import { Ionicons } from '@expo/vector-icons';

const FREELANCER_SERVICES = [
  { id: 'photographer', name: 'Photographer', icon: 'camera' },
  { id: 'videographer', name: 'Videographer', icon: 'videocam' },
  { id: 'album_designer', name: 'Album Designer', icon: 'albums' },
  { id: 'video_editor', name: 'Video Editor', icon: 'film' },
  { id: 'web_live_services', name: 'Web Live Services', icon: 'globe' },
  { id: 'led_wall', name: 'LED Wall', icon: 'tv' },
  { id: 'fly_cam', name: 'Fly Cam', icon: 'airplane' },
];

const BUSINESS_SERVICES = [
  { id: 'photography_firm', name: 'Photography Firm', icon: 'business' },
  { id: 'camera_rental', name: 'Camera Rental', icon: 'pricetags' },
  { id: 'service_centres', name: 'Service Centres', icon: 'construct' },
  { id: 'outdoor_studios', name: 'Outdoor Studios', icon: 'home' },
  { id: 'editing_studios', name: 'Editing Studios', icon: 'desktop' },
  { id: 'printing_labs', name: 'Printing Labs', icon: 'print' },
  { id: 'software', name: 'Software', icon: 'code-slash' },
  { id: 'oem', name: 'OEM', icon: 'hardware-chip' },
];

export default function InitialSelectionScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [profileType, setProfileType] = useState<string[]>([]);
  const [selectedFreelancerServices, setSelectedFreelancerServices] = useState<
    string[]
  >([]);
  const [selectedBusinessServices, setSelectedBusinessServices] = useState<
    string[]
  >([]);
  const [loading, setLoading] = useState(false);

  const toggleProfileType = (type: string) => {
    if (profileType.includes(type)) {
      setProfileType(profileType.filter((t) => t !== type));
      if (type === 'freelancer') {
        setSelectedFreelancerServices([]);
      } else {
        setSelectedBusinessServices([]);
      }
    } else {
      setProfileType([...profileType, type]);
    }
  };

  const toggleService = (
    serviceId: string,
    type: 'freelancer' | 'business'
  ) => {
    if (type === 'freelancer') {
      if (selectedFreelancerServices.includes(serviceId)) {
        setSelectedFreelancerServices(
          selectedFreelancerServices.filter((s) => s !== serviceId)
        );
      } else {
        setSelectedFreelancerServices([...selectedFreelancerServices, serviceId]);
      }
    } else {
      if (selectedBusinessServices.includes(serviceId)) {
        setSelectedBusinessServices(
          selectedBusinessServices.filter((s) => s !== serviceId)
        );
      } else {
        setSelectedBusinessServices([...selectedBusinessServices, serviceId]);
      }
    }
  };

  const handleSubmit = async () => {
    if (profileType.length === 0) {
      Alert.alert('Error', 'Please select at least one profile type');
      return;
    }

    if (
      profileType.includes('freelancer') &&
      selectedFreelancerServices.length === 0
    ) {
      Alert.alert('Error', 'Please select at least one freelancer service');
      return;
    }

    if (
      profileType.includes('business') &&
      selectedBusinessServices.length === 0
    ) {
      Alert.alert('Error', 'Please select at least one business service');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/profile/initial-selection', {
        userId: user?.id,
        profileType,
        freelancerServices: selectedFreelancerServices,
        businessServices: selectedBusinessServices,
      });
      
      // Navigate to advanced profile building
      router.push('/profile/advanced-profile');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to save profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Build Your Profile</Text>
        <Text style={styles.subtitle}>Select your profile type and services</Text>

        {/* Profile Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Type (Can choose both)</Text>
          <View style={styles.profileTypeContainer}>
            <TouchableOpacity
              style={[
                styles.profileTypeButton,
                profileType.includes('freelancer') &&
                  styles.profileTypeButtonActive,
              ]}
              onPress={() => toggleProfileType('freelancer')}
            >
              <Ionicons
                name="person"
                size={32}
                color={
                  profileType.includes('freelancer')
                    ? Colors.background
                    : Colors.primary
                }
              />
              <Text
                style={[
                  styles.profileTypeText,
                  profileType.includes('freelancer') &&
                    styles.profileTypeTextActive,
                ]}
              >
                Freelancer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.profileTypeButton,
                profileType.includes('business') && styles.profileTypeButtonActive,
              ]}
              onPress={() => toggleProfileType('business')}
            >
              <Ionicons
                name="briefcase"
                size={32}
                color={
                  profileType.includes('business')
                    ? Colors.background
                    : Colors.primary
                }
              />
              <Text
                style={[
                  styles.profileTypeText,
                  profileType.includes('business') &&
                    styles.profileTypeTextActive,
                ]}
              >
                Business
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Freelancer Services */}
        {profileType.includes('freelancer') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Freelancer Services (Can choose multiple)
            </Text>
            <View style={styles.servicesGrid}>
              {FREELANCER_SERVICES.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    selectedFreelancerServices.includes(service.id) &&
                      styles.serviceCardActive,
                  ]}
                  onPress={() => toggleService(service.id, 'freelancer')}
                >
                  <Ionicons
                    name={service.icon as any}
                    size={32}
                    color={
                      selectedFreelancerServices.includes(service.id)
                        ? Colors.background
                        : Colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.serviceCardText,
                      selectedFreelancerServices.includes(service.id) &&
                        styles.serviceCardTextActive,
                    ]}
                  >
                    {service.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Business Services */}
        {profileType.includes('business') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Business Services (Can choose multiple)
            </Text>
            <View style={styles.servicesGrid}>
              {BUSINESS_SERVICES.map((service) => (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    selectedBusinessServices.includes(service.id) &&
                      styles.serviceCardActive,
                  ]}
                  onPress={() => toggleService(service.id, 'business')}
                >
                  <Ionicons
                    name={service.icon as any}
                    size={32}
                    color={
                      selectedBusinessServices.includes(service.id)
                        ? Colors.background
                        : Colors.primary
                    }
                  />
                  <Text
                    style={[
                      styles.serviceCardText,
                      selectedBusinessServices.includes(service.id) &&
                        styles.serviceCardTextActive,
                    ]}
                  >
                    {service.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Saving...' : 'Continue to Advanced Profile'}
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
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.secondary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  profileTypeContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  profileTypeButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  profileTypeButtonActive: {
    backgroundColor: Colors.primary,
  },
  profileTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  profileTypeTextActive: {
    color: Colors.background,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '47%',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  serviceCardActive: {
    backgroundColor: Colors.primary,
  },
  serviceCardText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
    textAlign: 'center',
  },
  serviceCardTextActive: {
    color: Colors.background,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});