import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Colors } from '../constants/colors';

const RecentScans = ({ scans, onSelect }) => {
  if (!scans || scans.length === 0) {
    return null;
  }

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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.scanItem}
      onPress={() => onSelect(item.title, item.content_type)}
    >
      <View style={styles.scanContent}>
        <Text style={styles.scanTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.scanMeta}>
          <Text style={styles.scanType}>
            {getContentTypeLabel(item.content_type)}
          </Text>
          <Text style={styles.scanDate}>
            {formatDate(item.scanned_at)}
          </Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Scans</Text>
      <FlatList
        data={scans.slice(0, 5)}
        keyExtractor={(item, index) => `${item.title}-${item.content_type}-${index}`}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  scanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  scanContent: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  scanMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanType: {
    fontSize: 12,
    color: Colors.textLight,
    marginRight: 8,
  },
  scanDate: {
    fontSize: 12,
    color: Colors.textLight,
  },
  arrow: {
    fontSize: 24,
    color: Colors.textLight,
    marginLeft: 8,
  },
});

export default RecentScans;
