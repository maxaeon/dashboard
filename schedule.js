// Teaching schedule and IRSC fall 2026 dates. Edit freely.
// Days: 0 = Monday ... 6 = Sunday.

const SCHEDULE = {
  // One entry per term. Each has its own weekly blocks. The week view picks the term that contains the date.
  terms: [
    {
      name: "Fall 2026", start: "2026-08-19", end: "2026-12-09",
      weekly: [
        { days: [0, 2], start: "9:30", end: "10:45", name: "Intro to Philosophy", where: "Stuart", kind: "class" },
        { days: [0, 2], start: "11:00", end: "12:15", name: "Intro to Humanities", where: "Stuart", kind: "class" },
        { days: [3], start: "11:00", end: "12:15", name: "Intro to Humanities (hybrid)", where: "Stuart", kind: "class" },
        { days: [1, 4], start: "8:00", end: "12:00", name: "Office hours", where: "", kind: "office" },
      ],
    },
    {
      // Spring 2027. Term dates are placeholders until the IRSC spring calendar is posted. Edit the class days if not Mon to Thu.
      name: "Spring 2027", start: "2027-01-11", end: "2027-05-07",
      weekly: [
        { days: [0, 1, 2, 3], start: "9:30", end: "12:15", name: "Classes", where: "Chastain", kind: "class" },
        { days: [0, 1], start: "13:30", end: "17:30", name: "Office hours", where: "Chastain", kind: "office" },
      ],
    },
  ],

  // Days the college is closed. Classes are hidden on these days.
  closed: [
    { from: "2026-09-07", to: "2026-09-07", name: "Labor Day, college closed" },
    { from: "2026-11-11", to: "2026-11-11", name: "Veterans Day, college closed" },
    { from: "2026-11-23", to: "2026-11-29", name: "Thanksgiving break, college closed" },
    { from: "2026-12-18", to: "2027-01-03", name: "Winter break, college closed" },
    { from: "2027-01-18", to: "2027-01-18", name: "Martin Luther King Jr. Day, college closed (verify)" },
    { from: "2027-03-08", to: "2027-03-14", name: "Spring break (placeholder, verify IRSC dates)" },
  ],

  // One day items from the IRSC academic calendar.
  dates: [
    { date: "2026-09-03", name: "Verification of attendance deadline" },
    { date: "2026-10-29", name: "Last day to withdraw with a W" },
    { date: "2026-11-20", name: "Commencement participation deadline" },
    { date: "2026-12-03", name: "Final exam week begins (through Dec 9)" },
    { date: "2026-12-09", name: "Last day of term" },
    { date: "2026-12-10", name: "Grades due online by 8 pm" },
    { date: "2026-12-14", name: "Grades available. Commencement Dec 14 and 15" },
  ],
};
