import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 1) Bo‘lim
  const dep = await prisma.department.upsert({
    where: { name: "Terap. stomatologiya" },
    update: {},
    create: { name: "Terap. stomatologiya", active: true }
  });

  // 2) Xizmat
  await prisma.service.upsert({
    where: { code: "22" },
    update: {},
    create: {
      code: "22",
      name: "MRT",
      priceUZS: 60000,
      departmentId: dep.id
    }
  });

  // 3) Bemor
  await prisma.patient.upsert({
    where: { phone: "+998901234567" },
    update: {},
    create: {
      firstName: "Farrux",
      lastName: "Raximov",
      phone: "+998901234567",
      gender: "MALE"
    }
  });

  // 4) Chegirma
  await prisma.discount.upsert({
    where: { id: "seed-percent-10" },
    update: {},
    create: {
      id: "seed-percent-10",
      name: "Aksiya -10%",
      dtype: "PERCENT",
      value: 10,
      active: true
    }
  });

  // 5) ADMIN foydalanuvchi
  // Login sifatida "phone" maydonidan foydalanamiz (sizda email yo‘q)
  const adminLogin = "admin@example.com"; // formdagi "login" maydonga shu yoziladi
  const adminPassHash = await bcrypt.hash("Admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@example.com" }, // 🔑 endi email bo‘yicha upsert
    update: {},
    create: {
      firstName: "Admin",
      lastName: "User",
      phone: "+998900000000",       // ixtiyoriy, bo'sh qoldirmang
      email: "admin@example.com",   // 🔥 muhim
      role: "ADMIN",                // model enumiga mos qatnashsin
      password: adminPassHash,
    },
  });

  console.log("✅ Seed done (dept, service, patient, discount, admin)");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });