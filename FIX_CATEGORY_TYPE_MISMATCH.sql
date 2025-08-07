-- FIX_CATEGORY_TYPE_MISMATCH.sql
-- This script fixes the category column type mismatch

-- Step 1: Check current state
SELECT '=== CURRENT STATE ===' as step;
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'auction_items' AND column_name = 'category';

-- Step 2: Backup existing data
SELECT '=== BACKING UP DATA ===' as step;
SELECT id, auction_id, item_name, category::text as category_text 
FROM auction_items 
WHERE category IS NOT NULL;

-- Step 3: Change column type to VARCHAR
SELECT '=== FIXING COLUMN TYPE ===' as step;

-- Change the category column from enum to VARCHAR
ALTER TABLE auction_items 
ALTER COLUMN category TYPE VARCHAR(20) 
USING category::text;

-- Step 4: Verify the fix
SELECT '=== VERIFICATION ===' as step;
SELECT 
    column_name, 
    data_type, 
    udt_name,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'auction_items' AND column_name = 'category';

-- Step 5: Test auction creation
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