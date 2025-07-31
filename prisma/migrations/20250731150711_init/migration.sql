-- CreateTable
CREATE TABLE "public"."operation" (
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

    CONSTRAINT "operation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "operation_token_mint_idx" ON "public"."operation"("token_mint");

-- CreateIndex
CREATE INDEX "operation_pool_id_idx" ON "public"."operation"("pool_id");

-- CreateIndex
CREATE INDEX "operation_dex_idx" ON "public"."operation"("dex");

-- CreateIndex
CREATE INDEX "operation_created_at_idx" ON "public"."operation"("created_at");
