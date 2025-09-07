const ds = ["Aksiya", "Skidka dla detey", "Letnyaya aktsiya", "Skidka vyxodnogo dnya"];

export default function Discounts() {
  return (
    <div className="max-w-xl rounded-xl border bg-white p-6">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-lg font-semibold">Chegirmalar</h1>
        <button className="btn">Chegirma yaratish</button>
      </div>
      <div className="grid gap-2">
        {ds.map((name, i) => (
          <div key={i} className="flex items-center justify-between rounded border p-3">
            <span>{name}</span>
            <div className="flex gap-2 text-slate-500 text-sm">
              <button>✏️</button><button>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}