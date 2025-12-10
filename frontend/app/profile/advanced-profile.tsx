import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../stores/authStore';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICE_NAMES: Record<string, string> = {
  photographer: 'Photographer',
  videographer: 'Videographer',
  album_designer: 'Album Designer',
  video_editor: 'Video Editor',
  web_live_services: 'Web Live Services',
  led_wall: 'LED Wall',
  fly_cam: 'Fly Cam',
  photography_firm: 'Photography Firm',
  camera_rental: 'Camera Rental',
  service_centres: 'Service Centres',
  outdoor_studios: 'Outdoor Studios',
  editing_studios: 'Editing Studios',
  printing_labs: 'Printing Labs',
  software: 'Software',
  oem: 'OEM',
};

const SERVICE_ROUTES: Record<string, string> = {
  // Freelancer Services
  photographer: '/profile/services/photographer',
  videographer: '/profile/services/photographer',
  album_designer: '/profile/services/album-designer',
  video_editor: '/profile/services/video-editor',
  web_live_services: '/profile/services/web-live-services',
  led_wall: '/profile/services/led-wall',
  fly_cam: '/profile/services/fly-cam',
  // Business Services
  photography_firm: '/profile/services/photography-firm',
  camera_rental: '/profile/services/camera-rental',
  // Service Centres, Outdoor Studios, Editing Studios, Printing Labs - Coming Soon
};

export default function AdvancedProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [allServices, setAllServices] = useState<string[]>([]);
  const [completedServices, setCompletedServices] = useState<string[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get(`/profile/${user?.id}`);
      setProfile(response.data);
      
      // Combine all selected services
      const services = [
        ...(response.data.freelancerServices || []),
        ...(response.data.businessServices || []),
      ];
      setAllServices(services);
    } catch (error) {
      console.log('No profile found yet');
    } finally {
      setLoading(false);
    }
  };

  const handleContinueLater = () => {
    updateUser({ profileCompleted: true });
    router.replace('/(tabs)/home');
  };

  const handleStartProfile = () => {
    if (allServices.length === 0) {
      Alert.alert('Error', 'No services selected');
      return;
    }
    
    const firstService = allServices[0];
    navigateToService(firstService);
  };

  const navigateToService = (serviceId: string) => {
    const route = SERVICE_ROUTES[serviceId];
    if (route) {
      router.push(route as any);
    } else {
      // Service form not implemented yet - mark as completed and move to next
      Alert.alert(
        'Coming Soon',
        `${SERVICE_NAMES[serviceId]} profile form is under development. Marking as completed.`,
        [
          {
            text: 'OK',
            onPress: () => {
              markServiceCompleted(serviceId);
            },
          },
        ]
      );
    }
  };

  const markServiceCompleted = (serviceId: string) => {
    const newCompleted = [...completedServices, serviceId];
    setCompletedServices(newCompleted);
    
    const nextIndex = allServices.indexOf(serviceId) + 1;
    if (nextIndex < allServices.length) {
      // Move to next service
      setCurrentStep(nextIndex);
      setTimeout(() => {
        navigateToService(allServices[nextIndex]);
      }, 500);
    } else {
      // All services completed
      Alert.alert(
        'Profile Complete',
        'All service profiles have been completed!',
        [
          {
            text: 'Go to Home',
            onPress: () => {
              updateUser({ profileCompleted: true });
              router.replace('/(tabs)/home');
            },
          },
        ]
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const progressPercentage = allServices.length > 0 
    ? (completedServices.length / allServices.length) * 100 
    : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Advanced Profile Building</Text>
        <Text style={styles.subtitle}>
          Complete your profile for each selected service - one by one
        </Text>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {completedServices.length} of {allServices.length} completed
          </Text>
        </View>

        {/* Service List with Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Selected Services</Text>
          {allServices.map((service, index) => {
            const isCompleted = completedServices.includes(service);
            const isCurrent = index === currentStep && !isCompleted;
            
            return (
              <View
                key={service}
                style={[
                  styles.serviceItem,
                  isCompleted && styles.serviceItemCompleted,
                  isCurrent && styles.serviceItemCurrent,
                ]}
              >
                <View style={styles.serviceInfo}>
                  <View style={styles.serviceNumber}>
                    {isCompleted ? (
                      <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
                    ) : (
                      <Text style={styles.serviceNumberText}>{index + 1}</Text>
                    )}
                  </View>
                  <Text style={styles.serviceName}>
                    {SERVICE_NAMES[service] || service}
                  </Text>
                </View>
                {isCurrent && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>CURRENT</Text>
                  </View>
                )}
                {isCompleted && (
                  <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                )}
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        {completedServices.length === 0 ? (
          <TouchableOpacity style={styles.button} onPress={handleStartProfile}>
            <Text style={styles.buttonText}>Start Profile Building</Text>
          </TouchableOpacity>
        ) : completedServices.length < allServices.length ? (
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => navigateToService(allServices[currentStep])}
          >
            <Text style={styles.buttonText}>Continue with Next Service</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.button} 
            onPress={() => {
              updateUser({ profileCompleted: true });
              router.replace('/(tabs)/home');
            }}
          >
            <Text style={styles.buttonText}>Complete & Go to Home</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={handleContinueLater}>
          <Text style={styles.secondaryButtonText}>Continue Later</Text>
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
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    marginBottom: 32,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  serviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.textLight,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: Colors.textLight,
    textAlign: 'center',
  },
  serviceNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serviceNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  serviceItemCompleted: {
    backgroundColor: '#F0FFF4',
    borderColor: Colors.success,
  },
  serviceItemCurrent: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  currentBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.background,
  },
});