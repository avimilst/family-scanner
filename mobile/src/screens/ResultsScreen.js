import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../constants/colors';
import FindingCard from '../components/FindingCard';

const ResultsScreen = ({ route, navigation }) => {
  const { scanResult } = route.params;
  const { title, content_type, findings, cached, scanned_at } = scanResult;

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

  const handleScanAnother = () => {
    navigation.goBack();
  };

  const hasFindings = findings && findings.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleScanAnother}
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Scan Results</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {getContentTypeLabel(content_type)}
            </Text>
          </View>
          {cached && (
            <Text style={styles.cachedText}>
              Cached result from previous scan
            </Text>
          )}
        </View>

        {/* Findings Section */}
        <View style={styles.findingsSection}>
          {hasFindings ? (
            <>
              <Text style={styles.sectionTitle}>Content Findings</Text>
              {findings.map((finding, index) => (
                <FindingCard
                  key={`${finding.category}-${index}`}
                  category={finding.category}
                  description={finding.description}
                />
              ))}
            </>
          ) : (
            <View style={styles.noFindingsContainer}>
              <Text style={styles.noFindingsIcon}>✓</Text>
              <Text style={styles.noFindingsText}>
                No notable content found in our scanned categories.
              </Text>
            </View>
          )}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            This information is provided for guidance only. We recommend
            previewing content when possible.
          </Text>
        </View>
      </ScrollView>

      {/* Scan Another Button */}
      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.scanAnotherButton}
          onPress={handleScanAnother}
        >
          <Text style={styles.scanAnotherText}>Scan Another</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backArrow: {
    fontSize: 24,
    color: Colors.textWhite,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textWhite,
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 100,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  typeBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    fontSize: 14,
    color: Colors.textWhite,
    fontWeight: '500',
  },
  cachedText: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 8,
  },
  findingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  noFindingsContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.success,
    borderStyle: 'dashed',
  },
  noFindingsIcon: {
    fontSize: 48,
    color: Colors.success,
    marginBottom: 12,
  },
  noFindingsText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  disclaimer: {
    backgroundColor: Colors.backgroundDark,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  scanAnotherButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  scanAnotherText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textWhite,
  },
});

export default ResultsScreen;
