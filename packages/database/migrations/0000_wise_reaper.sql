CREATE TABLE "cms_announcements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"link" varchar(255),
	"link_text" varchar(50),
	"type" varchar(20) DEFAULT 'info' NOT NULL,
	"placement" varchar(20) DEFAULT 'banner' NOT NULL,
	"dismissible" boolean DEFAULT true NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_blog_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"excerpt" text,
	"content" text NOT NULL,
	"featured_image" varchar(500),
	"author" varchar(100) DEFAULT 'Geoff Bevans' NOT NULL,
	"category" varchar(50),
	"tags" jsonb DEFAULT '[]'::jsonb,
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"og_image" varchar(500),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"featured" boolean DEFAULT false NOT NULL,
	"read_time_minutes" integer,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_blog_posts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cms_docs_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"parent_id" uuid,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"icon" varchar(50),
	"description" text,
	"meta_title" varchar(60),
	"meta_description" varchar(160),
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_docs_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cms_features" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"icon" varchar(50),
	"image" varchar(500),
	"category" varchar(50),
	"sort_order" integer DEFAULT 0 NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_features_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cms_homepage_hero" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"headline" varchar(255) NOT NULL,
	"subheadline" text,
	"cta_primary_text" varchar(50) NOT NULL,
	"cta_primary_link" varchar(255) NOT NULL,
	"cta_secondary_text" varchar(50),
	"cta_secondary_link" varchar(255),
	"background_image" varchar(500),
	"background_video" varchar(500),
	"active" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cms_legal_pages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"version" varchar(20) NOT NULL,
	"effective_date" timestamp with time zone NOT NULL,
	"status" varchar(20) DEFAULT 'draft' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cms_legal_pages_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "cms_docs_pages" ADD CONSTRAINT "cms_docs_pages_parent_id_cms_docs_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."cms_docs_pages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cms_announcements_active_idx" ON "cms_announcements" USING btree ("active");--> statement-breakpoint
CREATE INDEX "cms_announcements_starts_at_idx" ON "cms_announcements" USING btree ("starts_at");--> statement-breakpoint
CREATE INDEX "cms_blog_posts_slug_idx" ON "cms_blog_posts" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "cms_blog_posts_status_idx" ON "cms_blog_posts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cms_blog_posts_published_at_idx" ON "cms_blog_posts" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "cms_blog_posts_category_idx" ON "cms_blog_posts" USING btree ("category");--> statement-breakpoint
CREATE INDEX "cms_docs_pages_slug_idx" ON "cms_docs_pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "cms_docs_pages_parent_id_idx" ON "cms_docs_pages" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "cms_docs_pages_status_idx" ON "cms_docs_pages" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cms_features_slug_idx" ON "cms_features" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "cms_features_category_idx" ON "cms_features" USING btree ("category");--> statement-breakpoint
CREATE INDEX "cms_legal_pages_slug_idx" ON "cms_legal_pages" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "cms_legal_pages_status_idx" ON "cms_legal_pages" USING btree ("status");
