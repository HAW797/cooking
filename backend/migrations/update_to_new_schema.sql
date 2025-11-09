-- Migration: Update database schema to match new design
-- Date: 2025-11-08

USE cooking_app;

-- Step 1: Update user table - add new columns
ALTER TABLE user 
    ADD COLUMN IF NOT EXISTS failed_login_attempts INT DEFAULT 0,
    ADD COLUMN IF NOT EXISTS account_locked_until DATETIME NULL;

-- Step 2: Create recipe_ingredients junction table
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    recipe_ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity VARCHAR(100),
    CONSTRAINT fk_ri_recipe FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id) ON DELETE CASCADE,
    CONSTRAINT fk_ri_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredient (ingredient_id) ON DELETE CASCADE
);

-- Step 3: Update community_cookbook table - add username column if not exists
ALTER TABLE community_cookbook 
    ADD COLUMN IF NOT EXISTS username VARCHAR(100) AFTER image_url;

-- Step 4: Reorder columns in community_cookbook (optional, for consistency)
-- Note: MySQL doesn't support reordering easily, so we'll just ensure all columns exist
-- The order in the diagram: post_id, user_id, recipe_title, description, image_url, username, instructions, cook_time, servings, created_at, updated_at

-- Verify all columns exist
ALTER TABLE community_cookbook 
    MODIFY COLUMN recipe_title VARCHAR(150) NOT NULL,
    MODIFY COLUMN description TEXT,
    MODIFY COLUMN image_url VARCHAR(255),
    MODIFY COLUMN instructions TEXT,
    MODIFY COLUMN cook_time INT,
    MODIFY COLUMN servings INT;

