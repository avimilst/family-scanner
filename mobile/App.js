import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SubscriptionProvider, useSubscription } from './src/context/SubscriptionContext';
import { ScanProvider } from './src/context/ScanContext';
import { Colors } from './src/constants/colors';

// Screens
import PaywallScreen from './src/screens/PaywallScreen';
import MainScreen from './src/screens/MainScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

// Navigation wrapper that checks subscription
const AppNavigator = () => {
  const { isSubscribed, isLoading } = useSubscription();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!isSubscribed ? (
        // Not subscribed - show paywall
        <Stack.Screen name="Paywall" component={PaywallScreen} />
      ) : (
        // Subscribed - show main app
        <>
          <Stack.Screen name="Main" component={MainScreen} />
          <Stack.Screen
            name="Results"
            component={ResultsScreen}
            options={{ animation: 'slide_from_bottom' }}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ animation: 'slide_from_right' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <SubscriptionProvider>
      <ScanProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <AppNavigator />
        </NavigationContainer>
      </ScanProvider>
    </SubscriptionProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
