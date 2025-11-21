CREATE TABLE "detections" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"source_type" text NOT NULL,
	"input_type" text NOT NULL,
	"input_preview" text,
	"raw_score" double precision NOT NULL,
	"ai_score" double precision NOT NULL,
	"length" integer,
	"sentence_count" integer,
	"sentences" jsonb,
	"attack_detected" jsonb,
	"readability_score" double precision,
	"credits_used" integer,
	"credits_remaining" integer,
	"version" text,
	"language" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "detections" ADD CONSTRAINT "detections_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;