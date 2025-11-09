-- Increase image_url column size to support base64 encoded images
-- Run this in phpMyAdmin

USE cooking_app;

-- Increase image_url size in community_cookbook table
ALTER TABLE community_cookbook MODIFY COLUMN image_url MEDIUMTEXT;

-- Optional: Also increase in recipe table if needed
ALTER TABLE recipe MODIFY COLUMN image_url MEDIUMTEXT;

