/*
  Warnings:

  - You are about to drop the column `content` on the `Message` table. All the data in the column will be lost.
  - Added the required column `answer` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chatId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `difficulty` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `question` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_id_fkey";

-- AlterTable
ALTER TABLE "public"."Chat" ADD COLUMN     "title" TEXT;

-- AlterTable
ALTER TABLE "public"."Message" DROP COLUMN "content",
ADD COLUMN     "answer" TEXT NOT NULL,
ADD COLUMN     "chatId" INTEGER NOT NULL,
ADD COLUMN     "difficulty" TEXT NOT NULL,
ADD COLUMN     "question" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "public"."Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
