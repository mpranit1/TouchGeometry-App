import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AudioEngine from '../utils/AudioEngine';
import HapticEngine from '../utils/HapticEngine';

const SandboxScreen = ({ navigation }) => {
  const points = useRef([]);
  const [status, setStatus] = useState("Sandbox Mode. Draw anything!");
  
  useEffect(() => {
    AudioEngine.play("Welcome to the Sandbox! Draw any shape, like a line, circle, square, or triangle, and I will guess what it is.");
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
        points.current = [{ x: gestureState.x0, y: gestureState.y0 }];
        HapticEngine.playSolidLine();
        setStatus("Drawing...");
      },
      onPanResponderMove: (evt, gestureState) => {
        points.current.push({ x: gestureState.moveX, y: gestureState.moveY });
        if (points.current.length % 5 === 0) {
            HapticEngine.playSolidLine();
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        points.current.push({ x: gestureState.moveX, y: gestureState.moveY });
        analyzeDrawing(points.current);
      }
    })
  ).current;

  const analyzeDrawing = (pts) => {
    if (pts.length < 15) {
        AudioEngine.play("Too small! Draw something bigger.");
        HapticEngine.playError();
        setStatus("Too short.");
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
    
    // Line check
    const startToEndDist = Math.sqrt(Math.pow(pts[pts.length-1].x - pts[0].x, 2) + Math.pow(pts[pts.length-1].y - pts[0].y, 2));
    if (totalDist < startToEndDist * 1.2) {
       HapticEngine.playSuccess();
       AudioEngine.play("You drew a Straight Line!");
       setStatus("Straight Line");
       return;
    }
    
    // Triangle check (sharp corners)
    let sharpCorners = 0;
    const step = 10;
    for (let i = step; i < pts.length - step; i += 5) {
         const prev = pts[i - step];
         const curr = pts[i];
         const next = pts[i + step];
         const baX = prev.x - curr.x; const baY = prev.y - curr.y;
         const bcX = next.x - curr.x; const bcY = next.y - curr.y;
         const magBA = Math.sqrt(baX*baX + baY*baY);
         const magBC = Math.sqrt(bcX*bcX + bcY*bcY);
         if (magBA > 5 && magBC > 5) {
             const dot = (baX*bcX + baY*bcY) / (magBA * magBC);
             if (dot > -0.5 && dot < 0.5) sharpCorners++; // around 90 deg
             else if (dot > 0.5 && dot < 1.0) sharpCorners++; // sharp acute
         }
    }
    
    const isClosed = startToEndDist < (width + height) * 0.2;
    
    if (isClosed && sharpCorners >= 2 && sharpCorners <= 4) {
       HapticEngine.playSuccess();
       AudioEngine.play("You drew a Triangle!");
       setStatus("Triangle");
       return;
    }
    
    const ratio = totalDist / (width + height);
    if (ratio < 1.8 && isClosed) {
       HapticEngine.playSuccess();
       AudioEngine.play("You drew a Circle!");
       setStatus("Circle");
    } else {
       HapticEngine.playSuccess();
       AudioEngine.play("You drew a Rectangle or Square!");
       setStatus("Rectangle / Square");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
         style={styles.backButton}
         onPress={() => { AudioEngine.stop(); navigation.goBack(); }}
      >
        <Text style={styles.backText}>Back to Home</Text>
      </TouchableOpacity>
      
      <View style={styles.drawingArea} {...panResponder.panHandlers}>
         <Text style={styles.instruction}>{status}</Text>
         <Text style={styles.subtext}>Draw a line, circle, square, or triangle.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1A1A2E' },
  backButton: { height: 80, backgroundColor: '#E94560', justifyContent: 'center', alignItems: 'center', margin: 10, borderRadius: 10 },
  backText: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  drawingArea: { flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#16213E', margin: 10, borderRadius: 10 },
  instruction: { color: '#0F3460', fontSize: 36, fontWeight: 'bold', textAlign: 'center' },
  subtext: { color: '#666', fontSize: 20, marginTop: 20 }
});

export default SandboxScreen;
