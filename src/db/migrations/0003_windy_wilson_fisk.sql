CREATE TABLE "guest_credits" (
	"id" text PRIMARY KEY NOT NULL,
	"ip_hash" text NOT NULL,
	"raw_ip" text,
	"credits" integer NOT NULL,
	"reset_at" timestamp NOT NULL,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_used_at" timestamp,
	CONSTRAINT "guest_credits_ip_hash_unique" UNIQUE("ip_hash")
);
