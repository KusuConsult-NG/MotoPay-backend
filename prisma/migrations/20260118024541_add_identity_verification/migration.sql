/*
  Warnings:

  - A unique constraint covering the columns `[nin]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "is_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nin" TEXT;

-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "tin_verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_nin_key" ON "users"("nin");
