/*
  Warnings:

  - You are about to drop the `client_profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `control_room_profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `guard_profile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `responder_profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "client_profile" DROP CONSTRAINT "client_profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "control_room_profile" DROP CONSTRAINT "control_room_profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "guard_profile" DROP CONSTRAINT "guard_profile_userId_fkey";

-- DropForeignKey
ALTER TABLE "responder_profile" DROP CONSTRAINT "responder_profile_userId_fkey";

-- DropTable
DROP TABLE "client_profile";

-- DropTable
DROP TABLE "control_room_profile";

-- DropTable
DROP TABLE "guard_profile";

-- DropTable
DROP TABLE "responder_profile";

-- CreateTable
CREATE TABLE "client" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "preferredContactMethod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "responder" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "callSign" TEXT,
    "licenseNumber" TEXT,
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'OFFLINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "responder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guard" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "employeeNumber" TEXT,
    "assignedShift" TEXT,
    "availabilityStatus" "AvailabilityStatus" NOT NULL DEFAULT 'OFFLINE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "control_room" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stationName" TEXT,
    "extension" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "control_room_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "client_userId_key" ON "client"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "responder_userId_key" ON "responder"("userId");

-- CreateIndex
CREATE INDEX "responder_availabilityStatus_idx" ON "responder"("availabilityStatus");

-- CreateIndex
CREATE UNIQUE INDEX "guard_userId_key" ON "guard"("userId");

-- CreateIndex
CREATE INDEX "guard_availabilityStatus_idx" ON "guard"("availabilityStatus");

-- CreateIndex
CREATE UNIQUE INDEX "control_room_userId_key" ON "control_room"("userId");

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "responder" ADD CONSTRAINT "responder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guard" ADD CONSTRAINT "guard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "control_room" ADD CONSTRAINT "control_room_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
