-- QUICK FIX FOR TYPE MISMATCH
-- This fixes the user_role enum type issue

-- Step 1: Check current state
SELECT 'Current database state:' as info;
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 2: Drop and recreate the user_role enum with proper values
DROP TYPE IF EXISTS user_role CASCADE;

-- Create the enum with the exact values the backend expects
CREATE TYPE user_role AS ENUM ('ADMIN', 'BUYER', 'CUSTOMER_REP', 'SELLER');

-- Step 3: Update the users table to use the new enum
ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;

-- Step 4: Verify the fix
SELECT 'After fix:' as info;
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 5: Test user creation
INSERT INTO users (username, password_hash, email, role) 
VALUES ('test_fix_user', 'test_hash', 'test@fix.com', 'BUYER'::user_role);

SELECT id, username, email, role FROM users WHERE username = 'test_fix_user';

-- Clean up test user
DELETE FROM users WHERE username = 'test_fix_user';

SELECT 'Type mismatch fix completed!' as status; 