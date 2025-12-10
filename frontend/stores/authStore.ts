import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  profileCompleted: boolean;
  userType?: string[];
  token?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  login: async (userData: User) => {
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    await AsyncStorage.setItem('token', userData.token || '');
    set({ user: userData, isAuthenticated: true });
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  },
  
  updateUser: async (userData: Partial<User>) => {
    set((state) => {
      const updatedUser = { ...state.user, ...userData } as User;
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      return { user: updatedUser };
    });
  },
  
  loadUser: async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      const token = await AsyncStorage.getItem('token');
      if (userStr && token) {
        const user = JSON.parse(userStr);
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error loading user:', error);
      set({ isLoading: false });
    }
  },
}));