import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography } from '../../utils/theme';
import { AuthStackParamList } from '../../types/navigation';
import { authApi } from '../../api';
import { useAuthStore } from '../../store/auth';

type LoginScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const setAuthenticated = useAuthStore((state) => state.setAuthenticated);

  const formatPhone = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    let formatted = cleaned;
    if (cleaned.length >= 6) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    } else if (cleaned.length >= 3) {
      formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
    return formatted;
  };

  const handleRequestOTP = async () => {
    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length !== 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid 10-digit phone number');
      return;
    }
    
    setLoading(true);
    try {
      await authApi.requestOTP(cleanedPhone);
      setShowOtp(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const cleanedPhone = phone.replace(/\D/g, '');
      const response = await authApi.verifyOTP(cleanedPhone, otpCode);
      setAuthenticated(response.user, response.token);
      navigation.navigate('LocationPermission');
    } catch (error) {
      Alert.alert('Error', 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.title}>
            {showOtp ? 'Enter Code' : 'Welcome Back'}
          </Text>
          <Text style={styles.subtitle}>
            {showOtp
              ? `Enter the 6-digit code sent to ${phone}`
              : 'Enter your phone number to get started'}
          </Text>
        </View>

        <View style={styles.form}>
          {!showOtp ? (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="(555) 123-4567"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={(text) => setPhone(formatPhone(text))}
                maxLength={14}
                editable={!loading}
              />
            </View>
          ) : (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Verification Code</Text>
              <TextInput
                style={[styles.input, styles.otpInput]}
                placeholder="123456"
                keyboardType="number-pad"
                value={otpCode}
                onChangeText={setOtpCode}
                maxLength={6}
                editable={!loading}
              />
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={showOtp ? handleVerifyOTP : handleRequestOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text style={styles.buttonText}>
                {showOtp ? 'Verify Code' : 'Send Code'}
              </Text>
            )}
          </TouchableOpacity>

          {showOtp && (
            <TouchableOpacity
              style={styles.resendButton}
              onPress={() => {
                setShowOtp(false);
                setOtpCode('');
              }}
              disabled={loading}
            >
              <Text style={styles.resendText}>Use different number</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  form: {
    gap: spacing.md,
  },
  inputContainer: {
    gap: spacing.sm,
  },
  label: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  otpInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 24,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...typography.h4,
    color: colors.background,
  },
  resendButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  resendText: {
    ...typography.body,
    color: colors.primary,
  },
});