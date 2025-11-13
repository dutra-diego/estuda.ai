/*
  Warnings:

  - You are about to drop the column `token` on the `Invitation` table. All the data in the column will be lost.
  - You are about to drop the `_ClassStudents` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_ClassStudents" DROP CONSTRAINT "_ClassStudents_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ClassStudents" DROP CONSTRAINT "_ClassStudents_B_fkey";

-- DropIndex
DROP INDEX "public"."Invitation_token_key";

-- AlterTable
ALTER TABLE "public"."Invitation" DROP COLUMN "token";

-- DropTable
DROP TABLE "public"."_ClassStudents";
