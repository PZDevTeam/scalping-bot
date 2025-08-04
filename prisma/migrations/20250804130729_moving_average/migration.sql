/*
  Warnings:

  - Added the required column `moving_average` to the `operation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."operation" ADD COLUMN     "moving_average" DOUBLE PRECISION NOT NULL;
