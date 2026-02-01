import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { contentApi } from '../services/api';
import { recentScansStorage } from '../services/storage';

const ScanContext = createContext(null);

export const ScanProvider = ({ children }) => {
  const [recentScans, setRecentScans] = useState([]);
  const [currentScan, setCurrentScan] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);

  // Load recent scans on mount
  useEffect(() => {
    loadRecentScans();
  }, []);

  const loadRecentScans = async () => {
    try {
      // Try to get from API first
      const apiResult = await contentApi.getRecent(5);
      if (apiResult.recent_scans && apiResult.recent_scans.length > 0) {
        setRecentScans(apiResult.recent_scans);
        await recentScansStorage.save(apiResult.recent_scans);
      } else {
        // Fall back to local storage
        const localScans = await recentScansStorage.get();
        setRecentScans(localScans);
      }
    } catch {
      // Fall back to local storage on error
      const localScans = await recentScansStorage.get();
      setRecentScans(localScans);
    }
  };

  const scanContent = useCallback(async (title, contentType) => {
    setIsScanning(true);
    setError(null);

    try {
      const result = await contentApi.scan(title, contentType);
      setCurrentScan(result);

      // Add to recent scans
      const scanEntry = {
        title: result.title,
        content_type: result.content_type,
        scanned_at: result.scanned_at || new Date().toISOString(),
      };
      const updated = await recentScansStorage.addScan(scanEntry);
      setRecentScans(updated);

      return result;
    } catch (err) {
      const errorMessage = err.message || 'We couldn\'t scan this title. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentScan = useCallback(() => {
    setCurrentScan(null);
  }, []);

  const value = {
    recentScans,
    currentScan,
    isScanning,
    error,
    scanContent,
    clearError,
    clearCurrentScan,
    refreshRecentScans: loadRecentScans,
  };

  return (
    <ScanContext.Provider value={value}>
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => {
  const context = useContext(ScanContext);
  if (!context) {
    throw new Error('useScan must be used within a ScanProvider');
  }
  return context;
};
