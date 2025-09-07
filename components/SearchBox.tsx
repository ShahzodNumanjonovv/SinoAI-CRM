"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
  placeholder?: string;
  initialValue?: string;
  keepParams?: string[];      // masalan: ["status"]
  className?: string;
  minChars?: number;          // default: 2
  delayMs?: number;           // default: 300
};

export default function SearchBox({
  placeholder = "Qidiruv...",
  initialValue = "",
  keepParams = [],
  className = "input w-full md:w-96",
  minChars = 2,
  delayMs = 300,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [value, setValue] = useState(initialValue);

  const baseParams = useMemo(() => {
    const o: Record<string, string> = {};
    keepParams.forEach((k) => {
      const v = sp.get(k);
      if (v) o[k] = v;
    });
    return o;
  }, [sp, keepParams.join("|")]);

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(baseParams);

      const q = value.trim();
      if (q.length >= minChars) params.set("q", q);
      // 2 belgidan kam bo‘lsa q’ni olib tashlaymiz
      else params.delete("q");

      const url = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;

      router.replace(url);
    }, delayMs);

    return () => clearTimeout(t);
  }, [value, baseParams, pathname, router, minChars, delayMs]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className={className}
    />
  );
}