import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Mark a service as completed in AsyncStorage
 */
export const markServiceCompleted = async (serviceId: string): Promise<void> => {
  try {
    const completedStr = await AsyncStorage.getItem('completed_services');
    const completed = completedStr ? JSON.parse(completedStr) : [];
    
    if (!completed.includes(serviceId)) {
      completed.push(serviceId);
      await AsyncStorage.setItem('completed_services', JSON.stringify(completed));
    }
  } catch (error) {
    console.error('Error marking service completed:', error);
  }
};

/**
 * Clear all completed services (for testing or reset)
 */
export const clearCompletedServices = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('completed_services');
  } catch (error) {
    console.error('Error clearing completed services:', error);
  }
};

/**
 * Get all completed services
 */
export const getCompletedServices = async (): Promise<string[]> => {
  try {
    const completedStr = await AsyncStorage.getItem('completed_services');
    return completedStr ? JSON.parse(completedStr) : [];
  } catch (error) {
    console.error('Error getting completed services:', error);
    return [];
  }
};