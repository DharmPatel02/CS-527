-- CHECK_AUCTION_SCHEMA.sql
-- This script checks the current auction_items table schema

-- Step 1: Check current auction_items table structure
SELECT '=== CURRENT AUCTION_ITEMS SCHEMA ===' as step;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    udt_name,
    column_default
FROM information_schema.columns 
WHERE table_name = 'auction_items' 
ORDER BY ordinal_position;

-- Step 2: Check if category column exists
SELECT '=== CHECKING FOR CATEGORY COLUMN ===' as step;
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_name = 'auction_items' 
  AND column_name = 'category';

-- Step 3: Check all enum types in the database
SELECT '=== ALL ENUM TYPES ===' as step;
SELECT 
    t.typname AS enum_type_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
ORDER BY t.typname, e.enumsortorder;

-- Step 4: Check if auction_items table exists
SELECT '=== TABLE EXISTS CHECK ===' as step;
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'auction_items';

SELECT '=== SCHEMA CHECK COMPLETE ===' as final_status; 