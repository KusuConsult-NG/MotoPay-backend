-- CreateTable
CREATE TABLE "processed_webhooks" (
    "id" TEXT NOT NULL,
    "event_reference" TEXT NOT NULL,
    "gateway" "PaymentGateway" NOT NULL,
    "event_type" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "processed_webhooks_event_reference_key" ON "processed_webhooks"("event_reference");

-- CreateIndex
CREATE INDEX "processed_webhooks_event_reference_idx" ON "processed_webhooks"("event_reference");
