-- Temporarily Disable RLS to Test User Creation
-- This will help us determine if RLS is the issue

-- Disable RLS on all tables
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_start_subscription DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_end_subscription DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Test user creation
INSERT INTO users (username, password_hash, email, role) 
VALUES ('test_no_rls_user', 'test_hash', 'test@norls.com', 'BUYER')
ON CONFLICT (username) DO NOTHING;

SELECT id, username, email, role FROM users WHERE username = 'test_no_rls_user';

DELETE FROM users WHERE username = 'test_no_rls_user';

SELECT 'RLS temporarily disabled - test user creation now' as status; 