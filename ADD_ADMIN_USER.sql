-- ADD_ADMIN_USER.sql
-- This script adds an admin user to the database

-- Step 1: Check if admin user already exists
SELECT 'Checking for existing admin user...' as status;
SELECT id, username, email, role FROM users WHERE username = 'admin';

-- Step 2: Add admin user (if not exists)
INSERT INTO users (username, password_hash, email, role) 
VALUES ('admin', 'admin123', 'admin@auction.com', 'ADMIN')
ON CONFLICT (username) DO NOTHING;

-- Step 3: Verify admin user was created
SELECT 'Admin user created successfully!' as status;
SELECT id, username, email, role FROM users WHERE username = 'admin';

-- Step 4: Show all users in database
SELECT 'All users in database:' as status;
SELECT id, username, email, role FROM users ORDER BY id; 