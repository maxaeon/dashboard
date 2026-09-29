/* Morning dashboard. Everything runs in the browser except the NPR fetch,
   which a GitHub Action writes to data/npr.json once a day. */

const $ = (id) => document.getElementById(id);
const M_TO_FT = 3.28084;
const KMH_TO_MPH = 0.621371;

let currentLocation = CONFIG.locations[0];
let dayOffset = 0; // -1 yesterday, 0 today, up to +6

/* ---------- Date header ---------- */
function showDate() {
  const now = new Date();
  $("date").textContent = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}

/* ---------- Locations ---------- */
function renderPlaces() {
  const nav = $("places");
  nav.innerHTML = "";
  CONFIG.locations.forEach((loc) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = loc.name;
    b.setAttribute("aria-pressed", loc.id === currentLocation.id ? "true" : "false");
    b.addEventListener("click", () => {
      currentLocation = loc;
      localStorage.setItem("morning.location", loc.id);
      renderPlaces();
      loadConditions();
    });
    nav.appendChild(b);
  });
}

/* ---------- Conditions ---------- */
async function loadConditions() {
  const loc = currentLocation;
  const hero = $("hero");
  hero.dataset.verdict = "";
  $("verdict-word").textContent = "Checking";
  $("verdict-why").textContent = `Pulling conditions for ${loc.place}.`;
  $("stats").innerHTML = "";
  $("tides").innerHTML = "";
  $("alerts").innerHTML = "";
  $("source").textContent = "";

  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
  const ymd = ymdOf(target);
  const isToday = dayOffset === 0;
  $("day-label").textContent = isToday ? "Today" : dayOffset === -1 ? "Yesterday" : dayOffset === 1 ? "Tomorrow" : target.toLocaleDateString(undefined, { weekday: "long" });
  $("day-prev").disabled = dayOffset <= -1;
  $("day-next").disabled = dayOffset >= 6;

  // Hourly arrays cover yesterday plus seven days. Day index 0 is yesterday.
  const dayIdx = dayOffset + 1;
  const hourSlice = (arr) => (arr || []).slice(dayIdx * 24, dayIdx * 24 + 24);
  const nowHour = isToday ? now.getHours() : 12;

  const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${loc.lat}&longitude=${loc.lon}&hourly=wave_height,wave_period,sea_surface_temperature&timezone=auto&past_days=1&forecast_days=7`;
  const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&hourly=wind_speed_10m,wind_direction_10m,temperature_2m,precipitation_probability&daily=sunrise,sunset&timezone=auto&past_days=1&forecast_days=7`;
  const alertsUrl = `https://api.weather.gov/alerts/active?point=${loc.lat},${loc.lon}`;
  const tideUrl = loc.tideStation
    ? `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=morning&begin_date=${ymd.replace(/-/g, "")}&end_date=${ymd.replace(/-/g, "")}&datum=MLLW&station=${loc.tideStation}&time_zone=lst_ldt&units=english&interval=hilo&format=json`
    : null;

  const [marine, weather, alerts, tides] = await Promise.all([
    fetchJson(marineUrl),
    fetchJson(weatherUrl),
    isToday ? fetchJson(alertsUrl, { headers: { Accept: "application/geo+json" } }) : Promise.resolve({ features: [] }),
    tideUrl ? fetchJson(tideUrl) : Promise.resolve(null),
  ]);

  // Daytime window, 7 am to 7 pm local, for the chosen day
  const day = (arr) => hourSlice(arr).slice(7, 20).filter((v) => v !== null && v !== undefined);
  const at = (arr) => hourSlice(arr)[nowHour];

  const waveFtArr = day(marine?.hourly?.wave_height).map((m) => m * M_TO_FT);
  const waveMax = waveFtArr.length ? Math.max(...waveFtArr) : null;
  const waveNow = at(marine?.hourly?.wave_height);
  const period = at(marine?.hourly?.wave_period);
  const sst = at(marine?.hourly?.sea_surface_temperature);

  const windArr = day(weather?.hourly?.wind_speed_10m).map((k) => k * KMH_TO_MPH);
  const windMax = windArr.length ? Math.max(...windArr) : null;
  const windNow = at(weather?.hourly?.wind_speed_10m);
  const windDir = at(weather?.hourly?.wind_direction_10m);
  const airNow = at(weather?.hourly?.temperature_2m);
  const rainArr = day(weather?.hourly?.precipitation_probability);
  const rainMax = rainArr.length ? Math.max(...rainArr) : null;

  const alertList = (alerts?.features || []).map((f) => f.properties);
  const beachAlerts = alertList.filter((a) => /rip current|high surf|beach hazard|surf|small craft|marine/i.test(a.event));
  const hardStop = beachAlerts.some((a) => /rip current|high surf/i.test(a.event));

  // Verdict
  let verdict = "go", word = "Swim", why = "";
  const rule = CONFIG.swimRule;
  if (waveMax === null && windMax === null) {
    verdict = ""; word = "No data";
    why = "The forecast services did not answer. Try Refresh, or check Windfinder from the links below.";
  } else if (hardStop) {
    verdict = "stop"; word = "Stay out";
    why = `${beachAlerts.find((a) => /rip current|high surf/i.test(a.event)).event} in effect for this coast. Swap the swim for the elliptical or a run.`;
  } else if (waveMax !== null && waveMax > rule.maxWaveFt) {
    verdict = "stop"; word = "Stay out";
    why = `Waves reach about ${waveMax.toFixed(1)} ft today, over the ${rule.maxWaveFt} ft limit. Rip currents run strongest on days like this.`;
  } else if (windMax !== null && windMax > rule.maxWindMph) {
    verdict = "care"; word = "Swim close";
    why = `Wind up to ${Math.round(windMax)} mph will make the water choppy. Stay in chest deep water, parallel to shore, and skip it if the flag is red.`;
  } else if (waveMax !== null && waveMax > 2) {
    verdict = "care"; word = "Swim close";
    why = `Waves around ${waveMax.toFixed(1)} ft. Fine for a shore swim, but stay where you can stand and check the flag.`;
  } else {
    verdict = "go"; word = loc.ocean ? "Swim" : "Calm";
    why = loc.ocean
      ? `Waves under ${Math.max(1, Math.round(waveMax || 0))} ft and light wind. A good day for the distance swim.`
      : `Light wind and small waves at ${loc.place}.`;
  }
  if (!loc.ocean) {
    // Lakes use the same words whether or not the wave model has data for that spot.
    if (verdict === "stop") word = "Rough";
    else if (verdict === "care") word = "Choppy";
    else if (verdict === "go") word = "Calm";
    if (waveMax === null && windMax !== null) why = `Wind up to ${Math.round(windMax)} mph at ${loc.place}. No wave model here, so judge the water when you arrive.`;
  }
  hero.dataset.verdict = verdict;
  const img = $("hero-img");
  const src = verdict && CONFIG.images ? CONFIG.images[verdict] : "";
  if (src) { img.hidden = false; img.src = src; img.onerror = () => { img.hidden = true; }; } else { img.hidden = true; img.removeAttribute("src"); }
  $("verdict-word").textContent = word;
  $("verdict-why").textContent = why;

  // Stats
  const stats = [];
  const nowLabel = isToday ? "now" : "midday";
  if (waveNow !== null && waveNow !== undefined) stats.push([`Waves ${nowLabel}`, `${(waveNow * M_TO_FT).toFixed(1)}<small>ft</small>`]);
  if (waveMax !== null) stats.push([isToday ? "Waves today" : "Waves, max", `${waveMax.toFixed(1)}<small>ft max</small>`]);
  if (windNow !== null && windNow !== undefined) stats.push(["Wind", `${Math.round(windNow * KMH_TO_MPH)}<small>mph ${compass(windDir)}</small>`]);
  if (sst !== null && sst !== undefined) stats.push(["Water", `${Math.round(cToF(sst))}<small>°F</small>`]);
  if (airNow !== null && airNow !== undefined) stats.push(["Air", `${Math.round(cToF(airNow))}<small>°F</small>`]);
  if (period) stats.push(["Wave period", `${Math.round(period)}<small>s</small>`]);
  if (rainMax !== null) stats.push(["Rain chance", `${rainMax}<small>%</small>`]);
  $("stats").innerHTML = stats.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");

  // Tides
  if (tides?.predictions?.length) {
    const parts = tides.predictions.map((p) => {
      const t = p.t.split(" ")[1];
      return `<span>${p.type === "H" ? "High" : "Low"} <b>${fmtTime(t)}</b> ${Number(p.v).toFixed(1)} ft</span>`;
    });
    if (loc.tideNote) parts.push(`<span class="tide-note">${loc.tideNote}</span>`);
    $("tides").innerHTML = parts.join("");
  } else if (loc.tideStation) {
    $("tides").innerHTML = `<span class="tide-note">Tide predictions did not load.</span>`;
  }
  if (weather?.daily?.sunrise?.[dayIdx]) {
    $("tides").innerHTML += `<span class="tide-note">Sunrise ${fmtTime(weather.daily.sunrise[dayIdx].slice(11))}, sunset ${fmtTime(weather.daily.sunset[dayIdx].slice(11))}</span>`;
  }

  // Alerts
  if (beachAlerts.length) {
    $("alerts").innerHTML = beachAlerts.map((a) => `<div class="alert ${/rip current|high surf/i.test(a.event) ? "" : "mild"}"><b>${a.event}</b> until ${a.ends ? new Date(a.ends).toLocaleString(undefined, { weekday: "short", hour: "numeric" }) : "further notice"}. ${a.headline || ""}</div>`).join("");
  } else if (!isToday) {
    $("alerts").innerHTML = "";
  } else if (loc.ocean && alerts) {
    $("alerts").innerHTML = `<div class="alert mild" style="border-left-color: var(--go); background: rgba(47,143,107,0.08)">No rip current or surf statements from the National Weather Service right now.</div>`;
  } else if (loc.ocean) {
    $("alerts").innerHTML = `<div class="alert mild">Could not reach the National Weather Service alerts feed. Check the flag when you arrive.</div>`;
  }

  $("source").textContent = `${isToday ? "Checked " + now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : target.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}. Forecasts are for the open coast near ${loc.place}. The flag at the lifeguard stand wins.`;
}

async function fetchJson(url, opts = {}) {
  try {
    const r = await fetch(url, opts);
    if (!r.ok) return null;
    return await r.json();
  } catch (e) {
    return null;
  }
}
const cToF = (c) => c * 9 / 5 + 32;
function compass(deg) {
  if (deg === null || deg === undefined) return "";
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round(deg / 45) % 8];
}
function fmtTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const ap = h >= 12 ? "pm" : "am";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ap}`;
}

/* ---------- Workout ---------- */
function loadWorkout() {
  const today = new Date();
  const y = today.getFullYear(), mo = today.getMonth(), d = today.getDate();
  const local = new Date(y, mo, d);
  const dow = (local.getDay() + 6) % 7; // Monday = 0
  const week = CALENDAR.find((w) => {
    const s = parseLocal(w.start);
    const e = new Date(s); e.setDate(s.getDate() + 6);
    return local >= s && local <= e;
  });
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  if (!week) {
    $("phase").textContent = local < parseLocal(CALENDAR[0].start) ? "Plan starts " + CALENDAR[0].start : "Plan finished";
    $("workout-text").textContent = local < parseLocal(CALENDAR[0].start) ? "Easy movement until then." : "Time to write the next one.";
    $("workout-note").textContent = "";
    return;
  }
  $("phase").textContent = week.phase;
  $("workout-text").textContent = week.days[dow];
  $("workout-note").textContent = week.note || "";
  $("week-list").innerHTML = week.days.map((t, i) => `<li class="${i === dow ? "today" : ""}"><b>${names[i]}</b><span>${t}</span></li>`).join("");
}
function parseLocal(ymd) {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/* ---------- Week view ---------- */
let weekOffset = 0;
function mondayOf(d) { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
const ymdOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
function closedOn(ymd) { return SCHEDULE.closed.find((c) => ymd >= c.from && ymd <= c.to) || null; }
function fmtClock(hm) { const [h, m] = hm.split(":").map(Number); return `${((h + 11) % 12) + 1}${m ? ":" + String(m).padStart(2, "0") : ""}`; }

function renderWeek() {
  const now = new Date();
  const todayYmd = ymdOf(now);
  const mon = mondayOf(now); mon.setDate(mon.getDate() + weekOffset * 7);
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6);
  const names = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  $("week-title").textContent = weekOffset === 0 ? "This week" : `${mon.toLocaleDateString(undefined, { month: "short", day: "numeric" })} to ${sun.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;

  const html = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(mon); d.setDate(mon.getDate() + i);
    const ymd = ymdOf(d);
    const term = SCHEDULE.terms.find((t) => ymd >= t.start && ymd <= t.end);
    const closed = closedOn(ymd);
    const items = [];
    if (closed) items.push({ kind: "holiday", text: closed.name });
    if (term && !closed) {
      term.weekly.filter((b) => b.days.includes(i)).forEach((b) =>
        items.push({ kind: b.kind, text: `<b>${fmtClock(b.start)} to ${fmtClock(b.end)}</b> ${b.name}${b.where ? ` <span>${b.where}</span>` : ""}` }));
    }
    SCHEDULE.dates.filter((x) => x.date === ymd).forEach((x) => items.push({ kind: "irsc", text: x.name }));
    CONFIG.events.filter((e) => e.date === ymd).forEach((e) => items.push({ kind: "event", text: e.name }));
    html.push(`<div class="day ${ymd === todayYmd ? "today" : ""} ${closed ? "closed" : ""}">
      <p class="day-name">${names[i]}<small>${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small></p>
      <ul>${items.map((it) => `<li class="${it.kind}">${it.text}</li>`).join("") || "<li><span>Nothing scheduled</span></li>"}</ul>
    </div>`);
  }
  $("week-grid").innerHTML = html.join("");
}
function initWeek() {
  $("week-prev").addEventListener("click", () => { weekOffset--; renderWeek(); });
  $("week-next").addEventListener("click", () => { weekOffset++; renderWeek(); });
  $("week-today").addEventListener("click", () => { weekOffset = 0; renderWeek(); });
  renderWeek();
}
function initGcal() {
  if (!CONFIG.googleCalendarEmbed) return;
  let src = CONFIG.googleCalendarEmbed;
  if (!/mode=/.test(src)) src += (src.includes("?") ? "&" : "?") + "mode=MONTH";
  $("gcal-frame").src = src;
  $("gcal").hidden = false;
}

/* ---------- Countdowns ---------- */
function loadEvents() {
  const today = new Date();
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const items = CONFIG.events.map((ev) => {
    const d = parseLocal(ev.date);
    const days = Math.round((d - t0) / 86400000);
    return { ...ev, days, d };
  }).filter((ev) => ev.days >= -1);
  $("events-list").innerHTML = items.map((ev) => {
    const label = ev.days === 0 ? "today" : ev.days === 1 ? "day" : "days";
    const num = ev.days === 0 ? "" : ev.days === -1 ? "done" : ev.days;
    const dateStr = ev.d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    const extra = [
      ev.link ? `<a href="${ev.link}" target="_blank" rel="noopener">Race page</a>` : "",
      ev.fundraiser && !ev.fundraiser.startsWith("PASTE") ? `<a href="${ev.fundraiser}" target="_blank" rel="noopener">Fundraiser</a>` : "",
    ].join("");
    return `<li><div class="days">${num}<small>${label}</small></div><div><div class="name">${ev.name}</div><div class="meta">${dateStr}, ${ev.place}${extra}</div></div></li>`;
  }).join("") || `<li><div></div><div class="meta">Nothing registered. Add events in config.js.</div></li>`;
}

/* ---------- To do ---------- */
const TODO_KEY = "morning.todos";
function getTodos() { try { return JSON.parse(localStorage.getItem(TODO_KEY) || "[]"); } catch { return []; } }
function setTodos(list) { localStorage.setItem(TODO_KEY, JSON.stringify(list)); renderTodos(); }
function renderTodos() {
  const list = getTodos();
  const ul = $("todo-list");
  if (!list.length) { ul.innerHTML = `<p class="todo-empty">Nothing yet. Add the first thing.</p>`; return; }
  ul.innerHTML = list.map((t, i) => `
    <li class="${t.done ? "done" : ""}">
      <input type="checkbox" id="todo-${i}" ${t.done ? "checked" : ""} data-i="${i}">
      <label for="todo-${i}">${escapeHtml(t.text)}</label>
      <button type="button" class="remove" data-i="${i}" aria-label="Remove">Remove</button>
    </li>`).join("");
  ul.querySelectorAll("input[type=checkbox]").forEach((cb) => cb.addEventListener("change", (e) => {
    const l = getTodos(); l[e.target.dataset.i].done = e.target.checked; setTodos(l);
  }));
  ul.querySelectorAll(".remove").forEach((b) => b.addEventListener("click", (e) => {
    const l = getTodos(); l.splice(Number(e.target.dataset.i), 1); setTodos(l);
  }));
}
function initTodos() {
  $("todo-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("todo-input").value.trim();
    if (!v) return;
    setTodos([...getTodos(), { text: v, done: false }]);
    $("todo-input").value = "";
  });
  $("clear-done").addEventListener("click", () => setTodos(getTodos().filter((t) => !t.done)));
  renderTodos();
}
function escapeHtml(s) { return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* ---------- Links ---------- */
function loadLinks() {
  $("links-list").innerHTML = CONFIG.links
    .filter((l) => !l.url.startsWith("PASTE"))
    .map((l) => `<a href="${l.url}" target="_blank" rel="noopener">${l.name}</a>`).join("");
}

/* ---------- Notes / brainstorm ---------- */
const NOTES_KEY = "morning.notes";
function initNotes() {
  const ta = $("notes-text");
  ta.value = localStorage.getItem(NOTES_KEY) || "";
  ta.addEventListener("input", () => localStorage.setItem(NOTES_KEY, ta.value));
  $("notes-clear").addEventListener("click", () => { ta.value = ""; localStorage.removeItem(NOTES_KEY); });
}

/* ---------- News ---------- */
/* Two routes to the headlines. First the file the GitHub Action writes (no third party involved).
   If that file is empty or stale, the browser pulls the feeds itself through a public RSS to JSON
   relay, so the section works even when the Action has not run. */
async function fetchFeedDirect(id, name) {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(`https://feeds.npr.org/${id}/rss.xml`)}`;
  const j = await fetchJson(url);
  if (!j || j.status !== "ok") return { id, name, items: [] };
  return { id, name, items: (j.items || []).slice(0, 8).map((it) => ({
    title: it.title || "", link: it.link || "",
    description: (it.description || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().slice(0, 180),
  })) };
}
async function loadNews() {
  let data = await fetchJson("data/npr.json?" + Date.now());
  const hours = data && data.updated ? (Date.now() - new Date(data.updated).getTime()) / 36e5 : Infinity;
  const usable = data && (data.feeds || []).some((f) => (f.items || []).length) && hours < 36;
  if (!usable) {
    const feeds = await Promise.all(CONFIG.npr.map((f) => fetchFeedDirect(f.id, f.name)));
    data = { updated: new Date().toISOString(), feeds, live: true };
  }
  if (!(data.feeds || []).some((f) => (f.items || []).length)) {
    $("news-list").innerHTML = `<p class="error">Headlines are not loading. The GitHub Action has not written data/npr.json (check the Actions tab and the workflow permissions) and the live feed relay did not answer.</p>`;
    return;
  }
  $("news-updated").textContent = data.updated ? `Updated ${new Date(data.updated).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}` : "";
  $("news-list").innerHTML = (data.feeds || []).map((f) => `
    <div class="news-group">
      <h3>${f.name}</h3>
      <ul>${f.items.slice(0, 6).map((it) => `<li><a href="${it.link}" target="_blank" rel="noopener">${escapeHtml(it.title)}</a>${it.description ? `<span class="desc">${escapeHtml(it.description)}</span>` : ""}</li>`).join("")}</ul>
    </div>`).join("");
}

/* ---------- Reading ---------- */
function loadReading() {
  const d = new Date();
  const dayNum = Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86400000);
  const [slug, title] = SEP[dayNum % SEP.length];
  const a = $("reading-link");
  a.href = `https://plato.stanford.edu/entries/${slug}/`;
  a.textContent = title;
}

/* ---------- Start ---------- */
function init() {
  const saved = localStorage.getItem("morning.location");
  currentLocation = CONFIG.locations.find((l) => l.id === saved) || CONFIG.locations[0];
  showDate();
  renderPlaces();
  loadConditions();
  loadWorkout();
  initWeek();
  initGcal();
  loadEvents();
  initTodos();
  loadLinks();
  initNotes();
  loadReading();
  loadNews();
  $("refresh").addEventListener("click", loadConditions);
  $("day-prev").addEventListener("click", () => { dayOffset = Math.max(-1, dayOffset - 1); loadConditions(); });
  $("day-next").addEventListener("click", () => { dayOffset = Math.min(6, dayOffset + 1); loadConditions(); });
}
document.addEventListener("DOMContentLoaded", init);
