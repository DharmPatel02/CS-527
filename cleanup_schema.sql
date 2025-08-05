-- Cleanup script to fix duplicate tables and enable RLS properly
-- Run this first in Supabase SQL Editor

-- Drop duplicate/conflicting tables
DROP TABLE IF EXISTS auction_end_subscriptions CASCADE;
DROP TABLE IF EXISTS auction_start_subscriptions CASCADE;

-- Drop existing tables to start fresh
DROP TABLE IF EXISTS auction_end_subscription CASCADE;
DROP TABLE IF EXISTS auction_start_subscription CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS auction_questions CASCADE;
DROP TABLE IF EXISTS auction_images CASCADE;
DROP TABLE IF EXISTS auction_items CASCADE;
DROP TABLE IF EXISTS user_details CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS item_category CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS is_admin() CASCADE;

-- Drop existing policies (if any exist)
-- Note: Policies are automatically dropped when tables are dropped 