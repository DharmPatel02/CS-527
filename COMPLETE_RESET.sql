-- COMPLETE_RESET.sql
-- This script completely resets the database to start fresh

-- Step 1: Drop all tables in the correct order
SELECT '=== DROPPING ALL TABLES ===' as step;

-- Drop tables that depend on other tables first
DROP TABLE IF EXISTS auction_images CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS questions CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS auction_end_subscription CASCADE;
DROP TABLE IF EXISTS auction_start_subscription CASCADE;
DROP TABLE IF EXISTS user_details CASCADE;

-- Drop main tables
DROP TABLE IF EXISTS auction_items CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Step 2: Drop all enum types
SELECT '=== DROPPING ENUM TYPES ===' as step;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS item_category CASCADE;

-- Step 3: Drop all functions
SELECT '=== DROPPING FUNCTIONS ===' as step;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 4: Verify everything is dropped
SELECT '=== VERIFYING CLEAN STATE ===' as step;
SELECT 
    table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

SELECT 
    typname 
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
  AND typtype = 'e'
ORDER BY typname;

SELECT '=== RESET COMPLETE ===' as final_status; 