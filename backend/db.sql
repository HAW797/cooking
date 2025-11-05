-- MySQL schema for Cooking App
-- Create database (run once if not created)
CREATE DATABASE IF NOT EXISTS cooking_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE cooking_app;

-- Users
CREATE TABLE IF NOT EXISTS user (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL
);

-- Lookups
CREATE TABLE IF NOT EXISTS cuisine_type (
    cuisine_type_id INT AUTO_INCREMENT PRIMARY KEY,
    cuisine_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS dietary (
    dietary_id INT AUTO_INCREMENT PRIMARY KEY,
    dietary_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS difficulty (
    difficulty_id INT AUTO_INCREMENT PRIMARY KEY,
    difficulty_level VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS ingredient (
    ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    ingredient_name VARCHAR(120) NOT NULL
);

-- Recipes (official collection)
CREATE TABLE IF NOT EXISTS recipe (
    recipe_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_title VARCHAR(150) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    cuisine_type_id INT,
    dietary_id INT,
    difficulty_id INT,
    prep_time INT,
    cook_time INT,
    servings INT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_recipe_cuisine FOREIGN KEY (cuisine_type_id) REFERENCES cuisine_type (cuisine_type_id),
    CONSTRAINT fk_recipe_dietary FOREIGN KEY (dietary_id) REFERENCES dietary (dietary_id),
    CONSTRAINT fk_recipe_difficulty FOREIGN KEY (difficulty_id) REFERENCES difficulty (difficulty_id)
);

-- Community cookbook posts (user-owned recipes)
CREATE TABLE IF NOT EXISTS community_cookbook (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_title VARCHAR(150) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
    cuisine_type_id INT,
    dietary_id INT,
    difficulty_id INT,
    prep_time INT,
    cook_time INT,
    servings INT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_cc_user FOREIGN KEY (user_id) REFERENCES user (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_cc_cuisine FOREIGN KEY (cuisine_type_id) REFERENCES cuisine_type (cuisine_type_id),
    CONSTRAINT fk_cc_dietary FOREIGN KEY (dietary_id) REFERENCES dietary (dietary_id),
    CONSTRAINT fk_cc_difficulty FOREIGN KEY (difficulty_id) REFERENCES difficulty (difficulty_id)
);

-- Resources (both culinary and educational)
CREATE TABLE IF NOT EXISTS resource (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    resource_type ENUM('Culinary', 'Educational') NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contact subjects (for dropdown)
CREATE TABLE IF NOT EXISTS contact_subject (
    subject_id INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL
);

-- Contact messages
CREATE TABLE IF NOT EXISTS contact_message (
    message_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL,
    subject VARCHAR(190) NOT NULL,
    subject_id INT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_contact_subject FOREIGN KEY (subject_id) REFERENCES contact_subject (subject_id)
);

-- API sessions (opaque bearer tokens)
CREATE TABLE IF NOT EXISTS user_session (
    session_token VARCHAR(100) PRIMARY KEY,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NULL,
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES user (user_id) ON DELETE CASCADE
);

-- Cookbook likes (love/react function)
CREATE TABLE IF NOT EXISTS cookbook_likes (
    like_id INT AUTO_INCREMENT PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES community_cookbook (post_id) ON DELETE CASCADE,
    CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES user (user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_like (post_id, user_id)
);

-- Recipe ratings (for recipe collection) - no auth required, no user_id
CREATE TABLE IF NOT EXISTS recipe_ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    rating INT NOT NULL CHECK (
        rating >= 1
        AND rating <= 5
    ),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rating_recipe FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id) ON DELETE CASCADE
);

-- Seed data
INSERT INTO
    cuisine_type (cuisine_name)
VALUES ('Italian'),
    ('Chinese'),
    ('Indian'),
    ('Thai'),
    ('Mexican')
ON DUPLICATE KEY UPDATE
    cuisine_name = VALUES(cuisine_name);

INSERT INTO
    dietary (dietary_name)
VALUES ('None'),
    ('Vegetarian'),
    ('Vegan'),
    ('Gluten Free')
ON DUPLICATE KEY UPDATE
    dietary_name = VALUES(dietary_name);

INSERT INTO
    difficulty (difficulty_level)
VALUES ('Easy'),
    ('Medium'),
    ('Hard')
ON DUPLICATE KEY UPDATE
    difficulty_level = VALUES(difficulty_level);

INSERT INTO
    contact_subject (subject_name)
VALUES ('General Inquiry'),
    ('Recipe Question'),
    ('Technical Support'),
    ('Feedback'),
    ('Partnership'),
    ('Other')
ON DUPLICATE KEY UPDATE
    subject_name = VALUES(subject_name);

INSERT INTO
    recipe (
        recipe_title,
        description,
        image_url,
        cuisine_type_id,
        dietary_id,
        difficulty_id,
        prep_time,
        cook_time,
        servings,
        instructions
    )
VALUES (
        'Spaghetti Pomodoro',
        'Classic tomato pasta',
        'https://picsum.photos/seed/pasta/400/250',
        1,
        1,
        1,
        10,
        15,
        2,
        'Boil pasta. Cook tomatoes with garlic and basil. Combine and serve.'
    ),
    (
        'Veg Fried Rice',
        'Simple veggie fried rice',
        'https://picsum.photos/seed/rice/400/250',
        2,
        2,
        1,
        15,
        10,
        2,
        'Stir-fry vegetables, add rice and sauce, toss to finish.'
    );

INSERT INTO
    resource (
        title,
        description,
        resource_type,
        file_url
    )
VALUES (
        'Knife Skills 101',
        'PDF on knife safety and cuts',
        'Culinary',
        '/downloads/knife-skills.pdf'
    ),
    (
        'Food Safety Basics',
        'Beginner food safety tips',
        'Educational',
        '/downloads/food-safety.pdf'
    );