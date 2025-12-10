import React, { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

const SERVICE_ROUTES: Record<string, string> = {
  photographer: '/profile/services/photographer',
  videographer: '/profile/services/photographer', // Reuse photographer form
  camera_rental: '/profile/services/camera-rental',
  // Add other services as needed
};

export default function AdvancedProfileScreen() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await api.get(`/profile/${user?.id}`);
      setProfile(response.data);
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

  const handleSubmit = async () => {
    updateUser({ profileCompleted: true });
    router.replace('/(tabs)/home');
  };

  const navigateToService = (serviceId: string) => {
    const route = SERVICE_ROUTES[serviceId];
    if (route) {
      router.push(route as any);
    } else {
      Alert.alert('Coming Soon', `${serviceId} profile form is under development`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Advanced Profile Building</Text>
        <Text style={styles.subtitle}>
          Complete your profile for each selected service
        </Text>

        {/* Freelancer Services */}
        {profile?.freelancerServices && profile.freelancerServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Freelancer Services</Text>
            {profile.freelancerServices.map((service: string) => (
              <TouchableOpacity
                key={service}
                style={styles.serviceItem}
                onPress={() => navigateToService(service)}
              >
                <View style={styles.serviceInfo}>
                  <Ionicons name="camera" size={24} color={Colors.primary} />
                  <Text style={styles.serviceName}>
                    {service.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Business Services */}
        {profile?.businessServices && profile.businessServices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Services</Text>
            {profile.businessServices.map((service: string) => (
              <TouchableOpacity
                key={service}
                style={styles.serviceItem}
                onPress={() => navigateToService(service)}
              >
                <View style={styles.serviceInfo}>
                  <Ionicons name="briefcase" size={24} color={Colors.primary} />
                  <Text style={styles.serviceName}>
                    {service.replace('_', ' ').toUpperCase()}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Complete Profile</Text>
        </TouchableOpacity>

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
});