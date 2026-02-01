import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useSubscription } from '../context/SubscriptionContext';

const PaywallScreen = () => {
  const { subscribe, devBypass, restorePurchase } = useSubscription();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubscribe = async () => {
    setIsProcessing(true);
    try {
      // In production, this would trigger native IAP
      // For now, simulate subscription
      await subscribe();
    } catch (error) {
      Alert.alert('Error', 'Unable to process subscription. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    setIsProcessing(true);
    try {
      const restored = await restorePurchase();
      if (!restored) {
        Alert.alert('No Purchase Found', 'We couldn\'t find an existing subscription to restore.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to restore purchase. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDevBypass = async () => {
    await devBypass();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.shield}>🛡️</Text>
          <Text style={styles.appName}>Family Scanner</Text>
          <Text style={styles.tagline}>We Scan. You Decide.</Text>
        </View>

        {/* Value Proposition */}
        <View style={styles.valueSection}>
          <Text style={styles.valueTitle}>Make Informed Decisions</Text>
          <View style={styles.bulletPoints}>
            <BulletPoint text="Scan TV shows, movies, and books instantly" />
            <BulletPoint text="Get objective content information" />
            <BulletPoint text="Violence, scary content, and more" />
            <BulletPoint text="Simple search - no complicated setup" />
          </View>
        </View>

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <View style={styles.priceCard}>
            <Text style={styles.price}>$2.99</Text>
            <Text style={styles.priceLabel}>per month</Text>
            <Text style={styles.priceSubtext}>Unlimited scans</Text>
          </View>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, isProcessing && styles.buttonDisabled]}
          onPress={handleSubscribe}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
          )}
        </TouchableOpacity>

        {/* Restore Purchase */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestore}
          disabled={isProcessing}
        >
          <Text style={styles.restoreButtonText}>Restore Purchase</Text>
        </TouchableOpacity>

        {/* Dev Bypass - Only visible in development */}
        {__DEV__ && (
          <TouchableOpacity
            style={styles.devBypassButton}
            onPress={handleDevBypass}
          >
            <Text style={styles.devBypassText}>
              [DEV] Skip Paywall for Testing
            </Text>
          </TouchableOpacity>
        )}

        {/* Legal Text */}
        <View style={styles.legalSection}>
          <Text style={styles.legalText}>
            Payment will be charged to your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'} account.
            Subscription automatically renews unless canceled at least 24 hours before the end of the current period.
          </Text>
          <View style={styles.legalLinks}>
            <TouchableOpacity>
              <Text style={styles.legalLink}>Privacy Policy</Text>
            </TouchableOpacity>
            <Text style={styles.legalDivider}>|</Text>
            <TouchableOpacity>
              <Text style={styles.legalLink}>Terms of Service</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const BulletPoint = ({ text }) => (
  <View style={styles.bulletRow}>
    <Text style={styles.bulletDot}>✓</Text>
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  shield: {
    fontSize: 48,
    marginBottom: 12,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: Colors.accentLight,
    fontStyle: 'italic',
  },
  valueSection: {
    marginBottom: 24,
  },
  valueTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textWhite,
    textAlign: 'center',
    marginBottom: 16,
  },
  bulletPoints: {
    paddingHorizontal: 12,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletDot: {
    fontSize: 16,
    color: Colors.accent,
    marginRight: 10,
    marginTop: 2,
  },
  bulletText: {
    fontSize: 16,
    color: Colors.textWhite,
    flex: 1,
  },
  pricingSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  priceCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 48,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  price: {
    fontSize: 40,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  priceLabel: {
    fontSize: 16,
    color: Colors.textWhite,
    opacity: 0.8,
  },
  priceSubtext: {
    fontSize: 14,
    color: Colors.accentLight,
    marginTop: 4,
  },
  subscribeButton: {
    backgroundColor: Colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  restoreButtonText: {
    fontSize: 14,
    color: Colors.textWhite,
    textDecorationLine: 'underline',
  },
  devBypassButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.warning,
    borderStyle: 'dashed',
  },
  devBypassText: {
    fontSize: 12,
    color: Colors.warning,
  },
  legalSection: {
    marginTop: 'auto',
    paddingBottom: 20,
  },
  legalText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 12,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  legalLink: {
    fontSize: 12,
    color: Colors.textWhite,
    textDecorationLine: 'underline',
  },
  legalDivider: {
    color: 'rgba(255, 255, 255, 0.4)',
    marginHorizontal: 8,
  },
});

export default PaywallScreen;
