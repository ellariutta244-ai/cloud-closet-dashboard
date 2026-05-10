"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft, ChevronRight, Plus, X, Pencil, Trash2,
  MapPin, Video, Calendar, ExternalLink, Apple,
} from "lucide-react";
import { MTTeam } from "./MultiTeamDashboard";

// ── Types ─────────────────────────────────────────────────────────────────────
export type CompanyEvent = {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time?: string | null;
  all_day: boolean;
  category: string;
  color?: string | null;
  team_id?: string | null;
  google_meet_link?: string | null;
  location?: string | null;
  created_by?: string | null;
  created_at: string;
};

// ── Categories ────────────────────────────────────────────────────────────────
export const EVENT_CATEGORIES = [
  { value: "all_hands",  label: "All Hands",    color: "#1c1917" },
  { value: "team",       label: "Team Meeting", color: "#3b82f6" },
  { value: "social",     label: "Social",       color: "#10b981" },
  { value: "workshop",   label: "Workshop",     color: "#8b5cf6" },
  { value: "deadline",   label: "Deadline",     color: "#ef4444" },
  { value: "general",    label: "General",      color: "#6b7280" },
];

function categoryColor(cat: string, teamColor?: string | null): string {
  if (cat === "team" && teamColor) return teamColor;
  return EVENT_CATEGORIES.find(c => c.value === cat)?.color ?? "#6b7280";
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function daysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate(); }
function startDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay(); }
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function fmtTime(dt: string) { return new Date(dt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }); }
function fmtDateLong(dt: string) { return new Date(dt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" }); }
function fmtDateShort(d: Date) { return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }); }
function startOfWeek(d: Date) { const s = new Date(d); s.setDate(d.getDate() - d.getDay()); s.setHours(0,0,0,0); return s; }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

// ── Google / Apple calendar helpers ──────────────────────────────────────────
function toGcalDate(dt: string, allDay: boolean): string {
  const d = new Date(dt);
  if (allDay) return d.toISOString().replace(/-/g, "").slice(0, 8);
  return d.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
}
function googleCalUrl(ev: CompanyEvent): string {
  const start = toGcalDate(ev.start_time, ev.all_day);
  const end   = ev.end_time ? toGcalDate(ev.end_time, ev.all_day) : start;
  const details = [ev.description, ev.google_meet_link ? `Google Meet: ${ev.google_meet_link}` : ""].filter(Boolean).join("\n");
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(ev.title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(ev.location || ev.google_meet_link || "")}`;
}
function downloadIcs(ev: CompanyEvent) {
  const fmt = (dt: string, allDay: boolean) => {
    const d = new Date(dt);
    if (allDay) return d.toISOString().replace(/-/g, "").slice(0, 8);
    return d.toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  };
  const start = fmt(ev.start_time, ev.all_day);
  const end   = ev.end_time ? fmt(ev.end_time, ev.all_day) : start;
  const desc  = [ev.description, ev.google_meet_link ? `Google Meet: ${ev.google_meet_link}` : ""].filter(Boolean).join("\\n");
  const lines = [
    "BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//Cloud Closet//EN",
    "BEGIN:VEVENT",
    `UID:${ev.id}@cloudcloset`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g,"").slice(0,15)}Z`,
    ev.all_day ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`,
    ev.all_day ? `DTEND;VALUE=DATE:${end}` : `DTEND:${end}`,
    `SUMMARY:${ev.title}`,
    ...(desc ? [`DESCRIPTION:${desc}`] : []),
    ...(ev.location ? [`LOCATION:${ev.location}`] : []),
    ...(ev.google_meet_link ? [`URL:${ev.google_meet_link}`] : []),
    "END:VEVENT","END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${ev.title.replace(/\s+/g, "_")}.ics`; a.click();
  URL.revokeObjectURL(url);
}

const BLANK = {
  title:"", description:"", category:"general", team_id:"",
  start_date:"", start_time_val:"09:00", end_date:"", end_time_val:"10:00",
  all_day:false, google_meet_link:"", location:"",
};

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAY_LETTERS = ["S","M","T","W","T","F","S"];

// ── Event detail modal (shared) ───────────────────────────────────────────────
function EventModal({ ev, teams, isAdmin, onEdit, onDelete, onClose }: {
  ev: CompanyEvent; teams: MTTeam[]; isAdmin: boolean;
  onEdit: () => void; onDelete: () => void; onClose: () => void;
}) {
  const team  = teams.find(t => t.id === ev.team_id);
  const color = ev.color || categoryColor(ev.category, team?.color);
  const cat   = EVENT_CATEGORIES.find(c => c.value === ev.category);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="h-1.5" style={{ background: color }}/>
        {/* Drag handle on mobile */}
        <div className="flex justify-center pt-2 pb-0 sm:hidden">
          <div className="w-8 h-1 bg-stone-200 rounded-full"/>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ background: color }}>
                  {cat?.label || ev.category}
                </span>
                {team && <span className="text-xs text-stone-400">{team.name}</span>}
              </div>
              <h2 className="text-base font-semibold text-stone-900 leading-snug">{ev.title}</h2>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isAdmin && <>
                <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700"><Pencil size={14}/></button>
                <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500"><Trash2 size={14}/></button>
              </>}
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400"><X size={14}/></button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mb-4">
            <div className="flex items-start gap-2 text-sm text-stone-600">
              <Calendar size={14} className="text-stone-400 flex-shrink-0 mt-0.5"/>
              <span>{ev.all_day ? fmtDateLong(ev.start_time) : `${fmtDateLong(ev.start_time)} · ${fmtTime(ev.start_time)}${ev.end_time ? ` – ${fmtTime(ev.end_time)}` : ""}`}</span>
            </div>
            {ev.location && (
              <div className="flex items-center gap-2 text-sm text-stone-600">
                <MapPin size={14} className="text-stone-400 flex-shrink-0"/>
                <span>{ev.location}</span>
              </div>
            )}
            {ev.google_meet_link && (
              <div className="flex items-center gap-2">
                <Video size={14} className="text-stone-400 flex-shrink-0"/>
                <a href={ev.google_meet_link} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  Join Google Meet <ExternalLink size={11}/>
                </a>
              </div>
            )}
          </div>

          {ev.description && <p className="text-sm text-stone-600 leading-relaxed mb-4 whitespace-pre-wrap">{ev.description}</p>}

          <div className="border-t border-stone-100 pt-4">
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">Add to Calendar</p>
            <div className="flex gap-2">
              <a href={googleCalUrl(ev)} target="_blank" rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-medium text-stone-700 transition-colors">
                <Calendar size={13} className="text-blue-500"/>Google
              </a>
              <button onClick={() => downloadIcs(ev)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-medium text-stone-700 transition-colors">
                <Apple size={13}/>Apple
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export function CompanyCalendar({ isAdmin, profile, teams, sb }: {
  isAdmin: boolean; profile: { id: string; full_name: string };
  teams: MTTeam[]; sb: any;
}) {
  const today = new Date();
  const [year, setYear]       = useState(today.getFullYear());
  const [month, setMonth]     = useState(today.getMonth());
  const [selectedDay, setSelectedDay] = useState<Date>(today);
  const [weekStart, setWeekStart]     = useState<Date>(startOfWeek(today));
  const [events, setEvents]   = useState<CompanyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selEvent, setSelEvent]   = useState<CompanyEvent | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [editEvent, setEditEvent] = useState<CompanyEvent | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  // Keep year/month in sync with selectedDay for data fetching
  useEffect(() => {
    setYear(selectedDay.getFullYear());
    setMonth(selectedDay.getMonth());
    setWeekStart(startOfWeek(selectedDay));
  }, [selectedDay.toDateString()]);

  useEffect(() => {
    setLoading(true);
    const from = new Date(year, month - 1, 1).toISOString();
    const to   = new Date(year, month + 2, 0).toISOString();
    sb.from("company_events").select("*").gte("start_time", from).lte("start_time", to).order("start_time")
      .then(({ data }: any) => { setEvents((data || []) as CompanyEvent[]); setLoading(false); });
  }, [year, month]);

  function eventsForDay(day: Date) {
    return events.filter(ev => sameDay(new Date(ev.start_time), day));
  }

  // ── Month grid nav ─────────────────────────────────────────────────────────
  const numDays  = daysInMonth(year, month);
  const startDay = startDayOfMonth(year, month);
  const cells: (Date | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: numDays }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    const d = new Date(year, month - 1, 1);
    setSelectedDay(d);
  }
  function nextMonth() {
    const d = new Date(year, month + 1, 1);
    setSelectedDay(d);
  }

  // ── Week strip nav ─────────────────────────────────────────────────────────
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  function prevWeek() {
    const d = addDays(weekStart, -7);
    setWeekStart(d);
    setSelectedDay(d);
  }
  function nextWeek() {
    const d = addDays(weekStart, 7);
    setWeekStart(d);
    setSelectedDay(d);
  }

  // ── Form helpers ───────────────────────────────────────────────────────────
  function openAdd(day?: Date) {
    const d = (day || selectedDay).toISOString().slice(0, 10);
    setForm({ ...BLANK, start_date: d, end_date: d });
    setEditEvent(null);
    setShowForm(true);
  }

  function openEdit(ev: CompanyEvent) {
    const sd = ev.start_time.slice(0, 10);
    const st = ev.start_time.slice(11, 16);
    const ed = ev.end_time ? ev.end_time.slice(0, 10) : sd;
    const et = ev.end_time ? ev.end_time.slice(11, 16) : "10:00";
    setForm({ title:ev.title, description:ev.description||"", category:ev.category, team_id:ev.team_id||"",
      start_date:sd, start_time_val:st, end_date:ed, end_time_val:et, all_day:ev.all_day,
      google_meet_link:ev.google_meet_link||"", location:ev.location||"" });
    setEditEvent(ev); setSelEvent(null); setShowForm(true);
  }

  function buildTimes() {
    const start = form.all_day ? `${form.start_date}T00:00:00` : `${form.start_date}T${form.start_time_val}:00`;
    const end = form.all_day
      ? `${form.end_date||form.start_date}T23:59:59`
      : `${form.end_date||form.start_date}T${form.end_time_val}:00`;
    return { start: new Date(start).toISOString(), end: new Date(end).toISOString() };
  }

  async function saveEvent() {
    if (!form.title.trim() || !form.start_date) return;
    setSaving(true);
    const { start, end } = buildTimes();
    const team  = teams.find(t => t.id === form.team_id);
    const color = form.category === "team" && team ? team.color
      : EVENT_CATEGORIES.find(c => c.value === form.category)?.color || null;
    const payload = {
      title: form.title.trim(), description: form.description.trim()||null,
      start_time: start, end_time: end, all_day: form.all_day,
      category: form.category, color, team_id: form.team_id||null,
      google_meet_link: form.google_meet_link.trim()||null,
      location: form.location.trim()||null, created_by: profile.id,
    };
    if (editEvent) {
      const { data } = await sb.from("company_events").update(payload).eq("id", editEvent.id).select().single();
      if (data) setEvents(events.map(e => e.id === editEvent.id ? data : e));
    } else {
      const { data } = await sb.from("company_events").insert(payload).select().single();
      if (data) setEvents([...events, data as CompanyEvent].sort((a,b) => a.start_time.localeCompare(b.start_time)));
    }
    setSaving(false); setShowForm(false); setEditEvent(null);
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    await sb.from("company_events").delete().eq("id", id);
    setEvents(events.filter(e => e.id !== id));
    setSelEvent(null);
  }

  const selectedDayEvents = eventsForDay(selectedDay).sort((a,b) => a.start_time.localeCompare(b.start_time));

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Company Calendar</h1>
          <p className="text-sm text-stone-400 mt-0.5 hidden sm:block">Meetings, events, and deadlines for the team</p>
        </div>
        {isAdmin && (
          <button onClick={() => openAdd()}
            className="flex items-center gap-2 px-3 py-2 sm:px-4 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors">
            <Plus size={15}/><span className="hidden sm:inline">Add Event</span><span className="sm:hidden">Add</span>
          </button>
        )}
      </div>

      {/* Legend — scrollable on mobile */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        {EVENT_CATEGORIES.map(c => (
          <div key={c.value} className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-2 h-2 rounded-full" style={{ background: c.color }}/>
            <span className="text-xs text-stone-500 whitespace-nowrap">{c.label}</span>
          </div>
        ))}
      </div>

      {/* ── MOBILE: week strip + day agenda ─────────────────────────────────── */}
      <div className="sm:hidden flex flex-col gap-3">
        {/* Week strip */}
        <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <button onClick={prevWeek} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"><ChevronLeft size={16}/></button>
            <p className="text-sm font-semibold text-stone-800">
              {weekStart.toLocaleDateString("en-US",{month:"short"})} {weekStart.getFullYear()}
            </p>
            <button onClick={nextWeek} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"><ChevronRight size={16}/></button>
          </div>
          <div className="grid grid-cols-7 px-1 py-2 gap-1">
            {weekDays.map((day, i) => {
              const isToday   = sameDay(day, today);
              const isSel     = sameDay(day, selectedDay);
              const hasEvents = eventsForDay(day).length > 0;
              return (
                <button key={i} onClick={() => setSelectedDay(day)}
                  className="flex flex-col items-center gap-1 py-2 rounded-xl transition-colors"
                  style={isSel ? { background: "#1c1917" } : {}}>
                  <span className="text-[10px] font-medium" style={{ color: isSel ? "#a8a29e" : "#9ca3af" }}>
                    {DAY_LETTERS[day.getDay()]}
                  </span>
                  <span className={`text-sm font-semibold ${isSel ? "text-white" : isToday ? "text-stone-800" : "text-stone-600"}`}>
                    {day.getDate()}
                  </span>
                  <div className={`w-1 h-1 rounded-full ${hasEvents ? (isSel ? "bg-white/60" : "bg-stone-400") : "bg-transparent"}`}/>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day agenda */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {fmtDateShort(selectedDay)}
            </p>
            {isAdmin && (
              <button onClick={() => openAdd(selectedDay)}
                className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1">
                <Plus size={12}/>Add
              </button>
            )}
          </div>
          {loading ? (
            <div className="text-center py-8 text-stone-300 text-sm">Loading…</div>
          ) : selectedDayEvents.length === 0 ? (
            <div className="bg-white border border-stone-100 rounded-2xl py-8 text-center">
              <Calendar size={20} className="mx-auto text-stone-200 mb-2"/>
              <p className="text-sm text-stone-400">No events today</p>
            </div>
          ) : selectedDayEvents.map(ev => {
            const team  = teams.find(t => t.id === ev.team_id);
            const color = ev.color || categoryColor(ev.category, team?.color);
            return (
              <button key={ev.id} onClick={() => setSelEvent(ev)}
                className="w-full text-left bg-white border border-stone-100 rounded-2xl p-4 hover:border-stone-300 transition-colors flex items-start gap-3">
                <div className="w-1 self-stretch rounded-full flex-shrink-0" style={{ background: color }}/>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-stone-800 truncate">{ev.title}</p>
                  <p className="text-xs text-stone-400 mt-0.5">
                    {ev.all_day ? "All day" : `${fmtTime(ev.start_time)}${ev.end_time ? ` – ${fmtTime(ev.end_time)}` : ""}`}
                  </p>
                  {ev.location && <p className="text-xs text-stone-400 truncate">{ev.location}</p>}
                </div>
                {ev.google_meet_link && (
                  <Video size={14} className="text-blue-400 flex-shrink-0 mt-0.5"/>
                )}
              </button>
            );
          })}
        </div>

        {/* Mini upcoming list */}
        {(() => {
          const upcoming = events
            .filter(ev => new Date(ev.start_time) > addDays(selectedDay, 0) && !sameDay(new Date(ev.start_time), selectedDay))
            .slice(0, 5);
          if (!upcoming.length) return null;
          return (
            <div className="flex flex-col gap-1 mt-1">
              <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Upcoming</p>
              {upcoming.map(ev => {
                const team  = teams.find(t => t.id === ev.team_id);
                const color = ev.color || categoryColor(ev.category, team?.color);
                return (
                  <button key={ev.id} onClick={() => setSelEvent(ev)}
                    className="w-full text-left flex items-center gap-3 py-2.5 px-3 bg-white border border-stone-100 rounded-xl hover:border-stone-300 transition-colors">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }}/>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-700 truncate">{ev.title}</p>
                    </div>
                    <p className="text-xs text-stone-400 flex-shrink-0">
                      {new Date(ev.start_time).toLocaleDateString("en-US",{month:"short",day:"numeric"})}
                    </p>
                  </button>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* ── DESKTOP: monthly grid ─────────────────────────────────────────────── */}
      <div className="hidden sm:block bg-white border border-stone-200/60 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"><ChevronLeft size={16}/></button>
          <p className="text-sm font-semibold text-stone-800">{MONTH_NAMES[month]} {year}</p>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500"><ChevronRight size={16}/></button>
        </div>
        <div className="grid grid-cols-7 border-b border-stone-100">
          {DAY_NAMES.map(d => <div key={d} className="py-2 text-center text-xs font-medium text-stone-400">{d}</div>)}
        </div>
        {loading ? (
          <div className="h-64 flex items-center justify-center text-stone-300 text-sm">Loading…</div>
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={`blank-${i}`} className="border-b border-r border-stone-100 min-h-[90px] bg-stone-50/40"/>;
              const isToday    = sameDay(day, today);
              const isSel      = sameDay(day, selectedDay);
              const dayEvents  = eventsForDay(day);
              const visible    = dayEvents.slice(0, 3);
              const overflow   = dayEvents.length - 3;
              return (
                <div key={day.toISOString()}
                  className={`border-b border-r border-stone-100 min-h-[90px] p-1.5 relative group transition-colors ${isAdmin ? "cursor-pointer hover:bg-stone-50/60" : ""} ${isSel ? "bg-stone-50" : ""}`}
                  onClick={isAdmin ? () => { setSelectedDay(day); openAdd(day); } : () => setSelectedDay(day)}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${isToday ? "bg-stone-800 text-white" : isSel ? "ring-2 ring-stone-300 text-stone-700" : "text-stone-500"}`}>
                    {day.getDate()}
                  </div>
                  <div className="flex flex-col gap-0.5" onClick={e => e.stopPropagation()}>
                    {visible.map(ev => {
                      const team  = teams.find(t => t.id === ev.team_id);
                      const color = ev.color || categoryColor(ev.category, team?.color);
                      return (
                        <button key={ev.id} onClick={() => setSelEvent(ev)}
                          className="w-full text-left px-1.5 py-0.5 rounded text-white text-[10px] font-medium truncate leading-tight hover:opacity-90"
                          style={{ background: color }}>
                          {!ev.all_day && <span className="opacity-80 mr-0.5">{fmtTime(ev.start_time)}</span>}
                          {ev.title}
                        </button>
                      );
                    })}
                    {overflow > 0 && (
                      <button onClick={e => { e.stopPropagation(); setSelEvent(dayEvents[3]); }}
                        className="text-[10px] text-stone-400 hover:text-stone-600 px-1">
                        +{overflow} more
                      </button>
                    )}
                  </div>
                  {isAdmin && <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100"><Plus size={11} className="text-stone-300"/></div>}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event detail modal */}
      {selEvent && (
        <EventModal
          ev={selEvent} teams={teams} isAdmin={isAdmin}
          onEdit={() => openEdit(selEvent)}
          onDelete={() => deleteEvent(selEvent.id)}
          onClose={() => setSelEvent(null)}
        />
      )}

      {/* Add / Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex justify-center pt-2 sm:hidden">
              <div className="w-8 h-1 bg-stone-200 rounded-full"/>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
              <p className="text-sm font-semibold text-stone-800">{editEvent ? "Edit Event" : "Add Event"}</p>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400"><X size={14}/></button>
            </div>
            <div className="p-5 flex flex-col gap-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Event Title <span className="text-red-400">*</span></label>
                <input value={form.title} onChange={e => setForm({...form, title:e.target.value})}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"
                  placeholder="e.g. All Hands Meeting"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category:e.target.value})}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400 bg-white">
                    {EVENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                {form.category === "team" && (
                  <div>
                    <label className="text-xs font-medium text-stone-600 block mb-1">Team</label>
                    <select value={form.team_id} onChange={e => setForm({...form, team_id:e.target.value})}
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400 bg-white">
                      <option value="">Select team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.all_day} onChange={e => setForm({...form, all_day:e.target.checked})}
                  className="w-4 h-4 rounded border-stone-300 accent-stone-800"/>
                <span className="text-sm text-stone-700">All day</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">Start Date <span className="text-red-400">*</span></label>
                  <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date:e.target.value, end_date:form.end_date||e.target.value})}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
                </div>
                {!form.all_day && (
                  <div>
                    <label className="text-xs font-medium text-stone-600 block mb-1">Start Time</label>
                    <input type="time" value={form.start_time_val} onChange={e => setForm({...form, start_time_val:e.target.value})}
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date:e.target.value})}
                    className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
                </div>
                {!form.all_day && (
                  <div>
                    <label className="text-xs font-medium text-stone-600 block mb-1">End Time</label>
                    <input type="time" value={form.end_time_val} onChange={e => setForm({...form, end_time_val:e.target.value})}
                      className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Google Meet Link</label>
                <input value={form.google_meet_link} onChange={e => setForm({...form, google_meet_link:e.target.value})}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"
                  placeholder="https://meet.google.com/..."/>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Location</label>
                <input value={form.location} onChange={e => setForm({...form, location:e.target.value})}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"
                  placeholder="Room, address, or virtual"/>
              </div>
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} rows={3}
                  className="w-full px-3 py-2.5 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400 resize-none"
                  placeholder="Agenda, notes, or details…"/>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 text-sm text-stone-600 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors">Cancel</button>
                <button onClick={saveEvent} disabled={saving || !form.title.trim() || !form.start_date}
                  className="flex-1 py-2.5 bg-stone-800 text-white text-sm font-medium rounded-xl hover:bg-stone-700 disabled:opacity-40 transition-colors">
                  {saving ? "Saving…" : editEvent ? "Save" : "Add Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
