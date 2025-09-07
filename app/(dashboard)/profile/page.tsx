export default function Profile() {
  return (
    <div className="max-w-xl rounded-xl border bg-white p-6">
      <h1 className="text-lg font-semibold mb-4">Profil</h1>
      <form className="grid gap-3">
        <input className="input" type="password" placeholder="Eski parol" />
        <input className="input" type="password" placeholder="Yangi parol" />
        <input className="input" type="password" placeholder="Yangi parolni tasdiqlash" />
        <button className="btn">Yangilash</button>
      </form>
    </div>
  );
}