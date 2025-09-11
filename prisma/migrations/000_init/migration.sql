-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'DONE');

-- CreateTable
CREATE TABLE "public"."ec_users" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'RECEPTION',
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ec_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ec_departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ec_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ec_patients" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3),
    "gender" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ec_patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ec_doctors" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "speciality" TEXT NOT NULL,
    "roomNo" INTEGER,
    "priceUZS" INTEGER NOT NULL,
    "departmentId" TEXT,
    "avatarUrl" TEXT,
    "experienceYears" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ec_doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ec_services" (
    "id" TEXT NOT NULL,
    "code" TEXT,
    "name" TEXT NOT NULL,
    "priceUZS" INTEGER NOT NULL,
    "departmentId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ec_services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ec_discounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dtype" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ec_discounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ec_invoices" (
    "id" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "patientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "subtotal" INTEGER NOT NULL DEFAULT 0,
    "discountId" TEXT,
    "discountAmt" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ec_invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ec_invoice_items" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "priceUZS" INTEGER NOT NULL,

    CONSTRAINT "ec_invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ec_appointments" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "note" TEXT,
    "source" TEXT NOT NULL DEFAULT 'miniapp',
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ec_appointments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ec_users_phone_key" ON "public"."ec_users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "ec_users_email_key" ON "public"."ec_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ec_departments_name_key" ON "public"."ec_departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ec_patients_phone_key" ON "public"."ec_patients"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "ec_doctors_code_key" ON "public"."ec_doctors"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ec_services_code_key" ON "public"."ec_services"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ec_invoices_code_key" ON "public"."ec_invoices"("code");

-- CreateIndex
CREATE INDEX "ec_appointments_date_doctorId_idx" ON "public"."ec_appointments"("date", "doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "ec_appointments_doctorId_date_from_key" ON "public"."ec_appointments"("doctorId", "date", "from");

-- AddForeignKey
ALTER TABLE "public"."ec_doctors" ADD CONSTRAINT "ec_doctors_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."ec_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ec_services" ADD CONSTRAINT "ec_services_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "public"."ec_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ec_invoices" ADD CONSTRAINT "ec_invoices_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."ec_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ec_invoices" ADD CONSTRAINT "ec_invoices_discountId_fkey" FOREIGN KEY ("discountId") REFERENCES "public"."ec_discounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ec_invoice_items" ADD CONSTRAINT "ec_invoice_items_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "public"."ec_invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ec_invoice_items" ADD CONSTRAINT "ec_invoice_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."ec_services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ec_appointments" ADD CONSTRAINT "ec_appointments_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "public"."ec_doctors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ec_appointments" ADD CONSTRAINT "ec_appointments_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "public"."ec_patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

