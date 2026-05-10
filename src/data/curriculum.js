export const CHAPTERS = {
  line: [
    { title: "Activity 1: Sleeping Lines", instruction: "Activity 1! In Class 2 we learn about sleeping lines. A sleeping line goes straight across. Trace a sleeping line!", reqDistance: 150, type: "solid" },
    { title: "Activity 2: Dashed vs. Solid", instruction: "Activity 2! Let's draw a dashed line! It will feel like bumpy dots.", reqDistance: 150, type: "dashed" },
    { title: "Mid-Lesson Quiz", instruction: "Quiz Time! True or False: A dashed line feels perfectly smooth. Swipe right for True, left for False.", type: "quiz", correctAnswer: false },
    { title: "Activity 3: Standing Lines", instruction: "Activity 3! Now let's draw a standing line! A standing line goes straight up and down, like a tree.", reqDistance: 100, type: "slope" },
    { title: "Activity 4: Slanting Lines", instruction: "Activity 4! Draw a slanting line. It leans to the side like a sliding board!", reqDistance: 150, type: "diagonal" },
    { title: "Activity 5: Curved Lines", instruction: "Activity 5! Shapes that roll use curved lines. Draw a wavy, curved line back and forth!", reqDistance: 150, type: "curved" },
    { title: "Activity 6: Parallel Lines", instruction: "Activity 6! Parallel lines never touch, like train tracks! Place two fingers on the screen and drag them together.", type: "parallel" },
    { title: "Activity 7: Perpendicular Lines", instruction: "Activity 7! Perpendicular lines cross at a perfect corner. Draw an L-shape without lifting your finger: a standing line that turns into a sleeping line!", type: "perpendicular" },
    { title: "Final Quiz", instruction: "Quiz Time! True or False: A sleeping line goes straight up and down. Swipe right for True, left for False.", type: "quiz", correctAnswer: false }
  ],
  triangle: [
    { title: "Activity 1: Edges and Corners", instruction: "Activity 1! In Class 3 we learn shapes have edges and corners. A triangle has 3 sharp corners. Find them!", reqSides: 120, type: "corners" },
    { title: "Activity 2: The Closed Loop", instruction: "Activity 2! Trace all 3 edges without lifting your finger.", reqSides: 200, type: "loop" },
    { title: "Mid-Lesson Quiz", instruction: "Quiz Time! True or False: A triangle has 4 corners. Swipe right for True, left for False.", type: "quiz", correctAnswer: false },
    { title: "Activity 3: Triangle Comparison", instruction: "Activity 3! Trace a triangle with a very long sleeping edge at the bottom!", reqSides: 250, type: "compare" },
    { title: "Activity 4: The Right Triangle", instruction: "Activity 4! Draw a triangle where one corner is a perfect square, like the letter L!", reqSides: 150, type: "right_tri" },
    { title: "Activity 5: Counting Edges", instruction: "Activity 5! Trace the 3 straight edges and count them out loud. One, two, three!", reqSides: 200, type: "edges" },
    { title: "Final Quiz", instruction: "Quiz Time! True or False: A triangle has 3 edges. Swipe right for True, left for False.", type: "quiz", correctAnswer: true }
  ],
  square: [
    { title: "Activity 1: Square Corners", instruction: "Activity 1! A square has 4 equal edges and 4 corners. Feel all 4 corners!", reqSides: 150, type: "corners" },
    { title: "Activity 2: The Box Walk", instruction: "Activity 2! Trace all 4 edges to close the square.", reqSides: 150, type: "box" },
    { title: "Mid-Lesson Quiz", instruction: "Quiz Time! True or False: All four edges of a square are equal. Swipe right for True, left for False.", type: "quiz", correctAnswer: true },
    { title: "Activity 3: Square vs Rectangle", instruction: "Activity 3! Can you draw a perfect square without making it too long?", reqSides: 200, type: "challenge" },
    { title: "Activity 4: Floor Patterns", instruction: "Activity 4! In Class 4 we learn about tiles! First draw a tiny tile, then a massive tile!", reqSides: 250, type: "scale" },
    { title: "Activity 5: The Rectangle Tile", instruction: "Activity 5! Floor tiles are often rectangles. Draw a rectangle with two long sleeping lines and two short standing lines.", reqSides: 200, type: "rectangle" },
    { title: "Final Quiz", instruction: "Quiz Time! True or False: A rectangle has all edges the exact same length. Swipe right for True, left for False.", type: "quiz", correctAnswer: false }
  ],
  circle: [
    { title: "Activity 1: Carts and Wheels", instruction: "Activity 1! In Class 4 we learn about Carts and Wheels! Draw a smooth circle loop, like a wheel.", reqSize: 100, type: "smooth" },
    { title: "Activity 2: Big Wheel, Small Wheel", instruction: "Activity 2! Now try to draw a tiny, small wheel.", reqSize: 50, maxSize: 80, type: "small" },
    { title: "Mid-Lesson Quiz", instruction: "Quiz Time! True or False: A wheel has zero sharp corners. Swipe right for True, left for False.", type: "quiz", correctAnswer: true },
    { title: "Activity 3: The Clock Face", instruction: "Activity 3! Tick-Tick-Tick! Draw a circle, and feel the bumps at 12, 3, 6, and 9 o'clock!", reqSize: 100, type: "clock" },
    { title: "Activity 4: The Fast Spin", instruction: "Activity 4! Draw a full circle as fast as you can! Ready, set, go!", reqSize: 100, type: "fast" },
    { title: "Activity 5: The Center Point", instruction: "Activity 5! Every wheel needs a center point! Draw a circle, then lift your finger and tap exactly in the center!", reqSize: 100, type: "center_tap" },
    { title: "Final Quiz", instruction: "Quiz Time! True or False: The center of a circle is right on the edge. Swipe right for True, left for False.", type: "quiz", correctAnswer: false }
  ],
  parallelogram: [
    { title: "Activity 1: Counting Corners", instruction: "Activity 1! A parallelogram is like a pushed-over square. Find all 4 corners!", reqSides: 120, type: "corners" },
    { title: "Activity 2: The Slanted Walk", instruction: "Activity 2! Draw all 4 slanting edges to close the loop.", reqSides: 200, type: "loop" },
    { title: "Mid-Lesson Quiz", instruction: "Quiz Time! True or False: A parallelogram has 4 corners. Swipe right for True, left for False.", type: "quiz", correctAnswer: true },
    { title: "Activity 3: Compare to Square", instruction: "Activity 3! Slant challenge! If you draw a perfect square, you fail. Slant it!", reqSides: 150, type: "slant" },
    { title: "Activity 4: The Tangram Piece", instruction: "Activity 4! In Class 3 we use Tangram puzzles! Draw a very wide, slanted 4-sided tangram piece.", reqSides: 200, type: "tangram" },
    { title: "Final Quiz", instruction: "Quiz Time! True or False: A tangram piece can be a parallelogram. Swipe right for True, left for False.", type: "quiz", correctAnswer: true }
  ],
  pentagon: [
    { title: "Activity 1: Finding 5 Corners", instruction: "Activity 1! A pentagon has 5 corners like a house. Find all 5!", reqSides: 120, type: "corners" },
    { title: "Activity 2: Perimeter Trace", instruction: "Activity 2! Trace the whole house shape without stopping!", reqSides: 200, type: "loop" },
    { title: "Mid-Lesson Quiz", instruction: "Quiz Time! True or False: A pentagon has 5 corners. Swipe right for True, left for False.", type: "quiz", correctAnswer: true },
    { title: "Activity 3: The Big House", instruction: "Activity 3! Draw a massive pentagon that fills up the screen!", reqSides: 300, type: "huge" },
    { title: "Activity 4: Play with Patterns", instruction: "Activity 4! In Class 4 we learn patterns! Draw a pentagon shape twice to make a pattern.", reqSides: 200, type: "pattern" },
    { title: "Final Quiz", instruction: "Quiz Time! True or False: A pentagon has 4 edges. Swipe right for True, left for False.", type: "quiz", correctAnswer: false }
  ],
  angle: [
    { title: "Activity 1: The Sharp Beak", instruction: "Activity 1! Draw a sharp V-shape, like a bird's beak. This is an Acute angle.", targetAngle: 45, maxDiff: 35, type: 'acute' },
    { title: "Activity 2: The Perfect Corner", instruction: "Activity 2! Draw a perfect square corner. This is a Right angle.", targetAngle: 90, maxDiff: 15, type: 'right' },
    { title: "Mid-Lesson Quiz", instruction: "Quiz Time! True or False: An acute angle is wider than a right angle. Swipe right for True, left for False.", type: "quiz", correctAnswer: false },
    { title: "Activity 3: The Wide Open Door", instruction: "Activity 3! Draw a very wide, open angle. This is an Obtuse angle.", targetAngle: 135, maxDiff: 35, type: 'obtuse' },
    { title: "Activity 4: The Flat Line", instruction: "Activity 4! Draw a perfectly straight sleeping line to make a 180 degree angle!", targetAngle: 180, maxDiff: 20, type: 'flat' },
    { title: "Activity 5: Angles in Letters", instruction: "Activity 5! We can find right angles in the alphabet! Trace the letter L to make a 90 degree angle.", targetAngle: 90, maxDiff: 20, type: 'letter' },
    { title: "Final Quiz", instruction: "Quiz Time! True or False: The letter L makes a right angle. Swipe right for True, left for False.", type: "quiz", correctAnswer: true }
  ],
  coordinate: [
    { title: "Activity 1: The Single Point", instruction: "Activity 1! A point is an exact location. It has no length or width. Tap anywhere on the screen to place a point!", type: "point" },
    { title: "Activity 2: Two Points Make a Line", instruction: "Activity 2! A line connects two points! Tap to place a start point, then tap somewhere else for the end point.", type: "two_points" },
    { title: "Activity 3: The X-Axis", instruction: "Activity 3! The X axis is a horizontal sleeping line. Drag your finger left and right to move along the X axis!", type: "x_axis" },
    { title: "Activity 4: The Y-Axis", instruction: "Activity 4! The Y axis is a vertical standing line. Drag your finger up and down to move along the Y axis!", type: "y_axis" },
    { title: "Activity 5: Grid Exploration", instruction: "Activity 5! Let's explore the grid map. Drag your finger to move your point and hear its coordinates.", type: "explore" },
    { title: "Activity 6: Find the Treasure", instruction: "Activity 6! Find point 2, -2. Drag your finger until you hit it!", targetX: 2, targetY: -2, type: "target" },
    { title: "Mid-Lesson Quiz", instruction: "Quiz Time! True or False: The X axis goes up and down. Swipe right for True, left for False.", type: "quiz", correctAnswer: false },
    { title: "Activity 7: Return to Origin", instruction: "Activity 7! The Origin is point zero, zero. You are lost! Navigate your finger back to zero, zero!", targetX: 0, targetY: 0, type: "origin" },
    { title: "Activity 8: Map Reading", instruction: "Activity 8! Follow the map. Start at 0, move exactly 2 steps right and 3 steps up to find point 2, 3!", targetX: 2, targetY: 3, type: "map" },
    { title: "Final Quiz", instruction: "Quiz Time! True or False: Coordinate 0,0 is called the Origin point. Swipe right for True, left for False.", type: "quiz", correctAnswer: true }
  ],
  distance: [
    { title: "Activity 1: Free Walk", instruction: "Activity 1! Distance! Slide to count your steps.", type: "free" },
    { title: "Activity 2: 5 Steps", instruction: "Activity 2! Try to take exactly 5 steps and stop.", targetUnits: 5, type: "exact" },
    { title: "Mid-Lesson Quiz", instruction: "Quiz Time! True or False: Distance is how far you move your finger. Swipe right for True, left for False.", type: "quiz", correctAnswer: true },
    { title: "Activity 3: Exactly 10 Steps", instruction: "Activity 3! Take exactly 10 steps and stop.", targetUnits: 10, type: "exact" },
    { title: "Activity 4: Step and Stop", instruction: "Activity 4! Take 3 steps, pause, then take 3 more steps!", targetUnits: 6, type: "pause" },
    { title: "Activity 5: Inside and Outside", instruction: "Activity 5! In Class 1 we learn Inside and Outside. Draw a boundary line loop, then tap inside it!", type: "inside" },
    { title: "Final Quiz", instruction: "Quiz Time! True or False: If you are in a house, you are outside. Swipe right for True, left for False.", type: "quiz", correctAnswer: false }
  ],
  master: [
    { title: "Activity 1: The Point Jump", instruction: "Welcome to the Geometry Master challenges! You will need a safe open space of at least 5 steps in every direction. Please make sure there are no objects or walls you can bump into. Activity 1! A point is a single spot. Hold your phone tightly, stand safely, and jump up and down once to stamp your point!", type: "jump" },
    { title: "Activity 2: The 360 Spin", instruction: "Activity 2! Hold your phone flat in front of you and slowly spin around in a full circle.", type: "spin" },
    { title: "Activity 3: The Physical Square", instruction: "Activity 3! We are walking a square. You need 3 steps of clear space ahead. When you hear the beep, take 3 steps forward, then turn 90 degrees right. Do this 4 times!", type: "physical_shape", shape: "square" },
    { title: "Activity 4: The Physical Triangle", instruction: "Activity 4! Triangle time! Walk 3 steps forward, then turn exactly 120 degrees to the right. Do this 3 times!", type: "physical_shape", shape: "triangle" },
    { title: "Activity 5: The Physical Rectangle", instruction: "Activity 5! Rectangle time! Make sure you have 4 steps of space. Walk 4 steps forward, turn 90 degrees right, walk 2 steps, turn 90 degrees right, and repeat!", type: "physical_shape", shape: "rectangle" },
    { title: "Activity 6: The Coordinate Hunt", instruction: "Activity 6! You are at point 0, 0. Turn right, take 4 steps along the X axis. Then turn left, take 2 steps along the Y axis to reach point 4, 2!", type: "coordinate_hunt" },
    { title: "Activity 7: The Geometry Statue", instruction: "Activity 7! Walk fast for 5 steps, then freeze completely still like a statue for 3 seconds!", type: "statue" },
    { title: "Activity 8: The Great Shake", instruction: "Activity 8! You did it! Now hold your phone tight and shake it really hard to erase the virtual chalkboard!", type: "shake" },
    { title: "Mastery Achieved", instruction: "Congratulations! You are the ultimate Geometry Master!", type: "quiz", correctAnswer: true }
  ]
};
