-- PostgreSQL Schema for Auction System (Supabase Compatible)
-- Run this in your Supabase SQL Editor

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
    image_data BYTEA, -- PostgreSQL equivalent of MySQL's LONGBLOB
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
    bid_amount DOUBLE PRECISION NOT NULL,
    bid_time TIMESTAMP NOT NULL,
    reserve_price DOUBLE PRECISION NOT NULL,
    auction_id BIGINT NOT NULL,
    buyer_id INTEGER NOT NULL,
    FOREIGN KEY (auction_id) REFERENCES auction_items(id),
    FOREIGN KEY (buyer_id) REFERENCES users(user_id)
);

-- Notifications table
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE, -- PostgreSQL uses BOOLEAN instead of BIT(1)
    message VARCHAR(255) NOT NULL,
    user_id INTEGER NOT NULL
);

-- Auction start subscriptions table
CREATE TABLE auction_start_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL,
    buyer_id INTEGER NOT NULL,
    start_time TIMESTAMP NOT NULL,
    triggered BOOLEAN NOT NULL DEFAULT FALSE
);

-- Auction end subscriptions table
CREATE TABLE auction_end_subscriptions (
    id BIGSERIAL PRIMARY KEY,
    auction_id INTEGER NOT NULL,
    closing_time TIMESTAMP NOT NULL,
    triggered BOOLEAN NOT NULL DEFAULT FALSE
);

-- Add additional indexes for better performance
CREATE INDEX idx_auction_items_seller_id ON auction_items(seller_id);
CREATE INDEX idx_auction_items_buyer_id ON auction_items(buyer_id);
CREATE INDEX idx_auction_items_category ON auction_items(category);
CREATE INDEX idx_auction_items_closing_time ON auction_items(closing_time);
CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_buyer_id ON bids(buyer_id);
CREATE INDEX idx_bids_bid_time ON bids(bid_time);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Optional: Add some constraints for data integrity
ALTER TABLE auction_items ADD CONSTRAINT chk_positive_prices 
    CHECK (starting_price >= 0 AND reserve_price >= 0 AND current_bid >= 0);

ALTER TABLE bids ADD CONSTRAINT chk_positive_bid 
    CHECK (bid_amount > 0 AND reserve_price >= 0);

-- Optional: Add created_at and updated_at timestamps for audit trail
ALTER TABLE auction_items ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE auction_items ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update the updated_at column
CREATE TRIGGER update_auction_items_updated_at BEFORE UPDATE ON auction_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 