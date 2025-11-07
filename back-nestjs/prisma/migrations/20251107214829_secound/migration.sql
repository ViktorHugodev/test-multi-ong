/*
  Warnings:

  - The values [PENDING,PAYMENT_PROCESSING,PAYMENT_FAILED,CONFIRMED,PROCESSING,SHIPPED,DELIVERED,CANCELLED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [ADMIN,ONG_MANAGER,ONG_STAFF,CUSTOMER] on the enum `UserRole` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `shipping_cost` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `cancelled_at` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `confirmed_at` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `payment_details` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `ai_interpretation` on the `search_logs` table. All the data in the column will be lost.
  - You are about to drop the column `latency_ms` on the `search_logs` table. All the data in the column will be lost.
  - You are about to drop the column `search_query` on the `search_logs` table. All the data in the column will be lost.
  - You are about to drop the column `user_id` on the `search_logs` table. All the data in the column will be lost.
  - You are about to drop the column `email_verified_at` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `last_login_at` on the `users` table. All the data in the column will be lost.
  - Made the column `payment_method` on table `orders` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `latency` to the `search_logs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `query` to the `search_logs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('pending', 'payment_processing', 'confirmed', 'failed', 'cancelled');
ALTER TABLE "public"."orders" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "orders" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "UserRole_new" AS ENUM ('admin', 'ong_manager', 'ong_staff', 'customer');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "UserRole_new" USING ("role"::text::"UserRole_new");
ALTER TYPE "UserRole" RENAME TO "UserRole_old";
ALTER TYPE "UserRole_new" RENAME TO "UserRole";
DROP TYPE "public"."UserRole_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_order_id_fkey";

-- DropIndex
DROP INDEX "orders_created_at_idx";

-- DropIndex
DROP INDEX "products_organization_id_sku_key";

-- DropIndex
DROP INDEX "search_logs_ai_success_idx";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "shipping_cost";

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "cancelled_at",
DROP COLUMN "confirmed_at",
DROP COLUMN "notes",
DROP COLUMN "payment_details",
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "paid_at" TIMESTAMP(3),
ADD COLUMN     "transaction_id" TEXT,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "shipping_cost" DROP NOT NULL,
ALTER COLUMN "shipping_cost" DROP DEFAULT,
ALTER COLUMN "shipping_details" DROP NOT NULL,
ALTER COLUMN "payment_method" SET NOT NULL;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "search_logs" DROP COLUMN "ai_interpretation",
DROP COLUMN "latency_ms",
DROP COLUMN "search_query",
DROP COLUMN "user_id",
ADD COLUMN     "filters" JSONB,
ADD COLUMN     "latency" INTEGER NOT NULL,
ADD COLUMN     "query" TEXT NOT NULL,
ALTER COLUMN "results_count" DROP DEFAULT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email_verified_at",
DROP COLUMN "last_login_at",
ALTER COLUMN "role" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
