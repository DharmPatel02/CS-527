-- SIMPLE USER TEST
-- Quick test to check user creation

-- Check current users
SELECT 'Current users:' as info;
SELECT id, username, email, role FROM users;

-- Try to create a test user
INSERT INTO users (username, password_hash, email, role) 
VALUES ('test_user_simple', 'test123', 'simple@test.com', 'BUYER')
RETURNING id, username, email, role;

-- Clean up
DELETE FROM users WHERE username = 'test_user_simple';

SELECT 'Test completed!' as status; 