-- Quick RLS fix for existing tables
-- Run this if you want to keep existing data

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

-- Drop any existing policies first
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;
DROP POLICY IF EXISTS "Users can view their own details" ON user_details;
DROP POLICY IF EXISTS "Users can update their own details" ON user_details;
DROP POLICY IF EXISTS "Anyone can view auction items" ON auction_items;
DROP POLICY IF EXISTS "Sellers can create auction items" ON auction_items;
DROP POLICY IF EXISTS "Sellers can update their own auction items" ON auction_items;
DROP POLICY IF EXISTS "Sellers can delete their own auction items" ON auction_items;
DROP POLICY IF EXISTS "Anyone can view auction images" ON auction_images;
DROP POLICY IF EXISTS "Sellers can manage images for their auctions" ON auction_images;
DROP POLICY IF EXISTS "Anyone can view questions" ON auction_questions;
DROP POLICY IF EXISTS "Authenticated users can ask questions" ON auction_questions;
DROP POLICY IF EXISTS "Sellers can answer questions for their auctions" ON auction_questions;
DROP POLICY IF EXISTS "Anyone can view bids" ON bids;
DROP POLICY IF EXISTS "Authenticated users can place bids" ON bids;
DROP POLICY IF EXISTS "Users can only update their own bids" ON bids;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON auction_start_subscription;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON auction_end_subscription;

-- Create policies for users table
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

-- Create policies for user_details table
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

-- Create policies for auction_items table
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

-- Create policies for auction_images table
CREATE POLICY "Anyone can view auction images" ON auction_images
    FOR SELECT USING (true);

CREATE POLICY "Sellers can manage images for their auctions" ON auction_images
    FOR ALL USING (
        auction_item_id IN (
            SELECT id FROM auction_items 
            WHERE seller_id::text = auth.uid()::text
        )
    );

-- Create policies for auction_questions table
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

-- Create policies for bids table
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

-- Create policies for notifications table
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (
        user_id::text = auth.uid()::text
    );

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (
        user_id::text = auth.uid()::text
    );

-- Create policies for subscription tables
CREATE POLICY "Users can manage their own subscriptions" ON auction_start_subscription
    FOR ALL USING (
        user_id::text = auth.uid()::text
    );

CREATE POLICY "Users can manage their own subscriptions" ON auction_end_subscription
    FOR ALL USING (
        user_id::text = auth.uid()::text
    ); 