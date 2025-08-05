-- Create Auction System Schema with RLS
-- Run this if your database is empty or mostly empty

-- Create ENUM types first (PostgreSQL requires explicit enum creation)
CREATE TYPE user_role AS ENUM ('ADMIN', 'BUYER', 'CUSTOMER_REP', 'SELLER');
CREATE TYPE item_category AS ENUM ('bike', 'car', 'truck');

-- Users table
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    role user_role,
    user_id INTEGER UNIQUE,
    username VARCHAR(255) UNIQUE
);

-- User details table
CREATE TABLE user_details (
    username VARCHAR(255) PRIMARY KEY,
    address VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    phone_number VARCHAR(255),
    FOREIGN KEY (username) REFERENCES users(username)
);

-- Auction items table
CREATE TABLE auction_items (
    id BIGSERIAL PRIMARY KEY,
    auction_id INTEGER UNIQUE,
    bid_increment DOUBLE PRECISION,
    category item_category,
    closing_time TIMESTAMP,
    description VARCHAR(255),
    item_name VARCHAR(255),
    reserve_price DOUBLE PRECISION,
    seller_id INTEGER,
    starting_price DOUBLE PRECISION,
    current_bid DOUBLE PRECISION,
    min_price DOUBLE PRECISION,
    start_time TIMESTAMP,
    buyer_id INTEGER
);

-- Auction images table
CREATE TABLE auction_images (
    id BIGSERIAL PRIMARY KEY,
    auction_item_id BIGINT,
    image_data BYTEA,
    image_mime VARCHAR(50),
    image_url VARCHAR(255),
    FOREIGN KEY (auction_item_id) REFERENCES auction_items(id)
);

-- Auction questions table
CREATE TABLE auction_questions (
    question_id SERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL,
    question TEXT NOT NULL,
    answer TEXT,
    FOREIGN KEY (auction_id) REFERENCES auction_items(auction_id) ON DELETE CASCADE
);

-- Create index for better performance
CREATE INDEX idx_auction_id ON auction_questions(auction_id);

-- Bids table
CREATE TABLE bids (
    bid_id BIGSERIAL PRIMARY KEY,
    auction_id INTEGER,
    bid_amount DOUBLE PRECISION,
    bid_time TIMESTAMP,
    buyer_id INTEGER,
    reserve_price DOUBLE PRECISION,
    FOREIGN KEY (auction_id) REFERENCES auction_items(auction_id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    message TEXT,
    timestamp TIMESTAMP,
    user_id INTEGER,
    is_read BOOLEAN DEFAULT FALSE
);

-- Auction start subscriptions table
CREATE TABLE auction_start_subscription (
    id BIGSERIAL PRIMARY KEY,
    auction_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (auction_id) REFERENCES auction_items(auction_id) ON DELETE CASCADE
);

-- Auction end subscriptions table
CREATE TABLE auction_end_subscription (
    id BIGSERIAL PRIMARY KEY,
    auction_id INTEGER,
    user_id INTEGER,
    FOREIGN KEY (auction_id) REFERENCES auction_items(auction_id) ON DELETE CASCADE
);

-- Add constraints for data integrity
ALTER TABLE auction_items ADD CONSTRAINT chk_positive_prices 
    CHECK (starting_price >= 0 AND reserve_price >= 0 AND current_bid >= 0);

ALTER TABLE bids ADD CONSTRAINT chk_positive_bid 
    CHECK (bid_amount > 0 AND reserve_price >= 0);

-- Add timestamps for audit trail
ALTER TABLE auction_items ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE auction_items ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_auction_items_updated_at BEFORE UPDATE ON auction_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_start_subscription ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_end_subscription ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Admin can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id::text = auth.uid()::text AND role = 'ADMIN'
        )
    );

CREATE POLICY "Users can view their own details" ON user_details
    FOR SELECT USING (
        username = (
            SELECT username FROM users 
            WHERE id::text = auth.uid()::text
        )
    );

CREATE POLICY "Users can update their own details" ON user_details
    FOR UPDATE USING (
        username = (
            SELECT username FROM users 
            WHERE id::text = auth.uid()::text
        )
    );

CREATE POLICY "Anyone can view auction items" ON auction_items
    FOR SELECT USING (true);

CREATE POLICY "Sellers can create auction items" ON auction_items
    FOR INSERT WITH CHECK (
        seller_id::text = auth.uid()::text
    );

CREATE POLICY "Sellers can update their own auction items" ON auction_items
    FOR UPDATE USING (
        seller_id::text = auth.uid()::text
    );

CREATE POLICY "Sellers can delete their own auction items" ON auction_items
    FOR DELETE USING (
        seller_id::text = auth.uid()::text
    );

CREATE POLICY "Anyone can view auction images" ON auction_images
    FOR SELECT USING (true);

CREATE POLICY "Sellers can manage images for their auctions" ON auction_images
    FOR ALL USING (
        auction_item_id IN (
            SELECT id FROM auction_items 
            WHERE seller_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Anyone can view questions" ON auction_questions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can ask questions" ON auction_questions
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Sellers can answer questions for their auctions" ON auction_questions
    FOR UPDATE USING (
        auction_id IN (
            SELECT auction_id FROM auction_items 
            WHERE seller_id::text = auth.uid()::text
        )
    );

CREATE POLICY "Anyone can view bids" ON bids
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can place bids" ON bids
    FOR INSERT WITH CHECK (
        auth.uid()::text = buyer_id::text
    );

CREATE POLICY "Users can only update their own bids" ON bids
    FOR UPDATE USING (
        buyer_id::text = auth.uid()::text
    );

CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        user_id::text = auth.uid()::text
    );

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (
        user_id::text = auth.uid()::text
    );

CREATE POLICY "Users can manage their own subscriptions" ON auction_start_subscription
    FOR ALL USING (
        user_id::text = auth.uid()::text
    );

CREATE POLICY "Users can manage their own subscriptions" ON auction_end_subscription
    FOR ALL USING (
        user_id::text = auth.uid()::text
    );

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

SELECT 'Schema created successfully with RLS enabled!' as status; 