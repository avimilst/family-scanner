import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import Constants from 'expo-constants';
import { Colors } from '../constants/colors';
import { useSubscription } from '../context/SubscriptionContext';

const SettingsScreen = ({ navigation }) => {
  const { isSubscribed, isDevMode, restorePurchase, unsubscribe } = useSubscription();

  const handleRestorePurchase = async () => {
    const restored = await restorePurchase();
    if (restored) {
      Alert.alert('Success', 'Your purchase has been restored.');
    } else {
      Alert.alert('No Purchase Found', 'We couldn\'t find an existing subscription to restore.');
    }
  };

  const handleManageSubscription = () => {
    // In production, this would open the appropriate store
    Alert.alert(
      'Manage Subscription',
      'To manage your subscription, please visit your device\'s app store settings.',
      [{ text: 'OK' }]
    );
  };

  const handlePrivacyPolicy = () => {
    // In production, link to actual privacy policy
    Alert.alert('Privacy Policy', 'Privacy policy would open here.');
  };

  const handleTermsOfService = () => {
    // In production, link to actual terms
    Alert.alert('Terms of Service', 'Terms of service would open here.');
  };

  const handleContact = () => {
    Linking.openURL('mailto:support@familyscanner.app');
  };

  const handleClearSubscription = async () => {
    Alert.alert(
      'Clear Subscription',
      'This will reset your subscription status. You\'ll need to subscribe again.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await unsubscribe();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Paywall' }],
            });
          },
        },
      ]
    );
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status</Text>
              <View style={[
                styles.statusBadge,
                isSubscribed ? styles.statusActive : styles.statusInactive
              ]}>
                <Text style={[
                  styles.statusText,
                  isSubscribed ? styles.statusTextActive : styles.statusTextInactive
                ]}>
                  {isSubscribed ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            {isDevMode && (
              <Text style={styles.devModeText}>
                (Development Mode - Paywall Bypassed)
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleRestorePurchase}
          >
            <Text style={styles.menuItemText}>Restore Purchase</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleManageSubscription}
          >
            <Text style={styles.menuItemText}>Manage Subscription</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handlePrivacyPolicy}
          >
            <Text style={styles.menuItemText}>Privacy Policy</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleTermsOfService}
          >
            <Text style={styles.menuItemText}>Terms of Service</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={handleContact}
          >
            <Text style={styles.menuItemText}>Contact Us</Text>
            <Text style={styles.menuItemSubtext}>support@familyscanner.app</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Family Scanner</Text>
          <Text style={styles.appVersionText}>Version {appVersion}</Text>
        </View>

        {/* Dev Options */}
        {__DEV__ && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Developer Options</Text>
            <TouchableOpacity
              style={[styles.menuItem, styles.dangerItem]}
              onPress={handleClearSubscription}
            >
              <Text style={styles.dangerItemText}>Reset Subscription Status</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backArrow: {
    fontSize: 24,
    color: Colors.textWhite,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: Colors.success + '20',
  },
  statusInactive: {
    backgroundColor: Colors.error + '20',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusTextActive: {
    color: Colors.success,
  },
  statusTextInactive: {
    color: Colors.error,
  },
  devModeText: {
    fontSize: 12,
    color: Colors.warning,
    marginTop: 8,
    fontStyle: 'italic',
  },
  menuItem: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuItemText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  menuItemSubtext: {
    fontSize: 14,
    color: Colors.textLight,
  },
  menuItemArrow: {
    fontSize: 22,
    color: Colors.textLight,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  appInfoText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  appVersionText: {
    fontSize: 14,
    color: Colors.textLight,
    marginTop: 4,
  },
  dangerItem: {
    borderColor: Colors.error + '40',
  },
  dangerItemText: {
    fontSize: 16,
    color: Colors.error,
  },
});

export default SettingsScreen;
