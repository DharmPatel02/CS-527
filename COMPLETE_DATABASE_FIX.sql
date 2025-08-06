-- COMPLETE DATABASE FIX
-- This script ensures the database matches the backend entities exactly

-- Step 1: Check current state
SELECT '=== CURRENT DATABASE STATE ===' as info;

-- Check what tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check users table structure
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Step 2: Drop everything and start fresh
SELECT '=== DROPPING EXISTING SCHEMA ===' as info;

-- Drop all policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Allow user registration" ON users;
DROP POLICY IF EXISTS "Backend can manage users" ON users;
DROP POLICY IF EXISTS "Backend full access" ON users;

-- Drop all tables
DROP TABLE IF EXISTS auction_end_subscription CASCADE;
DROP TABLE IF EXISTS auction_start_subscription CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS bids CASCADE;
DROP TABLE IF EXISTS auction_questions CASCADE;
DROP TABLE IF EXISTS auction_images CASCADE;
DROP TABLE IF EXISTS auction_items CASCADE;
DROP TABLE IF EXISTS user_details CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS item_category CASCADE;

-- Step 3: Create fresh schema
SELECT '=== CREATING FRESH SCHEMA ===' as info;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('ADMIN', 'BUYER', 'CUSTOMER_REP', 'SELLER');
CREATE TYPE item_category AS ENUM ('bike', 'car', 'truck');

-- Create users table with EXACT backend entity mapping
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user_details table
CREATE TABLE user_details (
    username VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    address VARCHAR(255),
    phone_number VARCHAR(255),
    FOREIGN KEY (username) REFERENCES users(username)
);

-- Create auction_items table
CREATE TABLE auction_items (
    id BIGSERIAL PRIMARY KEY,
    auction_id INTEGER UNIQUE,
    seller_id INTEGER,
    item_name VARCHAR(255),
    category item_category,
    starting_price DOUBLE PRECISION,
    bid_increment DOUBLE PRECISION,
    closing_time TIMESTAMP,
    description VARCHAR(255),
    current_bid DOUBLE PRECISION,
    start_time TIMESTAMP,
    min_price DOUBLE PRECISION,
    buyer_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create auction_images table
CREATE TABLE auction_images (
    id BIGSERIAL PRIMARY KEY,
    auction_item_id BIGINT,
    image_data BYTEA,
    image_mime VARCHAR(50),
    image_url VARCHAR(255),
    FOREIGN KEY (auction_item_id) REFERENCES auction_items(id)
);

-- Create auction_questions table
CREATE TABLE auction_questions (
    question_id SERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    FOREIGN KEY (auction_id) REFERENCES auction_items(auction_id) ON DELETE CASCADE
);

-- Create bids table
CREATE TABLE bids (
    bid_id BIGSERIAL PRIMARY KEY,
    auction_item_id BIGINT NOT NULL,
    buyer_id INTEGER NOT NULL,
    bid_time TIMESTAMP NOT NULL,
    bid_amount DOUBLE PRECISION NOT NULL,
    reserve_price DOUBLE PRECISION NOT NULL,
    FOREIGN KEY (auction_item_id) REFERENCES auction_items(id) ON DELETE CASCADE
);

-- Create notifications table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    message TEXT,
    timestamp TIMESTAMP,
    user_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE
);

-- Create auction_start_subscription table
CREATE TABLE auction_start_subscription (
    id BIGSERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL,
    auction_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    triggered BOOLEAN DEFAULT FALSE
);

-- Create auction_end_subscription table
CREATE TABLE auction_end_subscription (
    id BIGSERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL,
    closing_time TIMESTAMP,
    triggered BOOLEAN DEFAULT FALSE
);

-- Step 4: Create indexes and constraints
CREATE INDEX idx_auction_id ON auction_questions(auction_id);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

ALTER TABLE auction_items ADD CONSTRAINT chk_positive_prices
    CHECK (starting_price >= 0 AND current_bid >= 0);

ALTER TABLE bids ADD CONSTRAINT chk_positive_bid
    CHECK (bid_amount > 0 AND reserve_price >= 0);

-- Step 5: Create triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_auction_items_updated_at BEFORE UPDATE ON auction_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Step 7: Disable RLS
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_start_subscription DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_end_subscription DISABLE ROW LEVEL SECURITY;

-- Step 8: Test user creation
SELECT '=== TESTING USER CREATION ===' as info;

INSERT INTO users (username, password_hash, email, role) 
VALUES ('test_user_1', 'test_hash_1', 'test1@test.com', 'BUYER');

INSERT INTO users (username, password_hash, email, role) 
VALUES ('test_user_2', 'test_hash_2', 'test2@test.com', 'SELLER');

INSERT INTO users (username, password_hash, email, role) 
VALUES ('admin', 'admin123', 'admin@auction.com', 'ADMIN');

-- Step 9: Verify
SELECT '=== VERIFICATION ===' as info;
SELECT id, username, email, role FROM users ORDER BY id;

SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Clean up test users
DELETE FROM users WHERE username IN ('test_user_1', 'test_user_2');

SELECT 'COMPLETE DATABASE FIX FINISHED - User creation should now work!' as final_status; 