import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscriptionStorage } from '../services/storage';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDevMode, setIsDevMode] = useState(false);

  // Load subscription status on mount
  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const subscribed = await subscriptionStorage.isSubscribed();
      const devBypassed = await subscriptionStorage.isDevBypassed();
      setIsSubscribed(subscribed || devBypassed);
      setIsDevMode(devBypassed);
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe (would be called after successful IAP)
  const subscribe = async () => {
    await subscriptionStorage.setSubscribed(true);
    setIsSubscribed(true);
  };

  // Dev bypass for Expo Go testing
  const devBypass = async () => {
    await subscriptionStorage.setDevBypass(true);
    setIsDevMode(true);
    setIsSubscribed(true);
  };

  // Restore purchase
  const restorePurchase = async () => {
    // In production, this would verify with App Store / Google Play
    // For now, we'll just check local storage
    const subscribed = await subscriptionStorage.isSubscribed();
    if (subscribed) {
      setIsSubscribed(true);
      return true;
    }
    return false;
  };

  // Cancel/expire subscription
  const unsubscribe = async () => {
    await subscriptionStorage.clearSubscription();
    setIsSubscribed(false);
    setIsDevMode(false);
  };

  const value = {
    isSubscribed,
    isLoading,
    isDevMode,
    subscribe,
    devBypass,
    restorePurchase,
    unsubscribe,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
