// components/ui/FullScreenLoader.tsx
"use client";

type Props = {
  text?: string;
};

export default function FullScreenLoader({ text = "Kiritilmoqda..." }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 backdrop-blur-sm">
      <div className="rounded-2xl bg-white/95 px-8 py-6 shadow-xl ring-1 ring-black/5">
        <div className="flex items-center gap-4">
          {/* gradient spinner */}
          <div className="relative h-10 w-10">
            <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 animate-spin [animation-duration:1200ms]" />
            <span className="absolute inset-1 rounded-full bg-white" />
          </div>
          <div>
            <div className="text-sm text-slate-500">Iltimos, kuting</div>
            <div className="text-base font-semibold text-slate-800">{text}</div>
          </div>
        </div>
      </div>
    </div>
  );
}