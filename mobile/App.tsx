import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

const API_URL = 'https://family-scanner.avimilst.workers.dev';

interface ScanResult {
  rating?: number;
  assessment?: string;
  concerns?: string[];
  raw?: string;
  error?: string;
}

export default function App() {
  const [content, setContent] = useState('');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  const scanContent = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to connect to scanner API' });
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating?: number) => {
    if (!rating) return '#666';
    if (rating >= 4) return '#22c55e';
    if (rating >= 3) return '#eab308';
    return '#ef4444';
  };

  const getRatingEmoji = (rating?: number) => {
    if (!rating) return '';
    if (rating >= 4) return '✅';
    if (rating >= 3) return '⚠️';
    return '🚫';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Text style={styles.title}>Family Scanner</Text>
      <Text style={styles.subtitle}>We Scan. You Decide.</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter content to scan..."
        placeholderTextColor="#999"
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={scanContent}
        disabled={loading || !content.trim()}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Scan Content</Text>
        )}
      </TouchableOpacity>

      {result && (
        <ScrollView style={styles.resultContainer}>
          {result.error ? (
            <Text style={styles.errorText}>{result.error}</Text>
          ) : (
            <>
              {result.rating && (
                <View style={styles.ratingContainer}>
                  <Text style={styles.ratingEmoji}>
                    {getRatingEmoji(result.rating)}
                  </Text>
                  <Text
                    style={[
                      styles.ratingText,
                      { color: getRatingColor(result.rating) },
                    ]}
                  >
                    Rating: {result.rating}/5
                  </Text>
                </View>
              )}

              {result.assessment && (
                <Text style={styles.assessment}>{result.assessment}</Text>
              )}

              {result.concerns && result.concerns.length > 0 && (
                <View style={styles.concernsContainer}>
                  <Text style={styles.concernsTitle}>Concerns:</Text>
                  {result.concerns.map((concern, index) => (
                    <Text key={index} style={styles.concernItem}>
                      • {concern}
                    </Text>
                  ))}
                </View>
              )}

              {result.raw && (
                <Text style={styles.rawText}>{result.raw}</Text>
              )}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 120,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    maxHeight: 300,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  assessment: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
  concernsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  concernsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  concernItem: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    marginBottom: 4,
  },
  rawText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
});
