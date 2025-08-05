-- Fix RLS Policies for User Creation
-- This script adds the missing INSERT policy for the users table

-- Drop existing policies for users table
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Admin can view all users" ON users;

-- Create new policies that allow user creation
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

-- CRITICAL: Add INSERT policy to allow user creation
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (true);

-- Also add a policy to allow the backend to create users (for admin operations)
CREATE POLICY "Backend can manage users" ON users
    FOR ALL USING (true);

SELECT 'RLS policies updated successfully!' as status; 