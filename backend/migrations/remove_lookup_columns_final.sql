-- Migration: Remove difficulty_id, dietary_id, and cuisine_type_id from community_cookbook table
-- This script properly drops foreign keys first, then the columns

USE cooking_app;

-- Step 1: Drop the foreign key constraints first
ALTER TABLE community_cookbook DROP FOREIGN KEY fk_cc_cuisine;
ALTER TABLE community_cookbook DROP FOREIGN KEY fk_cc_dietary;
ALTER TABLE community_cookbook DROP FOREIGN KEY fk_cc_difficulty;

-- Step 2: Now drop the columns
ALTER TABLE community_cookbook DROP COLUMN cuisine_type_id;
ALTER TABLE community_cookbook DROP COLUMN dietary_id;
ALTER TABLE community_cookbook DROP COLUMN difficulty_id;

-- Verify the changes
DESCRIBE community_cookbook;

