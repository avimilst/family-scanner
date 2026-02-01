import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PaywallScreen({ navigation }) {
  const handleSubscribe = () => {
    // In production, this would trigger in-app purchase
    navigation.replace('Main');
  };

  const handleBypass = () => {
    // Testing bypass - remove in production
    navigation.replace('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="shield-checkmark" size={80} color="#4A90D9" />
        <Text style={styles.title}>Family Scanner</Text>
        <Text style={styles.tagline}>We Scan. You Decide.</Text>

        <View style={styles.features}>
          <FeatureItem icon="search" text="Search TV shows, movies & books" />
          <FeatureItem icon="checkmark-circle" text="Get detailed content analysis" />
          <FeatureItem icon="heart" text="Make informed family choices" />
          <FeatureItem icon="flash" text="Powered by AI with web search" />
        </View>

        <View style={styles.pricing}>
          <Text style={styles.price}>$4.99/month</Text>
          <Text style={styles.priceSubtext}>Cancel anytime</Text>
        </View>

        <TouchableOpacity style={styles.subscribeButton} onPress={handleSubscribe}>
          <Text style={styles.subscribeButtonText}>Start Free Trial</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.bypassButton} onPress={handleBypass}>
          <Text style={styles.bypassButtonText}>Skip for Testing</Text>
        </TouchableOpacity>

        <Text style={styles.terms}>
          By subscribing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }) {
  return (
    <View style={styles.featureItem}>
      <Ionicons name={icon} size={24} color="#4A90D9" />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 16,
  },
  tagline: {
    fontSize: 18,
    color: '#666666',
    marginTop: 8,
    marginBottom: 32,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  pricing: {
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  priceSubtext: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  subscribeButton: {
    backgroundColor: '#4A90D9',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscribeButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  bypassButton: {
    paddingVertical: 12,
    marginBottom: 24,
  },
  bypassButtonText: {
    color: '#999999',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  terms: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});
