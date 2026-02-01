import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { searchTitles, TitleSuggestion, getContentTypeLabel } from '../data/popularTitles';
import { ContentType } from '../types';

interface SearchInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (title: string, type: ContentType) => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChangeText,
  onSelectSuggestion,
  placeholder = 'Search for a title...',
}: SearchInputProps) {
  const [suggestions, setSuggestions] = useState<TitleSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleTextChange = useCallback((text: string) => {
    onChangeText(text);
    if (text.length >= 2) {
      const results = searchTitles(text, 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [onChangeText]);

  const handleSelectSuggestion = useCallback((item: TitleSuggestion) => {
    onSelectSuggestion(item.title, item.type);
    setSuggestions([]);
    setShowSuggestions(false);
    Keyboard.dismiss();
  }, [onSelectSuggestion]);

  const renderSuggestion = ({ item }: { item: TitleSuggestion }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSelectSuggestion(item)}
    >
      <Text style={styles.suggestionTitle}>{item.title}</Text>
      <Text style={styles.suggestionType}>{getContentTypeLabel(item.type)}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        onFocus={() => {
          if (suggestions.length > 0) setShowSuggestions(true);
        }}
        onBlur={() => {
          setTimeout(() => setShowSuggestions(false), 200);
        }}
      />
      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          <FlatList
            data={suggestions}
            renderItem={renderSuggestion}
            keyExtractor={(item) => item.title}
            keyboardShouldPersistTaps="handled"
            style={styles.suggestionsList}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 10,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  suggestionsList: {
    maxHeight: 300,
  },
  suggestionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionTitle: {
    fontSize: 15,
    color: '#1F2937',
    flex: 1,
  },
  suggestionType: {
    fontSize: 12,
    color: '#6B7280',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 8,
  },
});
