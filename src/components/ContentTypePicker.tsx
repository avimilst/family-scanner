import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ContentType } from '../types';
import { getContentTypeLabel } from '../data/popularTitles';

interface ContentTypePickerProps {
  selectedType: ContentType;
  onSelect: (type: ContentType) => void;
}

const contentTypes: ContentType[] = ['tv_show', 'movie', 'book'];

export function ContentTypePicker({ selectedType, onSelect }: ContentTypePickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Content Type</Text>
      <View style={styles.buttonGroup}>
        {contentTypes.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.button,
              selectedType === type && styles.buttonSelected,
            ]}
            onPress={() => onSelect(type)}
          >
            <Text
              style={[
                styles.buttonText,
                selectedType === type && styles.buttonTextSelected,
              ]}
            >
              {getContentTypeLabel(type)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  buttonSelected: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  buttonTextSelected: {
    color: '#4F46E5',
    fontWeight: '600',
  },
});
