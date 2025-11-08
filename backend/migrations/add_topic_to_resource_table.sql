-- Migration: Add topic column to resource table
-- Run this if you already have an existing database

USE cooking_app;

-- Add topic column to resource table (optional field)
ALTER TABLE resource 
ADD COLUMN topic VARCHAR(150) NULL AFTER description;

