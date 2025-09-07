// app/(dashboard)/statistics/_components/GenderSummaryCard.tsx
type Props = {
  male: number;
  female: number;
  title?: string;
};

export default function GenderSummaryCard({ male, female, title = "Jins bo‘yicha bemorlar" }: Props) {
  const total = Math.max(0, male + female);
  const malePct = total ? Math.round((male / total) * 100) : 0;
  const femalePct = total ? Math.round((female / total) * 100) : 0;

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">{title}</h3>
        <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm">
          <span className="text-slate-500">Jami</span>
          <span className="font-bold">{total.toLocaleString("uz-UZ")}</span>
        </span>
      </div>

      {/* Progress “pill” – ikkisi yonma-yon bitta segment sifatida ham ishlaydi */}
      <div className="mb-5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full bg-emerald-500 transition-all"
          style={{ width: `${malePct}%` }}
          aria-label="Erkak ulushi"
        />
        <div
          className="h-full -mt-3 bg-amber-400 transition-all"
          style={{ width: `${femalePct}%` }}
          aria-label="Ayol ulushi"
        />
      </div>

      {/* Detal satrlar */}
      <ul className="space-y-3">
        <li className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Erkak</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="tabular-nums text-slate-500">{male.toLocaleString("uz-UZ")}</span>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
              {malePct}%
            </span>
          </div>
        </li>
        <li className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="text-slate-600">Ayol</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="tabular-nums text-slate-500">{female.toLocaleString("uz-UZ")}</span>
            <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
              {femalePct}%
            </span>
          </div>
        </li>
      </ul>
    </div>
  );
}