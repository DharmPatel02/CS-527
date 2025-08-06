-- DEEP DIAGNOSTIC CHECK
-- This script will identify the exact cause of the user creation issue

-- Query 1: Check the definition of the user_role ENUM type
SELECT '=== CHECKING USER_ROLE ENUM ===' as section;
SELECT 
    t.typname AS enum_type_name,
    e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'user_role'
ORDER BY e.enumsortorder;

-- Query 2: Check the exact schema of the 'users' table, focusing on the 'role' column
SELECT '=== CHECKING USERS TABLE SCHEMA ===' as section;
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    udt_name,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'users' 
ORDER BY ordinal_position;

-- Query 3: Check if RLS is enabled on the users table
SELECT '=== CHECKING RLS STATUS ===' as section;
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'users';

-- Query 4: Check for any existing policies on the users table
SELECT '=== CHECKING RLS POLICIES ===' as section;
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'users';

-- Query 5: Show existing users
SELECT '=== EXISTING USERS ===' as section;
SELECT id, username, email, role, pg_typeof(role) as role_type FROM users ORDER BY id;

-- Query 6: Test direct user insertion with different approaches
SELECT '=== TESTING USER INSERTION ===' as section;

-- Test 1: Try inserting with explicit enum cast
DO $$
BEGIN
    INSERT INTO users (username, password_hash, email, role) 
    VALUES ('test_user_1', 'test_hash', 'test1@test.com', 'BUYER'::user_role);
    RAISE NOTICE 'Test 1 - Explicit cast: SUCCESS';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test 1 - Explicit cast: FAILED - %', SQLERRM;
END $$;

-- Test 2: Try inserting without cast
DO $$
BEGIN
    INSERT INTO users (username, password_hash, email, role) 
    VALUES ('test_user_2', 'test_hash', 'test2@test.com', 'BUYER');
    RAISE NOTICE 'Test 2 - No cast: SUCCESS';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test 2 - No cast: FAILED - %', SQLERRM;
END $$;

-- Test 3: Check what happens with invalid enum value
DO $$
BEGIN
    INSERT INTO users (username, password_hash, email, role) 
    VALUES ('test_user_3', 'test_hash', 'test3@test.com', 'INVALID_ROLE');
    RAISE NOTICE 'Test 3 - Invalid role: SUCCESS';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Test 3 - Invalid role: FAILED - %', SQLERRM;
END $$;

-- Clean up test users
DELETE FROM users WHERE username IN ('test_user_1', 'test_user_2', 'test_user_3');

-- Query 7: Check backend connection and permissions
SELECT '=== CHECKING PERMISSIONS ===' as section;
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'users' 
  AND grantee IN ('postgres', 'authenticated', 'anon');

-- Query 8: Check sequences
SELECT '=== CHECKING SEQUENCES ===' as section;
SELECT 
    sequence_name,
    data_type,
    start_value,
    increment
FROM information_schema.sequences 
WHERE sequence_schema = 'public' 
  AND sequence_name LIKE '%users%';

SELECT '=== DIAGNOSTIC COMPLETE ===' as final_status; 