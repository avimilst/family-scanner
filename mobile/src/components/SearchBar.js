import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text,
  FlatList,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '../constants/colors';
import { autocompleteApi } from '../services/api';

const SearchBar = ({ onSelect, placeholder = 'Enter title...' }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const searchTitles = useCallback(async (searchQuery) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await autocompleteApi.search(searchQuery);
      setResults(response.results || []);
      setShowDropdown(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleChangeText = (text) => {
    setQuery(text);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchTitles(text);
    }, 300);
  };

  const handleSelect = (item) => {
    setQuery(item.title);
    setShowDropdown(false);
    Keyboard.dismiss();
    onSelect(item.title, item.content_type);
  };

  const handleSubmit = () => {
    if (query.trim()) {
      setShowDropdown(false);
      Keyboard.dismiss();
      // Default to TV show if submitting custom entry
      onSelect(query.trim(), 'tv_show');
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const getContentTypeLabel = (type) => {
    switch (type) {
      case 'tv_show':
        return 'TV Show';
      case 'movie':
        return 'Movie';
      case 'book':
        return 'Book';
      default:
        return type;
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.resultTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.resultType}>
        {getContentTypeLabel(item.content_type)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={query}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textLight}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          autoCorrect={false}
          autoCapitalize="words"
        />
        {isLoading && (
          <ActivityIndicator
            size="small"
            color={Colors.primary}
            style={styles.loader}
          />
        )}
        {query.length > 0 && !isLoading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDropdown && results.length > 0 && (
        <View style={styles.dropdown}>
          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.title}-${item.content_type}-${index}`}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            style={styles.resultsList}
            maxHeight={300}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 100,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    height: 52,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  loader: {
    marginLeft: 8,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearIcon: {
    fontSize: 16,
    color: Colors.textLight,
  },
  dropdown: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    maxHeight: 300,
    overflow: 'hidden',
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  resultTitle: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    marginRight: 12,
  },
  resultType: {
    fontSize: 12,
    color: Colors.textLight,
    backgroundColor: Colors.backgroundDark,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
});

export default SearchBar;
