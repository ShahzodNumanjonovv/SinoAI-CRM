'use client';

import * as React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Props = { initial?: string; minLen?: number; delay?: number };

export default function SearchBox({ initial = '', minLen = 2, delay = 400 }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const [value, setValue] = React.useState(initial);

  // mavjud boshqa querylarni saqlab qolish uchun helper
  const buildUrl = (q: string) => {
    const params = new URLSearchParams(sp?.toString());
    if (q.length >= minLen || q === '') {
      if (q === '') params.delete('q');
      else params.set('q', q);
      // agar paging/offset bo‘lsa reset qilamiz
      params.delete('page');
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  React.useEffect(() => {
    const t = setTimeout(() => {
      const q = value.trim();
      if (q.length >= minLen || q === '') {
        router.replace(buildUrl(q)); // toza URL va server komponent qayta render
      }
    }, delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delay, minLen]);

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="Qidiruv (ism, telefon)..."
      className="input w-80"
      autoFocus
    />
  );
}