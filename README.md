# Morning

A one page morning check: swim or stay out, today's workout, countdowns to registered events, a to do list, quick links, a brainstorm box, and NPR headlines.

## Set up (once)

1. Create a new public repository on GitHub called `morning` (any name works).
2. Upload every file and folder here, keeping the structure. On the repo page choose Add file, Upload files, and drag the whole folder in. Make sure the `.github` folder comes along; some file managers hide it.
3. Settings, Pages, Source: Deploy from a branch, Branch: main, folder: / (root). Save. The site appears at `https://YOURNAME.github.io/morning/` in a minute or two.
4. Actions tab, Fetch NPR headlines, Run workflow. This writes the first `data/npr.json`. After that it runs on its own every morning.
5. Open the site on your phone and add it to the home screen. It behaves like an app.

## Change things

- `config.js` holds the locations, the swim rule, events, and links. The MSF fundraiser link goes in two places there, marked PASTE.
- `calendar.js` holds the training plan. Edit any day.
- `schedule.js` holds the class schedule, office hours, and the IRSC fall 2026 closed days and deadlines. Update it each term.
- To show your Google Calendar month view, paste its embed URL into `googleCalendarEmbed` in `config.js`. Google Calendar, Settings, choose the calendar, Integrate calendar, copy the public URL. A private calendar shows only while you are signed in to Google in the same browser.
- To add an NPR section, add its feed id to both `config.js` and `scripts/fetch_npr.py`. Ids are at https://www.npr.org/rss/.

## Data

Waves and water temperature come from Open-Meteo's marine model. Wind, air temperature, and rain from Open-Meteo. Tides from NOAA station 8722212 (Fort Pierce Inlet, south jetty). Rip current and surf statements from the National Weather Service alerts feed. Lake locations have no tides or wave model, so they show wind and any beach hazard statements.

The to do list and the brainstorm notes are saved in the browser only. They do not sync between phone and laptop.
