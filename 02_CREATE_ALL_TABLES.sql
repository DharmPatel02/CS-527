-- 02_CREATE_ALL_TABLES.sql
-- This script creates all tables in the correct format matching backend entities

-- Step 1: Create ENUM types
CREATE TYPE user_role AS ENUM ('ADMIN', 'BUYER', 'CUSTOMER_REP', 'SELLER');
CREATE TYPE item_category AS ENUM ('bike', 'car', 'truck');

-- Step 2: Create users table (matches Users.java entity exactly)
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create user_details table (matches UserDetails.java entity)
CREATE TABLE user_details (
    username VARCHAR(255) PRIMARY KEY,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    address VARCHAR(255),
    phone_number VARCHAR(255),
    FOREIGN KEY (username) REFERENCES users(username)
);

-- Step 4: Create auction_items table (matches AuctionItems.java entity)
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

-- Step 5: Create auction_images table (matches AuctionImage.java entity)
CREATE TABLE auction_images (
    id BIGSERIAL PRIMARY KEY,
    auction_item_id BIGINT,
    image_data BYTEA,
    image_mime VARCHAR(50),
    image_url VARCHAR(255),
    FOREIGN KEY (auction_item_id) REFERENCES auction_items(id)
);

-- Step 6: Create auction_questions table (matches AuctionQuestions.java entity)
CREATE TABLE auction_questions (
    question_id SERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    FOREIGN KEY (auction_id) REFERENCES auction_items(auction_id) ON DELETE CASCADE
);

-- Step 7: Create bids table (matches Bid.java entity)
CREATE TABLE bids (
    bid_id BIGSERIAL PRIMARY KEY,
    auction_item_id BIGINT NOT NULL,
    buyer_id INTEGER NOT NULL,
    bid_time TIMESTAMP NOT NULL,
    bid_amount DOUBLE PRECISION NOT NULL,
    reserve_price DOUBLE PRECISION NOT NULL,
    FOREIGN KEY (auction_item_id) REFERENCES auction_items(id) ON DELETE CASCADE
);

-- Step 8: Create notifications table (matches Notification.java entity)
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    message TEXT,
    timestamp TIMESTAMP,
    user_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE
);

-- Step 9: Create auction_start_subscription table (matches AuctionStartSubscription.java entity)
CREATE TABLE auction_start_subscription (
    id BIGSERIAL PRIMARY KEY,
    buyer_id INTEGER NOT NULL,
    auction_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    triggered BOOLEAN DEFAULT FALSE
);

-- Step 10: Create auction_end_subscription table (matches AuctionEndSubscription.java entity)
CREATE TABLE auction_end_subscription (
    id BIGSERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL,
    closing_time TIMESTAMP,
    triggered BOOLEAN DEFAULT FALSE
);

-- Step 11: Create indexes for performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_auction_questions_auction_id ON auction_questions(auction_id);
CREATE INDEX idx_bids_auction_item_id ON bids(auction_item_id);
CREATE INDEX idx_bids_buyer_id ON bids(buyer_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Step 12: Add constraints
ALTER TABLE auction_items ADD CONSTRAINT chk_positive_prices
    CHECK (starting_price >= 0 AND current_bid >= 0);

ALTER TABLE bids ADD CONSTRAINT chk_positive_bid
    CHECK (bid_amount > 0 AND reserve_price >= 0);

-- Step 13: Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 14: Create triggers
CREATE TRIGGER update_auction_items_updated_at 
    BEFORE UPDATE ON auction_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 15: Grant ALL permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO postgres;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Step 16: Disable RLS on ALL tables (to allow backend operations)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_images DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE bids DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_start_subscription DISABLE ROW LEVEL SECURITY;
ALTER TABLE auction_end_subscription DISABLE ROW LEVEL SECURITY;

-- Step 17: Create admin user for testing
INSERT INTO users (username, password_hash, email, role) 
VALUES ('admin', 'admin123', 'admin@auction.com', 'ADMIN');

-- Step 18: Verify schema creation
SELECT '=== SCHEMA CREATION COMPLETE ===' as status;

-- Show all created tables
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'users'
ORDER BY ordinal_position;

-- Show admin user
SELECT id, username, email, role FROM users;

-- Test user creation
INSERT INTO users (username, password_hash, email, role) 
VALUES ('test_user', 'test_hash', 'test@test.com', 'BUYER');

SELECT id, username, email, role FROM users WHERE username = 'test_user';

-- Clean up test user
DELETE FROM users WHERE username = 'test_user';

SELECT 'ALL TABLES CREATED SUCCESSFULLY - User creation should now work!' as final_status; 