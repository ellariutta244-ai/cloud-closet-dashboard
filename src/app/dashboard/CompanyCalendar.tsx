"use client";

import { useState, useEffect } from "react";
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

// ── Calendar helpers ──────────────────────────────────────────────────────────
function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function startDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}
function localDate(dt: string) {
  return new Date(dt);
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
function fmtTime(dt: string) {
  return new Date(dt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}
function fmtDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

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
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Cloud Closet//EN",
    "BEGIN:VEVENT",
    `UID:${ev.id}@cloudcloset`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, "").slice(0,15)}Z`,
    ev.all_day ? `DTSTART;VALUE=DATE:${start}` : `DTSTART:${start}`,
    ev.all_day ? `DTEND;VALUE=DATE:${end}` : `DTEND:${end}`,
    `SUMMARY:${ev.title}`,
    ...(desc ? [`DESCRIPTION:${desc}`] : []),
    ...(ev.location ? [`LOCATION:${ev.location}`] : []),
    ...(ev.google_meet_link ? [`URL:${ev.google_meet_link}`] : []),
    "END:VEVENT", "END:VCALENDAR",
  ];
  const blob = new Blob([lines.join("\r\n")], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${ev.title.replace(/\s+/g, "_")}.ics`; a.click();
  URL.revokeObjectURL(url);
}

// ── Blank form ────────────────────────────────────────────────────────────────
const BLANK = {
  title: "", description: "", category: "general", team_id: "",
  start_date: "", start_time_val: "09:00", end_date: "", end_time_val: "10:00",
  all_day: false, google_meet_link: "", location: "",
};

// ── Main Component ────────────────────────────────────────────────────────────
export function CompanyCalendar({ isAdmin, profile, teams, sb }: {
  isAdmin: boolean; profile: { id: string; full_name: string };
  teams: MTTeam[]; sb: any;
}) {
  const today = new Date();
  const [year, setYear]     = useState(today.getFullYear());
  const [month, setMonth]   = useState(today.getMonth());
  const [events, setEvents] = useState<CompanyEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selEvent, setSelEvent] = useState<CompanyEvent | null>(null);
  const [showForm, setShowForm]  = useState(false);
  const [editEvent, setEditEvent] = useState<CompanyEvent | null>(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Load events for ±1 month around current view
    const from = new Date(year, month - 1, 1).toISOString();
    const to   = new Date(year, month + 2, 0).toISOString();
    sb.from("company_events").select("*").gte("start_time", from).lte("start_time", to).order("start_time")
      .then(({ data }: any) => { setEvents((data || []) as CompanyEvent[]); setLoading(false); });
  }, [year, month]);

  // ── Calendar grid ──────────────────────────────────────────────────────────
  const numDays  = daysInMonth(year, month);
  const startDay = startDayOfMonth(year, month);
  const cells: (Date | null)[] = [
    ...Array(startDay).fill(null),
    ...Array.from({ length: numDays }, (_, i) => new Date(year, month, i + 1)),
  ];
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null);

  function eventsForDay(day: Date) {
    return events.filter(ev => sameDay(localDate(ev.start_time), day));
  }

  function prevMonth() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  // ── Form helpers ───────────────────────────────────────────────────────────
  function openAdd(day?: Date) {
    const d = day ? day.toISOString().slice(0, 10) : "";
    setForm({ ...BLANK, start_date: d, end_date: d });
    setEditEvent(null);
    setShowForm(true);
  }

  function openEdit(ev: CompanyEvent) {
    const sd = ev.start_time.slice(0, 10);
    const st = ev.start_time.slice(11, 16);
    const ed = ev.end_time ? ev.end_time.slice(0, 10) : sd;
    const et = ev.end_time ? ev.end_time.slice(11, 16) : "10:00";
    setForm({
      title: ev.title, description: ev.description || "",
      category: ev.category, team_id: ev.team_id || "",
      start_date: sd, start_time_val: st,
      end_date: ed, end_time_val: et,
      all_day: ev.all_day,
      google_meet_link: ev.google_meet_link || "",
      location: ev.location || "",
    });
    setEditEvent(ev);
    setSelEvent(null);
    setShowForm(true);
  }

  function buildTimes() {
    const start = form.all_day
      ? `${form.start_date}T00:00:00`
      : `${form.start_date}T${form.start_time_val}:00`;
    const end = (form.end_date || form.start_date)
      ? form.all_day
        ? `${form.end_date || form.start_date}T23:59:59`
        : `${form.end_date || form.start_date}T${form.end_time_val}:00`
      : null;
    return { start: new Date(start).toISOString(), end: end ? new Date(end).toISOString() : null };
  }

  async function saveEvent() {
    if (!form.title.trim() || !form.start_date) return;
    setSaving(true);
    const { start, end } = buildTimes();
    const team = teams.find(t => t.id === form.team_id);
    const color = form.category === "team" && team ? team.color
      : EVENT_CATEGORIES.find(c => c.value === form.category)?.color || null;
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      start_time: start,
      end_time: end,
      all_day: form.all_day,
      category: form.category,
      color,
      team_id: form.team_id || null,
      google_meet_link: form.google_meet_link.trim() || null,
      location: form.location.trim() || null,
      created_by: profile.id,
    };

    if (editEvent) {
      const { data } = await sb.from("company_events").update(payload).eq("id", editEvent.id).select().single();
      if (data) setEvents(events.map(e => e.id === editEvent.id ? data : e));
    } else {
      const { data } = await sb.from("company_events").insert(payload).select().single();
      if (data) setEvents([...events, data as CompanyEvent].sort((a, b) => a.start_time.localeCompare(b.start_time)));
    }
    setSaving(false);
    setShowForm(false);
    setEditEvent(null);
  }

  async function deleteEvent(id: string) {
    if (!confirm("Delete this event?")) return;
    await sb.from("company_events").delete().eq("id", id);
    setEvents(events.filter(e => e.id !== id));
    setSelEvent(null);
  }

  const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const DAY_NAMES   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-800">Company Calendar</h1>
          <p className="text-sm text-stone-400 mt-0.5">Meetings, events, and deadlines for the team</p>
        </div>
        {isAdmin && (
          <button onClick={() => openAdd()}
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors">
            <Plus size={15}/>Add Event
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {EVENT_CATEGORIES.map(c => (
          <div key={c.value} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: c.color }}/>
            <span className="text-xs text-stone-500">{c.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white border border-stone-200/60 rounded-2xl overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"><ChevronLeft size={16}/></button>
          <p className="text-sm font-semibold text-stone-800">{MONTH_NAMES[month]} {year}</p>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors"><ChevronRight size={16}/></button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-stone-100">
          {DAY_NAMES.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium text-stone-400">{d}</div>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="h-64 flex items-center justify-center text-stone-300 text-sm">Loading…</div>
        ) : (
          <div className="grid grid-cols-7">
            {cells.map((day, i) => {
              if (!day) return <div key={`blank-${i}`} className="border-b border-r border-stone-100 min-h-[90px] bg-stone-50/40"/>;
              const isToday = sameDay(day, today);
              const dayEvents = eventsForDay(day);
              const visible = dayEvents.slice(0, 3);
              const overflow = dayEvents.length - 3;
              return (
                <div key={day.toISOString()}
                  className="border-b border-r border-stone-100 min-h-[90px] p-1.5 relative group"
                  onClick={isAdmin ? () => openAdd(day) : undefined}
                  style={isAdmin ? { cursor: "pointer" } : {}}>
                  {/* Day number */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${isToday ? "bg-stone-800 text-white" : "text-stone-500"}`}>
                    {day.getDate()}
                  </div>
                  {/* Events */}
                  <div className="flex flex-col gap-0.5" onClick={e => e.stopPropagation()}>
                    {visible.map(ev => {
                      const team = teams.find(t => t.id === ev.team_id);
                      const color = ev.color || categoryColor(ev.category, team?.color);
                      return (
                        <button key={ev.id} onClick={() => setSelEvent(ev)}
                          className="w-full text-left px-1.5 py-0.5 rounded text-white text-[10px] font-medium truncate leading-tight hover:opacity-90 transition-opacity"
                          style={{ background: color }}>
                          {!ev.all_day && <span className="opacity-80 mr-0.5">{fmtTime(ev.start_time)}</span>}
                          {ev.title}
                        </button>
                      );
                    })}
                    {overflow > 0 && (
                      <button onClick={() => setSelEvent(dayEvents[3])}
                        className="text-[10px] text-stone-400 hover:text-stone-600 px-1">
                        +{overflow} more
                      </button>
                    )}
                  </div>
                  {/* Add hint on hover (admin only) */}
                  {isAdmin && (
                    <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Plus size={11} className="text-stone-300"/>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event detail modal */}
      {selEvent && (() => {
        const team  = teams.find(t => t.id === selEvent.team_id);
        const color = selEvent.color || categoryColor(selEvent.category, team?.color);
        const cat   = EVENT_CATEGORIES.find(c => c.value === selEvent.category);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setSelEvent(null)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
              {/* Color bar */}
              <div className="h-1.5" style={{ background: color }}/>
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded-full text-white font-medium" style={{ background: color }}>
                        {cat?.label || selEvent.category}
                      </span>
                      {team && <span className="text-xs text-stone-400">{team.name}</span>}
                    </div>
                    <h2 className="text-lg font-semibold text-stone-900">{selEvent.title}</h2>
                  </div>
                  <div className="flex items-center gap-1">
                    {isAdmin && (
                      <>
                        <button onClick={() => openEdit(selEvent)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors"><Pencil size={14}/></button>
                        <button onClick={() => deleteEvent(selEvent.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                      </>
                    )}
                    <button onClick={() => setSelEvent(null)} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"><X size={14}/></button>
                  </div>
                </div>

                {/* Date/time */}
                <div className="flex items-center gap-2 text-sm text-stone-600 mb-3">
                  <Calendar size={14} className="text-stone-400 flex-shrink-0"/>
                  <span>
                    {selEvent.all_day
                      ? fmtDate(selEvent.start_time)
                      : `${fmtDate(selEvent.start_time)} · ${fmtTime(selEvent.start_time)}${selEvent.end_time ? ` – ${fmtTime(selEvent.end_time)}` : ""}`}
                  </span>
                </div>

                {/* Location */}
                {selEvent.location && (
                  <div className="flex items-center gap-2 text-sm text-stone-600 mb-3">
                    <MapPin size={14} className="text-stone-400 flex-shrink-0"/>
                    <span>{selEvent.location}</span>
                  </div>
                )}

                {/* Meet link */}
                {selEvent.google_meet_link && (
                  <div className="flex items-center gap-2 mb-3">
                    <Video size={14} className="text-stone-400 flex-shrink-0"/>
                    <a href={selEvent.google_meet_link} target="_blank" rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                      Join Google Meet <ExternalLink size={11}/>
                    </a>
                  </div>
                )}

                {/* Description */}
                {selEvent.description && (
                  <p className="text-sm text-stone-600 leading-relaxed mb-4 whitespace-pre-wrap">{selEvent.description}</p>
                )}

                {/* Add to calendar */}
                <div className="border-t border-stone-100 pt-4">
                  <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-2.5">Add to Calendar</p>
                  <div className="flex gap-2">
                    <a href={googleCalUrl(selEvent)} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-medium text-stone-700 transition-colors">
                      <Calendar size={13} className="text-blue-500"/>Google Calendar
                    </a>
                    <button onClick={() => downloadIcs(selEvent)}
                      className="flex items-center gap-2 px-3 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-medium text-stone-700 transition-colors">
                      <Apple size={13}/>Apple Calendar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add / Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <p className="text-sm font-semibold text-stone-800">{editEvent ? "Edit Event" : "Add Event"}</p>
              <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"><X size={14}/></button>
            </div>
            <div className="p-6 flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Event Title <span className="text-red-400">*</span></label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"
                  placeholder="e.g. All Hands Meeting"/>
              </div>

              {/* Category + Team */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">Category</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400 bg-white">
                    {EVENT_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                {form.category === "team" && (
                  <div>
                    <label className="text-xs font-medium text-stone-600 block mb-1">Team</label>
                    <select value={form.team_id} onChange={e => setForm({ ...form, team_id: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400 bg-white">
                      <option value="">Select team</option>
                      {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* All day toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" checked={form.all_day} onChange={e => setForm({ ...form, all_day: e.target.checked })}
                  className="w-4 h-4 rounded border-stone-300 accent-stone-800"/>
                <span className="text-sm text-stone-700">All day</span>
              </label>

              {/* Start */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">Start Date <span className="text-red-400">*</span></label>
                  <input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value, end_date: form.end_date || e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
                </div>
                {!form.all_day && (
                  <div>
                    <label className="text-xs font-medium text-stone-600 block mb-1">Start Time</label>
                    <input type="time" value={form.start_time_val} onChange={e => setForm({ ...form, start_time_val: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
                  </div>
                )}
              </div>

              {/* End */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-stone-600 block mb-1">End Date</label>
                  <input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
                </div>
                {!form.all_day && (
                  <div>
                    <label className="text-xs font-medium text-stone-600 block mb-1">End Time</label>
                    <input type="time" value={form.end_time_val} onChange={e => setForm({ ...form, end_time_val: e.target.value })}
                      className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"/>
                  </div>
                )}
              </div>

              {/* Google Meet link */}
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Google Meet Link</label>
                <input value={form.google_meet_link} onChange={e => setForm({ ...form, google_meet_link: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"
                  placeholder="https://meet.google.com/..."/>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400"
                  placeholder="Room, address, or virtual"/>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-medium text-stone-600 block mb-1">Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3}
                  className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm text-stone-800 focus:outline-none focus:border-stone-400 resize-none"
                  placeholder="Agenda, notes, or details…"/>
              </div>

              {/* Color preview */}
              {form.start_date && form.title && (
                <div className="flex items-center gap-2 p-3 rounded-xl border border-stone-100 bg-stone-50">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{
                    background: form.category === "team"
                      ? (teams.find(t => t.id === form.team_id)?.color || "#3b82f6")
                      : (EVENT_CATEGORIES.find(c => c.value === form.category)?.color || "#6b7280")
                  }}/>
                  <p className="text-xs text-stone-500 truncate">{form.title}</p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-1">
                <button onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 rounded-xl transition-colors">Cancel</button>
                <button onClick={saveEvent} disabled={saving || !form.title.trim() || !form.start_date}
                  className="px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-xl hover:bg-stone-700 disabled:opacity-40 transition-colors">
                  {saving ? "Saving…" : editEvent ? "Save Changes" : "Add Event"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
