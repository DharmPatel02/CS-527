-- FIX_AUCTION_UPLOAD_CORRECTED.sql
-- This script fixes the auction upload issues by adding the missing category column

-- Step 1: Check current state
SELECT '=== CURRENT STATE ===' as step;
SELECT table_name, column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'auction_items' 
ORDER BY ordinal_position;

-- Step 2: Create the category enum type
SELECT '=== CREATING CATEGORY ENUM ===' as step;

-- Drop the old enum type if it exists
DROP TYPE IF EXISTS item_category CASCADE;

-- Create the correct enum type matching the Java Category enum
CREATE TYPE item_category AS ENUM ('car', 'bike', 'truck');

-- Step 3: Add the missing category column
SELECT '=== ADDING CATEGORY COLUMN ===' as step;

-- Add the category column to auction_items table
ALTER TABLE auction_items 
ADD COLUMN category item_category;

-- Step 4: Set default value for existing records
UPDATE auction_items 
SET category = 'car' 
WHERE category IS NULL;

-- Step 5: Make category column NOT NULL
ALTER TABLE auction_items 
ALTER COLUMN category SET NOT NULL;

-- Step 6: Verify the fix
SELECT '=== VERIFICATION ===' as step;
SELECT table_name, column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'auction_items' AND column_name = 'category';

-- Step 7: Check enum values
SELECT '=== ENUM VALUES ===' as step;
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