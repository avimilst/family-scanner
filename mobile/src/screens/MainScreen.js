import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { searchTitles } from '../data/titles';
import { scanContent } from '../config/api';

const CONTENT_TYPES = [
  { key: 'tv_show', label: 'TV Show', icon: 'tv' },
  { key: 'movie', label: 'Movie', icon: 'film' },
  { key: 'book', label: 'Book', icon: 'book' },
];

export default function MainScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState('tv_show');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleQueryChange = useCallback((text) => {
    setQuery(text);
    setError(null);
    if (text.length >= 2) {
      const results = searchTitles(text);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, []);

  const handleSelectSuggestion = useCallback((item) => {
    setQuery(item.title);
    setSelectedType(item.type);
    setSuggestions([]);
  }, []);

  const handleScan = async () => {
    if (!query.trim()) {
      setError('Please enter a title to scan');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const result = await scanContent(query.trim(), selectedType);
      navigation.navigate('Results', { result });
    } catch (err) {
      setError(err.message || 'Failed to scan content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderSuggestion = ({ item }) => {
    const typeInfo = CONTENT_TYPES.find(t => t.key === item.type);
    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSelectSuggestion(item)}
      >
        <Ionicons name={typeInfo?.icon || 'help'} size={20} color="#666" />
        <Text style={styles.suggestionTitle}>{item.title}</Text>
        <Text style={styles.suggestionType}>{typeInfo?.label}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Ionicons name="shield-checkmark" size={48} color="#4A90D9" />
          <Text style={styles.title}>Family Scanner</Text>
          <Text style={styles.subtitle}>We Scan. You Decide.</Text>
        </View>

        <View style={styles.searchSection}>
          <Text style={styles.searchLabel}>
            Which TV Show, Movie or Book would you like to scan?
          </Text>

          <View style={styles.inputContainer}>
            <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              placeholder="Search titles..."
              value={query}
              onChangeText={handleQueryChange}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => handleQueryChange('')}>
                <Ionicons name="close-circle" size={20} color="#999" />
              </TouchableOpacity>
            )}
          </View>

          {suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item, index) => `${item.title}-${index}`}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}

          <View style={styles.typeSelector}>
            {CONTENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.key}
                style={[
                  styles.typeButton,
                  selectedType === type.key && styles.typeButtonActive,
                ]}
                onPress={() => setSelectedType(type.key)}
                disabled={isLoading}
              >
                <Ionicons
                  name={type.icon}
                  size={20}
                  color={selectedType === type.key ? '#FFFFFF' : '#4A90D9'}
                />
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === type.key && styles.typeButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#D32F2F" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.scanButton, isLoading && styles.scanButtonDisabled]}
            onPress={handleScan}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="scan" size={24} color="#FFFFFF" />
                <Text style={styles.scanButtonText}>Scan Content</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  searchSection: {
    flex: 1,
  },
  searchLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
  },
  suggestionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    maxHeight: 240,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionTitle: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
  },
  suggestionType: {
    fontSize: 12,
    color: '#999999',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  typeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A90D9',
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: '#4A90D9',
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90D9',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: '#D32F2F',
    fontSize: 14,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90D9',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 32,
    gap: 12,
  },
  scanButtonDisabled: {
    backgroundColor: '#A0C4E8',
  },
  scanButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
