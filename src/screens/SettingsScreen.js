import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AudioEngine from '../utils/AudioEngine';
import HapticEngine from '../utils/HapticEngine';
import GlobalStore from '../utils/GlobalStore';

const SettingsScreen = ({ navigation }) => {
  const [hapticIntensity, setHapticIntensity] = useState(GlobalStore.settings.hapticIntensity);
  
  useEffect(() => {
    AudioEngine.play("Settings Menu. Tap the top to change Haptic Intensity. Tap the bottom to go back.");
  }, []);

  const toggleHaptic = () => {
     let next = 'medium';
     if (hapticIntensity === 'low') next = 'medium';
     else if (hapticIntensity === 'medium') next = 'high';
     else if (hapticIntensity === 'high') next = 'low';
     
     setHapticIntensity(next);
     GlobalStore.setSetting('hapticIntensity', next);
     HapticEngine.playHeavyImpact();
     AudioEngine.play(`Haptic Intensity set to ${next}.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
         style={[styles.button, { flex: 1, backgroundColor: '#FFD700' }]}
         onPress={toggleHaptic}
      >
        <Text style={styles.buttonText}>Haptic Intensity: {hapticIntensity.toUpperCase()}</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
         style={[styles.button, { flex: 1, backgroundColor: '#444' }]}
         onPress={() => { AudioEngine.stop(); navigation.goBack(); }}
      >
        <Text style={styles.buttonText}>Go Back</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212', padding: 10 },
  button: { justifyContent: 'center', alignItems: 'center', marginVertical: 10, borderRadius: 15 },
  buttonText: { fontSize: 32, color: '#000', fontWeight: 'bold' }
});

export default SettingsScreen;
