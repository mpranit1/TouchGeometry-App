import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, PanResponder, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Accelerometer, Magnetometer } from 'expo-sensors';
import AudioEngine from '../utils/AudioEngine';
import HapticEngine from '../utils/HapticEngine';
import GlobalStore from '../utils/GlobalStore';
import { CHAPTERS } from '../data/curriculum';

const UNIT_PIXELS = 60;

const LessonScreen = ({ route, navigation }) => {
  const type = route.params?.type || 'line';
  const topicChapters = CHAPTERS[type] || CHAPTERS['line'];

  const [mode, setMode] = useState('menu'); 
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [displayData, setDisplayData] = useState("");
  
  const chapterFocusRef = useRef(0);
  const lastTap = useRef(0);
  const gestureStartTime = useRef(0);

  useEffect(() => {
    if (mode === 'menu') {
       const ch = topicChapters[currentChapterIndex];
       AudioEngine.play(`Activity Menu. Swipe left or right to choose an activity. Currently on: ${ch.title}. Double tap anywhere to start.`);
    } else {
       const ch = topicChapters[currentChapterIndex];
       AudioEngine.play(ch.instruction);
       if (type === 'angle') setDisplayData("Waiting...");
       else if (type === 'coordinate') setDisplayData("(0, 0)");
       else if (type === 'distance') setDisplayData("0");
    }
  }, [type, mode, currentChapterIndex]);

  const initialHeadingRef = useRef(null);
  const stepsTakenRef = useRef(0);
  const shapePhaseRef = useRef(0);

  useEffect(() => {
     let stepSub = null;
     let magSub = null;
     
     if (type === 'master' && mode === 'drawing') {
         const chapter = topicChapters[currentChapterIndex];
         
         if (['jump', 'statue', 'shake', 'physical_shape', 'coordinate_hunt'].includes(chapter.type)) {
             Accelerometer.setUpdateInterval(100);
         }
         if (['spin', 'physical_shape', 'coordinate_hunt'].includes(chapter.type)) {
             Magnetometer.setUpdateInterval(100);
         }

         let isDone = false;

         if (chapter.type === 'jump') {
             stepSub = Accelerometer.addListener(data => {
                 if (isDone) return;
                 const { x, y, z } = data;
                 const mag = Math.sqrt(x*x + y*y + z*z);
                 if (mag > 2.2) { 
                     isDone = true;
                     HapticEngine.playSparkle();
                     AudioEngine.play("Great jump! You stamped a point!");
                     advanceChapter();
                 }
             });
         } else if (chapter.type === 'spin') {
             let lastAngle = null;
             let totalRotation = 0;
             magSub = Magnetometer.addListener(data => {
                 if (isDone) return;
                 let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
                 if (angle < 0) angle += 360;
                 if (lastAngle !== null) {
                     let delta = angle - lastAngle;
                     if (delta > 180) delta -= 360;
                     if (delta < -180) delta += 360;
                     totalRotation += Math.abs(delta);
                     if (totalRotation > 340) {
                         isDone = true;
                         HapticEngine.playSparkle();
                         AudioEngine.play("Wow! You spun a full circle!");
                         advanceChapter();
                     }
                 }
                 lastAngle = angle;
             });
         } else if (chapter.type === 'statue') {
             let freezeStartTime = null;
             let hasWalked = false;
             
             stepSub = Accelerometer.addListener(data => {
                 if (isDone) return;
                 const { x, y, z } = data;
                 const mag = Math.sqrt(x*x + y*y + z*z);
                 
                 if (mag > 1.3) {
                     hasWalked = true;
                     freezeStartTime = null; 
                 } else if (hasWalked && mag < 1.1) {
                     if (!freezeStartTime) freezeStartTime = Date.now();
                     else if (Date.now() - freezeStartTime > 3000) {
                         isDone = true;
                         HapticEngine.playSparkle();
                         AudioEngine.play("Perfect statue! You held the coordinate exactly.");
                         advanceChapter();
                     }
                 }
             });
         } else if (chapter.type === 'shake') {
             let shakeCount = 0;
             let lastShake = 0;
             stepSub = Accelerometer.addListener(data => {
                 if (isDone) return;
                 const { x, y, z } = data;
                 const mag = Math.sqrt(x*x + y*y + z*z);
                 if (mag > 1.8) {
                     const now = Date.now();
                     if (now - lastShake > 100) {
                         shakeCount++;
                         lastShake = now;
                         if (shakeCount > 10) {
                             isDone = true;
                             HapticEngine.playSparkle();
                             AudioEngine.play("Board erased! Amazing job!");
                             advanceChapter();
                         }
                     }
                 }
             });
         } else if (chapter.type === 'physical_shape' || chapter.type === 'coordinate_hunt') {
             shapePhaseRef.current = 0;
             stepsTakenRef.current = 0;
             initialHeadingRef.current = null;
             
             let sequence = [];
             if (chapter.shape === 'square') {
                 for (let i=0; i<4; i++) { sequence.push({type: 'walk', val: 3}); sequence.push({type: 'turn', val: 90}); }
             } else if (chapter.shape === 'triangle') {
                 for (let i=0; i<3; i++) { sequence.push({type: 'walk', val: 3}); sequence.push({type: 'turn', val: 120}); }
             } else if (chapter.shape === 'rectangle') {
                 sequence.push({type: 'walk', val: 4}); sequence.push({type: 'turn', val: 90});
                 sequence.push({type: 'walk', val: 2}); sequence.push({type: 'turn', val: 90});
                 sequence.push({type: 'walk', val: 4}); sequence.push({type: 'turn', val: 90});
                 sequence.push({type: 'walk', val: 2}); sequence.push({type: 'turn', val: 90});
             } else if (chapter.type === 'coordinate_hunt') {
                 sequence.push({type: 'turn', val: 90});
                 sequence.push({type: 'walk', val: 4});
                 sequence.push({type: 'turn', val: 90}); 
                 sequence.push({type: 'walk', val: 2});
             }
             
             let lastStepTime = 0;
             
             stepSub = Accelerometer.addListener(data => {
                 if (isDone || shapePhaseRef.current >= sequence.length) return;
                 const currentTask = sequence[shapePhaseRef.current];
                 if (currentTask.type !== 'walk') return;
                 
                 const { x, y, z } = data;
                 const mag = Math.sqrt(x*x + y*y + z*z);
                 if (mag > 1.3) {
                     const now = Date.now();
                     if (now - lastStepTime > 500) {
                         stepsTakenRef.current += 1;
                         lastStepTime = now;
                         HapticEngine.playHeavyImpact();
                         
                         if (stepsTakenRef.current >= currentTask.val) {
                             HapticEngine.playSparkle();
                             shapePhaseRef.current++;
                             stepsTakenRef.current = 0;
                             initialHeadingRef.current = null;
                             if (shapePhaseRef.current >= sequence.length) {
                                 isDone = true;
                                 AudioEngine.play("Amazing! Activity complete.");
                                 advanceChapter();
                             } else {
                                 AudioEngine.play("Good! Now turn.");
                             }
                         }
                     }
                 }
             });
             
             magSub = Magnetometer.addListener(data => {
                 if (isDone || shapePhaseRef.current >= sequence.length) return;
                 const currentTask = sequence[shapePhaseRef.current];
                 if (currentTask.type !== 'turn') return;
                 
                 let angle = Math.atan2(data.y, data.x) * (180 / Math.PI);
                 if (angle < 0) angle += 360;
                 
                 if (initialHeadingRef.current === null) {
                     initialHeadingRef.current = angle;
                 } else {
                     let diff = Math.abs(angle - initialHeadingRef.current);
                     if (diff > 180) diff = 360 - diff;
                     
                     if (Math.abs(diff - currentTask.val) < 20) { 
                         HapticEngine.playSparkle();
                         shapePhaseRef.current++;
                         initialHeadingRef.current = null;
                         stepsTakenRef.current = 0;
                         if (shapePhaseRef.current >= sequence.length) {
                             isDone = true;
                             AudioEngine.play("Amazing! Activity complete.");
                             advanceChapter();
                         } else {
                             AudioEngine.play("Good! Now walk.");
                         }
                     }
                 }
             });
         }
     }
     
     return () => {
         if (stepSub) stepSub.remove();
         if (magSub) magSub.remove();
     };
  }, [type, mode, currentChapterIndex]);

  const advanceTimeoutRef = useRef(null);

  const advanceChapter = useCallback(() => {
      if (advanceTimeoutRef.current) clearTimeout(advanceTimeoutRef.current);
      advanceTimeoutRef.current = setTimeout(() => {
          if (chapterFocusRef.current < topicChapters.length - 1) {
              chapterFocusRef.current++;
              setCurrentChapterIndex(chapterFocusRef.current);
          } else {
              GlobalStore.markTopicComplete(type);
              AudioEngine.play("You finished all activities and quizzes for this lesson! Returning to the menu.");
              setMode('menu');
          }
      }, 4500);
  }, [topicChapters, type]);

  const getChapter = useCallback(() => topicChapters[chapterFocusRef.current], [topicChapters]);

  const panResponderMenu = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dx, dy } = gestureState;
        const now = Date.now();
        const currentIndex = chapterFocusRef.current;

        if (dx > 50 && Math.abs(dy) < 50) {
          const nextIdx = Math.min(currentIndex + 1, topicChapters.length - 1);
          if (nextIdx !== currentIndex) {
            chapterFocusRef.current = nextIdx;
            setCurrentChapterIndex(nextIdx);
            HapticEngine.playLineDrag();
            AudioEngine.play(topicChapters[nextIdx].title);
          } else {
             HapticEngine.playError();
             AudioEngine.play("Last activity.");
          }
          lastTap.current = 0;
        } 
        else if (dx < -50 && Math.abs(dy) < 50) {
          const prevIdx = Math.max(currentIndex - 1, 0);
          if (prevIdx !== currentIndex) {
            chapterFocusRef.current = prevIdx;
            setCurrentChapterIndex(prevIdx);
            HapticEngine.playLineDrag();
            AudioEngine.play(topicChapters[prevIdx].title);
          } else {
             HapticEngine.playError();
             AudioEngine.play("First activity.");
          }
          lastTap.current = 0;
        } 
        else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
           if (now - lastTap.current < 500) { 
              HapticEngine.playSuccess();
              AudioEngine.stop();
              setMode('drawing');
              lastTap.current = 0;
           } else {
              AudioEngine.play(`Selected ${topicChapters[currentIndex].title}. Double tap to begin.`);
              HapticEngine.playLineDrag();
              lastTap.current = now;
           }
        }
      }
    })
  ).current;

  const panResponderQuiz = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
        const { dx } = gestureState;
        const chapter = getChapter();
        
        if (Math.abs(dx) > 60) {
            const answeredTrue = dx > 0;
            if (answeredTrue === chapter.correctAnswer) {
                HapticEngine.playSparkle();
                AudioEngine.play("Correct! Great job. Moving on.");
                advanceChapter();
            } else {
                HapticEngine.playRough();
                AudioEngine.play(`Oops, that's incorrect. ${chapter.instruction}`);
            }
        } else {
            AudioEngine.play("Remember, swipe right for True, or left for False.");
        }
      }
    })
  ).current;

  const panResponderLine = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
         pointsRef.current = [{ x: gestureState.x0, y: gestureState.y0 }];
         const chapter = getChapter();
         if (chapter.type === 'dashed') HapticEngine.playDashedLine(0);
         else HapticEngine.playSolidLine();
      },
      onPanResponderMove: (evt, gestureState) => {
         pointsRef.current.push({ x: gestureState.moveX, y: gestureState.moveY });
         const chapter = getChapter();
         const { dx, dy } = gestureState;
         const dist = Math.sqrt(dx*dx + dy*dy);
         
         if (chapter.type === 'dashed') {
             HapticEngine.playDashedLine(dist);
         } else if (chapter.type === 'slope') {
             HapticEngine.playSolidLine();
             if (dist % 50 < 5) {
                if (Math.abs(dx) > Math.abs(dy) * 1.5) {
                    AudioEngine.play("Horizontal!");
                } else if (Math.abs(dy) > Math.abs(dx) * 1.5) {
                    AudioEngine.play("Vertical!");
                }
             }
         } else {
             if (Math.abs(dx) % 30 < 5 || Math.abs(dy) % 30 < 5) HapticEngine.playSolidLine();
         }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const chapter = getChapter();
        const reqDist = chapter.reqDistance || 150;
        const dist = Math.sqrt(gestureState.dx**2 + gestureState.dy**2);

        if (dist > reqDist) {
           if (chapter.type === 'diagonal') {
               if (Math.abs(gestureState.dx) > 50 && Math.abs(gestureState.dy) > 50) {
                   HapticEngine.playSparkle();
                   AudioEngine.play("Yay! You drew a diagonal slash! Next activity.");
                   advanceChapter();
               } else {
                   HapticEngine.playRough();
                   AudioEngine.play("That was too straight! Try slanting it more diagonally.");
               }
           } else if (chapter.type === 'curved') {
               const pts = pointsRef.current;
               let totalDist = 0;
               for (let i = 1; i < pts.length; i++) {
                  totalDist += Math.sqrt((pts[i].x-pts[i-1].x)**2 + (pts[i].y-pts[i-1].y)**2);
               }
               const endDist = Math.sqrt((pts[pts.length-1].x - pts[0].x)**2 + (pts[pts.length-1].y - pts[0].y)**2);
               if (totalDist > endDist * 1.5 && endDist > 50) {
                   HapticEngine.playSparkle();
                   AudioEngine.play("Awesome! You drew a curvy wavy line that rolls around!");
                   advanceChapter();
               } else if (endDist <= 50) {
                   HapticEngine.playRough();
                   AudioEngine.play("That looks like a closed loop. Try drawing a wavy line from one side to the other!");
               } else {
                   HapticEngine.playRough();
                   AudioEngine.play("That was a bit too straight! Try making it wavy like a snake.");
               }
           } else if (chapter.type === 'perpendicular') {
               const pts = pointsRef.current;
               let foundRightAngle = false;
               if (pts.length > 20) {
                   const step = 10;
                   for (let i = step; i < pts.length - step; i++) {
                       const p1 = pts[i-step], p2 = pts[i], p3 = pts[i+step];
                       const baX = p1.x - p2.x, baY = p1.y - p2.y;
                       const bcX = p3.x - p2.x, bcY = p3.y - p2.y;
                       const magBA = Math.sqrt(baX*baX + baY*baY);
                       const magBC = Math.sqrt(bcX*bcX + bcY*bcY);
                       if (magBA > 10 && magBC > 10) {
                           let dot = (baX*bcX + baY*bcY) / (magBA * magBC);
                           let angle = Math.acos(Math.max(-1, Math.min(1, dot))) * 180 / Math.PI;
                           if (Math.abs(angle - 90) < 25) { foundRightAngle = true; break; }
                       }
                   }
               }
               if (foundRightAngle) {
                   HapticEngine.playSparkle();
                   AudioEngine.play("Awesome! You drew an L-shape for perpendicular lines.");
                   advanceChapter();
               } else {
                   HapticEngine.playRough();
                   AudioEngine.play("That wasn't quite a perfect corner. Draw a standing line, then turn sharply to draw a sleeping line!");
               }
           } else {
               HapticEngine.playSparkle();
               AudioEngine.play("Yay! You did it! Going to the next activity.");
               advanceChapter();
           }
        } else {
           HapticEngine.playRough();
           AudioEngine.play(`Oops! Keep going, make sure your line is long enough!`);
        }
      }
    })
  ).current;

  const pointsRef = useRef([]);

  const panResponderRigid = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
          pointsRef.current = [{ x: gestureState.x0, y: gestureState.y0 }];
          HapticEngine.playSolidLine();
      },
      onPanResponderMove: (evt, gestureState) => {
         const { dx, dy } = gestureState;
         pointsRef.current.push({ x: gestureState.moveX, y: gestureState.moveY });
         if (Math.abs(dx) % 30 < 5 || Math.abs(dy) % 30 < 5) HapticEngine.playSolidLine();
         
         if ((Math.abs(dx) > 80 && Math.abs(dy) < 20 && dx % 80 < 5) || 
             (Math.abs(dy) > 80 && Math.abs(dx) < 20 && dy % 80 < 5) ||
             (Math.abs(dx) > 60 && Math.abs(dy) > 60 && Math.abs(dx) % 60 < 5)) {
             HapticEngine.playHeavyImpact();
         }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const chapter = getChapter();
        const reqSides = chapter.reqSides || 120;
        const dist = Math.max(Math.abs(gestureState.dx), Math.abs(gestureState.dy));
        pointsRef.current.push({ x: gestureState.moveX, y: gestureState.moveY });

        if ((chapter.type === 'loop' || chapter.type === 'edges') && dist < reqSides) {
            HapticEngine.playRough();
            AudioEngine.play("Warning buzz! You stopped tracing before closing the loop! Try drawing the whole shape.");
            return;
        }

        if (chapter.type === 'pattern' && dist > reqSides) {
            HapticEngine.playSparkle();
            AudioEngine.play("Amazing pattern! You drew multiple shapes!");
            advanceChapter();
            return;
        }

        if (dist > reqSides) {
            if (chapter.type === 'right_tri' || chapter.type === 'slant' || chapter.type === 'tangram') {
              const pts = pointsRef.current;
              const step = 5; 
              let corners = [];
              for (let i = step; i < pts.length - step; i++) {
                 const prev = pts[i - step];
                 const curr = pts[i];
                 const next = pts[i + step];
                 const baX = prev.x - curr.x; const baY = prev.y - curr.y;
                 const bcX = next.x - curr.x; const bcY = next.y - curr.y;
                 const magBA = Math.sqrt(baX*baX + baY*baY);
                 const magBC = Math.sqrt(bcX*bcX + bcY*bcY);
                 if (magBA > 5 && magBC > 5) {
                     const dot = (baX*bcX + baY*bcY) / (magBA * magBC);
                     if (dot > -0.5) corners.push(dot); // Angle < 120 degrees
                 }
              }
              
              let hasRightAngle = false;
              let allSquare = corners.length > 0;
              for (let d of corners) {
                  let rad = Math.acos(d);
                  if (isNaN(rad)) rad = 0;
                  let deg = Math.round(rad * 180 / Math.PI);
                  if (Math.abs(deg - 90) <= 25) hasRightAngle = true;
                  else allSquare = false;
              }
              
              if (chapter.type === 'right_tri') {
                  if (hasRightAngle) {
                      HapticEngine.playSparkle();
                      AudioEngine.play(`Perfect! You found the right angle corner! Next activity.`);
                      advanceChapter();
                  } else {
                      HapticEngine.playRough();
                      AudioEngine.play(`No 90 degree corner found. Try to make one perfectly square 90 degree corner!`);
                  }
              } else if (chapter.type === 'slant' || chapter.type === 'tangram') {
                  if (hasRightAngle || allSquare) {
                      HapticEngine.playRough();
                      AudioEngine.play(`Too square! Try slanting it more so it has no right angles!`);
                  } else {
                      HapticEngine.playSparkle();
                      AudioEngine.play("Perfect! You felt the slanted shape! Next activity.");
                      advanceChapter();
                  }
              }
           } else if (chapter.type === 'rectangle') {
               let minX = 9999, maxX = -9999, minY = 9999, maxY = -9999;
               pointsRef.current.forEach(p => {
                  if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
                  if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
               });
               const w = maxX - minX; const h = maxY - minY;
               if (w > h * 1.5 || h > w * 1.5) {
                   HapticEngine.playSparkle();
                   AudioEngine.play("Great rectangle tile! It has long and short sides.");
                   advanceChapter();
               } else {
                   HapticEngine.playRough();
                   AudioEngine.play("That looks too much like a perfect square. Make two sides longer!");
               }
           } else {
               HapticEngine.playSparkle();
               AudioEngine.play(`Great job! You traced it perfectly! Next activity.`);
               advanceChapter();
           }
        } else {
           HapticEngine.playRough();
           AudioEngine.play(`Keep going! Explore the whole shape to feel all the corners.`);
        }
      }
    })
  ).current;

  const lastCircleBounds = useRef(null);

  const panResponderCircle = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
         gestureStartTime.current = Date.now();
         HapticEngine.playSolidLine();
         if (getChapter().type === 'center_tap' && lastCircleBounds.current) {
             const { cx, cy, r } = lastCircleBounds.current;
             const tapDist = Math.sqrt((gestureState.x0 - cx)**2 + (gestureState.y0 - cy)**2);
             if (tapDist < r * 0.4) {
                 HapticEngine.playSparkle();
                 AudioEngine.play("Perfect! You found the exact center point of the wheel!");
                 lastCircleBounds.current = null;
                 advanceChapter();
             } else {
                 HapticEngine.playRough();
                 AudioEngine.play("You tapped on the outside. Try tapping exactly in the middle of the circle you drew!");
             }
         }
      },
      onPanResponderMove: (evt, gestureState) => {
         const chapter = getChapter();
         const { dx, dy } = gestureState;
         
         if (chapter.type === 'clock') {
             if (Math.abs(dx) % 30 < 5 || Math.abs(dy) % 30 < 5) HapticEngine.playSolidLine();
             if ((Math.abs(dx) < 15 && Math.abs(dy) > 60 && Math.abs(dy) % 60 < 10) || 
                 (Math.abs(dy) < 15 && Math.abs(dx) > 60 && Math.abs(dx) % 60 < 10)) {
                 HapticEngine.playDashedLine(0);
             }
         } else {
             if (Math.abs(dx) % 20 < 5 || Math.abs(dy) % 20 < 5) HapticEngine.playSolidLine();
         }
      },
      onPanResponderRelease: (evt, gestureState) => {
        const chapter = getChapter();
        const reqSize = chapter.reqSize || 100;
        const maxSize = chapter.maxSize || 9999;
        const duration = Date.now() - gestureStartTime.current;
        
        const size = Math.max(Math.abs(gestureState.dx), Math.abs(gestureState.dy));

        if (size > reqSize && size < maxSize) {
           if (chapter.type === 'fast') {
               if (duration < 1500) {
                   HapticEngine.playSparkle();
                   AudioEngine.play("Wow! Super fast! Next activity.");
                   advanceChapter();
               } else {
                   HapticEngine.playRough();
                   AudioEngine.play(`You took ${duration/1000} seconds. Try to do it faster than 1.5 seconds!`);
               }
           } else if (chapter.type === 'center_tap') {
               HapticEngine.playSolidLine();
               AudioEngine.play("Good! Now lift your finger and tap exactly in the center of the wheel!");
               lastCircleBounds.current = { cx: evt.nativeEvent.pageX - gestureState.dx/2, cy: evt.nativeEvent.pageY - gestureState.dy/2, r: size/2 };
           } else {
               HapticEngine.playSparkle();
               AudioEngine.play("Wow! You drew it perfectly! Next activity.");
               advanceChapter();
           }
        } else if (size >= maxSize) {
           HapticEngine.playRough();
           AudioEngine.play("That circle is a bit too big! Try drawing a smaller one.");
        } else {
           HapticEngine.playRough();
           AudioEngine.play("Keep going round and round to finish the circle loop!");
        }
      }
    })
  ).current;

  const lastUnitsReported = useRef(0);
  const lastDistanceBounds = useRef(null);
  const panResponderDistance = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => { 
          lastUnitsReported.current = 0; 
          setDisplayData("0"); 
          HapticEngine.playSolidLine(); 

          if (getChapter().type === 'inside' && lastDistanceBounds.current) {
             const { minX, maxX, minY, maxY } = lastDistanceBounds.current;
             const px = gestureState.x0; const py = gestureState.y0;
             if (px > minX && px < maxX && py > minY && py < maxY) {
                 HapticEngine.playSparkle();
                 AudioEngine.play("Great job! You tapped inside the boundary.");
                 lastDistanceBounds.current = null;
                 advanceChapter();
             } else {
                 HapticEngine.playRough();
                 AudioEngine.play("You tapped outside the boundary. Try tapping inside!");
             }
          }
      },
      onPanResponderMove: (evt, gestureState) => {
         const distance = Math.sqrt(gestureState.dx * gestureState.dx + gestureState.dy * gestureState.dy);
         const units = Math.floor(distance / UNIT_PIXELS);
         
         if (units > lastUnitsReported.current) {
            lastUnitsReported.current = units;
            setDisplayData(`${units}`);
            HapticEngine.playHeavyImpact(); 
            AudioEngine.play(`${units}`);
         }
      },
      onPanResponderRelease: (evt, gestureState) => {
         const finalDist = Math.floor(Math.sqrt(gestureState.dx**2 + gestureState.dy**2) / UNIT_PIXELS);
         const chapter = getChapter();

         if (chapter.type === 'exact') {
             if (finalDist === chapter.targetUnits) {
                 HapticEngine.playSparkle();
                 AudioEngine.play(`Perfect! Exactly ${chapter.targetUnits} steps. Moving to next activity.`);
                 advanceChapter();
             } else {
                 HapticEngine.playRough();
                 AudioEngine.play(`You took ${finalDist} steps. Try to take exactly ${chapter.targetUnits} steps!`);
             }
         } else if (chapter.type === 'pause') {
             if (finalDist >= chapter.targetUnits) {
                 HapticEngine.playSparkle();
                 AudioEngine.play(`Great! You moved ${finalDist} steps with a pause! Next activity.`);
                 advanceChapter();
             } else {
                 HapticEngine.playRough();
                 AudioEngine.play(`You took ${finalDist} steps. Try taking a pause and taking more steps!`);
             }
         } else if (chapter.type === 'inside') {
             if (finalDist > 2) {
                 AudioEngine.play("Boundary drawn. Now lift your finger and tap inside the space.");
                 const cx = evt.nativeEvent.pageX - gestureState.dx;
                 const cy = evt.nativeEvent.pageY - gestureState.dy;
                 lastDistanceBounds.current = { 
                    minX: Math.min(cx, evt.nativeEvent.pageX), maxX: Math.max(cx, evt.nativeEvent.pageX),
                    minY: Math.min(cy, evt.nativeEvent.pageY), maxY: Math.max(cy, evt.nativeEvent.pageY) 
                 };
             } else {
                 HapticEngine.playRough();
                 AudioEngine.play("Draw a bigger boundary first!");
             }
         } else {
             if (finalDist > 0) {
                let directionUrl = "";
                if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) { directionUrl = gestureState.dx > 0 ? "right" : "left"; } 
                else { directionUrl = gestureState.dy > 0 ? "down" : "up"; }

                HapticEngine.playSparkle();
                AudioEngine.play(`Awesome! You moved ${finalDist} steps to the ${directionUrl}.`);
                advanceChapter();
             }
         }
      }
    })
  ).current;

  const lastCoord = useRef({ x: 0, y: 0, firstPoint: null });
  const panResponderCoordinate = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
         const chapter = getChapter();
         if (chapter.type === 'point') {
             lastCoord.current = { ...lastCoord.current, x: 0, y: 0 };
             setDisplayData("Point");
             HapticEngine.playSolidLine();
         } else if (chapter.type === 'two_points') {
             if (!lastCoord.current.firstPoint) {
                 lastCoord.current.firstPoint = { x: gestureState.x0, y: gestureState.y0 };
                 setDisplayData("Point 1");
                 HapticEngine.playSolidLine();
                 AudioEngine.play("First point placed! Now tap somewhere else to place the second point.");
             }
         } else if (chapter.type === 'x_axis' || chapter.type === 'y_axis') {
             pointsRef.current = [{ x: gestureState.x0, y: gestureState.y0 }];
             HapticEngine.playSolidLine();
         } else if (chapter.type === 'origin') {
             lastCoord.current = { ...lastCoord.current, x: Math.floor(Math.random() * 5) + 2, y: Math.floor(Math.random() * 5) + 2 };
             setDisplayData(`( ${lastCoord.current.x} , ${lastCoord.current.y} )`);
             HapticEngine.playSolidLine();
         } else {
             lastCoord.current = { ...lastCoord.current, x: 0, y: 0 };
             setDisplayData(`( ${lastCoord.current.x} , ${lastCoord.current.y} )`);
             HapticEngine.playSolidLine();
         }
      },
      onPanResponderMove: (evt, gestureState) => {
         const chapter = getChapter();
         if (chapter.type === 'point' || chapter.type === 'two_points') return; // Ignore movement for point activity

         if (chapter.type === 'x_axis' || chapter.type === 'y_axis') {
             pointsRef.current.push({ x: gestureState.moveX, y: gestureState.moveY });
             const { dx, dy } = gestureState;
             if (chapter.type === 'x_axis' && Math.abs(dx) % 30 < 5) HapticEngine.playSolidLine();
             if (chapter.type === 'y_axis' && Math.abs(dy) % 30 < 5) HapticEngine.playSolidLine();
             
             if (Math.abs(dx) > 50 && Math.abs(dy) < 30 && chapter.type === 'x_axis') {
                 if (Math.abs(dx) % 60 < 5) AudioEngine.play("X Axis");
             }
             if (Math.abs(dy) > 50 && Math.abs(dx) < 30 && chapter.type === 'y_axis') {
                 if (Math.abs(dy) % 60 < 5) AudioEngine.play("Y Axis");
             }
             return;
         }

         const currX = Math.round(gestureState.dx / UNIT_PIXELS) + (chapter.type === 'origin' ? lastCoord.current.x : 0);
         const currY = Math.round(-gestureState.dy / UNIT_PIXELS) + (chapter.type === 'origin' ? lastCoord.current.y : 0);

         if (currX !== lastCoord.current.x || currY !== lastCoord.current.y) {
             lastCoord.current = { ...lastCoord.current, x: currX, y: currY };
             setDisplayData(`( ${currX} , ${currY} )`);
             HapticEngine.playHeavyImpact();
             
             let phrase = `Coordinate ${currX}, ${currY}`;
             AudioEngine.play(phrase);
         }
      },
      onPanResponderRelease: (evt, gestureState) => {
          const chapter = getChapter();

          if (chapter.type === 'point') {
              const dist = Math.sqrt(gestureState.dx**2 + gestureState.dy**2);
              if (dist < 20) {
                  HapticEngine.playSparkle();
                  AudioEngine.play("Great job! You placed a point. A point shows an exact location.");
                  advanceChapter();
              } else {
                  HapticEngine.playRough();
                  AudioEngine.play("You drew a line! A point has no length. Try just tapping the screen once.");
              }
              return;
          } else if (chapter.type === 'two_points') {
              if (lastCoord.current.firstPoint) {
                  const p1 = lastCoord.current.firstPoint;
                  const p2 = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
                  const dist = Math.sqrt((p2.x - p1.x)**2 + (p2.y - p1.y)**2);
                  if (dist > 50) {
                      HapticEngine.playSparkle();
                      AudioEngine.play("Great! A straight line connects your two points.");
                      lastCoord.current.firstPoint = null;
                      advanceChapter();
                  } else {
                      HapticEngine.playRough();
                      AudioEngine.play("That's too close to the first point! Tap further away.");
                  }
              }
              return;
          } else if (chapter.type === 'x_axis') {
              if (Math.abs(gestureState.dx) > 100 && Math.abs(gestureState.dy) < 50) {
                  HapticEngine.playSparkle();
                  AudioEngine.play("Excellent! You moved along the horizontal X-axis.");
                  advanceChapter();
              } else {
                  HapticEngine.playRough();
                  AudioEngine.play("The X-axis is a sleeping line. Try dragging left or right!");
              }
              return;
          } else if (chapter.type === 'y_axis') {
              if (Math.abs(gestureState.dy) > 100 && Math.abs(gestureState.dx) < 50) {
                  HapticEngine.playSparkle();
                  AudioEngine.play("Excellent! You moved along the vertical Y-axis.");
                  advanceChapter();
              } else {
                  HapticEngine.playRough();
                  AudioEngine.play("The Y-axis is a standing line. Try dragging up or down!");
              }
              return;
          }

          const cx = lastCoord.current.x;
          const cy = lastCoord.current.y;
          
          if (chapter.type === 'target' || chapter.type === 'origin' || chapter.type === 'map') {
              if (cx === chapter.targetX && cy === chapter.targetY) {
                  HapticEngine.playSparkle();
                  AudioEngine.play("You found the target! Amazing job!");
                  advanceChapter();
              } else {
                  HapticEngine.playRough();
                  AudioEngine.play(`You are at ${cx}, ${cy}. The target is ${chapter.targetX}, ${chapter.targetY}. Keep searching!`);
              }
          } else {
              HapticEngine.playSparkle();
              AudioEngine.play(`Finished! You are resting at point ${cx}, ${cy}. Great exploring!`);
              advanceChapter();
          }
      }
    })
  ).current;

  const panResponderAngle = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt, gestureState) => {
          pointsRef.current = [{ x: gestureState.x0, y: gestureState.y0 }];
          HapticEngine.playSolidLine();
          setDisplayData("Drawing...");
      },
      onPanResponderMove: (evt, gestureState) => {
          pointsRef.current.push({ x: gestureState.moveX, y: gestureState.moveY });
          if (pointsRef.current.length % 10 === 0) HapticEngine.playSolidLine();
      },
      onPanResponderRelease: (evt, gestureState) => {
          pointsRef.current.push({ x: gestureState.moveX, y: gestureState.moveY });
          const pts = pointsRef.current;
          if (pts.length < 15) {
              AudioEngine.play("Oops, that was a bit too short. Draw a longer V shape!");
              HapticEngine.playRough();
              setDisplayData("Too short");
              return;
          }
          
          let maxDist = -1;
          let vertexIdx = Math.floor(pts.length / 2);
          const startPt = pts[0];
          const endPt = pts[pts.length - 1];
          
          for (let i = 1; i < pts.length - 1; i++) {
             const p = pts[i];
             const num = Math.abs((endPt.y - startPt.y)*p.x - (endPt.x - startPt.x)*p.y + endPt.x*startPt.y - endPt.y*startPt.x);
             const den = Math.sqrt((endPt.y - startPt.y)**2 + (endPt.x - startPt.x)**2);
             const dist = den === 0 ? 0 : num / den;
             if (dist > maxDist) {
                 maxDist = dist;
                 vertexIdx = i;
             }
          }
          
          const chapter = getChapter();
          let angleDeg = 180;
          
          if (maxDist < 25) {
              // It's a straight line
              angleDeg = 180;
          } else {
              const vertex = pts[vertexIdx];
              const baX = startPt.x - vertex.x;
              const baY = startPt.y - vertex.y;
              const bcX = endPt.x - vertex.x;
              const bcY = endPt.y - vertex.y;
              
              const magBA = Math.sqrt(baX*baX + baY*baY);
              const magBC = Math.sqrt(bcX*bcX + bcY*bcY);
              
              if (magBA > 5 && magBC > 5) {
                  let dot = (baX*bcX + baY*bcY) / (magBA * magBC);
                  if (dot > 1.0) dot = 1.0;
                  if (dot < -1.0) dot = -1.0;
                  angleDeg = Math.round(Math.acos(dot) * 180 / Math.PI);
              }
          }
          
          if (chapter.type !== 'flat' && angleDeg > 160) {
              AudioEngine.play("That's a straight line! Make sure to turn your finger to make a pointy corner.");
              HapticEngine.playRough();
              setDisplayData("Straight Line");
              return;
          }
          
          let classification = "";
          if (angleDeg < 80) classification = "an Acute angle";
          else if (angleDeg <= 100) classification = "a Right angle";
          else classification = "an Obtuse angle";
          if (angleDeg > 165) classification = "a Straight Line";
          
          setDisplayData(`${angleDeg}°`);
          
          if (chapter.type) {
              if (Math.abs(angleDeg - chapter.targetAngle) <= chapter.maxDiff) {
                  HapticEngine.playSparkle();
                  AudioEngine.play(`Great job! You drew a ${angleDeg} degree ${chapter.type} angle! Moving to next activity.`);
                  advanceChapter();
              } else {
                  HapticEngine.playRough();
                  let hint = chapter.targetAngle < angleDeg ? "sharper (smaller)" : "wider (bigger)";
                  AudioEngine.play(`You drew a ${angleDeg} degree angle. Try to make it ${hint} for this activity!`);
              }
          } else {
              HapticEngine.playSparkle();
              AudioEngine.play(`Measured: ${angleDeg} degrees! It's ${classification}.`);
              advanceChapter();
          }
      }
    })
  ).current;

  const multiTouchStartDist = useRef(0);
  const multiTouchStartAngle = useRef(0);

  const panResponderMultiTouch = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
         const touches = evt.nativeEvent.touches;
         if (touches.length === 2) {
             const dx = touches[0].pageX - touches[1].pageX;
             const dy = touches[0].pageY - touches[1].pageY;
             const dist = Math.sqrt(dx*dx + dy*dy);
             const angle = Math.atan2(dy, dx);
             
             if (multiTouchStartDist.current === 0) {
                 multiTouchStartDist.current = dist;
                 multiTouchStartAngle.current = angle;
             }
             
             const chapter = getChapter();
             
             if (chapter.type === 'parallel') {
                 if (dist > 50 && Math.abs(angle - multiTouchStartAngle.current) < 0.5) {
                     if (Math.abs(dx) > 100 || Math.abs(dy) > 100) {
                         HapticEngine.playSparkle();
                         AudioEngine.play("Great job! You drew parallel lines moving together.");
                         multiTouchStartDist.current = 0;
                         advanceChapter();
                     }
                 }
             } else if (chapter.type === 'pinch') {
                 if (multiTouchStartDist.current - dist > 100) {
                     HapticEngine.playSparkle();
                     AudioEngine.play("Amazing! You pinched and shrunk the shape! Next challenge.");
                     multiTouchStartDist.current = 0;
                     advanceChapter();
                 }
             } else if (chapter.type === 'twist') {
                 if (Math.abs(angle - multiTouchStartAngle.current) > 0.8) {
                     HapticEngine.playSparkle();
                     AudioEngine.play("Incredible! You twisted and rotated the shape!");
                     multiTouchStartAngle.current = 0;
                     advanceChapter();
                 }
             }
         }
      },
      onPanResponderRelease: () => {
         multiTouchStartDist.current = 0;
         multiTouchStartAngle.current = 0;
      }
    })
  ).current;

  const panResponderMasterFallback = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (evt, gestureState) => {
         const chapter = getChapter();
         if (['jump', 'spin', 'statue', 'shake', 'physical_shape', 'coordinate_hunt'].includes(chapter.type)) {
            HapticEngine.playSparkle();
            AudioEngine.play("Manual override accepted.");
            advanceChapter();
         }
      }
    })
  ).current;

  const activePanResponder = useMemo(() => {
      if (mode === 'menu') return panResponderMenu;
      const chapter = getChapter();
      if (chapter?.type === 'quiz') return panResponderQuiz;
      if (['triangle', 'square', 'parallelogram', 'pentagon'].includes(type) || chapter?.type === 'pattern' || chapter?.type === 'rectangle' || chapter?.type === 'edges' || chapter?.type === 'tangram') return panResponderRigid;
      if (type === 'circle' || chapter?.type === 'center_tap') return panResponderCircle;
      if (type === 'distance' || chapter?.type === 'exact' || chapter?.type === 'inside') return panResponderDistance;
      if (type === 'coordinate' || chapter?.type === 'target' || chapter?.type === 'map' || chapter?.type === 'point' || chapter?.type === 'two_points' || chapter?.type === 'x_axis' || chapter?.type === 'y_axis') return panResponderCoordinate;
      if (type === 'angle' || chapter?.type === 'right' || chapter?.type === 'letter') return panResponderAngle;
      if (chapter?.type === 'pinch' || chapter?.type === 'twist' || chapter?.type === 'parallel') return panResponderMultiTouch;
      if (type === 'master' && ['jump', 'spin', 'statue', 'shake', 'physical_shape', 'coordinate_hunt'].includes(chapter?.type)) return panResponderMasterFallback;
      return panResponderLine;
  }, [mode, type, getChapter]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
         style={styles.backButton}
         onPress={() => { 
             AudioEngine.stop(); 
             if (mode === 'drawing') {
                 setMode('menu');
                 AudioEngine.play("Back to Activities Menu");
             } else {
                 navigation.goBack(); 
             }
         }}
      >
        <Text style={styles.backText}>{mode === 'drawing' ? 'Back to Activities' : 'Go to Home'}</Text>
      </TouchableOpacity>

      <View style={styles.drawingArea} {...activePanResponder.panHandlers} accessible={true}>
        {mode === 'menu' ? (
           <>
               <Text style={styles.instruction}>Select Activity</Text>
               <Text style={styles.chapterTitle}>{topicChapters[currentChapterIndex].title}</Text>
               <Text style={styles.instructionSmall}>Swipe to change. Double tap to start.</Text>
           </>
        ) : (
           <>
               {getChapter()?.type === 'quiz' ? (
                  <>
                     <Text style={styles.instruction}>Quiz Time!</Text>
                     <Text style={styles.unitsDisplay}>➡️ True</Text>
                     <Text style={styles.unitsDisplay}>⬅️ False</Text>
                  </>
               ) : (
                  <>
                     {['line', 'triangle', 'square', 'circle', 'parallelogram', 'pentagon'].includes(type) && (
                        <Text style={styles.instruction}>Explore {type.toUpperCase()} Bounds</Text>
                     )}
                     {type === 'distance' && (
                        <>
                           <Text style={styles.instruction}>Distance Measured:</Text>
                           <Text style={styles.unitsDisplay}>{displayData} Units</Text>
                        </>
                     )}
                     {type === 'coordinate' && (
                        <>
                           <Text style={styles.instruction}>Grid Engine:</Text>
                           <Text style={styles.unitsDisplay}>{displayData}</Text>
                        </>
                     )}
                     {type === 'angle' && (
                        <>
                           <Text style={styles.instruction}>Goniometer Engine:</Text>
                           <Text style={styles.unitsDisplay}>{displayData}</Text>
                        </>
                     )}
                     {(getChapter()?.type === 'pinch' || getChapter()?.type === 'twist') && (
                        <>
                           <Text style={styles.instruction}>Multi-Touch Engine:</Text>
                           <Text style={styles.unitsDisplay}>Use 2 Fingers</Text>
                        </>
                     )}
                  </>
               )}
           </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#121212' },
  backButton: { height: 100, backgroundColor: '#444', justifyContent: 'center', alignItems: 'center', margin: 10, borderRadius: 15 },
  backText: { fontSize: 24, color: '#FFF', fontWeight: 'bold' },
  drawingArea: { flex: 1, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#333', margin: 10, borderRadius: 15 },
  instruction: { color: '#666', fontSize: 24, marginBottom: 20, textTransform: 'capitalize' },
  instructionSmall: { color: '#444', fontSize: 18, marginTop: 20 },
  chapterTitle: { color: '#32CD32', fontSize: 40, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 20 },
  unitsDisplay: { color: '#FFF', fontSize: 60, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 }
});

export default LessonScreen;
