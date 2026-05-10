import * as Speech from 'expo-speech';

class AudioEngine {
  static async play(text, options = {}) {
    // Stop any ongoing speech before starting a new one for clarity
    await Speech.stop();
    Speech.speak(text, {
      rate: options.rate || 0.85, // Slower for better comprehension
      pitch: options.pitch || 1.0,
      language: options.language || 'en-US',
      ...options,
    });
  }

  static async stop() {
    await Speech.stop();
  }
}

export default AudioEngine;
