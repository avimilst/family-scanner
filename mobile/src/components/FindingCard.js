import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, getCategoryConfig } from '../constants/colors';

const FindingCard = ({ category, description }) => {
  const categoryConfig = getCategoryConfig(category);

  return (
    <View style={[styles.container, { borderLeftColor: categoryConfig.color }]}>
      <View style={styles.header}>
        <Text style={[styles.dot, { color: categoryConfig.color }]}>
          {categoryConfig.icon}
        </Text>
        <Text style={styles.categoryLabel}>
          {categoryConfig.label}
        </Text>
      </View>
      <Text style={styles.description}>
        {description}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dot: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
});

export default FindingCard;
