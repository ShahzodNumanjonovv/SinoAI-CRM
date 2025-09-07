// app/login/page.tsx
import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Kirish — SinoAI",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 grid grid-cols-1 lg:grid-cols-[340px_1fr]">
      {/* Chap panel */}
      <aside className="hidden lg:flex flex-col justify-between rounded-r-2xl bg-white p-8 shadow-sm">
        <div className="text-emerald-700 font-semibold text-lg">SinoAI</div>

        <div className="mt-10">
          <h1 className="text-2xl font-semibold text-slate-800">
            Salom, xush kelibsiz
          </h1>
        </div>

        <div className="h-10" />
      </aside>

      {/* O'ng — forma */}
      <main className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-800">
              SinoAI tizimiga kirish
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              Quyidagi ma’lumotlarni kiriting.
            </p>
          </div>

          <LoginForm />
        </div>
      </main>
    </div>
  );
}