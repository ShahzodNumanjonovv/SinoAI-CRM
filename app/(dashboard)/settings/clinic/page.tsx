export default function ClinicSettings() {
  return (
    <div className="max-w-xl rounded-xl border bg-white p-6">
      <div className="mb-4 rounded border border-sky-200 bg-sky-50 p-3 text-sm">
        Bu yerda klinikaga oid barcha ma’lumotlarni yangilashingiz mumkin
      </div>
      <form className="grid gap-3">
        <input className="input" placeholder="Nomi" defaultValue="Saydana" />
        <input className="input" placeholder="Manzil" defaultValue="Namangan shaxar" />
        <input className="input" placeholder="QR havola" defaultValue="https://example.com" />
        <input className="input" placeholder="Telefon raqami" defaultValue="+998 99 999-99-99" />
        <div className="grid grid-cols-2 gap-3">
          <input className="input" placeholder="Ish boshlanish vaqti" defaultValue="08:00" />
          <input className="input" placeholder="Ish tugash vaqti" defaultValue="19:00" />
        </div>
        <button className="btn">Saqlash</button>
      </form>
    </div>
  );
}