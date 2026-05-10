import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AudioEngine from '../utils/AudioEngine';
import HapticEngine from '../utils/HapticEngine';

const GestureMenuScreen = ({ navigation }) => {
  const points = useRef([]);
  const [status, setStatus] = useState("Draw a Circle or Square to begin...");
  
  useEffect(() => {
    AudioEngine.play("Magic Menu! Draw a big circle to open the Circle lesson, or draw a big square to open the Square lesson. Keep your finger on the screen until you're done!");
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        points.current = [{ x: gestureState.x0, y: gestureState.y0 }];
        HapticEngine.playLineDrag();
        setStatus("Drawing path...");
      },
      onPanResponderMove: (evt, gestureState) => {
        points.current.push({ x: gestureState.moveX, y: gestureState.moveY });
        if (points.current.length % 5 === 0) {
            HapticEngine.playLineDrag();
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        points.current.push({ x: gestureState.moveX, y: gestureState.moveY });
        analyzeDrawing(points.current);
      }
    })
  ).current;

  // Simple heuristic algorithm to determine stroke geometry
  const analyzeDrawing = (pts) => {
    if (pts.length < 10) {
        AudioEngine.play("That was too quick! Try drawing a nice big shape.");
        HapticEngine.playError();
        setStatus("Too short. Draw larger.");
        return;
    }
    
    let totalDist = 0;
    let minX = pts[0].x, maxX = pts[0].x;
    let minY = pts[0].y, maxY = pts[0].y;
    
    for (let i = 1; i < pts.length; i++) {
       let dx = pts[i].x - pts[i-1].x;
       let dy = pts[i].y - pts[i-1].y;
       totalDist += Math.sqrt(dx*dx + dy*dy);
       
       if (pts[i].x < minX) minX = pts[i].x;
       if (pts[i].x > maxX) maxX = pts[i].x;
       if (pts[i].y < minY) minY = pts[i].y;
       if (pts[i].y > maxY) maxY = pts[i].y;
    }
    
    const width = maxX - minX;
    const height = maxY - minY;
    if (width < 50 && height < 50) {
        AudioEngine.play("That's a tiny shape! Can you make it much bigger?");
        setStatus("Too small. Make it larger.");
        return;
    }
    
    const ratio = totalDist / (width + height);
    
    if (ratio < 1.3) {
       HapticEngine.playError();
       AudioEngine.play("That felt like a straight line. Try drawing a round circle or a boxy square!");
       setStatus("Detected: Line");
    } else if (ratio < 1.7) {
       HapticEngine.playSuccess();
       AudioEngine.play("Yay, a Circle! Let's go to the Circle lesson.");
       setStatus("Detected: Circle");
       setTimeout(() => navigation.navigate("Lesson", { type: "circle" }), 3500);
    } else {
       HapticEngine.playSuccess();
       AudioEngine.play("Awesome, a Square! Let's go to the Square lesson.");
       setStatus("Detected: Square");
       setTimeout(() => navigation.navigate("Lesson", { type: "square" }), 3500);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
         style={styles.backButton}
         onPress={() => { AudioEngine.stop(); navigation.goBack(); }}
      >
        <Text style={styles.backText}>Go Back</Text>
      </TouchableOpacity>
      
      <View style={styles.drawingArea} {...panResponder.panHandlers}>
         <Text style={styles.instruction}>{status}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0A0A' },
  backButton: { height: 100, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', margin: 10, borderRadius: 15 },
  backText: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  drawingArea: { flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#555', margin: 10, borderRadius: 20 },
  instruction: { color: '#FFD700', fontSize: 24, padding: 20, textAlign: 'center', fontWeight: 'bold' }
});

export default GestureMenuScreen;
