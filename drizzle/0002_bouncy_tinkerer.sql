CREATE TYPE "public"."product_unit_type" AS ENUM('packet', 'jar', 'bottle', 'piece', 'box', 'kg', 'gram', 'litre', 'ml');--> statement-breakpoint
CREATE TYPE "public"."selling_mode" AS ENUM('packaged', 'gram', 'piece');--> statement-breakpoint
ALTER TABLE "user_addresses" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "user_addresses" CASCADE;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "in_article_image_url" text;--> statement-breakpoint
ALTER TABLE "blogs" ADD COLUMN "in_article_image_caption" text;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "subtitle" text;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "image" text;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "show_on_homepage" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "collections" ADD COLUMN "max_products" integer DEFAULT 4 NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "phone" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_name" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shipping_address" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method" varchar(50) DEFAULT 'online' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_status" varchar(50) DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_invoice_id" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_trx_id" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_sender_number" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "coupon_code" varchar(50);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "discount_amount" real DEFAULT 0;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "inventory_quantity" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "unit" "product_unit_type" DEFAULT 'packet' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "selling_mode" "selling_mode" DEFAULT 'packaged' NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "bulk_stock_quantity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "price_per_unit" real;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "compare_at_price_per_unit" real;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "minimum_order_quantity" integer DEFAULT 100 NOT NULL;--> statement-breakpoint
CREATE INDEX "collections_homepage_idx" ON "collections" USING btree ("show_on_homepage");--> statement-breakpoint
CREATE INDEX "orders_payment_invoice_idx" ON "orders" USING btree ("payment_invoice_id");--> statement-breakpoint
CREATE INDEX "products_selling_mode_idx" ON "products" USING btree ("selling_mode");