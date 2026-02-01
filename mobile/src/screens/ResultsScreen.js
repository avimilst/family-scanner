import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Category colors and icons
const CATEGORY_CONFIG = {
  'Violence': {
    color: '#E53935',
    lightColor: '#FFEBEE',
    icon: 'warning',
  },
  'Sexual content': {
    color: '#D81B60',
    lightColor: '#FCE4EC',
    icon: 'heart-dislike',
  },
  'LGBTQ+ characters/themes': {
    color: '#8E24AA',
    lightColor: '#F3E5F5',
    icon: 'people',
  },
  'Scary content': {
    color: '#5E35B1',
    lightColor: '#EDE7F6',
    icon: 'skull',
  },
  'Religious themes': {
    color: '#1E88E5',
    lightColor: '#E3F2FD',
    icon: 'book',
  },
};

// Default config for unknown categories
const DEFAULT_CONFIG = {
  color: '#757575',
  lightColor: '#F5F5F5',
  icon: 'information-circle',
};

function getTypeLabel(type) {
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
}

function getTypeIcon(type) {
  switch (type) {
    case 'tv_show':
      return 'tv';
    case 'movie':
      return 'film';
    case 'book':
      return 'book';
    default:
      return 'help';
  }
}

export default function ResultsScreen({ route, navigation }) {
  const { result } = route.params;
  const { title, content_type, findings = [] } = result;

  const hasFindings = findings.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.typeTag}>
            <Ionicons name={getTypeIcon(content_type)} size={16} color="#4A90D9" />
            <Text style={styles.typeTagText}>{getTypeLabel(content_type)}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Summary */}
        <View style={[
          styles.summaryCard,
          hasFindings ? styles.summaryWarning : styles.summaryClean
        ]}>
          <Ionicons
            name={hasFindings ? 'alert-circle' : 'checkmark-circle'}
            size={32}
            color={hasFindings ? '#F57C00' : '#43A047'}
          />
          <Text style={styles.summaryText}>
            {hasFindings
              ? `${findings.length} content ${findings.length === 1 ? 'concern' : 'concerns'} found`
              : 'No content concerns found'}
          </Text>
        </View>

        {/* Findings */}
        {hasFindings && (
          <View style={styles.findingsSection}>
            <Text style={styles.sectionTitle}>Content Analysis</Text>
            {findings.map((finding, index) => {
              const config = CATEGORY_CONFIG[finding.category] || DEFAULT_CONFIG;
              return (
                <View
                  key={index}
                  style={[styles.findingCard, { borderLeftColor: config.color }]}
                >
                  <View style={styles.findingHeader}>
                    <View style={[styles.categoryDot, { backgroundColor: config.color }]} />
                    <Ionicons name={config.icon} size={20} color={config.color} />
                    <Text style={[styles.categoryText, { color: config.color }]}>
                      {finding.category}
                    </Text>
                  </View>
                  <Text style={styles.descriptionText}>{finding.description}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Legend */}
        <View style={styles.legendSection}>
          <Text style={styles.legendTitle}>Category Legend</Text>
          <View style={styles.legendGrid}>
            {Object.entries(CATEGORY_CONFIG).map(([category, config]) => (
              <View key={category} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: config.color }]} />
                <Text style={styles.legendText}>{category}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.scanAnotherButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="search" size={20} color="#4A90D9" />
            <Text style={styles.scanAnotherText}>Scan Another Title</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  typeTagText: {
    fontSize: 14,
    color: '#4A90D9',
    fontWeight: '500',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
    textAlign: 'center',
    marginTop: 12,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 16,
    marginBottom: 24,
  },
  summaryWarning: {
    backgroundColor: '#FFF3E0',
  },
  summaryClean: {
    backgroundColor: '#E8F5E9',
  },
  summaryText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  findingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  findingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  findingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 15,
    color: '#555555',
    lineHeight: 22,
    marginLeft: 20,
  },
  legendSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 16,
  },
  legendGrid: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#333333',
  },
  actions: {
    marginBottom: 24,
  },
  scanAnotherButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4A90D9',
    gap: 8,
  },
  scanAnotherText: {
    color: '#4A90D9',
    fontSize: 16,
    fontWeight: '600',
  },
});
