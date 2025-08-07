-- TEST_AUCTION_UPLOAD.sql
-- This script tests auction upload functionality

-- Step 1: Check if we have any existing auction items
SELECT '=== EXISTING AUCTION ITEMS ===' as step;
SELECT 
    id, 
    auction_id, 
    seller_id, 
    item_name, 
    category, 
    starting_price,
    current_bid,
    closing_time
FROM auction_items 
ORDER BY id;

-- Step 2: Check if we have any users (sellers)
SELECT '=== AVAILABLE USERS ===' as step;
SELECT 
    id, 
    username, 
    email, 
    role
FROM users 
WHERE role = 'SELLER' OR role = 'ADMIN'
ORDER BY id;

-- Step 3: Test creating an auction item
SELECT '=== TESTING AUCTION CREATION ===' as step;

-- Insert a test auction item
INSERT INTO auction_items (
    auction_id, 
    seller_id, 
    item_name, 
    category, 
    starting_price, 
    bid_increment, 
    closing_time, 
    description, 
    current_bid, 
    min_price,
    start_time
) VALUES (
    1001, 
    1, 
    'Test Honda Civic', 
    'car', 
    5000.0, 
    100.0, 
    NOW() + INTERVAL '7 days', 
    'A beautiful Honda Civic for testing', 
    5000.0, 
    4500.0,
    NOW()
) RETURNING id, auction_id, item_name, category, starting_price;

-- Step 4: Verify the created auction
SELECT '=== VERIFYING CREATED AUCTION ===' as step;
SELECT 
    id, 
    auction_id, 
    seller_id, 
    item_name, 
    category, 
    starting_price,
    current_bid,
    closing_time,
    start_time
FROM auction_items 
WHERE auction_id = 1001;

-- Step 5: Test with different categories
SELECT '=== TESTING DIFFERENT CATEGORIES ===' as step;

-- Test bike category
INSERT INTO auction_items (
    auction_id, 
    seller_id, 
    item_name, 
    category, 
    starting_price, 
    bid_increment, 
    closing_time, 
    description, 
    current_bid, 
    min_price,
    start_time
) VALUES (
    1002, 
    1, 
    'Test Yamaha R1', 
    'bike', 
    8000.0, 
    200.0, 
    NOW() + INTERVAL '5 days', 
    'A powerful Yamaha R1 motorcycle', 
    8000.0, 
    7200.0,
    NOW()
) RETURNING id, auction_id, item_name, category;

-- Test truck category
INSERT INTO auction_items (
    auction_id, 
    seller_id, 
    item_name, 
    category, 
    starting_price, 
    bid_increment, 
    closing_time, 
    description, 
    current_bid, 
    min_price,
    start_time
) VALUES (
    1003, 
    1, 
    'Test Ford F-150', 
    'truck', 
    15000.0, 
    500.0, 
    NOW() + INTERVAL '10 days', 
    'A reliable Ford F-150 truck', 
    15000.0, 
    13500.0,
    NOW()
) RETURNING id, auction_id, item_name, category;

-- Step 6: Show all test auctions
SELECT '=== ALL TEST AUCTIONS ===' as step;
SELECT 
    id, 
    auction_id, 
    seller_id, 
    item_name, 
    category, 
    starting_price,
    current_bid,
    closing_time
FROM auction_items 
WHERE auction_id IN (1001, 1002, 1003)
ORDER BY auction_id;

-- Step 7: Clean up test data
SELECT '=== CLEANING UP TEST DATA ===' as step;
DELETE FROM auction_items WHERE auction_id IN (1001, 1002, 1003);

SELECT '=== TEST COMPLETE ===' as final_status; 