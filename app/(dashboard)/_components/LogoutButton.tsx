"use client";

export default function LogoutButton() {
  async function onClick() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }
  return (
    <button onClick={onClick} className="text-sm text-red-600 hover:underline">
      Logout
    </button>
  );
}