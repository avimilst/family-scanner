import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

const Header = ({ showSettings, onSettingsPress }) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.shield}>🛡️</Text>
        <Text style={styles.appName}>Family Scanner</Text>
      </View>
      <Text style={styles.tagline}>We Scan. You Decide.</Text>

      {showSettings && (
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={onSettingsPress}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    paddingTop: 8,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  shield: {
    fontSize: 24,
    marginRight: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  tagline: {
    fontSize: 14,
    color: Colors.accentLight,
    fontStyle: 'italic',
  },
  settingsButton: {
    position: 'absolute',
    right: 16,
    top: 8,
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
});

export default Header;
