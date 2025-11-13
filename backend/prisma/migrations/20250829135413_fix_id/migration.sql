/*
  Warnings:

  - You are about to drop the column `chatId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Student` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Teacher` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Student" DROP CONSTRAINT "Student_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Teacher" DROP CONSTRAINT "Teacher_userId_fkey";

-- DropIndex
DROP INDEX "public"."Student_userId_key";

-- DropIndex
DROP INDEX "public"."Teacher_userId_key";

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "chatId";

-- AlterTable
ALTER TABLE "public"."Student" DROP COLUMN "userId";

-- AlterTable
ALTER TABLE "public"."Teacher" DROP COLUMN "userId";

-- AddForeignKey
ALTER TABLE "public"."Student" ADD CONSTRAINT "Student_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Teacher" ADD CONSTRAINT "Teacher_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_id_fkey" FOREIGN KEY ("id") REFERENCES "public"."Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
