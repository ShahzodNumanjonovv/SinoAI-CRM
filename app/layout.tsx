// app/layout.tsx
import type { ReactNode } from "react";
import "@/styles/globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uz">
      
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}