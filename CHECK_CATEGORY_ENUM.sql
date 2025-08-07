-- CHECK_CATEGORY_ENUM.sql
-- This script checks and fixes the category enum type

-- Step 1: Check current category enum type
SELECT '=== CURRENT CATEGORY ENUM ===' as step;
SELECT 
    t.typname AS enum_type_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN (
    SELECT udt_name 
    FROM information_schema.columns 
    WHERE table_name = 'auction_items' 
      AND column_name = 'category'
)
ORDER BY e.enumsortorder;

-- Step 2: Check what enum type the category column is using
SELECT '=== CATEGORY COLUMN TYPE ===' as step;
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_name = 'auction_items' 
  AND column_name = 'category';

-- Step 3: Check all enum types in database
SELECT '=== ALL ENUM TYPES ===' as step;
SELECT 
    t.typname AS enum_type_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
ORDER BY t.typname, e.enumsortorder;

SELECT '=== ENUM CHECK COMPLETE ===' as final_status; 