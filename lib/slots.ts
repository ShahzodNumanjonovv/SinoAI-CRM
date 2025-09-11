export type Slot = {
  start: string; // ISO
  end: string;   // ISO
};

export function genDaySlots(isoDate: string): Slot[] {
  // isoDate => '2025-09-08' (local kun)
  const ranges: Array<[number, number]> = [
    [8, 12],  // 08:00 - 12:00
    [13, 18], // 13:00 - 18:00
  ];

  const out: Slot[] = [];
  for (const [h1, h2] of ranges) {
    let cur = new Date(`${isoDate}T${String(h1).padStart(2, "0")}:00:00`);
    const end = new Date(`${isoDate}T${String(h2).padStart(2, "0")}:00:00`);
    while (cur < end) {
      const next = new Date(cur.getTime() + 30 * 60 * 1000);
      out.push({ start: cur.toISOString(), end: next.toISOString() });
      cur = next;
    }
  }
  return out;
}