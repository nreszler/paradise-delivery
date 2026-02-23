import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackNavigationProp } from '@react-navigation/stack';
import { colors, spacing, typography } from '../../utils/theme';
import { AuthStackParamList } from '../../types/navigation';

type WelcomeScreenProps = {
  navigation: StackNavigationProp<AuthStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>P</Text>
          </View>
          <Text style={styles.appName}>Paradise Delivery</Text>
        </View>
        
        <Text style={styles.tagline}>
          Delicious food delivered to your door,{'\n'}
          <Text style={styles.taglineHighlight}>at lower prices</Text>
        </Text>
        
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🍔</Text>
            <Text style={styles.featureText}>Your favorite restaurants</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>Save vs other apps</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🚚</Text>
            <Text style={styles.featureText}>Fast, reliable delivery</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
        
        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.background,
  },
  appName: {
    ...typography.h2,
    color: colors.text,
  },
  tagline: {
    ...typography.h4,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 28,
  },
  taglineHighlight: {
    color: colors.accent,
    fontWeight: '700',
  },
  features: {
    width: '100%',
    gap: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundGray,
    padding: spacing.md,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  featureText: {
    ...typography.body,
    color: colors.text,
  },
  footer: {
    padding: spacing.lg,
  },
  getStartedButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  getStartedText: {
    ...typography.h4,
    color: colors.background,
  },
  terms: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});