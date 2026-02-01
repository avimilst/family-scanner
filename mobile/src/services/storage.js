import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SUBSCRIPTION_STATUS: '@family_scanner_subscription',
  RECENT_SCANS: '@family_scanner_recent_scans',
  DEV_BYPASS: '@family_scanner_dev_bypass',
};

// Subscription Storage
export const subscriptionStorage = {
  // Save subscription status
  setSubscribed: async (isSubscribed) => {
    try {
      await AsyncStorage.setItem(KEYS.SUBSCRIPTION_STATUS, JSON.stringify(isSubscribed));
    } catch (error) {
      console.error('Error saving subscription status:', error);
    }
  },

  // Get subscription status
  isSubscribed: async () => {
    try {
      const value = await AsyncStorage.getItem(KEYS.SUBSCRIPTION_STATUS);
      return value ? JSON.parse(value) : false;
    } catch (error) {
      console.error('Error getting subscription status:', error);
      return false;
    }
  },

  // Set dev bypass (for Expo Go testing)
  setDevBypass: async (bypassed) => {
    try {
      await AsyncStorage.setItem(KEYS.DEV_BYPASS, JSON.stringify(bypassed));
    } catch (error) {
      console.error('Error saving dev bypass:', error);
    }
  },

  // Get dev bypass status
  isDevBypassed: async () => {
    try {
      const value = await AsyncStorage.getItem(KEYS.DEV_BYPASS);
      return value ? JSON.parse(value) : false;
    } catch (error) {
      console.error('Error getting dev bypass:', error);
      return false;
    }
  },

  // Clear subscription (for testing/logout)
  clearSubscription: async () => {
    try {
      await AsyncStorage.multiRemove([KEYS.SUBSCRIPTION_STATUS, KEYS.DEV_BYPASS]);
    } catch (error) {
      console.error('Error clearing subscription:', error);
    }
  },
};

// Recent Scans Storage (local cache)
export const recentScansStorage = {
  // Save recent scans
  save: async (scans) => {
    try {
      // Keep only last 10 scans locally
      const recentScans = scans.slice(0, 10);
      await AsyncStorage.setItem(KEYS.RECENT_SCANS, JSON.stringify(recentScans));
    } catch (error) {
      console.error('Error saving recent scans:', error);
    }
  },

  // Get recent scans
  get: async () => {
    try {
      const value = await AsyncStorage.getItem(KEYS.RECENT_SCANS);
      return value ? JSON.parse(value) : [];
    } catch (error) {
      console.error('Error getting recent scans:', error);
      return [];
    }
  },

  // Add a scan to recent
  addScan: async (scan) => {
    try {
      const scans = await recentScansStorage.get();
      // Remove duplicate if exists
      const filtered = scans.filter(
        (s) => !(s.title.toLowerCase() === scan.title.toLowerCase() && s.content_type === scan.content_type)
      );
      // Add to beginning
      const updated = [scan, ...filtered].slice(0, 10);
      await recentScansStorage.save(updated);
      return updated;
    } catch (error) {
      console.error('Error adding scan:', error);
      return [];
    }
  },

  // Clear recent scans
  clear: async () => {
    try {
      await AsyncStorage.removeItem(KEYS.RECENT_SCANS);
    } catch (error) {
      console.error('Error clearing recent scans:', error);
    }
  },
};
