-- Migration: Remove difficulty_id, dietary_id, and cuisine_type_id from community_cookbook table
-- Date: 2025-11-08

USE cooking_app;

-- Drop foreign key constraints first
ALTER TABLE community_cookbook 
    DROP FOREIGN KEY fk_cc_cuisine,
    DROP FOREIGN KEY fk_cc_dietary,
    DROP FOREIGN KEY fk_cc_difficulty;

-- Drop the columns
ALTER TABLE community_cookbook 
    DROP COLUMN cuisine_type_id,
    DROP COLUMN dietary_id,
    DROP COLUMN difficulty_id;

