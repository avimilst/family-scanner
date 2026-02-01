import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  FlatList,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { scanProduct } from './src/api';
import { saveScan, getRecentScans, deleteScan, clearAllScans } from './src/storage';

// Color scheme
const colors = {
  primary: '#4A90D9',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
};

export default function App() {
  const [screen, setScreen] = useState('home'); // home, scanner, manual, result, history
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [manualInput, setManualInput] = useState('');
  const [recentScans, setRecentScans] = useState([]);

  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    const scans = await getRecentScans();
    setRecentScans(scans);
  };

  const handleBarCodeScanned = async ({ type, data }) => {
    if (scanning) return;
    setScanning(true);
    await performScan({ barcode: data });
  };

  const handleManualSearch = async () => {
    if (!manualInput.trim()) {
      Alert.alert('Error', 'Please enter a product name or barcode');
      return;
    }
    await performScan({ productName: manualInput.trim() });
  };

  const performScan = async ({ barcode, productName }) => {
    setLoading(true);
    setScreen('result');

    try {
      const response = await scanProduct({ barcode, productName });

      if (response.success) {
        const scanData = {
          query: productName || barcode,
          ...response,
        };
        await saveScan(scanData);
        await loadRecentScans();
        setResult(response);
      } else {
        throw new Error('Scan failed');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to scan product');
      setScreen('home');
    } finally {
      setLoading(false);
      setScanning(false);
    }
  };

  const handleDeleteScan = async (scanId) => {
    await deleteScan(scanId);
    await loadRecentScans();
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to delete all scan history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await clearAllScans();
            await loadRecentScans();
          },
        },
      ]
    );
  };

  const viewScanResult = (scan) => {
    setResult(scan);
    setScreen('result');
  };

  // Get recommendation color
  const getRecommendationColor = (suitableFor) => {
    if (!suitableFor) return colors.textLight;
    const lower = suitableFor.toLowerCase();
    if (lower.includes('young') || lower.includes('children')) return colors.success;
    if (lower.includes('tween')) return colors.primary;
    if (lower.includes('teen')) return colors.warning;
    return colors.danger;
  };

  // Render Home Screen
  const renderHome = () => (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Family Scanner</Text>
        <Text style={styles.subtitle}>We Scan. You Decide.</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => {
            if (!permission?.granted) {
              requestPermission();
            }
            setScreen('scanner');
          }}
        >
          <Text style={styles.buttonText}>Scan Barcode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => {
            setManualInput('');
            setScreen('manual');
          }}
        >
          <Text style={[styles.buttonText, { color: colors.primary }]}>Search by Name</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.outlineButton]}
          onPress={() => setScreen('history')}
        >
          <Text style={[styles.buttonText, { color: colors.textLight }]}>
            View History ({recentScans.length})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render Scanner Screen
  const renderScanner = () => {
    if (!permission) {
      return <View style={styles.container}><ActivityIndicator size="large" color={colors.primary} /></View>;
    }

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.message}>Camera permission is required to scan barcodes.</Text>
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={requestPermission}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={() => setScreen('home')}>
            <Text style={[styles.buttonText, { color: colors.textLight }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{
            barcodeTypes: ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'qr'],
          }}
          onBarcodeScanned={scanning ? undefined : handleBarCodeScanned}
        >
          <View style={styles.scannerOverlay}>
            <View style={styles.scannerFrame} />
            <Text style={styles.scannerText}>Point at a barcode to scan</Text>
          </View>
        </CameraView>
        <TouchableOpacity style={styles.cancelButton} onPress={() => setScreen('home')}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render Manual Search Screen
  const renderManualSearch = () => (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Search Product</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter product name or barcode..."
        value={manualInput}
        onChangeText={setManualInput}
        autoFocus
        returnKeyType="search"
        onSubmitEditing={handleManualSearch}
      />
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={handleManualSearch}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Search</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={() => setScreen('home')}>
        <Text style={[styles.buttonText, { color: colors.textLight }]}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );

  // Render Result Screen
  const renderResult = () => {
    if (loading) {
      return (
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Analyzing product...</Text>
          <Text style={styles.loadingSubtext}>Using AI to research content ratings</Text>
        </View>
      );
    }

    const data = result?.data;
    const recommendation = data?.recommendation;

    return (
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.resultScroll} contentContainerStyle={styles.resultContent}>
          {data?.productName ? (
            <>
              <Text style={styles.productName}>{data.productName}</Text>
              <Text style={styles.productType}>{data.productType}</Text>

              {data.ageRating && (
                <View style={styles.ratingBadge}>
                  <Text style={styles.ratingText}>Rated: {data.ageRating}</Text>
                </View>
              )}

              {recommendation && (
                <View style={[styles.recommendationCard, { borderColor: getRecommendationColor(recommendation.suitableFor) }]}>
                  <Text style={[styles.recommendationTitle, { color: getRecommendationColor(recommendation.suitableFor) }]}>
                    {recommendation.suitableFor}
                  </Text>
                  {recommendation.minimumAge && (
                    <Text style={styles.minimumAge}>Minimum Age: {recommendation.minimumAge}+</Text>
                  )}
                  <Text style={styles.recommendationSummary}>{recommendation.summary}</Text>
                </View>
              )}

              {data.contentWarnings?.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Content Warnings</Text>
                  {data.contentWarnings.map((warning, index) => (
                    <View key={index} style={styles.warningBadge}>
                      <Text style={styles.warningText}>{warning}</Text>
                    </View>
                  ))}
                </View>
              )}

              {data.description && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Description</Text>
                  <Text style={styles.description}>{data.description}</Text>
                </View>
              )}
            </>
          ) : data?.rawAnalysis ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Analysis</Text>
              <Text style={styles.description}>{data.rawAnalysis}</Text>
            </View>
          ) : (
            <Text style={styles.message}>No data available</Text>
          )}
        </ScrollView>

        <TouchableOpacity
          style={[styles.button, styles.primaryButton, styles.doneButton]}
          onPress={() => {
            setResult(null);
            setScreen('home');
          }}
        >
          <Text style={styles.buttonText}>Done</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  };

  // Render History Screen
  const renderHistory = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.historyHeader}>
        <Text style={styles.screenTitle}>Scan History</Text>
        {recentScans.length > 0 && (
          <TouchableOpacity onPress={handleClearHistory}>
            <Text style={styles.clearText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {recentScans.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No scans yet</Text>
          <Text style={styles.emptySubtext}>Scan a product to see it here</Text>
        </View>
      ) : (
        <FlatList
          data={recentScans}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.historyItem} onPress={() => viewScanResult(item)}>
              <View style={styles.historyItemContent}>
                <Text style={styles.historyProductName}>
                  {item.data?.productName || item.query || 'Unknown Product'}
                </Text>
                <Text style={styles.historyDate}>
                  {new Date(item.savedAt).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteScan(item.id)}
              >
                <Text style={styles.deleteButtonText}>X</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={[styles.button, styles.outlineButton, styles.backButton]}
        onPress={() => setScreen('home')}
      >
        <Text style={[styles.buttonText, { color: colors.textLight }]}>Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );

  return (
    <View style={styles.app}>
      <StatusBar style="auto" />
      {screen === 'home' && renderHome()}
      {screen === 'scanner' && renderScanner()}
      {screen === 'manual' && renderManualSearch()}
      {screen === 'result' && renderResult()}
      {screen === 'history' && renderHistory()}
    </View>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    fontStyle: 'italic',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.primary,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.textLight,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  input: {
    width: '100%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: colors.textLight,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: colors.card,
  },
  message: {
    fontSize: 16,
    color: colors.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  // Scanner styles
  scannerContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  scannerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  scannerFrame: {
    width: 250,
    height: 250,
    borderWidth: 3,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  scannerText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 20,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  // Loading styles
  loadingText: {
    fontSize: 18,
    color: colors.text,
    marginTop: 20,
  },
  loadingSubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
  },
  // Result styles
  resultScroll: {
    flex: 1,
    width: '100%',
  },
  resultContent: {
    padding: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  productType: {
    fontSize: 16,
    color: colors.textLight,
    marginBottom: 16,
  },
  ratingBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  ratingText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  recommendationCard: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 16,
  },
  recommendationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  minimumAge: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 8,
  },
  recommendationSummary: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  warningBadge: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  warningText: {
    color: colors.danger,
    fontSize: 14,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  doneButton: {
    margin: 20,
    width: '90%',
    alignSelf: 'center',
  },
  // History styles
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 60,
    marginBottom: 10,
  },
  clearText: {
    color: colors.danger,
    fontSize: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: colors.textLight,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    marginHorizontal: 20,
    marginVertical: 6,
    padding: 16,
    borderRadius: 12,
  },
  historyItemContent: {
    flex: 1,
  },
  historyProductName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  deleteButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.danger,
    fontWeight: 'bold',
  },
  backButton: {
    margin: 20,
    width: '90%',
    alignSelf: 'center',
  },
});
