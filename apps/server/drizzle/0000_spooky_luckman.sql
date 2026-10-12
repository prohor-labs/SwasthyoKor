CREATE TABLE "cart_items" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"cart_id" varchar(255) NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"variant_id" varchar(255) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collections" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"handle" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"seo_title" varchar(255),
	"seo_description" text,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "collections_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "menus" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"handle" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"path" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255),
	"total_amount" real NOT NULL,
	"total_currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"status" varchar(50) DEFAULT 'confirmed' NOT NULL,
	"items" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"handle" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"body" text NOT NULL,
	"body_summary" text DEFAULT '' NOT NULL,
	"seo_title" varchar(255),
	"seo_description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "pages_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
CREATE TABLE "product_collections" (
	"product_id" varchar(255) NOT NULL,
	"collection_id" varchar(255) NOT NULL,
	CONSTRAINT "product_collections_product_id_collection_id_pk" PRIMARY KEY("product_id","collection_id")
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"alt_text" text NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_options" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"values" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"price_amount" real NOT NULL,
	"price_currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"available_for_sale" boolean DEFAULT true NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"selected_options" jsonb DEFAULT '[]'::jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"handle" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"description_html" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"available_for_sale" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "products_handle_unique" UNIQUE("handle")
);
--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_variant_id_product_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_collections" ADD CONSTRAINT "product_collections_collection_id_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collections"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cart_items_cart_idx" ON "cart_items" USING btree ("cart_id");--> statement-breakpoint
CREATE INDEX "cart_items_variant_idx" ON "cart_items" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "collections_handle_idx" ON "collections" USING btree ("handle");--> statement-breakpoint
CREATE INDEX "menus_handle_idx" ON "menus" USING btree ("handle");--> statement-breakpoint
CREATE INDEX "pages_handle_idx" ON "pages" USING btree ("handle");--> statement-breakpoint
CREATE INDEX "product_collections_collection_idx" ON "product_collections" USING btree ("collection_id");--> statement-breakpoint
CREATE INDEX "product_collections_product_idx" ON "product_collections" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_images_product_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_options_product_idx" ON "product_options" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_variants_product_idx" ON "product_variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "products_handle_idx" ON "products" USING btree ("handle");