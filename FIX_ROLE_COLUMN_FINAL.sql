-- FIX_ROLE_COLUMN_FINAL.sql
-- This script changes the role column from enum to VARCHAR to fix the mapping issue

-- Step 1: Check current state
SELECT '=== CURRENT STATE ===' as step;
SELECT table_name, column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Step 2: Backup existing role values
SELECT '=== BACKING UP EXISTING ROLES ===' as step;
SELECT id, username, email, role::text as role_text FROM users;

-- Step 3: Change role column from enum to VARCHAR
SELECT '=== CHANGING ROLE COLUMN TYPE ===' as step;

-- First, drop the role column
ALTER TABLE users DROP COLUMN role;

-- Add the role column as VARCHAR
ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'BUYER';

-- Step 4: Update existing users with their roles
UPDATE users SET role = 'ADMIN' WHERE username = 'admin';

-- Step 5: Verify the fix
SELECT '=== VERIFICATION ===' as step;
SELECT table_name, column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'role';

-- Step 6: Test user creation
SELECT '=== TESTING USER CREATION ===' as step;
INSERT INTO users (username, password_hash, email, role) 
VALUES ('test_final_user', 'test123', 'final@test.com', 'BUYER')
RETURNING id, username, email, role;

-- Clean up test user
DELETE FROM users WHERE username = 'test_final_user';

SELECT '=== FIX COMPLETE ===' as final_status; 