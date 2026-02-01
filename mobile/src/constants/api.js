// API Configuration
// Production Worker URL
export const WORKER_URL = 'https://family-scanner.avimilst.workers.dev';

// For local development with Expo Go:
// - iOS Simulator: use 'http://localhost:3000/api'
// - Android Emulator: use 'http://10.0.2.2:3000/api'
// - Physical device: use your computer's local IP, e.g., 'http://192.168.1.x:3000/api'

import Constants from 'expo-constants';

// Use Worker URL in production, localhost for development
const isDevelopment = __DEV__;
export const API_BASE_URL = isDevelopment
  ? (Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api')
  : `${WORKER_URL}/api`;

export const ENDPOINTS = {
  // Content endpoints
  scan: '/content/scan',
  recent: '/content/recent',
  cached: '/content/cached',

  // Autocomplete endpoints
  autocompleteSearch: '/autocomplete/search',
  autocompletePopular: '/autocomplete/popular',

  // Health check
  health: '/health',
};

export const getApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`;
