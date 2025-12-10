import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../stores/authStore';
import api from '../../services/api';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async () => {
    if (!identifier) {
      Alert.alert('Error', `Please enter your ${loginMethod}`);
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { identifier, type: loginMethod });
      setOtpSent(true);
      Alert.alert('Success', 'OTP sent successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!identifier) {
      Alert.alert('Error', `Please enter your ${loginMethod}`);
      return;
    }

    if (authMethod === 'password' && !password) {
      Alert.alert('Error', 'Please enter your password');
      return;
    }

    if (authMethod === 'otp' && !otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const payload =
        authMethod === 'password'
          ? { identifier, password, type: loginMethod }
          : { identifier, otp, type: loginMethod };

      const response = await api.post('/auth/login', payload);
      await login(response.data.user);
      
      if (response.data.user.profileCompleted) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/profile/initial-selection');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <Text style={styles.title}>CAMARTES</Text>
          <Text style={styles.subtitle}>Photography Ecosystem</Text>

          {/* Login Method Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                loginMethod === 'email' && styles.toggleButtonActive,
              ]}
              onPress={() => setLoginMethod('email')}
            >
              <Text
                style={[
                  styles.toggleText,
                  loginMethod === 'email' && styles.toggleTextActive,
                ]}
              >
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                loginMethod === 'phone' && styles.toggleButtonActive,
              ]}
              onPress={() => setLoginMethod('phone')}
            >
              <Text
                style={[
                  styles.toggleText,
                  loginMethod === 'phone' && styles.toggleTextActive,
                ]}
              >
                Phone
              </Text>
            </TouchableOpacity>
          </View>

          {/* Identifier Input */}
          <TextInput
            style={styles.input}
            placeholder={
              loginMethod === 'email' ? 'Email Address' : 'Phone Number'
            }
            placeholderTextColor={Colors.placeholder}
            value={identifier}
            onChangeText={setIdentifier}
            keyboardType={loginMethod === 'email' ? 'email-address' : 'phone-pad'}
            autoCapitalize="none"
          />

          {/* Auth Method Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                authMethod === 'password' && styles.toggleButtonActive,
              ]}
              onPress={() => {
                setAuthMethod('password');
                setOtpSent(false);
              }}
            >
              <Text
                style={[
                  styles.toggleText,
                  authMethod === 'password' && styles.toggleTextActive,
                ]}
              >
                Password
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                authMethod === 'otp' && styles.toggleButtonActive,
              ]}
              onPress={() => setAuthMethod('otp')}
            >
              <Text
                style={[
                  styles.toggleText,
                  authMethod === 'otp' && styles.toggleTextActive,
                ]}
              >
                OTP
              </Text>
            </TouchableOpacity>
          </View>

          {/* Password or OTP Input */}
          {authMethod === 'password' ? (
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={Colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          ) : (
            <>
              {!otpSent ? (
                <TouchableOpacity
                  style={styles.button}
                  onPress={handleSendOtp}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? 'Sending...' : 'Send OTP'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter OTP"
                    placeholderTextColor={Colors.placeholder}
                    value={otp}
                    onChangeText={setOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                  <TouchableOpacity onPress={handleSendOtp}>
                    <Text style={styles.linkText}>Resend OTP</Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}

          {/* Login Button */}
          {(authMethod === 'password' || otpSent) && (
            <TouchableOpacity
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Logging in...' : 'Login'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Signup Link */}
          <TouchableOpacity onPress={() => router.push('/auth/signup')}>
            <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.secondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  toggleButtonActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.secondary,
  },
  toggleTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: Colors.background,
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
  linkText: {
    color: Colors.primary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});