import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AudioEngine from '../utils/AudioEngine';
import HapticEngine from '../utils/HapticEngine';
import GlobalStore from '../utils/GlobalStore';

const MENU_OPTIONS = [
  { id: 'lesson_line', label: 'Start Line Lesson', route: 'Lesson', params: { type: 'line' } },
  { id: 'lesson_triangle', label: 'Start Triangle Lesson', route: 'Lesson', params: { type: 'triangle' } },
  { id: 'lesson_square', label: 'Start Square Lesson', route: 'Lesson', params: { type: 'square' } },
  { id: 'lesson_circle', label: 'Start Circle Lesson', route: 'Lesson', params: { type: 'circle' } },
  { id: 'lesson_parallelogram', label: 'Start Parallelogram Lesson', route: 'Lesson', params: { type: 'parallelogram' } },
  { id: 'lesson_pentagon', label: 'Start Pentagon Lesson', route: 'Lesson', params: { type: 'pentagon' } },
  { id: 'lesson_angle', label: 'Start Angles Lesson', route: 'Lesson', params: { type: 'angle' } },
  { id: 'lesson_coord', label: 'Start Coordinate Grid', route: 'Lesson', params: { type: 'coordinate' } },
  { id: 'lesson_dist', label: 'Start Spatial Tracker', route: 'Lesson', params: { type: 'distance' } },
  { id: 'lesson_master', label: 'The Final Boss: Geometry Master', route: 'Lesson', params: { type: 'master' } },
  { id: 'sandbox', label: 'Free Draw Sandbox Mode', route: 'Sandbox', params: {} },
  { id: 'settings', label: 'Settings & Preferences', route: 'Settings', params: {} },
  { id: 'menu_gesture', label: 'Magic Gesture Menu: Draw to Select', route: 'GestureMenu', params: {} }
];

const HomeScreen = ({ navigation }) => {
  const [focusIndex, setFocusIndex] = useState(0);
  const focusRef = useRef(0);
  
  const updateFocus = (newIndex) => {
    setFocusIndex(newIndex);
    focusRef.current = newIndex;
  };

  const [completedCount, setCompletedCount] = useState(GlobalStore.getCompletedCount());

  useEffect(() => {
    const unsubscribe = GlobalStore.subscribe(() => setCompletedCount(GlobalStore.getCompletedCount()));
    return unsubscribe;
  }, []);

  useEffect(() => {
    AudioEngine.play(`Welcome back. You have mastered ${completedCount} out of 10 topics. Swipe horizontally to explore the menu. Current focus: ${MENU_OPTIONS[focusIndex].label}`);
  }, [completedCount]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const now = Date.now();
        const currentIndex = focusRef.current;

        if (dx > 50 && Math.abs(dy) < 50) {
          const nextIdx = Math.min(currentIndex + 1, MENU_OPTIONS.length - 1);
          if (nextIdx !== currentIndex) {
            updateFocus(nextIdx);
            HapticEngine.playLineDrag();
            AudioEngine.play(MENU_OPTIONS[nextIdx].label);
          } else {
             HapticEngine.playError();
             AudioEngine.play("End of menu");
          }
          lastTap.current = 0;
        } 
        else if (dx < -50 && Math.abs(dy) < 50) {
          const prevIdx = Math.max(currentIndex - 1, 0);
          if (prevIdx !== currentIndex) {
            updateFocus(prevIdx);
            HapticEngine.playLineDrag();
            AudioEngine.play(MENU_OPTIONS[prevIdx].label);
          } else {
             HapticEngine.playError();
             AudioEngine.play("Beginning of menu");
          }
          lastTap.current = 0;
        } 
        else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
           if (now - lastTap.current < 500) { 
              HapticEngine.playSuccess();
              AudioEngine.stop();
              navigation.navigate(MENU_OPTIONS[currentIndex].route, MENU_OPTIONS[currentIndex].params);
              lastTap.current = 0;
           } else {
              AudioEngine.play(`Selected ${MENU_OPTIONS[currentIndex].label}. Double tap to confirm.`);
              HapticEngine.playLineDrag();
              lastTap.current = now;
           }
        }
      }
    })
  ).current;

  const lastTap = useRef(0);

  return (
    <SafeAreaView style={styles.container} {...panResponder.panHandlers}>
      <View style={styles.content}>
         <Text style={styles.title} accessible={true} accessibilityLabel="Home Screen. Swipe to navigate.">TouchGeometry+</Text>
         <Text style={styles.progressText}>Mastered: {completedCount} / 10</Text>
         <View style={styles.optionBox}>
             <Text style={styles.optionText}>{MENU_OPTIONS[focusIndex].label}</Text>
         </View>
         <Text style={styles.instruction}>Swipe horizontally to navigate.</Text>
         <Text style={styles.instruction}>Double tap anywhere to select.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 36, color: '#FFF', fontWeight: 'bold', marginBottom: 10 },
  progressText: { fontSize: 24, color: '#FFD700', marginBottom: 20 },
  optionBox: { padding: 40, backgroundColor: '#333', borderRadius: 15, marginVertical: 30, width: '90%', alignItems: 'center' },
  optionText: { fontSize: 32, color: '#FFF', fontWeight: 'bold', textAlign: 'center' },
  instruction: { fontSize: 18, color: '#AAA', marginTop: 10, textAlign: 'center' }
});

export default HomeScreen;
