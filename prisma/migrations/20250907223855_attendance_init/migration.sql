-- CreateEnum
CREATE TYPE "public"."TimeStatus" AS ENUM ('NONE', 'WORKING', 'ON_BREAK', 'DONE');

-- CreateTable
CREATE TABLE "public"."AttendanceDay" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "clockInAt" TIMESTAMP(3),
    "clockOutAt" TIMESTAMP(3),
    "totalWorkSeconds" INTEGER NOT NULL DEFAULT 0,
    "totalBreakSeconds" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."TimeStatus" NOT NULL DEFAULT 'NONE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AttendanceDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BreakInterval" (
    "id" TEXT NOT NULL,
    "attendanceDayId" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BreakInterval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkLog" (
    "id" TEXT NOT NULL,
    "attendanceDayId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AttendanceDay_userId_date_idx" ON "public"."AttendanceDay"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "AttendanceDay_userId_date_key" ON "public"."AttendanceDay"("userId", "date");

-- CreateIndex
CREATE INDEX "BreakInterval_attendanceDayId_start_idx" ON "public"."BreakInterval"("attendanceDayId", "start");

-- CreateIndex
CREATE INDEX "WorkLog_attendanceDayId_createdAt_idx" ON "public"."WorkLog"("attendanceDayId", "createdAt");

-- AddForeignKey
ALTER TABLE "public"."BreakInterval" ADD CONSTRAINT "BreakInterval_attendanceDayId_fkey" FOREIGN KEY ("attendanceDayId") REFERENCES "public"."AttendanceDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkLog" ADD CONSTRAINT "WorkLog_attendanceDayId_fkey" FOREIGN KEY ("attendanceDayId") REFERENCES "public"."AttendanceDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
