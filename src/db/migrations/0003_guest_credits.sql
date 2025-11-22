CREATE TABLE IF NOT EXISTS "guest_credits" (
  "id" text PRIMARY KEY,
  "ip_hash" text NOT NULL UNIQUE,
  "raw_ip" text,
  "credits" integer NOT NULL,
  "reset_at" timestamp NOT NULL,
  "user_agent" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "last_used_at" timestamp
);
