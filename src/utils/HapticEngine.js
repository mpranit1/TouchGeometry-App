import * as Haptics from 'expo-haptics';

class HapticEngine {
  static playSuccess() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  static playError() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }

  static playLineDrag() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  static playCorner() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  static async playSparkle() {
    for (let i = 0; i < 4; i++) {
       Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
       await new Promise(resolve => setTimeout(resolve, 80));
    }
  }

  static async playRough() {
    for (let i = 0; i < 3; i++) {
       Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
       await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  static playDashedLine(distance) {
     if (Math.floor(distance / 40) % 2 === 0) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
     }
  }

  static playSolidLine() {
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }

  static playHeavyImpact() {
     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
}

export default HapticEngine;
