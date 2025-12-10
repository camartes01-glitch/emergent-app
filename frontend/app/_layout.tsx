import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  const loadUser = useAuthStore((state) => state.loadUser);

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/login" />
        <Stack.Screen name="auth/signup" />
        <Stack.Screen name="profile/initial-selection" />
        <Stack.Screen name="profile/advanced-profile" />
        <Stack.Screen name="(tabs)" />
      </Stack>
    </GestureHandlerRootView>
  );
}