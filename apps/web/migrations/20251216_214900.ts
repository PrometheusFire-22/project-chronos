import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_cta_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_content_layout" AS ENUM('full', 'centered', 'narrow');
  CREATE TYPE "public"."enum_pages_blocks_content_background_color" AS ENUM('none', 'gray', 'primary', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_media_block_size" AS ENUM('small', 'medium', 'large', 'full');
  CREATE TYPE "public"."enum_pages_blocks_media_block_position" AS ENUM('left', 'center', 'right');
  CREATE TYPE "public"."enum_pages_blocks_cta_buttons_style" AS ENUM('primary', 'secondary', 'outline');
  CREATE TYPE "public"."enum_pages_blocks_cta_background_color" AS ENUM('none', 'primary', 'accent', 'dark');
  CREATE TYPE "public"."enum_footer_social_links_platform" AS ENUM('twitter', 'linkedin', 'github', 'youtube', 'facebook', 'instagram');
  CREATE TABLE "pages_blocks_media_block" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_id" integer NOT NULL,
  	"caption" varchar,
  	"size" "enum_pages_blocks_media_block_size" DEFAULT 'large',
  	"position" "enum_pages_blocks_media_block_position" DEFAULT 'center',
  	"block_name" varchar
  );

  CREATE TABLE "pages_blocks_cta_buttons" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link" varchar NOT NULL,
  	"style" "enum_pages_blocks_cta_buttons_style" DEFAULT 'primary'
  );

  CREATE TABLE "pages_blocks_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL,
  	"text" varchar,
  	"background_color" "enum_pages_blocks_cta_background_color" DEFAULT 'primary',
  	"block_name" varchar
  );

  CREATE TABLE "header_nav_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_id" integer,
  	"external_link" varchar
  );

  CREATE TABLE "header" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"cta_button_show" boolean DEFAULT true,
  	"cta_button_label" varchar DEFAULT 'Get Started',
  	"cta_button_link" varchar DEFAULT '/contact',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );

  CREATE TABLE "footer_columns_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_id" integer,
  	"external_link" varchar
  );

  CREATE TABLE "footer_columns" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar NOT NULL
  );

  CREATE TABLE "footer_social_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"platform" "enum_footer_social_links_platform" NOT NULL,
  	"url" varchar NOT NULL
  );

  CREATE TABLE "footer_legal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_id" integer
  );

  CREATE TABLE "footer" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"copyright" varchar DEFAULT '© 2025 Project Chronos. All rights reserved.',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );

  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "type" SET NOT NULL;
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "heading" SET NOT NULL;
  ALTER TABLE "pages_blocks_content" ALTER COLUMN "content" SET NOT NULL;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "subheading" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "cta_show" boolean DEFAULT true;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "cta_label" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "cta_link" varchar;
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "cta_style" "enum_pages_blocks_hero_cta_style" DEFAULT 'primary';
  ALTER TABLE "pages_blocks_content" ADD COLUMN "layout" "enum_pages_blocks_content_layout" DEFAULT 'centered';
  ALTER TABLE "pages_blocks_content" ADD COLUMN "background_color" "enum_pages_blocks_content_background_color" DEFAULT 'none';
  ALTER TABLE "pages" ADD COLUMN "description" varchar;
  ALTER TABLE "pages" ADD COLUMN "is_home" boolean DEFAULT false;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_media_id_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_block" ADD CONSTRAINT "pages_blocks_media_block_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta_buttons" ADD CONSTRAINT "pages_blocks_cta_buttons_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_cta"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_cta" ADD CONSTRAINT "pages_blocks_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_link_id_pages_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "header_nav_items" ADD CONSTRAINT "header_nav_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."header"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_link_id_pages_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_columns_links" ADD CONSTRAINT "footer_columns_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer_columns"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_columns" ADD CONSTRAINT "footer_columns_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_social_links" ADD CONSTRAINT "footer_social_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_link_id_pages_id_fk" FOREIGN KEY ("link_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "footer_legal_links" ADD CONSTRAINT "footer_legal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."footer"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_media_block_order_idx" ON "pages_blocks_media_block" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_block_parent_id_idx" ON "pages_blocks_media_block" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_block_path_idx" ON "pages_blocks_media_block" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_block_media_idx" ON "pages_blocks_media_block" USING btree ("media_id");
  CREATE INDEX "pages_blocks_cta_buttons_order_idx" ON "pages_blocks_cta_buttons" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_buttons_parent_id_idx" ON "pages_blocks_cta_buttons" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_order_idx" ON "pages_blocks_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_cta_parent_id_idx" ON "pages_blocks_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_cta_path_idx" ON "pages_blocks_cta" USING btree ("_path");
  CREATE INDEX "header_nav_items_order_idx" ON "header_nav_items" USING btree ("_order");
  CREATE INDEX "header_nav_items_parent_id_idx" ON "header_nav_items" USING btree ("_parent_id");
  CREATE INDEX "header_nav_items_link_idx" ON "header_nav_items" USING btree ("link_id");
  CREATE INDEX "footer_columns_links_order_idx" ON "footer_columns_links" USING btree ("_order");
  CREATE INDEX "footer_columns_links_parent_id_idx" ON "footer_columns_links" USING btree ("_parent_id");
  CREATE INDEX "footer_columns_links_link_idx" ON "footer_columns_links" USING btree ("link_id");
  CREATE INDEX "footer_columns_order_idx" ON "footer_columns" USING btree ("_order");
  CREATE INDEX "footer_columns_parent_id_idx" ON "footer_columns" USING btree ("_parent_id");
  CREATE INDEX "footer_social_links_order_idx" ON "footer_social_links" USING btree ("_order");
  CREATE INDEX "footer_social_links_parent_id_idx" ON "footer_social_links" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_links_order_idx" ON "footer_legal_links" USING btree ("_order");
  CREATE INDEX "footer_legal_links_parent_id_idx" ON "footer_legal_links" USING btree ("_parent_id");
  CREATE INDEX "footer_legal_links_link_idx" ON "footer_legal_links" USING btree ("link_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_media_block" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta_buttons" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header_nav_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "header" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_columns" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_social_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer_legal_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "footer" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_media_block" CASCADE;
  DROP TABLE "pages_blocks_cta_buttons" CASCADE;
  DROP TABLE "pages_blocks_cta" CASCADE;
  DROP TABLE "header_nav_items" CASCADE;
  DROP TABLE "header" CASCADE;
  DROP TABLE "footer_columns_links" CASCADE;
  DROP TABLE "footer_columns" CASCADE;
  DROP TABLE "footer_social_links" CASCADE;
  DROP TABLE "footer_legal_links" CASCADE;
  DROP TABLE "footer" CASCADE;
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "type" DROP NOT NULL;
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "heading" DROP NOT NULL;
  ALTER TABLE "pages_blocks_content" ALTER COLUMN "content" DROP NOT NULL;
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "subheading";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "cta_show";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "cta_label";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "cta_link";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "cta_style";
  ALTER TABLE "pages_blocks_content" DROP COLUMN "layout";
  ALTER TABLE "pages_blocks_content" DROP COLUMN "background_color";
  ALTER TABLE "pages" DROP COLUMN "description";
  ALTER TABLE "pages" DROP COLUMN "is_home";
  DROP TYPE "public"."enum_pages_blocks_hero_cta_style";
  DROP TYPE "public"."enum_pages_blocks_content_layout";
  DROP TYPE "public"."enum_pages_blocks_content_background_color";
  DROP TYPE "public"."enum_pages_blocks_media_block_size";
  DROP TYPE "public"."enum_pages_blocks_media_block_position";
  DROP TYPE "public"."enum_pages_blocks_cta_buttons_style";
  DROP TYPE "public"."enum_pages_blocks_cta_background_color";
  DROP TYPE "public"."enum_footer_social_links_platform";`)
}
