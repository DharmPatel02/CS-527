-- FIX_ROLE_COLUMN_CONFLICT.sql
-- This script fixes the duplicate role column issue

-- Step 1: Check current state
SELECT '=== CURRENT STATE ===' as step;
SELECT table_name, column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE column_name = 'role' 
ORDER BY table_name, ordinal_position;

-- Step 2: Drop the varchar role column (if it exists)
SELECT '=== FIXING ROLE COLUMN ===' as step;

-- First, let's see which table has the varchar role column
SELECT table_name, column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE column_name = 'role' AND data_type = 'character varying';

-- Drop the varchar role column from users table
ALTER TABLE users DROP COLUMN IF EXISTS role;

-- Step 3: Recreate the role column with proper enum type
ALTER TABLE users ADD COLUMN role user_role NOT NULL DEFAULT 'BUYER';

-- Step 4: Verify the fix
SELECT '=== VERIFICATION ===' as step;
SELECT table_name, column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE column_name = 'role' 
ORDER BY table_name, ordinal_position;

-- Step 5: Test user creation
SELECT '=== TESTING USER CREATION ===' as step;
INSERT INTO users (username, password_hash, email, role) 
VALUES ('test_fix_user', 'test123', 'fix@test.com', 'BUYER')
RETURNING id, username, email, role;

-- Clean up test user
DELETE FROM users WHERE username = 'test_fix_user';

SELECT '=== FIX COMPLETE ===' as final_status; 