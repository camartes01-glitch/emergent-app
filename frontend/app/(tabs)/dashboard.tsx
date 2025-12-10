import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('portfolio');

  const tabs = [
    { id: 'portfolio', label: 'Edit Portfolio', icon: 'create' },
    { id: 'bookings', label: 'View Bookings', icon: 'calendar' },
    { id: 'inventory', label: 'Inventory', icon: 'cube' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'portfolio':
        return <PortfolioTab />;
      case 'bookings':
        return <BookingsTab />;
      case 'inventory':
        return <InventoryTab router={router} />;
      case 'settings':
        return <SettingsTab />;
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Header */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsContainer}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.id)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? Colors.background : Colors.secondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content}>{renderContent()}</ScrollView>
    </View>
  );
}

function PortfolioTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.contentTitle}>Edit Portfolio</Text>
      <Text style={styles.contentText}>
        Add or remove services and update your profile information.
      </Text>
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="add-circle" size={24} color={Colors.primary} />
        <Text style={styles.actionButtonText}>Add Service</Text>
      </TouchableOpacity>
    </View>
  );
}

function BookingsTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.contentTitle}>View Bookings</Text>
      <Text style={styles.contentText}>Manage your bookings and schedule.</Text>
      <TouchableOpacity style={styles.actionButton}>
        <Ionicons name="add-circle" size={24} color={Colors.primary} />
        <Text style={styles.actionButtonText}>Manual Add Booking</Text>
      </TouchableOpacity>
    </View>
  );
}

function InventoryTab({ router }: { router: any }) {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.contentTitle}>Inventory Management</Text>
      <Text style={styles.contentText}>
        Camera Rental Specific: Manage equipment and bookings.
      </Text>

      <TouchableOpacity
        style={styles.inventoryCard}
        onPress={() => router.push('/dashboard/equipment-list')}
      >
        <View style={styles.inventoryCardContent}>
          <Ionicons name="list" size={32} color={Colors.primary} />
          <View style={styles.inventoryCardText}>
            <Text style={styles.inventoryCardTitle}>Equipment Listing</Text>
            <Text style={styles.inventoryCardSubtitle}>View all equipment</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.inventoryCard}
        onPress={() => router.push('/dashboard/inventory-status')}
      >
        <View style={styles.inventoryCardContent}>
          <Ionicons name="apps" size={32} color={Colors.primary} />
          <View style={styles.inventoryCardText}>
            <Text style={styles.inventoryCardTitle}>Inventory Status</Text>
            <Text style={styles.inventoryCardSubtitle}>
              In, Out, Maintenance
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.inventoryCard}
        onPress={() => router.push('/dashboard/rental-bookings')}
      >
        <View style={styles.inventoryCardContent}>
          <Ionicons name="calendar" size={32} color={Colors.primary} />
          <View style={styles.inventoryCardText}>
            <Text style={styles.inventoryCardTitle}>Rental Bookings</Text>
            <Text style={styles.inventoryCardSubtitle}>
              Live booking workflow
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
      </TouchableOpacity>
    </View>
  );
}

function SettingsTab() {
  return (
    <View style={styles.tabContent}>
      <Text style={styles.contentTitle}>Account Settings</Text>
      <Text style={styles.contentText}>
        Manage your account preferences and settings.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabsContainer: {
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingHorizontal: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.secondary,
    marginLeft: 8,
  },
  tabTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 24,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  contentText: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.primary,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 16,
    color: Colors.primary,
    marginLeft: 8,
    fontWeight: '600',
  },
  inventoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  inventoryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  inventoryCardText: {
    marginLeft: 16,
    flex: 1,
  },
  inventoryCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  inventoryCardSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
  },
});