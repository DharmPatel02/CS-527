-- FIX_AUCTION_UPLOAD.sql
-- This script fixes the auction upload issues

-- Step 1: Check current state
SELECT '=== CURRENT STATE ===' as step;
SELECT table_name, column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'auction_items' 
ORDER BY ordinal_position;

-- Step 2: Fix the category enum mapping
SELECT '=== FIXING CATEGORY ENUM ===' as step;

-- Drop the old enum type if it exists
DROP TYPE IF EXISTS item_category CASCADE;

-- Create the correct enum type matching the Java Category enum
CREATE TYPE item_category AS ENUM ('car', 'bike', 'truck');

-- Step 3: Update the auction_items table category column
ALTER TABLE auction_items 
ALTER COLUMN category TYPE item_category 
USING category::text::item_category;

-- Step 4: Verify the fix
SELECT '=== VERIFICATION ===' as step;
SELECT table_name, column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'auction_items' AND column_name = 'category';

-- Step 5: Check enum values
SELECT '=== ENUM VALUES ===' as step;
SELECT 
    t.typname AS enum_type_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'item_category'
ORDER BY e.enumsortorder;

-- Step 6: Test auction creation
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