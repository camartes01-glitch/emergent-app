import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';

interface InventoryItem {
  id: string;
  equipmentName: string;
  category: string;
  status: 'in' | 'out' | 'maintenance';
  rentalInfo?: {
    seekerName: string;
    phone: string;
    location: string;
    startDate: string;
    endDate: string;
  };
}

export default function InventoryStatusScreen() {
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/inventory/status');
      setInventory(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in':
        return Colors.success;
      case 'out':
        return Colors.error;
      case 'maintenance':
        return '#FF9500';
      default:
        return Colors.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in':
        return 'checkmark-circle';
      case 'out':
        return 'arrow-forward-circle';
      case 'maintenance':
        return 'construct';
      default:
        return 'help-circle';
    }
  };

  const filteredInventory = filterStatus === 'all'
    ? inventory
    : inventory.filter((item) => item.status === filterStatus);

  const statusCounts = {
    all: inventory.length,
    in: inventory.filter((i) => i.status === 'in').length,
    out: inventory.filter((i) => i.status === 'out').length,
    maintenance: inventory.filter((i) => i.status === 'maintenance').length,
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Inventory Status</Text>
        <TouchableOpacity onPress={loadInventory}>
          <Ionicons name="refresh" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        {[
          { key: 'all', label: 'All' },
          { key: 'in', label: 'In' },
          { key: 'out', label: 'Out' },
          { key: 'maintenance', label: 'Maintenance' },
        ].map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterButton,
              filterStatus === filter.key && styles.filterButtonActive,
            ]}
            onPress={() => setFilterStatus(filter.key)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filterStatus === filter.key && styles.filterButtonTextActive,
              ]}
            >
              {filter.label} ({statusCounts[filter.key as keyof typeof statusCounts]})
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Inventory List */}
      <ScrollView style={styles.content}>
        {filteredInventory.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.inventoryCard}
            onPress={() => {
              if (item.status === 'out' && item.rentalInfo) {
                Alert.alert(
                  'Rental Information',
                  `Seeker: ${item.rentalInfo.seekerName}\nPhone: ${item.rentalInfo.phone}\nLocation: ${item.rentalInfo.location}\nPeriod: ${item.rentalInfo.startDate} to ${item.rentalInfo.endDate}`,
                  [{ text: 'OK' }]
                );
              }
            }}
          >
            <View style={styles.inventoryCardContent}>
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: getStatusColor(item.status) },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(item.status) as any}
                  size={24}
                  color={Colors.background}
                />
              </View>
              <View style={styles.inventoryInfo}>
                <Text style={styles.equipmentName}>{item.equipmentName}</Text>
                <Text style={styles.category}>{item.category}</Text>
                {item.status === 'out' && item.rentalInfo && (
                  <Text style={styles.rentalInfo}>
                    Rented to: {item.rentalInfo.seekerName}
                  </Text>
                )}
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {filteredInventory.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={64} color={Colors.border} />
            <Text style={styles.emptyStateText}>No items found</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  filterScroll: {
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
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
  statusIndicator: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  inventoryInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  category: {
    fontSize: 12,
    color: Colors.textLight,
    marginBottom: 2,
  },
  rentalInfo: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.background,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textLight,
    marginTop: 16,
  },
});