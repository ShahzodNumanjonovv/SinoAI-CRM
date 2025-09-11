"use client";

import { useEffect, useMemo, useState } from "react";

type Doctor = { id: string; firstName: string; lastName: string };
type Appointment = {
  id: string;
  date: string;         // ISO
  from: string;         // "08:00"
  to: string;
  doctorId: string;
  doctor: { id: string; firstName: string; lastName: string };
  patient: { firstName: string; lastName?: string | null; phone: string };
};

const SLOT_TIMES = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30",
];

function toISO(dmy: string) {
  // UI input type="date" odatda 'YYYY-MM-DD' qaytaradi.
  // Agar sizda DD/MM/YYYY bo‘lsa, shunga moslang.
  if (/^\d{4}-\d{2}-\d{2}$/.test(dmy)) return dmy;
  const [dd, mm, yyyy] = dmy.split("/");
  return `${yyyy}-${mm}-${dd}`;
}

export default function CalendarPage() {
  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState<string>(todayISO);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const load = async () => {
    setLoading(true);
    try {
      const iso = toISO(date);
      const r = await fetch(`/api/calendar?date=${iso}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok || !j.ok) throw new Error(j?.message || "Failed to load");
      setDoctors(j.doctors || []);
      setAppointments(j.appointments || []);
    } catch (e) {
      console.error(e);
      alert("Kalendarni yuklashda xatolik.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Sahifa ochilganda ham yuklaymiz
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // doctorId => Map<from, Appointment>
  const grid = useMemo(() => {
    const m = new Map<string, Map<string, Appointment>>();
    for (const d of doctors) m.set(d.id, new Map());
    for (const a of appointments) {
      if (!m.has(a.doctorId)) m.set(a.doctorId, new Map());
      m.get(a.doctorId)!.set(a.from.trim(), a);
    }
    return m;
  }, [doctors, appointments]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Kalendar</h1>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2">
          <span className="text-slate-600">Sana</span>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <button
          onClick={load}
          disabled={loading}
          className="bg-emerald-700 text-white px-4 py-2 rounded disabled:opacity-60"
        >
          {loading ? "Yuklanmoqda…" : "Filtrlash"}
        </button>
      </div>

      <div className="rounded border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left">
              <th>Vaqt</th>
              {doctors.map((d) => (
                <th key={d.id}>
                  {d.firstName} {d.lastName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SLOT_TIMES.map((t) => (
              <tr key={t} className="border-t [&>td]:px-3 [&>td]:py-2 align-top">
                <td className="text-slate-500">{t}</td>
                {doctors.map((d) => {
                  const ap = grid.get(d.id)?.get(t);
                  return (
                    <td key={d.id + t}>
                      {ap ? (
                        <div className="rounded border border-emerald-300 bg-emerald-50 text-emerald-800 px-2 py-1">
                          <div className="font-medium">Band</div>
                          <div className="text-xs">
                            {ap.patient.firstName} {ap.patient.lastName || ""}<br />
                            {ap.from}–{ap.to}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded border border-dashed text-slate-400 px-2 py-1">
                          Bo‘sh
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}