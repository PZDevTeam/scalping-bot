/*
  Warnings:

  - Added the required column `candle` to the `operation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selected_timeframe` to the `operation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."operation" ADD COLUMN     "candle" INTEGER NOT NULL,
ADD COLUMN     "selected_timeframe" TEXT NOT NULL;
