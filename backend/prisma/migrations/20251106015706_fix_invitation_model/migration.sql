/*
  Warnings:

  - You are about to drop the column `acceptedAt` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Invitation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[classId,email]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Invitation" DROP CONSTRAINT "Invitation_classId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Invitation" DROP CONSTRAINT "Invitation_teacherId_fkey";

-- AlterTable
ALTER TABLE "Invitation" DROP COLUMN "acceptedAt",
DROP COLUMN "createdAt",
DROP COLUMN "status",
ALTER COLUMN "email" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_classId_email_key" ON "Invitation"("classId", "email");

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "Teacher"("id") ON DELETE CASCADE ON UPDATE CASCADE;
