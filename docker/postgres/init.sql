-- HR System Database Initialization and Seed Data
-- This script will be executed when the PostgreSQL container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: Tables will be created by Prisma migrations
-- This script focuses on seed data that will be inserted after Prisma migration

-- Create a function to wait for tables to exist and then seed data
CREATE OR REPLACE FUNCTION seed_hr_data() RETURNS void AS $$
BEGIN
    -- This function will be called after Prisma creates the tables
    -- For now, just create a placeholder that confirms the database is ready
    
    -- Create a simple log table for initialization tracking
    CREATE TABLE IF NOT EXISTS initialization_log (
        id SERIAL PRIMARY KEY,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    INSERT INTO initialization_log (message) 
    VALUES ('HR System database initialized successfully');
    
END;
$$ LANGUAGE plpgsql;

-- Execute the seed function
SELECT seed_hr_data();
