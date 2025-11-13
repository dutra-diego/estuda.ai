/*
  Warnings:

  - Made the column `title` on table `Chat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Invitation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `teacherId` on table `Invitation` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "public"."Invitation" DROP CONSTRAINT "Invitation_teacherId_fkey";

-- AlterTable
ALTER TABLE "public"."Chat" ADD COLUMN     "classId" TEXT,
ALTER COLUMN "title" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."Invitation" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "teacherId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Chat" ADD CONSTRAINT "Chat_classId_fkey" FOREIGN KEY ("classId") REFERENCES "public"."Class"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Invitation" ADD CONSTRAINT "Invitation_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."Teacher"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
