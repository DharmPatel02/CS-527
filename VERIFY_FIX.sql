-- VERIFY_FIX.sql
-- This script verifies the fix and identifies any remaining issues

-- Step 1: Check current role column state
SELECT '=== CURRENT ROLE COLUMN STATE ===' as step;
SELECT table_name, column_name, data_type, udt_name, is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Step 2: Check user_role enum values
SELECT '=== USER_ROLE ENUM VALUES ===' as step;
SELECT 
    t.typname AS enum_type_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- Step 3: Check existing users
SELECT '=== EXISTING USERS ===' as step;
SELECT id, username, email, role, pg_typeof(role) as role_type FROM users ORDER BY id;

-- Step 4: Test direct SQL insertion
SELECT '=== TESTING DIRECT SQL INSERTION ===' as step;
INSERT INTO users (username, password_hash, email, role) 
VALUES ('verify_test_user', 'test123', 'verify@test.com', 'BUYER')
RETURNING id, username, email, role;

-- Step 5: Check RLS status
SELECT '=== RLS STATUS ===' as step;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- Step 6: Check RLS policies
SELECT '=== RLS POLICIES ===' as step;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Step 7: Check permissions
SELECT '=== PERMISSIONS ===' as step;
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'users' 
  AND grantee IN ('postgres', 'authenticated', 'anon');

-- Clean up test user
DELETE FROM users WHERE username = 'verify_test_user';

SELECT '=== VERIFICATION COMPLETE ===' as final_status; 