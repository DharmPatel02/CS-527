-- Debug Signup Issues
-- This script checks current RLS policies and tests user creation

-- Check current RLS policies on users table
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Check if RLS is enabled on users table
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- Check current users in the table
SELECT id, username, email, role FROM users LIMIT 5;

-- Test if we can insert a user (this should work if RLS is properly configured)
-- Note: This will fail if RLS is blocking, which is what we want to confirm
INSERT INTO users (username, password_hash, email, role) 
VALUES ('test_user_' || EXTRACT(EPOCH FROM NOW())::text, 'test_hash', 'test@test.com', 'BUYER')
ON CONFLICT (username) DO NOTHING;

-- Check if the test user was created
SELECT id, username, email, role FROM users WHERE username LIKE 'test_user_%';

-- Clean up test user
DELETE FROM users WHERE username LIKE 'test_user_%';

SELECT 'Debug completed - check results above' as status; 