-- CHECK_USERS.sql
-- This script checks what users exist in the database

-- Step 1: Check all users
SELECT '=== ALL USERS ===' as step;
SELECT 
    id, 
    username, 
    email, 
    role,
    password_hash
FROM users 
ORDER BY id;

-- Step 2: Check if admin user exists
SELECT '=== ADMIN USER CHECK ===' as step;
SELECT 
    id, 
    username, 
    email, 
    role
FROM users 
WHERE username = 'admin';

-- Step 3: Check user count by role
SELECT '=== USERS BY ROLE ===' as step;
SELECT 
    role, 
    COUNT(*) as count
FROM users 
GROUP BY role
ORDER BY role;

-- Step 4: Test admin login credentials
SELECT '=== TESTING ADMIN LOGIN ===' as step;
SELECT 
    id, 
    username, 
    email, 
    role,
    CASE 
        WHEN password_hash = 'admin123' THEN 'PASSWORD_MATCHES'
        ELSE 'PASSWORD_DOES_NOT_MATCH'
    END as password_status
FROM users 
WHERE username = 'admin';

SELECT '=== CHECK COMPLETE ===' as final_status; 