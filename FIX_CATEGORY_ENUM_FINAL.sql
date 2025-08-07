-- FIX_CATEGORY_ENUM_FINAL.sql
-- This script fixes the category enum to match the Java Category enum

-- Step 1: Check current state
SELECT '=== CURRENT STATE ===' as step;
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_name = 'auction_items' 
  AND column_name = 'category';

-- Step 2: Check current enum values
SELECT '=== CURRENT ENUM VALUES ===' as step;
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

-- Step 3: Backup existing category values
SELECT '=== BACKING UP CATEGORY VALUES ===' as step;
SELECT id, auction_id, item_name, category::text as category_text 
FROM auction_items 
WHERE category IS NOT NULL;

-- Step 4: Fix the enum type
SELECT '=== FIXING ENUM TYPE ===' as step;

-- Get the current enum type name
DO $$
DECLARE
    current_enum_name text;
BEGIN
    -- Get the current enum type name
    SELECT udt_name INTO current_enum_name
    FROM information_schema.columns 
    WHERE table_name = 'auction_items' 
      AND column_name = 'category';
    
    RAISE NOTICE 'Current enum type: %', current_enum_name;
    
    -- Drop the old enum type and recreate it
    EXECUTE 'DROP TYPE IF EXISTS ' || current_enum_name || ' CASCADE';
    
    -- Create the correct enum type matching Java Category enum
    CREATE TYPE item_category AS ENUM ('car', 'bike', 'truck');
    
    RAISE NOTICE 'Created new enum type: item_category';
END $$;

-- Step 5: Update the category column to use the new enum
ALTER TABLE auction_items 
ALTER COLUMN category TYPE item_category 
USING category::text::item_category;

-- Step 6: Verify the fix
SELECT '=== VERIFICATION ===' as step;
SELECT 
    column_name, 
    data_type, 
    udt_name
FROM information_schema.columns 
WHERE table_name = 'auction_items' 
  AND column_name = 'category';

-- Step 7: Check new enum values
SELECT '=== NEW ENUM VALUES ===' as step;
SELECT 
    t.typname AS enum_type_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'item_category'
ORDER BY e.enumsortorder;

-- Step 8: Test auction creation
SELECT '=== TESTING AUCTION CREATION ===' as step;

-- Insert a test auction item
INSERT INTO auction_items (
    auction_id, seller_id, item_name, category, starting_price, 
    bid_increment, closing_time, description, current_bid, min_price
) VALUES (
    999, 1, 'Test Car', 'car', 1000.0, 50.0, 
    NOW() + INTERVAL '1 day', 'Test description', 1000.0, 1100.0
) RETURNING id, auction_id, item_name, category;

-- Clean up test data
DELETE FROM auction_items WHERE auction_id = 999;

SELECT '=== FIX COMPLETE ===' as final_status; 