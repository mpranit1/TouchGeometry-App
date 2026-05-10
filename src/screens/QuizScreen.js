import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AudioEngine from '../utils/AudioEngine';
import HapticEngine from '../utils/HapticEngine';

const UNIT_PIXELS = 60;
const TARGET_UNITS = 4;

const QuizScreen = ({ route, navigation }) => {
  const type = route.params?.type || 'geometry';
  const [units, setUnits] = useState(0);
  
  useEffect(() => {
    if (type === 'distance') {
      AudioEngine.play(`Quiz Time! Can you draw a line that is exactly ${TARGET_UNITS} steps long? Give it a try!`);
    } else {
      AudioEngine.play("Quiz Time! Question 1: Does a straight line have any corners? Tap the top for Yes, or the bottom for No.");
    }
  }, [type]);

  const handleGeometryAnswer = (isCorrect) => {
    if (isCorrect) {
      HapticEngine.playSuccess();
      AudioEngine.play("You got it right! A straight line is perfectly smooth with no corners. Going back to home.");
      setTimeout(() => navigation.goBack(), 4000);
    } else {
      HapticEngine.playError();
      AudioEngine.play("Oops, not quite! Remember, a straight line doesn't bend, so it has no corners. Let's try again!");
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt, gestureState) => {
         const distance = Math.sqrt(gestureState.dx**2 + gestureState.dy**2);
         const currentU = Math.floor(distance / UNIT_PIXELS);
         
         if (currentU !== lastU.current) {
             lastU.current = currentU;
             setUnits(currentU);
             HapticEngine.playLineDrag();
         }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const finalU = lastU.current;
        if (finalU === TARGET_UNITS) {
           HapticEngine.playSuccess();
           AudioEngine.play(`Perfect! You drew exactly ${TARGET_UNITS} steps! Going back to home.`);
           setTimeout(() => navigation.goBack(), 4500);
        } else {
           HapticEngine.playError();
           AudioEngine.play(`You took ${finalU} steps. We need exactly ${TARGET_UNITS} steps. Let's try again!`);
           lastU.current = 0;
           setUnits(0);
        }
      }
    })
  ).current;

  const lastU = useRef(0);

  return (
    <SafeAreaView style={styles.container}>
      {type === 'geometry' ? (
        <>
          <TouchableOpacity 
            style={[styles.button, styles.topOption]} 
            onPress={() => handleGeometryAnswer(false)}
            accessible={true}
            accessibilityLabel="Yes"
          >
            <Text style={styles.buttonText}>YES</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.bottomOption]} 
            onPress={() => handleGeometryAnswer(true)}
            accessible={true}
            accessibilityLabel="No"
          >
            <Text style={styles.buttonText}>NO</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButtonGeometry} 
            onPress={() => { AudioEngine.stop(); navigation.goBack(); }}
          >
            <Text style={styles.backText}>Back to Home</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => { AudioEngine.stop(); navigation.goBack(); }}
          >
            <Text style={styles.backText}>Back to Home</Text>
          </TouchableOpacity>
          
          <View style={styles.drawingArea} {...panResponder.panHandlers}>
             <Text style={styles.instruction}>Target: {TARGET_UNITS} Units</Text>
             <Text style={styles.instructionLarge}>{units}</Text>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  button: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 20,
  },
  topOption: {
    backgroundColor: '#FF6347',
  },
  bottomOption: {
    backgroundColor: '#4682B4',
  },
  buttonText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFF',
  },
  backButtonGeometry: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 20,
  },
  backButton: {
    flex: 1,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
    borderRadius: 20,
    maxHeight: 100,
  },
  backText: {
    fontSize: 24,
    color: '#FFF',
  },
  drawingArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: '#444',
    borderWidth: 2,
    margin: 10,
    borderRadius: 20,
  },
  instruction: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FF6347',
    marginBottom: 40
  },
  instructionLarge: {
     fontSize: 120,
     color: '#FFF',
     fontWeight: 'bold'
  }
});

export default QuizScreen;
