CREATE TABLE "cms_waitlist_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"company" varchar(255),
	"role" varchar(50),
	"heard_from" varchar(100),
	"source" varchar(50) DEFAULT 'homepage' NOT NULL,
	"utm_source" varchar(100),
	"utm_medium" varchar(100),
	"utm_campaign" varchar(100),
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"email_sent" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_waitlist_submissions_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "cms_waitlist_email_idx" ON "cms_waitlist_submissions" USING btree ("email");--> statement-breakpoint
CREATE INDEX "cms_waitlist_status_idx" ON "cms_waitlist_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cms_waitlist_created_at_idx" ON "cms_waitlist_submissions" USING btree ("created_at");
