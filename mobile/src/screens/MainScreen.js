import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { useScan } from '../context/ScanContext';
import Header from '../components/Header';
import SearchBar from '../components/SearchBar';
import RecentScans from '../components/RecentScans';

const MainScreen = ({ navigation }) => {
  const { recentScans, scanContent, isScanning, error, clearError } = useScan();
  const [scanningTitle, setScanningTitle] = useState('');

  const handleScan = async (title, contentType) => {
    setScanningTitle(title);
    clearError();

    try {
      const result = await scanContent(title, contentType);
      navigation.navigate('Results', { scanResult: result });
    } catch (err) {
      Alert.alert(
        'Scan Failed',
        err.message || 'We couldn\'t scan this title. Please try again.',
        [{ text: 'OK', onPress: clearError }]
      );
    }
  };

  const handleSettingsPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header showSettings onSettingsPress={handleSettingsPress} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main Question */}
        <Text style={styles.mainQuestion}>
          Which TV Show, Movie or Book would you like to scan?
        </Text>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            onSelect={handleScan}
            placeholder="Enter title..."
          />
        </View>

        {/* Recent Scans */}
        <RecentScans scans={recentScans} onSelect={handleScan} />
      </ScrollView>

      {/* Scanning Modal */}
      <Modal
        visible={isScanning}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.scanningText}>Scanning...</Text>
            <Text style={styles.scanningTitle} numberOfLines={2}>
              {scanningTitle}
            </Text>
            <View style={styles.scanningAnimation}>
              <Text style={styles.animatedDots}>
                🔍 Analyzing content...
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: 8,
  },
  contentContainer: {
    padding: 24,
    paddingBottom: 40,
  },
  mainQuestion: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 30,
  },
  searchContainer: {
    zIndex: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  scanningText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginTop: 16,
  },
  scanningTitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  scanningAnimation: {
    marginTop: 16,
  },
  animatedDots: {
    fontSize: 14,
    color: Colors.textLight,
  },
});

export default MainScreen;
