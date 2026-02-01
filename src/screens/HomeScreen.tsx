import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SearchInput } from '../components/SearchInput';
import { ContentTypePicker } from '../components/ContentTypePicker';
import { ScanResultCard } from '../components/ScanResultCard';
import { scanContent } from '../services/api';
import { ContentType, ScanResult } from '../types';

export function HomeScreen() {
  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState<ContentType>('tv_show');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectSuggestion = (selectedTitle: string, type: ContentType) => {
    setTitle(selectedTitle);
    setContentType(type);
  };

  const handleScan = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title to scan');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await scanContent(title.trim(), contentType);

      if (response.success && response.data) {
        setResult(response.data);
      } else {
        setError(response.error || 'Failed to scan content');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setContentType('tv_show');
    setResult(null);
    setError(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.appTitle}>Family Scanner</Text>
          <Text style={styles.tagline}>We Scan. You Decide.</Text>
        </View>

        {/* Main Content */}
        {!result ? (
          <View style={styles.searchContainer}>
            <SearchInput
              value={title}
              onChangeText={setTitle}
              onSelectSuggestion={handleSelectSuggestion}
              placeholder="Search for a movie, TV show, or book..."
            />

            <ContentTypePicker
              selectedType={contentType}
              onSelect={setContentType}
            />

            <TouchableOpacity
              style={[
                styles.scanButton,
                (!title.trim() || isLoading) && styles.scanButtonDisabled,
              ]}
              onPress={handleScan}
              disabled={!title.trim() || isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.scanButtonText}>Scan Content</Text>
              )}
            </TouchableOpacity>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>
                  Analyzing content with AI...
                </Text>
                <Text style={styles.loadingSubtext}>
                  This may take a few moments
                </Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity onPress={handleReset}>
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <TouchableOpacity style={styles.backButton} onPress={handleReset}>
              <Text style={styles.backButtonText}>{'<'} Scan Another</Text>
            </TouchableOpacity>
            <ScanResultCard result={result} />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4F46E5',
  },
  tagline: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  searchContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  scanButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  scanButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    alignItems: 'center',
  },
  errorText: {
    color: '#991B1B',
    fontSize: 14,
    textAlign: 'center',
  },
  retryText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
  },
  resultContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4F46E5',
    fontWeight: '500',
  },
});
