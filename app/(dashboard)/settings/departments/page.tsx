const items = [
  { name: "Ortopedik stomatologiya", active: true },
  { name: "Xirurgik stomatologiya", active: false },
  { name: "Terap. stomatologiya", active: true }
];

export default function Departments() {
  return (
    <div className="max-w-xl rounded-xl border bg-white p-6">
      <h1 className="text-lg font-semibold mb-4">Bo‘limlar</h1>
      <div className="grid gap-2">
        {items.map((d, i) => (
          <div key={i} className="flex items-center justify-between rounded border p-3">
            <span>{d.name}</span>
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" defaultChecked={d.active} /> Faol
            </label>
          </div>
        ))}
      </div>
      <button className="btn mt-4">O‘zgarishlarni saqlash</button>
    </div>
  );
}