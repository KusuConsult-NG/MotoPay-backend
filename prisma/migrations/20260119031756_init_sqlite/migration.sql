-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone_number" TEXT,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PUBLIC',
    "agent_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "nin" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tin" TEXT,
    "plate_number" TEXT NOT NULL,
    "chassis_number" TEXT NOT NULL,
    "engine_number" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "owner_name" TEXT NOT NULL,
    "owner_contact" TEXT NOT NULL,
    "registration_date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_renewal_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "tin_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "compliance_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "vehicle_category" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "is_mandatory" BOOLEAN NOT NULL DEFAULT false,
    "validity_period_days" INTEGER NOT NULL,
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "vehicle_compliance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vehicle_id" TEXT NOT NULL,
    "compliance_item_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "issue_date" DATETIME NOT NULL,
    "expiry_date" DATETIME NOT NULL,
    "certificate_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "vehicle_compliance_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "vehicle_compliance_compliance_item_id_fkey" FOREIGN KEY ("compliance_item_id") REFERENCES "compliance_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "user_id" TEXT,
    "vehicle_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "fee" REAL NOT NULL,
    "total_amount" REAL NOT NULL,
    "payment_method" TEXT NOT NULL,
    "payment_gateway" TEXT NOT NULL,
    "payment_reference" TEXT,
    "status" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "agent_id" TEXT,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "transactions_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transaction_id" TEXT NOT NULL,
    "receipt_number" TEXT NOT NULL,
    "pdf_url" TEXT,
    "email_sent_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "receipts_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "agent_commissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "agent_id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "percentage" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "status" TEXT NOT NULL,
    "paid_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agent_commissions_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "agent_commissions_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "exceptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticket_number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "user_submitted_data" TEXT NOT NULL,
    "plate_number" TEXT,
    "chassis_number" TEXT,
    "status" TEXT NOT NULL,
    "assigned_to" TEXT,
    "resolution_notes" TEXT,
    "evidence_urls" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "resolved_at" DATETIME,
    CONSTRAINT "exceptions_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "compliance_item_id" TEXT NOT NULL,
    "old_price" REAL NOT NULL,
    "new_price" REAL NOT NULL,
    "changed_by" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "approved_by" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "price_history_compliance_item_id_fkey" FOREIGN KEY ("compliance_item_id") REFERENCES "compliance_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "price_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "price_history_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "processed_webhooks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event_reference" TEXT NOT NULL,
    "gateway" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "processed_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_agent_id_key" ON "users"("agent_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_nin_key" ON "users"("nin");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_plate_number_key" ON "vehicles"("plate_number");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_chassis_number_key" ON "vehicles"("chassis_number");

-- CreateIndex
CREATE INDEX "vehicles_plate_number_idx" ON "vehicles"("plate_number");

-- CreateIndex
CREATE INDEX "vehicles_chassis_number_idx" ON "vehicles"("chassis_number");

-- CreateIndex
CREATE INDEX "vehicles_tin_idx" ON "vehicles"("tin");

-- CreateIndex
CREATE UNIQUE INDEX "compliance_items_name_vehicle_category_key" ON "compliance_items"("name", "vehicle_category");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_reference_key" ON "transactions"("reference");

-- CreateIndex
CREATE INDEX "transactions_reference_idx" ON "transactions"("reference");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_transaction_id_key" ON "receipts"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_receipt_number_key" ON "receipts"("receipt_number");

-- CreateIndex
CREATE UNIQUE INDEX "agent_commissions_transaction_id_key" ON "agent_commissions"("transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "exceptions_ticket_number_key" ON "exceptions"("ticket_number");

-- CreateIndex
CREATE INDEX "exceptions_status_idx" ON "exceptions"("status");

-- CreateIndex
CREATE INDEX "exceptions_assigned_to_idx" ON "exceptions"("assigned_to");

-- CreateIndex
CREATE UNIQUE INDEX "processed_webhooks_event_reference_key" ON "processed_webhooks"("event_reference");

-- CreateIndex
CREATE INDEX "processed_webhooks_event_reference_idx" ON "processed_webhooks"("event_reference");
