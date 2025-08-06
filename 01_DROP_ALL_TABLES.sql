-- 01_DROP_ALL_TABLES.sql
-- This script completely removes all existing database objects

-- Step 1: Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Backend can manage users" ON users;
DROP POLICY IF EXISTS "Backend full access" ON users;
DROP POLICY IF EXISTS "Users can view their own details" ON user_details;
DROP POLICY IF EXISTS "Users can update their own details" ON user_details;
DROP POLICY IF EXISTS "Anyone can view auction items" ON auction_items;
DROP POLICY IF EXISTS "Sellers can create auction items" ON auction_items;
DROP POLICY IF EXISTS "Sellers can update their own auction items" ON auction_items;
DROP POLICY IF EXISTS "Sellers can delete their own auction items" ON auction_items;
DROP POLICY IF EXISTS "Anyone can view auction images" ON auction_images;
DROP POLICY IF EXISTS "Sellers can manage images for their auctions" ON auction_images;
DROP POLICY IF EXISTS "Anyone can view questions" ON auction_questions;
DROP POLICY IF EXISTS "Authenticated users can ask questions" ON auction_questions;
DROP POLICY IF EXISTS "Sellers can answer questions for their auctions" ON auction_questions;
DROP POLICY IF EXISTS "Anyone can view bids" ON bids;
DROP POLICY IF EXISTS "Authenticated users can place bids" ON bids;
DROP POLICY IF EXISTS "Users can only update their own bids" ON bids;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON auction_start_subscription;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON auction_end_subscription;

-- Step 2: Drop ALL tables (CASCADE to remove dependencies)
DROP TABLE IF EXISTS auction_end_subscription CASCADE;
DROP TABLE IF EXISTS auction_start_subscription CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS auction_questions CASCADE;
DROP TABLE IF EXISTS auction_images CASCADE;
DROP TABLE IF EXISTS auction_items CASCADE;
DROP TABLE IF EXISTS user_details CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 3: Drop ALL types and functions
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS item_category CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 4: Verify everything is dropped
SELECT '=== VERIFICATION: ALL TABLES DROPPED ===' as status;

-- Check if any tables remain
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if any types remain
SELECT typname 
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typname IN ('user_role', 'item_category');

SELECT 'DROP COMPLETE - Ready for fresh schema creation!' as final_status; 