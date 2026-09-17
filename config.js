// Edit this file to change locations, links, and events. Nothing else needs to change.

const CONFIG = {
  // Locations shown as tabs. The first one is the default.
  // tideStation is a NOAA CO-OPS station id (leave null for lakes).
  // Great Lakes beaches have no tides or rip current statements, so those parts are hidden.
  locations: [
    { id: "fortpierce", name: "Fort Pierce", place: "Jetty Park", lat: 27.4700, lon: -80.2883, tideStation: "8722212", ocean: true },
    { id: "stuart", name: "Stuart", place: "Bathtub Reef Beach", lat: 27.1783, lon: -80.1667, tideStation: "8722212", tideNote: "Fort Pierce Inlet station, roughly 45 min later here", ocean: true },
    { id: "grandhaven", name: "Grand Haven", place: "Lake Michigan", lat: 43.0567, lon: -86.2510, tideStation: null, ocean: false },
    { id: "lakeport", name: "Lakeport", place: "Lake Huron", lat: 43.1178, lon: -82.4869, tideStation: null, ocean: false },
    { id: "traversecity", name: "Traverse City", place: "Grand Traverse Bay", lat: 44.7631, lon: -85.6206, tideStation: null, ocean: false },
  ],

  // The swim rule. Waves in feet.
  swimRule: { maxWaveFt: 3, maxWindMph: 15 },

  // Countdown events. Keep them in date order.
  events: [
    { name: "Gobbler Half Marathon", date: "2026-11-14", place: "Lakewood Park, Fort Pierce" },
    { name: "Game On Sprint Triathlon", date: "2026-12-06", place: "Jetty Park, 7:25 am start", link: "https://runsignup.com/Race/FL/FortPierce/GameOnTriathlon", fundraiser: "PASTE_YOUR_MSF_FUNDRAISER_LINK_HERE" },
    { name: "MammothMarch Northeast Florida", date: "2027-01-30", place: "Dunns Creek State Park, 20 miles" },
  ],

  // Google Calendar month view. Paste the embed URL from Google Calendar:
  // Settings, pick the calendar, Integrate calendar, copy the "Public URL to this calendar" or the src from the embed code.
  // A private calendar shows here only while you are signed in to that Google account in the same browser.
  // Leave empty to hide the section.
  googleCalendarEmbed: "",

  // Quick links. Add or remove freely.
  links: [
    { name: "Google Docs", url: "https://docs.google.com/document/u/0/" },
    { name: "Google Drive", url: "https://drive.google.com/" },
    { name: "Gmail", url: "https://mail.google.com/" },
    { name: "Canvas (IRSC)", url: "https://irsc.instructure.com/" },
    // { name: "Canvas (Mott)", url: "https://mcc.instructure.com/" },
    { name: "Samsung Health", url: "https://www.samsung.com/us/apps/samsung-health/" },
    { name: "Claude", url: "https://claude.ai/new" },
    { name: "GitHub", url: "https://github.com/" },
    { name: "MSF fundraiser", url: "PASTE_YOUR_MSF_FUNDRAISER_LINK_HERE" },
    { name: "Windfinder Fort Pierce", url: "https://www.windfinder.com/forecast/fort_pierce_inlet" },
    { name: "NWS surf forecast", url: "https://www.weather.gov/mlb/surf" },
  ],

  // NPR feeds fetched daily by the GitHub Action. Ids from feeds.npr.org.
  npr: [
    { id: "1001", name: "Top stories" },
    { id: "1007", name: "Science" },
    { id: "1128", name: "Health" },
  ],
};
