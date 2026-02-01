import AsyncStorage from '@react-native-async-storage/async-storage';

const SCANS_KEY = '@family_scanner_scans';
const MAX_SCANS = 50; // Keep last 50 scans

/**
 * Save a scan result to local storage
 */
export async function saveScan(scanResult) {
  try {
    const scans = await getRecentScans();
    const newScan = {
      id: Date.now().toString(),
      ...scanResult,
      savedAt: new Date().toISOString(),
    };

    // Add to beginning of array (most recent first)
    scans.unshift(newScan);

    // Keep only the last MAX_SCANS
    const trimmedScans = scans.slice(0, MAX_SCANS);

    await AsyncStorage.setItem(SCANS_KEY, JSON.stringify(trimmedScans));
    return newScan;
  } catch (error) {
    console.error('Error saving scan:', error);
    throw error;
  }
}

/**
 * Get all recent scans from local storage
 */
export async function getRecentScans() {
  try {
    const scansJson = await AsyncStorage.getItem(SCANS_KEY);
    if (scansJson) {
      return JSON.parse(scansJson);
    }
    return [];
  } catch (error) {
    console.error('Error getting scans:', error);
    return [];
  }
}

/**
 * Delete a scan by ID
 */
export async function deleteScan(scanId) {
  try {
    const scans = await getRecentScans();
    const filtered = scans.filter(scan => scan.id !== scanId);
    await AsyncStorage.setItem(SCANS_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (error) {
    console.error('Error deleting scan:', error);
    throw error;
  }
}

/**
 * Clear all scans
 */
export async function clearAllScans() {
  try {
    await AsyncStorage.removeItem(SCANS_KEY);
    return [];
  } catch (error) {
    console.error('Error clearing scans:', error);
    throw error;
  }
}
