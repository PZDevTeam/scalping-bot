-- CreateTable
CREATE TABLE "public"."operation" (
    "id" TEXT NOT NULL,
    "receipt_token_mint" TEXT NOT NULL,
    "receipt_token_name" TEXT NOT NULL,
    "target_token_mint" TEXT NOT NULL,
    "target_token_name" TEXT NOT NULL,
    "receipt_amount" DOUBLE PRECISION NOT NULL,
    "target_amount" DOUBLE PRECISION NOT NULL,
    "receipt_volume" DOUBLE PRECISION NOT NULL,
    "target_volume" DOUBLE PRECISION NOT NULL,
    "exchange_rate" DOUBLE PRECISION NOT NULL,
    "dex" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pool_id" TEXT NOT NULL,
    "operation_type" TEXT NOT NULL,

    CONSTRAINT "operation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "operation_receipt_token_mint_idx" ON "public"."operation"("receipt_token_mint");

-- CreateIndex
CREATE INDEX "operation_target_token_mint_idx" ON "public"."operation"("target_token_mint");

-- CreateIndex
CREATE INDEX "operation_pool_id_idx" ON "public"."operation"("pool_id");

-- CreateIndex
CREATE INDEX "operation_dex_idx" ON "public"."operation"("dex");

-- CreateIndex
CREATE INDEX "operation_created_at_idx" ON "public"."operation"("created_at");

-- CreateIndex
CREATE INDEX "operation_operation_type_idx" ON "public"."operation"("operation_type");
