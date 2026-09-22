CREATE TABLE "accounts" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"provider_account_id" varchar(255),
	"provider_username" varchar(255),
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "blogs" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"slug" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text NOT NULL,
	"content" text NOT NULL,
	"category" varchar(100) DEFAULT 'মধু ও পুষ্টি' NOT NULL,
	"read_time" varchar(50) DEFAULT '৫ মিনিট' NOT NULL,
	"author" varchar(100) DEFAULT 'স্বাস্থ্যকর নিউট্রিশন টিম' NOT NULL,
	"cover_image" text NOT NULL,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"faqs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"related_product_handles" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "blogs_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "coupons" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"code" varchar(50) NOT NULL,
	"discount_type" varchar(20) DEFAULT 'percentage' NOT NULL,
	"discount_value" real NOT NULL,
	"min_order_amount" real DEFAULT 0 NOT NULL,
	"max_discount_amount" real,
	"usage_limit" integer,
	"used_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "coupons_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "hero_banners" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"highlight" varchar(255) NOT NULL,
	"subtitle" text NOT NULL,
	"link" text DEFAULT '/search' NOT NULL,
	"accent_color" varchar(50) DEFAULT 'text-amber-400' NOT NULL,
	"image" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "magic_link_tokens" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"token" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "magic_link_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "product_reviews" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"product_id" varchar(255) NOT NULL,
	"user_id" varchar(255),
	"user_name" varchar(255) NOT NULL,
	"user_avatar" text,
	"rating" integer DEFAULT 5 NOT NULL,
	"comment" text NOT NULL,
	"approved" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"token" text NOT NULL,
	"ip_address" varchar(100),
	"user_agent" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "store_settings" (
	"id" varchar(50) PRIMARY KEY DEFAULT 'default' NOT NULL,
	"store_name" varchar(255) DEFAULT 'স্বাস্থ্যকর' NOT NULL,
	"store_phone" varchar(50) DEFAULT '01812345678' NOT NULL,
	"whatsapp_number" varchar(50) DEFAULT '8801812345678' NOT NULL,
	"store_email" varchar(255) DEFAULT 'support@swasthyokor.com' NOT NULL,
	"store_address" text DEFAULT 'ঢাকা, বাংলাদেশ' NOT NULL,
	"inside_dhaka_fee" real DEFAULT 60 NOT NULL,
	"outside_dhaka_fee" real DEFAULT 120 NOT NULL,
	"free_shipping_min_amount" real DEFAULT 1500 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_addresses" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"label" varchar(100) DEFAULT 'বাসা / Home' NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"district" varchar(100) NOT NULL,
	"thana" varchar(100) NOT NULL,
	"street_address" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"avatar_url" text,
	"phone" varchar(50),
	"is_banned" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "total_currency" SET DEFAULT 'BDT';--> statement-breakpoint
ALTER TABLE "product_variants" ALTER COLUMN "price_currency" SET DEFAULT 'BDT';--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "compare_at_price" real;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_addresses" ADD CONSTRAINT "user_addresses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "accounts_user_idx" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "accounts_provider_account_idx" ON "accounts" USING btree ("provider","provider_account_id");--> statement-breakpoint
CREATE INDEX "blogs_slug_idx" ON "blogs" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "blogs_published_created_at_idx" ON "blogs" USING btree ("published","created_at");--> statement-breakpoint
CREATE INDEX "blogs_category_idx" ON "blogs" USING btree ("category");--> statement-breakpoint
CREATE INDEX "coupons_code_idx" ON "coupons" USING btree ("code");--> statement-breakpoint
CREATE INDEX "hero_banners_active_position_idx" ON "hero_banners" USING btree ("active","position");--> statement-breakpoint
CREATE INDEX "magic_link_email_idx" ON "magic_link_tokens" USING btree ("email");--> statement-breakpoint
CREATE INDEX "magic_link_token_idx" ON "magic_link_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "product_reviews_product_idx" ON "product_reviews" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "product_reviews_user_idx" ON "product_reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_user_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sessions_token_idx" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "user_addresses_user_idx" ON "user_addresses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "cart_items_product_idx" ON "cart_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "orders_email_idx" ON "orders" USING btree ("email");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "products_available_idx" ON "products" USING btree ("available_for_sale");