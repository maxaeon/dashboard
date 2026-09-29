// Training calendar, Sept 14 2026 through Jan 30 2027. Each week starts on Monday.
// Edit any cell freely. Dates are the Monday of each week.

const CALENDAR = (() => {
  const R = "Easy run 30 min, run 3 / walk 1, heart rate under 140";
  const R40 = "Easy run 35 to 40 min, run 3 / walk 1, heart rate under 140";
  const S = "Swim 45 min, first 10 min freestyle drills";
  const REST = "Rest day. Bike commute only. Friday elliptical is fine if 45 to 60 min easy, heart rate under 135";
  const BS = "Bike to Jetty Park, ocean swim 20 to 30 min, bike home";
  const BS15 = "Bike to Jetty Park, ocean swim 15 min, bike home";
  const R5 = "Run 5 km easy";
  const W60 = "Walk 60 min";
  const BR = "Brick: bike 30 min, then run 10 to 15 min immediately, easy. Log the transition";
  const RB = "Reverse brick: run 15 min, then bike 20 min. Log the transition";
  const UP = ". Upper body lifting after.";
  const LEG = ". Legs and core after.";
  return [
    { start: "2026-09-14", phase: "Half marathon build", days: [R+LEG, S, BR+UP, R, REST+UP, "Long run/walk 5 mi", BS + ". Log both transitions."], note: "Set the interval timer. Register for both races (tri price rises after Oct 16). Transition log starts this week." },
    { start: "2026-09-21", phase: "Half marathon build", days: [R+LEG, RB, BR+UP, R, REST+UP, "Long run/walk 6 mi", BS + ". Log both transitions."], note: "Distance swim: add about 50 yards each week. Reverse brick replaces Tuesday swim every second week." },
    { start: "2026-09-28", phase: "Half marathon build", days: [R+LEG, S, BR+UP, R, REST+UP, "Long run/walk 7 mi", BS + ". Log both transitions."], note: "Carry water on the long run. The Gobbler has water only at the finish area. Log one control run this week (a fresh run on the brick route)." },
    { start: "2026-10-05", phase: "Half marathon build", days: [R+LEG, RB, BR+UP, R, REST+UP, "Long run/walk 5 mi (easier week)", BS + ". Log both transitions."], note: "Easier week. Log one control ride this week (a fresh ride on the brick route)." },
    { start: "2026-10-12", phase: "Half marathon build", days: [R+LEG, S, BR+UP, R, REST+UP, "Long run/walk 8 mi", "FULL SPRINT REHEARSAL: drive to Jetty Park, swim 1/4 mi, bike 12 mi on A1A, run 5k on the jetty. Log both transitions."], note: "Test race food on the long run. Sunday is the first full rehearsal, drive there and back." },
    { start: "2026-10-19", phase: "Half marathon build", days: [R+LEG, RB, BR+UP, R, REST+UP, "Long run/walk 10 mi", "Beach swimrun session: alternate 200 yd run and a short swim, 6 to 8 times. Log each switch."], note: "Go slower than feels necessary on the long run." },
    { start: "2026-10-26", phase: "Half marathon build", days: [R+LEG, S, BR+UP, R, REST+UP, "Long run/walk 11 mi (or the full 13.1 beach round trip)", BS + ". Log both transitions."], note: "Peak week. Same shoes, breakfast, water and run/walk pattern as race day. Log one more control run." },
    { start: "2026-11-02", phase: "Half marathon taper", days: [R, S, "Short brick: bike 20 min, run 10 min. Log it.", "Easy run 20 min", REST, "Long run/walk 6 mi", BS15 + ". Log both transitions."], note: "Taper. Keep the routine, cut the volume." },
    { start: "2026-11-09", phase: "Race week", days: ["Easy run 20 min", "Swim 30 min, easy", "Easy run 20 min", REST, REST, "GOBBLER HALF MARATHON, Lakewood Park", "Walk 30 min, easy spin"], note: "Carry your own water and food. Run/walk from mile 1." },
    { start: "2026-11-16", phase: "Recovery", days: [REST, "Swim 30 min, easy", "Easy run 20 min", "Easy spin 30 min", REST, "Walk 4 mi", "Swim 30 min, build to 400 m continuous, then a 10 min run off the beach. Log it."], note: "Sore legs early in the week. No run over 20 min." },
    { start: "2026-11-23", phase: "Triathlon build", days: [R5, "Swim 40 min, 400 m continuous", "Brick: bike 40 min, then run 15 min", R5, REST, "FULL SPRINT REHEARSAL 2: drive to Jetty Park, swim 1/4 mi, bike 12 mi on A1A, run 5k. Log both transitions.", "Walk 6 mi on beach sand"], note: "Practice transitions. Thanksgiving Thu, swap days as needed." },
    { start: "2026-11-30", phase: "Triathlon taper", days: ["Run 20 min easy", "Swim 20 min easy", "Bike 30 min easy, run 5 min", "Rest", "Rest, lay out gear", "Rest", "GAME ON SPRINT TRIATHLON, Jetty Park, 7:25 am. Log both transitions that evening."], note: "Arrive early, walk the swim entry and exit before the start." },
    { start: "2026-12-07", phase: "Recovery", days: [REST, "Walk 45 min", R5, "Walk 45 min", REST, "Walk 6 mi", "Swim 30 min"], note: "Weekend long effort switches from running to walking." },
    { start: "2026-12-14", phase: "Hike build", days: [R5, W60, R5, W60, REST, "Long walk 8 mi, on sand if possible", "Swim 30 min"], note: "Exact shoes, socks and pack for Jan 30." },
    { start: "2026-12-21", phase: "Hike build", days: [R5, W60, R5, W60, REST, "Long walk 10 mi", "Walk 4 mi easy"], note: "Likely Michigan. Cold walking counts. Layer up." },
    { start: "2026-12-28", phase: "Hike build", days: [R5, W60, R5, W60, REST, "Long walk 12 mi", "Walk 4 mi easy"], note: "Eat every 45 to 60 min on the long walk." },
    { start: "2027-01-04", phase: "Hike build", days: [R5, W60, R5, "Walk 75 min", REST, "Long walk 14 mi", "Walk 4 mi easy"], note: "About 5 hours on feet. Bring everything you would bring to the event." },
    { start: "2027-01-11", phase: "Hike build", days: [R5, W60, R5, "Walk 75 min", REST, "Long walk 16 mi", "Walk 4 mi easy"], note: "Peak walk, three weeks out. As much beach sand as possible." },
    { start: "2027-01-18", phase: "Hike build", days: [R5, W60, R5, W60, REST, "Long walk 12 mi, sand", "Swim 30 min"], note: "Volume comes down. Final trial of food and water plan." },
    { start: "2027-01-25", phase: "Hike taper", days: [R5, "Walk 45 min", "Walk 45 min", "Rest", "Travel to Pomona Park (about 3 hr)", "MAMMOTHMARCH NORTHEAST FLORIDA, Dunns Creek State Park, 20 mi", "Rest, drive home"], note: "Aid every 5 to 7 mi. Start slot from 7:15 am." },
  ];
})();
