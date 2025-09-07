export default function StatisticsPage() {
  return (
    <div className="grid gap-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card title="Daromad" value="0 UZS" />
        <Card title="Tashrif buyuruvchilar" value="0" />
        <Card title="Yaratilgan hisob-fakturalar" value="0" />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="Daromad umumiy ko‘rinishi (oy)">
          <div className="h-56 grid place-items-center text-slate-400">Grafik joyi</div>
        </Panel>
        <Panel title="Jins bo‘yicha bemorlar">
          <div className="h-56 grid place-items-center text-slate-400">Donut grafik</div>
        </Panel>
      </div>
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
    </div>
  );
}
function Panel({ title, children }: React.PropsWithChildren<{ title: string }>) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="mb-3 text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}