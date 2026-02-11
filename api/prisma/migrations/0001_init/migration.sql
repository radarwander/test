CREATE TYPE "Role" AS ENUM ('admin', 'sales');
CREATE TYPE "LeadStatus" AS ENUM ('new', 'contacted', 'qualified', 'disqualified', 'converted');
CREATE TYPE "OpportunityStage" AS ENUM ('prospecting', 'proposal', 'negotiation', 'won', 'lost');

CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3)
);

CREATE TABLE "customers" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "industry" TEXT,
  "level" TEXT,
  "owner_id" TEXT NOT NULL REFERENCES "users"("id"),
  "phone" TEXT,
  "email" TEXT,
  "address" TEXT,
  "remark" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3)
);

CREATE TABLE "leads" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "status" "LeadStatus" NOT NULL DEFAULT 'new',
  "phone" TEXT,
  "email" TEXT,
  "owner_id" TEXT NOT NULL REFERENCES "users"("id"),
  "customer_id" TEXT REFERENCES "customers"("id"),
  "remark" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3)
);

CREATE TABLE "opportunities" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "customer_id" TEXT NOT NULL REFERENCES "customers"("id"),
  "owner_id" TEXT NOT NULL REFERENCES "users"("id"),
  "stage" "OpportunityStage" NOT NULL DEFAULT 'prospecting',
  "amount" DECIMAL(12,2) NOT NULL,
  "close_date" TIMESTAMP(3),
  "probability" INTEGER,
  "remark" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "deleted_at" TIMESTAMP(3)
);

CREATE TABLE "activity_logs" (
  "id" TEXT PRIMARY KEY,
  "actor_id" TEXT NOT NULL REFERENCES "users"("id"),
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "before" JSONB,
  "after" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
