export default function Topbar() {
  return (
    <header className="h-14 border-b bg-white px-4 flex items-center justify-between">
      <div className="text-sm text-slate-500">Boshqaruv paneli</div>
      <div className="flex items-center gap-3">
        <span className="text-sm">Uzbek</span>
        <div className="size-8 rounded-full bg-emerald-500 grid place-items-center text-white">P</div>
      </div>
    </header>
  );
}