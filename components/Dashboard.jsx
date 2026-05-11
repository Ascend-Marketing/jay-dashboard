import { useState, useEffect, useCallback, useRef } from "react";

function useWindowWidth() {
  const [width, setWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 800);
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";

const HABITS = [
  { id: "sun", label: "Zon ochtend", time: "07:05", icon: "☀️" },
  { id: "shower", label: "Koude douche", time: "07:15", icon: "🚿" },
  { id: "nophone", label: "Geen telefoon 30min", time: "07:00", icon: "📵" },
  { id: "coffee", label: "Zwarte koffie", time: "07:30", icon: "☕" },
  { id: "meal1", label: "Maaltijd 1 (12:30)", time: "12:30", icon: "🥩" },
  { id: "meal2", label: "Maaltijd 2 (17:00)", time: "17:00", icon: "🐟" },
  { id: "meal3", label: "Maaltijd 3 (21:00)", time: "21:00", icon: "🥚" },
  { id: "nosugar", label: "Geen suiker", time: "all day", icon: "🚫" },
  { id: "gym", label: "Gym / Herstel", time: "ochtend", icon: "💪" },
  { id: "sleep", label: "Slaap voor 23:30", time: "23:30", icon: "😴" },
];

const GYM = {
  MAANDAG: { label: "PUSH", color: "#e74c3c", exercises: ["Bench Press 4×8","OHP 4×8","Incline DB Press 3×10","Lateral Raises 4×12","Tricep Pushdown 3×12","OH Tricep Ext 3×10"] },
  DINSDAG: { label: "PULL", color: "#e67e22", exercises: ["Deadlift 4×5","Pull-ups 4×max","Cable Row 4×10","Face Pulls 3×15","Barbell Curl 3×10","Hammer Curl 3×12"] },
  WOENSDAG: { label: "BENEN", color: "#27ae60", exercises: ["Squat 4×8","Romanian DL 4×8","Leg Press 3×12","Lunges 3×10","Leg Curl 3×12","Calf Raises 4×20"] },
  ZONDAG: { label: "FULL BODY", color: "#2980b9", exercises: ["Squat/DL zwaar 5×3","Bench zwaar 5×3","Weighted Pull-ups 4×5","OHP 3×6","Plank 3×60s"] },
};

// Base meals — 200g+ porties voor grote eter
const MEALS = {
  Maandag: {
    m1: ["200g rundergehakt in boter", "3 eieren in boter", "1 appel"],
    m2: ["200g kip Paprika Chili (koud)", "Komkommer + cherry tomaat", "1 avocado"],
    m3: ["3 eieren in boter"],
  },
  Dinsdag: {
    m1: ["200g zalm in boter", "3 eieren in boter", "1 pruim"],
    m2: ["200g kip Tandoori (koud)", "Paprika + tomaat", "1 avocado"],
    m3: ["2 eieren in boter"],
  },
  Woensdag: {
    m1: ["250g kip Paprika Chili in boter", "3 eieren in boter", "80g mango"],
    m2: ["200g zalm (koud)", "Komkommer + paprika", "1 avocado"],
    m3: ["3 eieren in boter + 50g spek"],
  },
  Donderdag: {
    m1: ["200g rundergehakt in boter", "3 eieren in boter", "1 appel"],
    m2: ["200g kip Tandoori (koud)", "Cherry tomaat + komkommer", "1 avocado"],
    m3: ["2 eieren in boter"],
  },
  Vrijdag: {
    m1: ["200g varkenshaas in boter", "3 eieren in boter", "1 pruim"],
    m2: ["200g kip Paprika Chili (koud)", "Paprika + tomaat", "1 avocado"],
    m3: ["2 eieren in boter + 50g spek"],
  },
  Zaterdag: {
    m1: ["200g zalm in boter", "3 eieren in boter", "1 appel"],
    m2: ["200g kip Tandoori (koud)", "Komkommer + cherry tomaat", "1 avocado"],
    m3: ["3 eieren in boter"],
  },
  Zondag: {
    m1: ["200g rundergehakt in boter", "3 eieren in boter", "1 pruim"],
    m2: ["200g kip Paprika Chili (koud)", "Paprika + cherry tomaat", "1 avocado"],
    m3: ["3 eieren in boter"],
  },
};

// Special day overrides — Factor maaltijden + groentenmixen overbrugging
const SPECIAL_MEALS = {
  "2026-05-11": {
    m1: ["⭐ FACTOR maaltijd — varkenshaas/spinazie/sperziebonen", "(geen bereiding nodig)"],
    m2: ["⭐ FACTOR maaltijd — varkenshaas/spinazie/sperziebonen", "(geen bereiding nodig)"],
    m3: ["3 eieren in boter + 50g spek"],
    note: "Factor maaltijden opmaken. Muscle Meat nog niet binnen.",
  },
  "2026-05-12": {
    m1: ["⭐ FACTOR maaltijd — varkenshaas/spinazie/sperziebonen", "(geen bereiding nodig)"],
    m2: ["150g kip blokjes (diepvries) koud", "Komkommer + paprika", "1 avocado"],
    m3: ["2 eieren in boter"],
    note: "Laatste Factor maaltijd. Kip blokjes diepvries opmaken.",
  },
  "2026-05-13": {
    m1: ["3 eieren in boter", "150g Mexicaanse groentemix (diepvries)", "80g mango"],
    m2: ["150g wok groentemix (diepvries) gebakken in boter", "1 avocado", "Komkommer"],
    m3: ["✅ Muscle Meat arriveert vanavond — 200g rundergehakt in boter"],
    note: "Muscle Meat levering avond. Groentenmixen opmaken bij M1/M2.",
  },
  "2026-05-14": {
    m1: ["200g rundergehakt (MM) in boter", "3 eieren in boter", "150g erwten/groentemix", "1 appel"],
    m2: ["200g kip Paprika Chili (MM, koud)", "Cherry tomaat + komkommer", "1 avocado"],
    m3: ["3 eieren in boter"],
    note: "Eerste volledige Muscle Meat dag. Groentenmixen verwerken bij M1.",
  },
  "2026-05-15": {
    m1: ["200g zalm (MM) in boter", "3 eieren in boter", "150g prei gebakken in boter", "1 pruim"],
    m2: ["200g kip Tandoori (MM, koud)", "Paprika + tomaat", "1 avocado"],
    m3: ["2 eieren in boter"],
    note: "Prei opmaken bij M1.",
  },
  "2026-05-16": {
    m1: ["250g kip Paprika Chili (MM) in boter", "3 eieren in boter", "150g groentenmix (diepvries)", "80g mango"],
    m2: ["200g zalm (MM, koud)", "Komkommer + paprika", "1 avocado"],
    m3: ["3 eieren in boter + 50g spek"],
    note: "Groentenmixen verder opmaken.",
  },
};

const DAY_NL = ["Zondag","Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag"];
const DAY_SHORT = ["ZO","MA","DI","WO","DO","VR","ZA"];

const SHOPPING_ALERTS = [
  {
    date: "2026-05-11",
    urgency: "high",
    where: "Afghaanse winkel",
    items: ["6 avocado's"],
    note: "Enkel avocado's — rest heb je nog in huis",
  },
  {
    date: "2026-05-17",
    urgency: "high",
    where: "Lokale boer",
    items: ["24 eieren", "250g boter"],
  },
  {
    date: "2026-05-18",
    urgency: "high",
    where: "Afghaanse winkel",
    items: ["6 avocado's", "2 komkommers", "2 paprika's", "1 mango", "Pruimen 4st"],
  },
  {
    date: "2026-05-23",
    urgency: "high",
    where: "Lokale boer",
    items: ["24 eieren", "250g boter"],
  },
  {
    date: "2026-05-25",
    urgency: "high",
    where: "Afghaanse winkel",
    items: ["6 avocado's", "2 komkommers", "2 paprika's", "Appels 4st", "Cherry tomaat 2tr"],
  },
  {
    date: "2026-05-29",
    urgency: "high",
    where: "Lokale boer",
    items: ["24 eieren", "250g boter"],
  },
  {
    date: "2026-06-01",
    urgency: "critical",
    where: "Muscle Meat (online bestellen)",
    items: ["2.5kg Kip Paprika Chili", "2.5kg Kip Tandoori", "2kg Zalm", "2kg Rundergehakt", "1kg Varkenshaas"],
    note: "Zelfde bestelling als mei — €143",
  },
];

function getKey(d = new Date()) { return d.toISOString().split("T")[0]; }
function load(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

function getMayPlan() {
  const plan = [];
  for (let day = 1; day <= 31; day++) {
    const date = new Date(2026, 4, day);
    const dayName = DAY_NL[date.getDay()];
    const gymType =
      dayName === "Maandag" ? "PUSH" :
      dayName === "Dinsdag" ? "PULL" :
      dayName === "Woensdag" ? "BENEN" :
      dayName === "Zondag" ? "FULL BODY" : null;
    const dateKey = `2026-05-${String(day).padStart(2,"0")}`;
    const special = SPECIAL_MEALS[dateKey];
    plan.push({
      day, date: dateKey, dayName,
      dayShort: DAY_SHORT[date.getDay()],
      isTraining: !!gymType, gymType,
      meals: special || MEALS[dayName] || MEALS["Maandag"],
      specialNote: special?.note || null,
      hasShop: SHOPPING_ALERTS.some(a => a.date === dateKey),
      isSpecial: !!special,
    });
  }
  return plan;
}

const MAY_PLAN = getMayPlan();

function Ring({ value, max = 100, color, label, size = 80 }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const offset = circ - pct * circ;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
      <div style={{ position:"relative", width:size, height:size }}>
        <svg width={size} height={size} style={{ transform:"rotate(-90deg)" }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#222" strokeWidth={6} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition:"stroke-dashoffset 1s ease", strokeLinecap:"round" }} />
        </svg>
        <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontFamily:"monospace", fontSize:13, color, fontWeight:700 }}>{value}%</div>
      </div>
      <div style={{ fontFamily:"monospace", fontSize:9, color:"#555", letterSpacing:"0.1em", textAlign:"center" }}>{label}</div>
    </div>
  );
}

function WaterTracker({ glasses, onToggle }) {
  const TARGET = 8;
  const pct = Math.round((glasses / TARGET) * 100);
  const color = glasses >= TARGET ? "#00bcd4" : glasses >= 5 ? "#ff6d00" : "#e74c3c";
  return (
    <div style={{ background:"#111", border:`1px solid ${glasses >= TARGET ? "#00bcd4" : "#1e1e1e"}`, borderRadius:6, padding:16, marginBottom:14 }}>
      <div style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.18em", color:"#444", marginBottom:10, textTransform:"uppercase" }}>// WATER — 2L DOEL</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:28, color, lineHeight:1 }}>{glasses}/{TARGET}</div>
        <div style={{ fontFamily:"monospace", fontSize:10, color:"#555" }}>{glasses * 250}ml / 2000ml</div>
        <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:16, color }}>{pct}%</div>
      </div>
      <div style={{ display:"flex", gap:5, marginBottom:10 }}>
        {Array.from({ length: TARGET }, (_, i) => (
          <div key={i} onClick={() => onToggle(i + 1)} title={`${(i+1)*250}ml`}
            style={{ flex:1, height:34, borderRadius:4, border:`1px solid ${i < glasses ? "#00bcd4" : "#1e1e1e"}`, background: i < glasses ? "#071c20" : "#0f0f0f", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:14, transition:"all 0.15s" }}>
            {i < glasses ? "💧" : <span style={{ color:"#333", fontSize:10 }}>○</span>}
          </div>
        ))}
      </div>
      <div style={{ height:4, background:"#1e1e1e", borderRadius:2, overflow:"hidden" }}>
        <div style={{ height:"100%", background:"#00bcd4", width:`${pct}%`, borderRadius:2, transition:"width 0.5s" }} />
      </div>
      {glasses >= TARGET && <div style={{ fontFamily:"monospace", fontSize:9, color:"#00bcd4", textAlign:"center", marginTop:8 }}>✓ 2L BEREIKT</div>}
    </div>
  );
}

// Editable meal card
function EditableMealCard({ mealKey, items, color, time, label, dateKey, onSave }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(items.join("\n"));

  const handleSave = () => {
    const newItems = draft.split("\n").map(s => s.trim()).filter(Boolean);
    onSave(dateKey, mealKey, newItems);
    setEditing(false);
  };

  const handleCancel = () => {
    setDraft(items.join("\n"));
    setEditing(false);
  };

  return (
    <div style={{ padding:"10px 12px", borderRadius:5, borderLeft:`3px solid ${color}`, background:"#0f0f0f", marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:12, color }}>{time} — {label}</div>
        <button onClick={() => editing ? handleCancel() : setEditing(true)}
          style={{ background:"none", border:`1px solid ${editing?"#e74c3c":"#333"}`, color: editing?"#e74c3c":"#555", borderRadius:3, padding:"2px 8px", cursor:"pointer", fontFamily:"monospace", fontSize:9 }}>
          {editing ? "✗ ANNULEER" : "✏️ EDIT"}
        </button>
      </div>
      {editing ? (
        <div>
          <textarea value={draft} onChange={e => setDraft(e.target.value)}
            style={{ width:"100%", background:"#080808", border:"1px solid #00e676", borderRadius:3, color:"#f0ede8", fontFamily:"monospace", fontSize:11, padding:8, resize:"vertical", minHeight:80, boxSizing:"border-box" }} />
          <div style={{ display:"flex", gap:6, marginTop:6 }}>
            <button onClick={handleSave}
              style={{ flex:1, background:"#00e676", border:"none", color:"#080808", borderRadius:3, padding:"6px 0", cursor:"pointer", fontFamily:"monospace", fontSize:10, fontWeight:700 }}>
              ✓ OPSLAAN
            </button>
            <button onClick={handleCancel}
              style={{ flex:1, background:"#1a1a1a", border:"1px solid #333", color:"#555", borderRadius:3, padding:"6px 0", cursor:"pointer", fontFamily:"monospace", fontSize:10 }}>
              ANNULEER
            </button>
          </div>
          <div style={{ fontFamily:"monospace", fontSize:8, color:"#333", marginTop:4 }}>Één item per regel</div>
        </div>
      ) : (
        <div style={{ fontSize:11, color:"#555", lineHeight:1.8 }}>{items.join(" · ")}</div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const width = useWindowWidth();
  const isMobile = width < 640;
  const [tab, setTab] = useState("today");
  const [calDateOffset, setCalDateOffset] = useState(0);
  const [habits, setHabits] = useState(() => load("j_habits", {}));
  const [gymSessions, setGymSessions] = useState(() => load("j_gym", {}));
  const [calEvents, setCalEvents] = useState(null);
  const [calLoading, setCalLoading] = useState(false);
  const [gymDay, setGymDay] = useState("MAANDAG");
  const [gymReps, setGymReps] = useState(() => load("j_reps", {}));
  const [water, setWater] = useState(() => load("j_water", {}));
  const [selectedMayDay, setSelectedMayDay] = useState(null);
  const [mealOverrides, setMealOverrides] = useState(() => load("j_meal_overrides", {}));

  const today = new Date();
  const calDate = new Date(today);
  calDate.setDate(calDate.getDate() + calDateOffset);
  const todayKey = getKey(today);
  const dayName = DAY_NL[today.getDay()];
  const todayHabits = habits[todayKey] || {};
  const doneCount = Object.values(todayHabits).filter(Boolean).length;
  const habitPct = Math.round(doneCount / HABITS.length * 100);
  const todayWater = water[todayKey] || 0;

  // Get meals for a given date key, with override support
  const getMealsForDate = (dateKey) => {
    const dayIdx = new Date(dateKey).getDay();
    const dName = DAY_NL[dayIdx];
    const special = SPECIAL_MEALS[dateKey];
    const base = special || MEALS[dName] || MEALS["Maandag"];
    const overrides = mealOverrides[dateKey] || {};
    return {
      m1: overrides.m1 || base.m1,
      m2: overrides.m2 || base.m2,
      m3: overrides.m3 || base.m3,
    };
  };

  const handleMealSave = (dateKey, mealKey, newItems) => {
    const updated = {
      ...mealOverrides,
      [dateKey]: { ...(mealOverrides[dateKey] || {}), [mealKey]: newItems }
    };
    setMealOverrides(updated);
    save("j_meal_overrides", updated);
  };

  const calcStreak = () => {
    let s = 0, d = new Date(today);
    while (s < 365) {
      const h = habits[getKey(d)] || {};
      if (Object.values(h).filter(Boolean).length >= 7) { s++; d.setDate(d.getDate() - 1); } else break;
    }
    return s;
  };
  const streak = calcStreak();

  const calcMonth = () => {
    let total = 0, scored = 0;
    const d = new Date(today.getFullYear(), today.getMonth(), 1);
    while (d <= today) {
      total++;
      const h = habits[getKey(d)] || {};
      scored += Object.values(h).filter(Boolean).length / HABITS.length;
      d.setDate(d.getDate() + 1);
    }
    return total ? Math.round(scored / total * 100) : 0;
  };
  const monthPct = calcMonth();

  const getWeekKey = (d) => {
    const jan1 = new Date(d.getFullYear(), 0, 1);
    const week = Math.ceil((((d - jan1) / 864e5) + jan1.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${week}`;
  };
  const weekKey = getWeekKey(today);
  const gymThisWeek = gymSessions[weekKey] || 0;

  const nextAlert = SHOPPING_ALERTS.find(a => a.date >= todayKey);
  const daysToShop = nextAlert ? Math.ceil((new Date(nextAlert.date) - today) / (1000 * 60 * 60 * 24)) : null;

  const toggleHabit = (id) => {
    const updated = { ...habits, [todayKey]: { ...todayHabits, [id]: !todayHabits[id] } };
    setHabits(updated); save("j_habits", updated);
  };

  const toggleGym = () => {
    const curr = gymSessions[weekKey] || 0;
    const val = curr < 4 ? curr + 1 : 0;
    const updated = { ...gymSessions, [weekKey]: val };
    setGymSessions(updated); save("j_gym", updated);
  };

  const toggleWater = (glass) => {
    const curr = water[todayKey] || 0;
    const newVal = glass === curr ? glass - 1 : glass;
    const updated = { ...water, [todayKey]: Math.max(0, newVal) };
    setWater(updated); save("j_water", updated);
  };

  const fetchCalendar = useCallback(async (date) => {
    setCalLoading(true); setCalEvents(null);
    try {
      const isoDate = getKey(date);
      const calendarId = "jaywilliams.jw5@gmail.com";
      const apiKey = "AIzaSyCLHk6aQuAb-M3fbOkaonyMf2Cifeh7MBs";
      const timeMin = `${isoDate}T00:00:00+02:00`;
      const timeMax = `${isoDate}T23:59:59+02:00`;
      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.error) { setCalEvents([]); setCalLoading(false); return; }
      const events = (data.items || []).map(ev => ({
        title: ev.summary || "Geen titel",
        startTime: ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleTimeString("nl-BE", { hour:"2-digit", minute:"2-digit" }) : "Hele dag",
        endTime: ev.end?.dateTime ? new Date(ev.end.dateTime).toLocaleTimeString("nl-BE", { hour:"2-digit", minute:"2-digit" }) : "",
        location: ev.location || "",
      }));
      setCalEvents(events);
    } catch { setCalEvents([]); }
    setCalLoading(false);
  }, []);

  useEffect(() => {
    if (tab === "calendar" || tab === "today") fetchCalendar(calDate);
  }, [tab, calDateOffset]);

  // Auto-refresh calendar every 5 minutes
  useEffect(() => {
    if (tab !== "calendar" && tab !== "today") return;
    const interval = setInterval(() => fetchCalendar(calDate), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [tab, calDateOffset]);

  const heatData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - 29 + i);
    const h = habits[getKey(d)] || {};
    const cnt = Object.values(h).filter(Boolean).length;
    return { day: i + 1, score: cnt, pct: Math.round(cnt / HABITS.length * 100), isToday: getKey(d) === todayKey };
  });

  const MAY_OFFSET = 5;
  const selectedDay = MAY_PLAN.find(d => d.day === selectedMayDay) || MAY_PLAN.find(d => d.date === todayKey) || MAY_PLAN[0];

  const S = {
    app: { background:"#080808", minHeight:"100vh", color:"#f0ede8", fontFamily:"system-ui,sans-serif", fontSize: isMobile ? 13 : 14 },
    hdr: { background:"rgba(8,8,8,0.97)", borderBottom:"1px solid #1e1e1e", padding: isMobile ? "10px 12px" : "14px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100, flexWrap: isMobile ? "wrap" : "nowrap", gap: isMobile ? 8 : 0 },
    nav: { display:"flex", borderBottom:"1px solid #1e1e1e", padding: isMobile ? "0 8px" : "0 20px", overflowX:"auto", WebkitOverflowScrolling:"touch" },
    navBtn: (a) => ({ background:"none", border:"none", borderBottom:a?"2px solid #00e676":"2px solid transparent", color:a?"#00e676":"#555", fontFamily:"monospace", fontSize: isMobile ? 9 : 10, letterSpacing:"0.08em", padding: isMobile ? "10px 10px" : "11px 14px", cursor:"pointer", whiteSpace:"nowrap" }),
    pg: { padding: isMobile ? "12px" : "16px 20px", maxWidth:1300, margin:"0 auto" },
    card: { background:"#111", border:"1px solid #1e1e1e", borderRadius:6, padding: isMobile ? 12 : 16, marginBottom:12 },
    lbl: { fontFamily:"monospace", fontSize:9, letterSpacing:"0.15em", color:"#444", marginBottom:8, textTransform:"uppercase" },
    kpi: { background:"#111", border:"1px solid #1e1e1e", borderRadius:6, padding: isMobile ? 12 : 16 },
    g2: { display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:12 },
    g4: { display:"grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap:10 },
    g21: { display:"grid", gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", gap:12 },
    hab: (d) => ({ display:"flex", alignItems:"center", gap:10, padding: isMobile ? "12px 12px" : "9px 12px", borderRadius:5, border:`1px solid ${d?"#00e676":"#1e1e1e"}`, background:d?"#0d2a1a":"#0f0f0f", cursor:"pointer", transition:"all 0.15s", userSelect:"none", minHeight: isMobile ? 48 : "auto" }),
    chk: (d) => ({ width: isMobile ? 22 : 18, height: isMobile ? 22 : 18, borderRadius:3, border:`2px solid ${d?"#00e676":"#333"}`, background:d?"#00e676":"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize: isMobile ? 12 : 10, color:"#080808", flexShrink:0 }),
    ev: { display:"flex", gap:10, padding:"9px 12px", borderRadius:4, background:"#0f0f0f", borderLeft:"3px solid #00e676", marginBottom:6 },
    never: { display:"flex", alignItems:"center", gap:8, padding:"7px 10px", borderRadius:4, background:"#180808", borderLeft:"2px solid #e74c3c", marginBottom:5, fontSize:12 },
    rule: { display:"flex", gap:10, padding:"9px 12px", borderRadius:4, background:"#0f0f0f", marginBottom:7, alignItems:"flex-start" },
    shop: { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"9px 0", borderBottom:"1px solid #181818" },
    progBar: { height:4, background:"#1e1e1e", borderRadius:2, overflow:"hidden", marginTop:6 },
    alert: (u) => ({ padding:"10px 12px", borderRadius:4, borderLeft:`3px solid ${u==="critical"?"#e74c3c":"#ff6d00"}`, background: u==="critical"?"#130808":"#0d0900", marginBottom:8 }),
  };

  const todayStr = today.toLocaleDateString("nl-BE", { weekday:"long", day:"numeric", month:"long" }).toUpperCase();
  const calStr = calDate.toLocaleDateString("nl-BE", { weekday:"long", day:"numeric", month:"long" }).toUpperCase();
  const todayMeals = getMealsForDate(todayKey);
  const todaySpecial = SPECIAL_MEALS[todayKey];

  return (
    <div style={S.app}>
      {/* HEADER */}
      <div style={S.hdr}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", width: isMobile ? "100%" : "auto", gap:8 }}>
          <div>
            <div style={{ fontFamily:"monospace", fontWeight:700, fontSize: isMobile ? 14 : 16, letterSpacing:"0.08em" }}>
              JAY <span style={{ color:"#00e676" }}>WILLIAMS</span>
            </div>
            {!isMobile && <div style={{ fontFamily:"monospace", fontSize:9, color:"#444", letterSpacing:"0.12em" }}>ASCEND MARKETING // STAGE 4 // KORTRIJK</div>}
          </div>
          {!isMobile && (
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"monospace", fontSize:11, color:"#00e676", letterSpacing:"0.06em" }}>{todayStr}</div>
              <div style={{ fontFamily:"monospace", fontSize:9, color:"#444" }}>30-DAY PROTOCOL</div>
            </div>
          )}
          {isMobile && (
            <div style={{ fontFamily:"monospace", fontSize:9, color:"#00e676" }}>{todayStr.split(" ").slice(0,3).join(" ")}</div>
          )}
        </div>
        <div style={{ display:"flex", gap: isMobile ? 6 : 10, alignItems:"center", width: isMobile ? "100%" : "auto", justifyContent: isMobile ? "space-between" : "flex-end" }}>
          {nextAlert && (
            <div style={{ background: daysToShop <= 1 ? "#130808" : "#0d0900", border:`1px solid ${daysToShop <= 1 ? "#e74c3c" : "#ff6d00"}`, borderRadius:4, padding:"6px 12px", textAlign:"center", cursor:"pointer" }} onClick={() => setTab("shopping")}>
              <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:18, color: daysToShop <= 1 ? "#e74c3c" : "#ff6d00", lineHeight:1 }}>
                {daysToShop <= 0 ? "!" : daysToShop === 1 ? "1d" : `${daysToShop}d`}
              </div>
              <div style={{ fontFamily:"monospace", fontSize:8, color:"#555", letterSpacing:"0.1em" }}>🛒 SHOP</div>
            </div>
          )}
          <div style={{ background: todayWater >= 8 ? "#071c20" : "#0f0f0f", border:`1px solid ${todayWater >= 8 ? "#00bcd4" : "#1e1e1e"}`, borderRadius:4, padding:"6px 12px", textAlign:"center", cursor:"pointer" }} onClick={() => setTab("today")}>
            <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:18, color:"#00bcd4", lineHeight:1 }}>{todayWater}/8</div>
            <div style={{ fontFamily:"monospace", fontSize:8, color:"#555", letterSpacing:"0.1em" }}>💧 WATER</div>
          </div>
          <div style={{ background:"#0d2a1a", border:"1px solid #00e676", borderRadius:4, padding:"6px 14px", textAlign:"center" }}>
            <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:22, color:"#00e676", lineHeight:1 }}>{streak}</div>
            <div style={{ fontFamily:"monospace", fontSize:8, color:"#00e676", letterSpacing:"0.1em" }}>STREAK</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:22, color: habitPct >= 80 ? "#00e676" : habitPct >= 50 ? "#ff6d00" : "#e74c3c" }}>{habitPct}%</div>
            <div style={{ fontFamily:"monospace", fontSize:8, color:"#444", letterSpacing:"0.1em" }}>VANDAAG</div>
          </div>
        </div>
      </div>

      {/* NAV */}
      <div style={S.nav}>
        {[["today","// TODAY"],["mei","// MEI PLAN"],["calendar","// AGENDA"],["gym","// GYM"],["nutrition","// VOEDING"],["stats","// STATS"],["shopping","// BOODSCHAPPEN"],["rules","// PROTOCOL"]].map(([id, lbl]) => (
          <button key={id} style={S.navBtn(tab === id)} onClick={() => setTab(id)}>{lbl}</button>
        ))}
      </div>

      {/* ══ TODAY ══ */}
      {tab === "today" && <div style={S.pg}>
        <div style={{ ...S.g4, marginBottom:14 }}>
          {[
            { n:`${doneCount}/${HABITS.length}`, l:"HABITS VANDAAG", c: habitPct>=80?"#00e676":habitPct>=50?"#ff6d00":"#e74c3c", p:habitPct },
            { n:`${todayWater}/8`, l:"WATER (2L DOEL)", c: todayWater>=8?"#00bcd4":todayWater>=5?"#ff6d00":"#e74c3c", p:todayWater*12.5 },
            { n:streak, l:"DAG STREAK", c:"#ff6d00", p:Math.min(streak/30*100,100) },
            { n:`${monthPct}%`, l:"MAAND MEI", c: monthPct>=80?"#00e676":monthPct>=60?"#ff6d00":"#e74c3c", p:monthPct },
          ].map((k, i) => (
            <div key={i} style={S.kpi}>
              <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:28, color:k.c, lineHeight:1 }}>{k.n}</div>
              <div style={{ ...S.lbl, marginTop:4, marginBottom:0 }}>{k.l}</div>
              <div style={S.progBar}><div style={{ height:"100%", background:k.c, width:`${k.p}%`, borderRadius:2, transition:"width 0.5s" }} /></div>
            </div>
          ))}
        </div>

        <div style={S.g21}>
          <div>
            {/* Habit checklist */}
            <div style={S.card}>
              <div style={S.lbl}>// DAILY LOCK-IN — {todayStr}</div>
              <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:7 }}>
                {HABITS.map(h => (
                  <div key={h.id} style={S.hab(!!todayHabits[h.id])} onClick={() => toggleHabit(h.id)}>
                    <div style={S.chk(!!todayHabits[h.id])}>{todayHabits[h.id] ? "✓" : ""}</div>
                    <div style={{ flex:1, fontWeight:700, fontSize:12, color: todayHabits[h.id] ? "#00e676" : "#ccc" }}>{h.icon} {h.label}</div>
                    <div style={{ fontFamily:"monospace", fontSize:9, color:"#444" }}>{h.time}</div>
                  </div>
                ))}
              </div>
              <div style={{ height:5, background:"#1e1e1e", borderRadius:2, overflow:"hidden", marginTop:12 }}>
                <div style={{ height:"100%", background:"#00e676", width:`${habitPct}%`, borderRadius:2, transition:"width 0.5s" }} />
              </div>
              <div style={{ fontFamily:"monospace", fontSize:9, color:"#444", textAlign:"right", marginTop:4 }}>{doneCount}/{HABITS.length} VOLTOOID</div>
            </div>
            <WaterTracker glasses={todayWater} onToggle={toggleWater} />
          </div>

          <div>
            {/* Special day notice */}
            {todaySpecial && (
              <div style={{ padding:"10px 12px", borderRadius:5, borderLeft:"3px solid #ff6d00", background:"#0d0900", marginBottom:8 }}>
                <div style={{ fontFamily:"monospace", fontSize:9, color:"#ff6d00", marginBottom:4 }}>⚠️ SPECIALE DAG</div>
                <div style={{ fontSize:11, color:"#888" }}>{todaySpecial.note}</div>
              </div>
            )}

            {/* Editable meals today */}
            <div style={S.card}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.18em", color:"#444", textTransform:"uppercase" }}>// MAALTIJDEN — {dayName.toUpperCase()}</div>
                <div style={{ fontFamily:"monospace", fontSize:8, color:"#333" }}>✏️ klik EDIT om aan te passen</div>
              </div>
              {["m1","m2","m3"].map((m, i) => {
                const times = ["12:30","17:00","21:00"];
                const labels = ["M1 — GROOT","M2 — VELD","M3 — KLEIN"];
                const cols = ["#00e676","#27ae60","#2980b9"];
                const items = todayMeals[m] || [];
                return (
                  <EditableMealCard key={m} mealKey={m} items={items} color={cols[i]}
                    time={times[i]} label={labels[i]} dateKey={todayKey} onSave={handleMealSave} />
                );
              })}
            </div>

            {/* Rings */}
            <div style={S.card}>
              <div style={S.lbl}>// WEEK VOORTGANG</div>
              <div style={{ display:"flex", justifyContent:"space-around", padding:"4px 0" }}>
                <Ring value={habitPct} color="#00e676" label="HABITS" />
                <Ring value={Math.round(todayWater/8*100)} color="#00bcd4" label="WATER" />
                <Ring value={gymThisWeek*25} color="#448aff" label="GYM" />
              </div>
            </div>

            {/* Gym sessions */}
            <div style={S.card}>
              <div style={S.lbl}>// GYM SESSIES WEEK</div>
              <div style={{ display:"flex", gap:6, marginBottom:8 }}>
                {[1,2,3,4].map(n => (
                  <div key={n} onClick={toggleGym} style={{ flex:1, height:38, borderRadius:4, border:`1px solid ${gymThisWeek>=n?"#00e676":"#1e1e1e"}`, background: gymThisWeek>=n?"#0d2a1a":"#0f0f0f", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontFamily:"monospace", fontWeight:700, fontSize:16, color: gymThisWeek>=n?"#00e676":"#333" }}>
                    {gymThisWeek >= n ? "✓" : n}
                  </div>
                ))}
              </div>
              <div style={{ fontFamily:"monospace", fontSize:9, color: gymThisWeek>=4?"#00e676":"#444" }}>TARGET: 4/WEEK</div>
            </div>

            {/* Google Calendar */}
            <div style={S.card}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <div style={{ fontFamily:"monospace", fontSize:9, letterSpacing:"0.18em", color:"#444", textTransform:"uppercase" }}>// AGENDA VANDAAG</div>
                <button onClick={() => fetchCalendar(calDate)} style={{ background:"none", border:"1px solid #333", color:"#555", borderRadius:3, padding:"3px 8px", cursor:"pointer", fontFamily:"monospace", fontSize:9 }}>
                  {calLoading ? "⟳" : "↺ REFRESH"}
                </button>
              </div>
              {calLoading ? <div style={{ color:"#444", fontFamily:"monospace", fontSize:11 }}>⟳ Laden...</div>
                : calEvents && calEvents.length > 0 ? calEvents.map((ev, i) => (
                  <div key={i} style={S.ev}>
                    <div style={{ fontFamily:"monospace", fontSize:10, color:"#00e676", minWidth:42 }}>{ev.startTime || "—"}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:13 }}>{ev.title}</div>
                      {ev.location && <div style={{ fontSize:11, color:"#444", marginTop:1 }}>📍 {ev.location}</div>}
                    </div>
                  </div>
                )) : <div style={{ color:"#333", fontFamily:"monospace", fontSize:11 }}>Geen items voor vandaag.<br/><span style={{ fontSize:9, color:"#222" }}>Voeg werk toe in Google Calendar → verschijnt hier automatisch.</span></div>}
            </div>
          </div>
        </div>
      </div>}

      {/* ══ MEI PLAN ══ */}
      {tab === "mei" && <div style={S.pg}>
        <div style={S.g21}>
          <div>
            <div style={S.card}>
              <div style={S.lbl}>// MEI 2026 — MAALTIJDPLAN</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3, marginBottom:4 }}>
                {["ZO","MA","DI","WO","DO","VR","ZA"].map(d => (
                  <div key={d} style={{ textAlign:"center", fontFamily:"monospace", fontSize:9, color:"#444", padding:"4px 0" }}>{d}</div>
                ))}
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:3 }}>
                {Array.from({ length: MAY_OFFSET }, (_, i) => <div key={`pad-${i}`} />)}
                {MAY_PLAN.map(d => {
                  const isToday = d.date === todayKey;
                  const isSelected = selectedDay && d.day === selectedDay.day;
                  const isPast = d.date < todayKey;
                  const gymColor = d.gymType === "PUSH" ? "#e74c3c" : d.gymType === "PULL" ? "#e67e22" : d.gymType === "BENEN" ? "#27ae60" : d.gymType === "FULL BODY" ? "#2980b9" : null;
                  return (
                    <div key={d.day} onClick={() => setSelectedMayDay(d.day)}
                      style={{ aspectRatio:"1/1", borderRadius:4, cursor:"pointer", transition:"all 0.15s",
                        border:`1px solid ${isSelected?"#00e676":isToday?"#ff6d00":d.isSpecial?"#ff6d0044":d.isTraining?"#1a2a1a":"#181818"}`,
                        background: isSelected?"#0d2a1a":isToday?"#1a0d00":d.isSpecial?"#110900":"#0c0c0c",
                        display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:2,
                        opacity: isPast && !isToday ? 0.35 : 1 }}>
                      <div style={{ fontFamily:"monospace", fontSize:11, fontWeight:700, color: isSelected?"#00e676":isToday?"#ff6d00":isPast?"#333":"#f0ede8" }}>{d.day}</div>
                      {gymColor && <div style={{ fontSize:5, color:gymColor, fontFamily:"monospace" }}>{d.gymType?.slice(0,3)}</div>}
                      {d.hasShop && <div style={{ width:4, height:4, borderRadius:"50%", background:"#ff6d00", marginTop:1 }} />}
                      {d.isSpecial && <div style={{ width:4, height:4, borderRadius:"50%", background:"#8e44ad", marginTop:1 }} />}
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:10, marginTop:10, fontFamily:"monospace", fontSize:8, color:"#444", flexWrap:"wrap" }}>
                <span><span style={{ color:"#ff6d00" }}>■</span> Vandaag</span>
                <span><span style={{ color:"#e74c3c" }}>■</span> Push</span>
                <span><span style={{ color:"#e67e22" }}>■</span> Pull</span>
                <span><span style={{ color:"#27ae60" }}>■</span> Benen</span>
                <span><span style={{ color:"#2980b9" }}>■</span> Full Body</span>
                <span><span style={{ color:"#ff6d00" }}>●</span> Boodschappen</span>
                <span><span style={{ color:"#8e44ad" }}>●</span> Speciale dag</span>
              </div>
            </div>

            <div style={S.card}>
              <div style={S.lbl}>// BOODSCHAPPEN SCHEMA MEI</div>
              {SHOPPING_ALERTS.map((alert, i) => {
                const alertDate = new Date(alert.date);
                const dateStr = alertDate.toLocaleDateString("nl-BE", { weekday:"short", day:"numeric", month:"short" });
                const daysUntil = Math.ceil((alertDate - today) / (1000*60*60*24));
                const isPast = daysUntil < 0;
                return (
                  <div key={i} style={{ ...S.alert(alert.urgency), opacity: isPast ? 0.35 : 1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                      <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:11, color: alert.urgency==="critical"?"#e74c3c":"#ff6d00", textTransform:"uppercase" }}>
                        {alert.urgency === "critical" ? "⚡ " : "🛒 "}{dateStr.toUpperCase()}
                      </div>
                      <div style={{ fontFamily:"monospace", fontSize:9, color:"#444" }}>
                        {isPast ? "VOORBIJ" : daysUntil === 0 ? "VANDAAG" : `over ${daysUntil}d`}
                      </div>
                    </div>
                    <div style={{ fontSize:10, color:"#666", marginBottom:4 }}>📍 {alert.where}</div>
                    {alert.note && <div style={{ fontSize:9, color:"#555", fontStyle:"italic", marginBottom:6 }}>{alert.note}</div>}
                    <div style={{ display:"flex", flexWrap:"wrap", gap:3 }}>
                      {alert.items.map((item, ii) => (
                        <span key={ii} style={{ fontSize:9, background:"#1a1a1a", border:"1px solid #2a2a2a", padding:"2px 6px", borderRadius:3, color:"#ccc" }}>{item}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: selected day detail */}
          <div>
            {selectedDay && (() => {
              const dayMeals = getMealsForDate(selectedDay.date);
              const daySpecial = SPECIAL_MEALS[selectedDay.date];
              return (
                <>
                  <div style={{ ...S.card, borderTop:`3px solid ${selectedDay.isTraining ? (GYM[selectedDay.gymType]?.color || "#00e676") : selectedDay.isSpecial ? "#8e44ad" : "#1e1e1e"}` }}>
                    <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:15, color:"#00e676", marginBottom:4 }}>
                      {selectedDay.dayName.toUpperCase()} {selectedDay.day} MEI
                    </div>
                    <div style={{ display:"flex", gap:6, marginBottom:12, flexWrap:"wrap" }}>
                      {selectedDay.gymType ? (
                        <div style={{ display:"inline-block", padding:"3px 10px", borderRadius:3, background: GYM[selectedDay.gymType]?.color, color:"#fff", fontFamily:"monospace", fontSize:9, fontWeight:700 }}>
                          🏋️ {selectedDay.gymType}
                        </div>
                      ) : (
                        <div style={{ display:"inline-block", padding:"3px 10px", borderRadius:3, background:"#181818", color:"#444", fontFamily:"monospace", fontSize:9 }}>RUSTDAG</div>
                      )}
                      {selectedDay.isSpecial && <div style={{ display:"inline-block", padding:"3px 10px", borderRadius:3, background:"#1a0d2a", color:"#8e44ad", fontFamily:"monospace", fontSize:9 }}>⭐ SPECIAAL</div>}
                    </div>

                    {daySpecial?.note && (
                      <div style={{ padding:"8px 10px", borderRadius:4, background:"#0d0900", borderLeft:"2px solid #ff6d00", marginBottom:10, fontSize:11, color:"#888" }}>
                        {daySpecial.note}
                      </div>
                    )}

                    {["m1","m2","m3"].map((m, i) => {
                      const times = ["12:30","17:00","21:00"];
                      const labels = ["MAALTIJD 1 — GROOT","MAALTIJD 2 — VELD","MAALTIJD 3 — KLEIN"];
                      const cols = ["#00e676","#27ae60","#2980b9"];
                      const items = dayMeals[m] || [];
                      return (
                        <EditableMealCard key={m} mealKey={m} items={items} color={cols[i]}
                          time={times[i]} label={labels[i]} dateKey={selectedDay.date} onSave={handleMealSave} />
                      );
                    })}
                  </div>

                  {SHOPPING_ALERTS.filter(a => a.date === selectedDay.date).map((alert, i) => (
                    <div key={i} style={{ ...S.alert(alert.urgency), marginBottom:14 }}>
                      <div style={{ ...S.lbl, color: alert.urgency==="critical"?"#e74c3c":"#ff6d00", marginBottom:8 }}>
                        {alert.urgency === "critical" ? "⚡ MUSCLE MEAT BESTELLING" : "🛒 BOODSCHAPPENDAG"}
                      </div>
                      <div style={{ fontSize:11, color:"#666", marginBottom:6 }}>📍 {alert.where}</div>
                      {alert.note && <div style={{ fontSize:10, color:"#555", fontStyle:"italic", marginBottom:6 }}>{alert.note}</div>}
                      {alert.items.map((item, ii) => (
                        <div key={ii} style={{ fontSize:11, color:"#ccc", padding:"4px 0", borderBottom:"1px solid #141414" }}>• {item}</div>
                      ))}
                    </div>
                  ))}

                  <div style={S.card}>
                    <div style={S.lbl}>// FASTING</div>
                    <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:28, color:"#00e676" }}>15:9</div>
                    <div style={{ fontSize:11, color:"#555", marginTop:6, lineHeight:1.8 }}>
                      <div>Stop eten: <strong style={{ color:"#f0ede8" }}>21:30</strong></div>
                      <div>Eerste maaltijd: <strong style={{ color:"#f0ede8" }}>12:30</strong></div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      </div>}

      {/* ══ CALENDAR ══ */}
      {tab === "calendar" && <div style={S.pg}>
        <div style={{ padding:"10px 14px", borderRadius:5, background:"#0d2a1a", border:"1px solid #00e676", marginBottom:14, fontFamily:"monospace", fontSize:10, color:"#00e676" }}>
          💡 Voeg werkblokken toe in <strong>Google Calendar</strong> → verschijnen automatisch hier. Werkt met 30-min blokken.
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <button onClick={() => setCalDateOffset(d => d - 1)} style={{ background:"#0f0f0f", border:"1px solid #1e1e1e", color:"#f0ede8", padding:"7px 14px", borderRadius:4, cursor:"pointer", fontFamily:"monospace", fontSize:10 }}>← PREV</button>
          <div style={{ flex:1, textAlign:"center", fontFamily:"monospace", fontWeight:700, fontSize:14, color:"#00e676" }}>{calStr}</div>
          <button onClick={() => setCalDateOffset(d => d + 1)} style={{ background:"#0f0f0f", border:"1px solid #1e1e1e", color:"#f0ede8", padding:"7px 14px", borderRadius:4, cursor:"pointer", fontFamily:"monospace", fontSize:10 }}>NEXT →</button>
          <button onClick={() => setCalDateOffset(0)} style={{ background:"#00e676", border:"none", color:"#080808", padding:"7px 14px", borderRadius:4, cursor:"pointer", fontFamily:"monospace", fontSize:10, fontWeight:700 }}>TODAY</button>
          <button onClick={() => fetchCalendar(calDate)} style={{ background:"#0f0f0f", border:"1px solid #00e676", color:"#00e676", padding:"7px 14px", borderRadius:4, cursor:"pointer", fontFamily:"monospace", fontSize:10 }}>{calLoading ? "⟳ LADEN..." : "↺ REFRESH"}</button>
        </div>
        <div style={S.g2}>
          <div style={S.card}>
            <div style={S.lbl}>// GOOGLE AGENDA — {calStr}</div>
            {calLoading ? <div style={{ color:"#444", fontFamily:"monospace", fontSize:11, padding:8 }}>⟳ Google Calendar laden...</div>
              : calEvents && calEvents.length > 0 ? calEvents.map((ev, i) => (
                <div key={i} style={S.ev}>
                  <div style={{ fontFamily:"monospace", fontSize:10, color:"#00e676", minWidth:50 }}>
                    <div>{ev.startTime || "—"}</div>
                    <div style={{ color:"#333" }}>{ev.endTime || ""}</div>
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:13 }}>{ev.title}</div>
                    {ev.location && <div style={{ fontSize:11, color:"#444", marginTop:1 }}>📍 {ev.location}</div>}
                  </div>
                </div>
              )) : <div style={{ color:"#444", fontFamily:"monospace", fontSize:11, padding:8 }}>Geen items gevonden voor {calStr}.</div>}
          </div>
          <div style={S.card}>
            <div style={S.lbl}>// VAST DAGSCHEMA</div>
            {[
              ["07:00","Wakker — geen telefoon","#8e44ad"],
              ["07:05","10 min zon","#f39c12"],
              ["07:15","Koude douche","#2980b9"],
              ["07:30","Zwarte koffie (90min na wakker)","#795548"],
              ["12:30","MAALTIJD 1 — groot","#00e676"],
              ["17:00","MAALTIJD 2 — veld","#27ae60"],
              ["21:00","MAALTIJD 3 — klein","#2980b9"],
              ["21:30","Stop eten — vasten start","#e74c3c"],
              ["23:30","Slaap","#555"],
            ].map(([t, item, c], i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:7 }}>
                <div style={{ fontFamily:"monospace", fontSize:10, color:"#00e676", minWidth:40, paddingTop:2 }}>{t}</div>
                <div style={{ padding:"7px 10px", borderRadius:4, background:"#0f0f0f", borderLeft:`2px solid ${c}`, fontSize:12, fontWeight:700, flex:1 }}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      </div>}

      {/* ══ GYM ══ */}
      {tab === "gym" && <div style={S.pg}>
        <div style={{ display:"flex", gap:7, marginBottom:14, flexWrap:"wrap" }}>
          {Object.keys(GYM).map(d => (
            <button key={d} onClick={() => setGymDay(d)} style={{ background: gymDay===d?GYM[d].color:"#0f0f0f", border:`1px solid ${gymDay===d?GYM[d].color:"#1e1e1e"}`, color: gymDay===d?"#fff":"#555", padding:"7px 16px", borderRadius:4, cursor:"pointer", fontFamily:"monospace", fontSize:10, letterSpacing:"0.1em" }}>
              {d} — {GYM[d].label}
            </button>
          ))}
        </div>
        <div style={S.g2}>
          <div style={S.card}>
            <div style={{ ...S.lbl, color:GYM[gymDay].color }}>// {gymDay} — {GYM[gymDay].label}</div>
            <div style={{ fontFamily:"monospace", fontSize:9, color:"#444", marginBottom:10 }}>VOEL REPS IN PER SET</div>
            {GYM[gymDay].exercises.map((ex, i) => {
              const key = `${gymDay}_${i}`;
              const sets = gymReps[key] || ["","","",""];
              return (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr repeat(4,42px)", gap:7, alignItems:"center", padding:"9px 0", borderBottom:"1px solid #141414" }}>
                  <div style={{ fontSize:12, fontWeight:700 }}>{ex}</div>
                  {sets.map((s, si) => (
                    <input key={si} type="number" placeholder={`S${si+1}`} value={s}
                      onChange={e => { const ns = [...sets]; ns[si] = e.target.value; const u = { ...gymReps, [key]:ns }; setGymReps(u); save("j_reps", u); }}
                      style={{ width:38, height:30, background:"#0f0f0f", border:`1px solid ${s?"#00e676":"#1e1e1e"}`, borderRadius:3, color:"#f0ede8", textAlign:"center", fontFamily:"monospace", fontSize:11 }} />
                  ))}
                </div>
              );
            })}
          </div>
          <div>
            <div style={S.card}>
              <div style={S.lbl}>// SESSIES DEZE WEEK</div>
              <div style={{ display:"flex", gap:7, margin:"6px 0 12px" }}>
                {[1,2,3,4].map(n => (
                  <div key={n} onClick={toggleGym} style={{ flex:1, height:44, borderRadius:4, border:`1px solid ${gymThisWeek>=n?"#00e676":"#1e1e1e"}`, background: gymThisWeek>=n?"#0d2a1a":"#0f0f0f", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontFamily:"monospace", fontWeight:700, fontSize:20, color: gymThisWeek>=n?"#00e676":"#333" }}>
                    {gymThisWeek >= n ? "✓" : n}
                  </div>
                ))}
              </div>
              <div style={{ fontFamily:"monospace", fontSize:9, color: gymThisWeek>=4?"#00e676":"#444" }}>TARGET: 4/WEEK</div>
            </div>
            <div style={S.card}>
              <div style={S.lbl}>// GYM REGELS</div>
              {[["⏰","Train voor 12:30","Vasten + training = max output"],["📈","Progressive overload","+1 rep of +2.5kg/week"],["😴","7.5u slaap = training","Zonder slaap geen groei"],["🥩","M1 na gym","Eerst trainen, dan eten — hormonen optimaal"]].map(([ic, t, d], i) => (
                <div key={i} style={S.rule}>
                  <div style={{ fontSize:16 }}>{ic}</div>
                  <div><div style={{ fontSize:12, fontWeight:700, marginBottom:2 }}>{t}</div><div style={{ fontSize:11, color:"#444" }}>{d}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>}

      {/* ══ NUTRITION ══ */}
      {tab === "nutrition" && <div style={S.pg}>
        <div style={S.g2}>
          <div>
            {["m1","m2","m3"].map((m, i) => {
              const times = ["12:30","17:00","21:00"], labels = ["MAALTIJD 1 — GROOT","MAALTIJD 2 — VELD BREAK","MAALTIJD 3 — KLEIN"];
              const cols = ["#00e676","#27ae60","#2980b9"];
              const items = todayMeals[m] || [];
              return (
                <EditableMealCard key={m} mealKey={m} items={items} color={cols[i]}
                  time={times[i]} label={labels[i]} dateKey={todayKey} onSave={handleMealSave} />
              );
            })}
          </div>
          <div>
            <div style={S.card}>
              <div style={S.lbl}>// MACRO TARGET</div>
              {[{ l:"EIWIT", v:85, c:"#00e676", t:"~150g" },{ l:"VET", v:65, c:"#ff6d00", t:"~70g" },{ l:"KOOLHYDRAAT", v:10, c:"#448aff", t:"<30g" }].map((m, i) => (
                <div key={i} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}><span style={{ fontSize:11, fontWeight:700 }}>{m.l}</span><span style={{ fontFamily:"monospace", fontSize:10, color:m.c }}>{m.t}</span></div>
                  <div style={{ height:4, background:"#1e1e1e", borderRadius:2, overflow:"hidden" }}><div style={{ height:"100%", background:m.c, width:`${m.v}%`, borderRadius:2 }} /></div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={S.lbl}>// EIWITBRONNEN</div>
              {[["Kip Paprika Chili","M1/M2","24g/100g","#e67e22"],["Kip Tandoori","M1/M2","23g/100g","#e74c3c"],["Zalm","M1","20g/100g","#3498db"],["Rundergehakt","M1","20g/100g","#c0392b"],["Varkenshaas","M1","22g/100g","#e91e63"],["Eieren","M1/M3","13g/100g","#f39c12"]].map(([n, when, p, c], i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid #141414", alignItems:"center" }}>
                  <div><div style={{ fontSize:11, fontWeight:700 }}>{n}</div><div style={{ fontSize:9, color:"#444", fontFamily:"monospace" }}>{when}</div></div>
                  <div style={{ fontFamily:"monospace", fontSize:11, color:c, fontWeight:700 }}>{p}</div>
                </div>
              ))}
            </div>
            <div style={S.card}>
              <div style={S.lbl}>// FASTING</div>
              <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:36, color:"#00e676", lineHeight:1 }}>15:9</div>
              <div style={{ fontSize:11, color:"#555", marginTop:8, lineHeight:1.8 }}>
                <div>Vasten: <strong style={{ color:"#f0ede8" }}>21:30 → 12:30</strong></div>
                <div>Eetvenster: <strong style={{ color:"#f0ede8" }}>12:30 → 21:30</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>}

      {/* ══ STATS ══ */}
      {tab === "stats" && <div style={S.pg}>
        <div style={{ ...S.g4, marginBottom:14 }}>
          {[{ n:streak, l:"STREAK", c:"#ff6d00" },{ n:`${monthPct}%`, l:"MAAND", c: monthPct>=80?"#00e676":"#ff6d00" },{ n:`${gymThisWeek}/4`, l:"GYM/WEEK", c: gymThisWeek>=4?"#00e676":"#e74c3c" },{ n:Object.keys(habits).length, l:"DAGEN GELOGD", c:"#448aff" }].map((k, i) => (
            <div key={i} style={S.kpi}>
              <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:28, color:k.c, lineHeight:1 }}>{k.n}</div>
              <div style={{ ...S.lbl, marginTop:4, marginBottom:0 }}>{k.l}</div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={S.lbl}>// 30-DAY HEATMAP</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(30,1fr)", gap:3 }}>
            {heatData.map((d, i) => (
              <div key={i} title={`Dag ${d.day}: ${d.pct}%`} style={{ aspectRatio:1, borderRadius:2, background: d.isToday?"#ff6d00":d.pct>=80?"#00e676":d.pct>=40?"#1a5c32":"#1a1a1a", border:`1px solid ${d.isToday?"#ff6d00":"#1e1e1e"}` }} />
            ))}
          </div>
        </div>
        <div style={S.g2}>
          <div style={S.card}>
            <div style={S.lbl}>// HABIT SCORE — 30 DAGEN</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={heatData}>
                <XAxis dataKey="day" tick={{ fill:"#333", fontSize:9 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0,100]} />
                <Tooltip contentStyle={{ background:"#111", border:"1px solid #222", color:"#f0ede8", fontSize:10 }} formatter={v => [v+"%","Score"]} />
                <Bar dataKey="pct" radius={[2,2,0,0]}>
                  {heatData.map((d, i) => <Cell key={i} fill={d.isToday?"#ff6d00":d.pct>=80?"#00e676":d.pct>=40?"#27ae60":"#1a1a1a"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div style={S.card}>
            <div style={S.lbl}>// TREND</div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={heatData}>
                <XAxis dataKey="day" tick={{ fill:"#333", fontSize:9 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0,100]} />
                <Tooltip contentStyle={{ background:"#111", border:"1px solid #222", color:"#f0ede8", fontSize:10 }} />
                <Line type="monotone" dataKey="pct" stroke="#00e676" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>}

      {/* ══ SHOPPING ══ */}
      {tab === "shopping" && <div style={S.pg}>
        {nextAlert && (
          <div style={{ background:"#0d0900", border:`1px solid ${daysToShop <= 1 ? "#e74c3c" : "#ff6d00"}`, borderRadius:6, padding:"12px 18px", marginBottom:14, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:13, color: daysToShop <= 1 ? "#e74c3c" : "#ff6d00" }}>
                {daysToShop <= 0 ? "⚠️ BOODSCHAPPEN VANDAAG" : `⚠️ BOODSCHAPPEN OVER ${daysToShop} DAGEN`}
              </div>
              <div style={{ fontSize:11, color:"#888", marginTop:4 }}>📍 {nextAlert.where}</div>
              {nextAlert.note && <div style={{ fontSize:10, color:"#555", fontStyle:"italic", marginTop:2 }}>{nextAlert.note}</div>}
              <div style={{ display:"flex", flexWrap:"wrap", gap:3, marginTop:6 }}>
                {nextAlert.items.map((item, i) => (
                  <span key={i} style={{ fontSize:9, background:"#1a1a1a", border:"1px solid #2a2a2a", padding:"2px 6px", borderRadius:3, color:"#ccc" }}>{item}</span>
                ))}
              </div>
            </div>
            <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:28, color: daysToShop <= 1 ? "#e74c3c" : "#ff6d00", textAlign:"right", minWidth:60 }}>
              {daysToShop <= 0 ? "!" : `${daysToShop}d`}
            </div>
          </div>
        )}
        <div style={S.g2}>
          <div style={S.card}>
            <div style={S.lbl}>// MUSCLE MEAT — HUIDIGE VOORRAAD</div>
            {[["Kip Paprika Chili","2.5kg","~17 porties","#e67e22"],["Kip Tandoori","2.5kg","~17 porties","#e74c3c"],["Zalm","2kg","~10 porties","#3498db"],["Rundergehakt","2kg","~10 porties","#c0392b"],["Varkenshaas","1kg","~5 porties","#e91e63"]].map(([n, w, p, c], i) => (
              <div key={i} style={S.shop}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700 }}>{n} <span style={{ fontFamily:"monospace", fontSize:8, padding:"1px 5px", background:"#0d2a1a", color:"#00e676", borderRadius:2 }}>MM</span></div>
                  <div style={{ fontSize:10, color:"#444", marginTop:1 }}>{p} à 200g</div>
                </div>
                <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:14, color:c }}>{w}</div>
              </div>
            ))}
            <div style={{ marginTop:12, padding:"10px 12px", background:"#0d0800", border:"1px solid #e74c3c", borderRadius:4 }}>
              <div style={{ fontFamily:"monospace", fontSize:10, color:"#e74c3c", fontWeight:700 }}>⚡ HERBESTELLEN: 1 JUNI 2026</div>
              <div style={{ fontSize:10, color:"#666", marginTop:3 }}>Zelfde bestelling ≈ €143 — voor ~5 weken</div>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.lbl}>// VERS — WEKELIJKS</div>
            {[["Avocado's","6 stuks","Afghaanse winkel","~€4","elke 5-7 dagen"],["Eieren","24 stuks","Lokale boer","~€6","elke 5-6 dagen"],["Komkommer","2 stuks","Afghaanse winkel","~€1.50","wekelijks"],["Paprika","2 stuks","Afghaanse winkel","~€2","wekelijks"],["Tomaten/cherry","5st + 2tr","Afghaanse winkel","~€3","wekelijks"],["Boter 250g","1-2 pakjes","Lokale boer","~€3.50","wekelijks"],["Fruit (appel/pruim/mango)","4-8 stuks","Afghaanse winkel","~€3","wekelijks"]].map(([n, a, w, p, f], i) => (
              <div key={i} style={{ padding:"8px 0", borderBottom:"1px solid #181818" }}>
                <div style={{ display:"flex", justifyContent:"space-between" }}>
                  <div style={{ fontSize:12, fontWeight:700 }}>{n}</div>
                  <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:13, color:"#00e676" }}>{p}</div>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:2 }}>
                  <div style={{ fontSize:10, color:"#444" }}>{a} — {w}</div>
                  <div style={{ fontSize:9, color:"#555", fontFamily:"monospace" }}>{f}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background:"#00e676", color:"#080808", fontFamily:"monospace", fontWeight:700, fontSize:16, padding:"12px 18px", borderRadius:4, display:"flex", justifyContent:"space-between", marginTop:4 }}>
          <span>VERS WEKELIJKS TOTAAL</span><span>~€23</span>
        </div>
        <div style={{ background:"#0f0f0f", border:"1px solid #00e676", fontFamily:"monospace", fontWeight:700, fontSize:16, padding:"12px 18px", borderRadius:4, display:"flex", justifyContent:"space-between", marginTop:7 }}>
          <span>EFFECTIEF PER WEEK</span><span style={{ color:"#00e676" }}>~€52</span>
        </div>
      </div>}

      {/* ══ RULES ══ */}
      {tab === "rules" && <div style={S.pg}>
        <div style={S.g2}>
          <div style={S.card}>
            <div style={S.lbl}>// ALTIJD</div>
            {[["☀️","10 min zon — binnen uur na wakker","Reset circadiaan ritme. Dopamine boost."],["🚿","Koude douche 2-3 min","Norepinephrine +300%. Focus heel de dag."],["📵","Geen telefoon eerste 30 min","Brein is meest plastisch. Geef het richting."],["☕","Koffie 90 min na wakker","Cortisol eerst zakken → 3× sterker effect."],["🧈","Boter & reuzel — altijd","Nooit zaadoliën. Nooit margarine."],["💊","L-Glutamine bij craving","½ theelepel in water. Weg in 10 min."],["💧","2L water per dag","8 glazen × 250ml. Hydratatie = focus + herstel."]].map(([ic, t, d], i) => (
              <div key={i} style={S.rule}>
                <div style={{ fontSize:18, flexShrink:0 }}>{ic}</div>
                <div><div style={{ fontSize:12, fontWeight:700, marginBottom:2 }}>{t}</div><div style={{ fontSize:11, color:"#444", lineHeight:1.5 }}>{d}</div></div>
              </div>
            ))}
          </div>
          <div>
            <div style={S.card}>
              <div style={S.lbl}>// NOOIT</div>
              {["Zaadoliën (zonnebloem, koolzaad, soja)","Margarine","Brood, pasta, rijst, granen","Suiker — behalve klein fruit bij M1","Alcohol","Eten na 21:30","Telefoon eerste 30 min","Slapen later dan 23:30","Kooi-eieren","Pangasius of vis in zaadolie","Tonijn in zonnebloemolie (enkel water/olijfolie)"].map((item, i) => (
                <div key={i} style={S.never}><span style={{ color:"#e74c3c", fontFamily:"monospace" }}>✗</span> {item}</div>
              ))}
            </div>
            <div style={S.card}>
              <div style={S.lbl}>// FASTING</div>
              <div style={{ fontFamily:"monospace", fontWeight:700, fontSize:44, color:"#00e676", lineHeight:1 }}>15:9</div>
              <div style={{ fontSize:11, color:"#555", marginTop:8, lineHeight:1.8 }}>
                <div>Vasten: <strong style={{ color:"#f0ede8" }}>21:30 → 12:30 (15u)</strong></div>
                <div>Eetvenster: <strong style={{ color:"#f0ede8" }}>12:30 → 21:30 (9u)</strong></div>
              </div>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
}
