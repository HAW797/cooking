-- Migration: Remove difficulty_id, dietary_id, and cuisine_type_id from community_cookbook table
-- Date: 2025-11-08
-- Version 2: Fixed constraint dropping

USE cooking_app;

-- First, let's check and drop foreign key constraints
-- The constraint names might be auto-generated, so we'll try different approaches

-- Try dropping with the expected names
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;

-- Drop foreign key constraints (if they exist)
ALTER TABLE community_cookbook DROP FOREIGN KEY IF EXISTS fk_cc_cuisine;
ALTER TABLE community_cookbook DROP FOREIGN KEY IF EXISTS fk_cc_dietary;
ALTER TABLE community_cookbook DROP FOREIGN KEY IF EXISTS fk_cc_difficulty;

-- If the above doesn't work, try these alternative names
ALTER TABLE community_cookbook DROP FOREIGN KEY IF EXISTS community_cookbook_ibfk_1;
ALTER TABLE community_cookbook DROP FOREIGN KEY IF EXISTS community_cookbook_ibfk_2;
ALTER TABLE community_cookbook DROP FOREIGN KEY IF EXISTS community_cookbook_ibfk_3;
ALTER TABLE community_cookbook DROP FOREIGN KEY IF EXISTS community_cookbook_ibfk_4;

-- Drop the columns
ALTER TABLE community_cookbook 
    DROP COLUMN IF EXISTS cuisine_type_id,
    DROP COLUMN IF EXISTS dietary_id,
    DROP COLUMN IF EXISTS difficulty_id;

SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;

