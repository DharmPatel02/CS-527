-- Simple cleanup script - run this first
-- This will safely drop tables if they exist

-- First, let's see what tables exist
SELECT 'Checking existing tables...' as status;

-- Drop tables one by one with error handling
DO $$
BEGIN
    -- Drop subscription tables
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'auction_end_subscriptions') THEN
        DROP TABLE auction_end_subscriptions CASCADE;
        RAISE NOTICE 'Dropped auction_end_subscriptions';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'auction_start_subscriptions') THEN
        DROP TABLE auction_start_subscriptions CASCADE;
        RAISE NOTICE 'Dropped auction_start_subscriptions';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'auction_end_subscription') THEN
        DROP TABLE auction_end_subscription CASCADE;
        RAISE NOTICE 'Dropped auction_end_subscription';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'auction_start_subscription') THEN
        DROP TABLE auction_start_subscription CASCADE;
        RAISE NOTICE 'Dropped auction_start_subscription';
    END IF;
    
    -- Drop other tables
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        DROP TABLE notifications CASCADE;
        RAISE NOTICE 'Dropped notifications';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bids') THEN
        DROP TABLE bids CASCADE;
        RAISE NOTICE 'Dropped bids';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'auction_questions') THEN
        DROP TABLE auction_questions CASCADE;
        RAISE NOTICE 'Dropped auction_questions';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'auction_images') THEN
        DROP TABLE auction_images CASCADE;
        RAISE NOTICE 'Dropped auction_images';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'auction_items') THEN
        DROP TABLE auction_items CASCADE;
        RAISE NOTICE 'Dropped auction_items';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_details') THEN
        DROP TABLE user_details CASCADE;
        RAISE NOTICE 'Dropped user_details';
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        DROP TABLE users CASCADE;
        RAISE NOTICE 'Dropped users';
    END IF;
    
    -- Drop types
    IF EXISTS (SELECT FROM pg_type WHERE typname = 'user_role') THEN
        DROP TYPE user_role CASCADE;
        RAISE NOTICE 'Dropped user_role type';
    END IF;
    
    IF EXISTS (SELECT FROM pg_type WHERE typname = 'item_category') THEN
        DROP TYPE item_category CASCADE;
        RAISE NOTICE 'Dropped item_category type';
    END IF;
    
    RAISE NOTICE 'Cleanup completed successfully!';
END $$; 