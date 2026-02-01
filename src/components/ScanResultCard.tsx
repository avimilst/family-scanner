import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { ScanResult, ContentWarning, PositiveElement, DiscussionTopic } from '../types';
import { getContentTypeLabel } from '../data/popularTitles';

interface ScanResultCardProps {
  result: ScanResult;
}

function SeverityBadge({ severity }: { severity: string }) {
  const getColor = () => {
    switch (severity) {
      case 'mild': return { bg: '#D1FAE5', text: '#065F46' };
      case 'moderate': return { bg: '#FEF3C7', text: '#92400E' };
      case 'strong': return { bg: '#FEE2E2', text: '#991B1B' };
      default: return { bg: '#E5E7EB', text: '#374151' };
    }
  };
  const colors = getColor();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]}>
        {severity.toUpperCase()}
      </Text>
    </View>
  );
}

function WarningCard({ warning }: { warning: ContentWarning }) {
  return (
    <View style={styles.warningCard}>
      <View style={styles.warningHeader}>
        <Text style={styles.warningCategory}>{warning.category}</Text>
        <SeverityBadge severity={warning.severity} />
      </View>
      <Text style={styles.warningDescription}>{warning.description}</Text>
      {warning.episodes_or_chapters && warning.episodes_or_chapters.length > 0 && (
        <Text style={styles.warningEpisodes}>
          Episodes/Chapters: {warning.episodes_or_chapters.join(', ')}
        </Text>
      )}
    </View>
  );
}

function PositiveCard({ element }: { element: PositiveElement }) {
  return (
    <View style={styles.positiveCard}>
      <Text style={styles.positiveCategory}>{element.category}</Text>
      <Text style={styles.positiveDescription}>{element.description}</Text>
    </View>
  );
}

function DiscussionCard({ topic }: { topic: DiscussionTopic }) {
  return (
    <View style={styles.discussionCard}>
      <Text style={styles.discussionTopic}>{topic.topic}</Text>
      {topic.suggested_questions.map((question, index) => (
        <Text key={index} style={styles.discussionQuestion}>
          {'\u2022'} {question}
        </Text>
      ))}
    </View>
  );
}

export function ScanResultCard({ result }: ScanResultCardProps) {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{result.title}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.contentType}>
            {getContentTypeLabel(result.content_type)}
          </Text>
          {result.cached && (
            <View style={styles.cachedBadge}>
              <Text style={styles.cachedText}>Cached</Text>
            </View>
          )}
        </View>
      </View>

      {/* Overall Rating */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overall Rating</Text>
        <View style={styles.ratingCard}>
          <Text style={styles.ratingText}>{result.overall_rating}</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Summary</Text>
        <Text style={styles.summaryText}>{result.summary}</Text>
      </View>

      {/* Age Recommendation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Age Recommendation</Text>
        <View style={styles.ageCard}>
          <View style={styles.ageHeader}>
            <Text style={styles.ageNumber}>{result.age_recommendation.minimum_age}+</Text>
            <Text style={styles.ageRange}>
              Ideal: {result.age_recommendation.ideal_age_range}
            </Text>
          </View>
          <Text style={styles.ageReasoning}>
            {result.age_recommendation.reasoning}
          </Text>
        </View>
      </View>

      {/* Content Warnings */}
      {result.content_warnings && result.content_warnings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Warnings</Text>
          {result.content_warnings.map((warning, index) => (
            <WarningCard key={index} warning={warning} />
          ))}
        </View>
      )}

      {/* Positive Elements */}
      {result.positive_elements && result.positive_elements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Positive Elements</Text>
          {result.positive_elements.map((element, index) => (
            <PositiveCard key={index} element={element} />
          ))}
        </View>
      )}

      {/* Discussion Topics */}
      {result.discussion_topics && result.discussion_topics.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Discussion Topics</Text>
          {result.discussion_topics.map((topic, index) => (
            <DiscussionCard key={index} topic={topic} />
          ))}
        </View>
      )}

      {/* Similar Alternatives */}
      {result.similar_alternatives && result.similar_alternatives.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Similar Alternatives</Text>
          <View style={styles.alternativesContainer}>
            {result.similar_alternatives.map((alt, index) => (
              <View key={index} style={styles.alternativeChip}>
                <Text style={styles.alternativeText}>{alt}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Scanned timestamp */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Scanned: {new Date(result.scanned_at).toLocaleDateString()}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contentType: {
    fontSize: 14,
    color: '#6B7280',
  },
  cachedBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cachedText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  ratingCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 12,
    padding: 16,
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  summaryText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  ageCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
  },
  ageHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  ageNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginRight: 12,
  },
  ageRange: {
    fontSize: 14,
    color: '#6B7280',
  },
  ageReasoning: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: '#FEF2F2',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  warningHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  warningCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991B1B',
  },
  warningDescription: {
    fontSize: 14,
    color: '#7F1D1D',
    lineHeight: 20,
  },
  warningEpisodes: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 6,
    fontStyle: 'italic',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  positiveCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#22C55E',
  },
  positiveCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#166534',
    marginBottom: 4,
  },
  positiveDescription: {
    fontSize: 14,
    color: '#15803D',
    lineHeight: 20,
  },
  discussionCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  discussionTopic: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 8,
  },
  discussionQuestion: {
    fontSize: 13,
    color: '#B45309',
    marginBottom: 4,
    paddingLeft: 8,
  },
  alternativesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  alternativeChip: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  alternativeText: {
    fontSize: 13,
    color: '#374151',
  },
  footer: {
    marginTop: 16,
    marginBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
