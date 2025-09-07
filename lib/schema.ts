import { z } from "zod";

export const patientSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().min(7),
  birthDate: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE"]),
  address: z.string().optional()
});

export const serviceSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  priceUZS: z.coerce.number().int().nonnegative(),
  departmentId: z.string().optional().nullable()
});

export const userSchema = z.object({
  firstName: z.string().min(1, "Ism shart"),
  lastName: z.string().min(1, "Familiya shart"),
  phone: z.string().min(7, "Telefon noto‘g‘ri"),
  role: z.enum(["ADMIN","MANAGER","DOCTOR","RECEPTION"]),
  password: z.string().min(6, "Parol kamida 6 belgi"),
});

// mavjud exportlaringiz bilan bir qatorda export qiling