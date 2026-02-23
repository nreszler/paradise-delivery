import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Location from 'expo-location';
import { colors, spacing, typography } from '../../utils/theme';
import { AuthStackParamList } from '../../types/navigation';
import { useLocationStore } from '../../store/auth';

type LocationPermissionScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'LocationPermission'>;
};

export default function LocationPermissionScreen({
  navigation,
}: LocationPermissionScreenProps) {
  const [loading, setLoading] = useState(false);
  const setCurrentLocation = useLocationStore((state) => state.setCurrentLocation);

  const requestLocationPermission = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
        // Navigate to main app
        navigation.getParent()?.navigate('Main');
      } else {
        Alert.alert(
          'Location Access Denied',
          'You can still use the app, but we need location to show nearby restaurants and estimate delivery times.',
          [
            { text: 'Skip', onPress: () => navigation.getParent()?.navigate('Main') },
            { text: 'Try Again', onPress: requestLocationPermission },
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to get location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📍</Text>
        </View>

        <Text style={styles.title}>Enable Location</Text>
        <Text style={styles.description}>
          We use your location to show nearby restaurants and provide accurate delivery estimates.
        </Text>

        <View style={styles.benefits}>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🍽️</Text>
            <Text style={styles.benefitText}>Find restaurants near you</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>⏱️</Text>
            <Text style={styles.benefitText}>Accurate delivery times</Text>
          </View>
          <View style={styles.benefit}>
            <Text style={styles.benefitIcon}>🗺️</Text>
            <Text style={styles.benefitText}>Track your delivery</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={requestLocationPermission}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.buttonText}>Enable Location Services</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.getParent()?.navigate('Main')}
          disabled={loading}
        >
          <Text style={styles.skipText}>Not Now</Text>
        </TouchableOpacity>
      </View>
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
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  icon: {
    fontSize: 60,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  benefits: {
    width: '100%',
    gap: spacing.md,
  },
  benefit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
  },
  benefitIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  benefitText: {
    ...typography.body,
    color: colors.text,
  },
  footer: {
    padding: spacing.lg,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...typography.h4,
    color: colors.background,
  },
  skipButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  skipText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});