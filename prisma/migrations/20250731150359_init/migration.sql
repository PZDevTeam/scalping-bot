-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "dex_operation";

-- CreateTable
CREATE TABLE "dex_operation"."Operation" (
    "id" SERIAL NOT NULL,
    "token_mint" TEXT NOT NULL,
    "token_name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "usd_price" DOUBLE PRECISION NOT NULL,
    "total_value" DOUBLE PRECISION NOT NULL,
    "operation" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "dex" TEXT NOT NULL,
    "slot" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Operation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Operation_token_mint_idx" ON "dex_operation"."Operation"("token_mint");

-- CreateIndex
CREATE INDEX "Operation_pool_id_idx" ON "dex_operation"."Operation"("pool_id");

-- CreateIndex
CREATE INDEX "Operation_dex_idx" ON "dex_operation"."Operation"("dex");

-- CreateIndex
CREATE INDEX "Operation_created_at_idx" ON "dex_operation"."Operation"("created_at");
