DROP INDEX "products_selling_mode_idx";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "selling_mode";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "bulk_stock_quantity";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "price_per_unit";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "compare_at_price_per_unit";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "minimum_order_quantity";--> statement-breakpoint
DROP TYPE "public"."selling_mode";