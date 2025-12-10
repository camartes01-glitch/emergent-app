import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const BUSINESS_SERVICES = [
  { id: 'photography_firm', name: 'Photography Firm', icon: 'business' },
  { id: 'camera_rental', name: 'Camera Rental', icon: 'pricetags' },
  { id: 'service_centres', name: 'Service Centres', icon: 'construct' },
  { id: 'outdoor_studios', name: 'Outdoor Studios', icon: 'home' },
  { id: 'editing_studios', name: 'Editing Studios', icon: 'desktop' },
  { id: 'printing_labs', name: 'Printing Labs', icon: 'print' },
];

const FREELANCER_SERVICES = [
  { id: 'photographer', name: 'Photographer', icon: 'camera' },
  { id: 'videographer', name: 'Videographer', icon: 'videocam' },
  { id: 'album_designer', name: 'Album Designer', icon: 'albums' },
  { id: 'video_editor', name: 'Video Editor', icon: 'film' },
  { id: 'web_live_services', name: 'Web Live Services', icon: 'globe' },
  { id: 'led_wall', name: 'LED Wall', icon: 'tv' },
];

export default function HomeScreen() {
  const [showAllBusiness, setShowAllBusiness] = React.useState(false);
  const [showAllFreelancer, setShowAllFreelancer] = React.useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Ad Banner */}
      <View style={styles.bannerContainer}>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Welcome to CAMARTES</Text>
          <Text style={styles.bannerSubtext}>Photography Ecosystem</Text>
        </View>
      </View>

      {/* Business Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Services</Text>
        <View style={styles.servicesGrid}>
          {(showAllBusiness
            ? BUSINESS_SERVICES
            : BUSINESS_SERVICES.slice(0, 6)
          ).map((service) => (
            <TouchableOpacity key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceIconContainer}>
                <Ionicons
                  name={service.icon as any}
                  size={32}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.serviceCardText}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {BUSINESS_SERVICES.length > 6 && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setShowAllBusiness(!showAllBusiness)}
          >
            <Text style={styles.moreButtonText}>
              {showAllBusiness ? 'Show Less' : 'More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Freelancer Services */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Freelancer Services</Text>
        <View style={styles.servicesGrid}>
          {(showAllFreelancer
            ? FREELANCER_SERVICES
            : FREELANCER_SERVICES.slice(0, 6)
          ).map((service) => (
            <TouchableOpacity key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceIconContainer}>
                <Ionicons
                  name={service.icon as any}
                  size={32}
                  color={Colors.primary}
                />
              </View>
              <Text style={styles.serviceCardText}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {FREELANCER_SERVICES.length > 6 && (
          <TouchableOpacity
            style={styles.moreButton}
            onPress={() => setShowAllFreelancer(!showAllFreelancer)}
          >
            <Text style={styles.moreButtonText}>
              {showAllFreelancer ? 'Show Less' : 'More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Events & Blogs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Events & Blogs</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[1, 2, 3].map((item) => (
            <TouchableOpacity key={item} style={styles.eventCard}>
              <View style={styles.eventImagePlaceholder}>
                <Ionicons name="images" size={48} color={Colors.secondary} />
              </View>
              <Text style={styles.eventTitle}>Event/Blog {item}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  bannerContainer: {
    padding: 16,
  },
  banner: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  bannerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.background,
  },
  bannerSubtext: {
    fontSize: 16,
    color: Colors.background,
    marginTop: 8,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: (width - 56) / 3,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceCardText: {
    fontSize: 11,
    color: Colors.text,
    textAlign: 'center',
  },
  moreButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 16,
  },
  moreButtonText: {
    color: Colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  eventCard: {
    width: 200,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  eventImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventTitle: {
    padding: 12,
    fontSize: 14,
    color: Colors.text,
  },
});