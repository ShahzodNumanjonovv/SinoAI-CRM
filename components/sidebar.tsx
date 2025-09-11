"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const items = [
  { href: "/statistics", label: "Statistika" },
  { href: "/kassir", label: "Kassir" },
  { href: "/calendar", label: "Kalendar" },
  { href: "/patients", label: "Bemorlar" },
  { href: "/users", label: "Foydalanuvchilar" },
  { href: "/doctors", label: "Shifokorlar" }, // ⬅️ yangisi
  { href: "/settings/clinic", label: "Sozlamalar" },
];

export default function Sidebar() {
  const path = usePathname();
  return (
    <aside className="w-56 shrink-0 border-r bg-white">
      <div className="px-4 py-4 font-semibold">SinoAI</div>
      <nav className="flex flex-col gap-1 px-2">
        {items.map((i) => (
          <Link
            key={i.href}
            href={i.href}
            className={clsx(
              "rounded px-3 py-2 text-sm hover:bg-slate-100",
              path.startsWith(i.href) && "bg-slate-100 font-semibold"
            )}
          >
            {i.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}