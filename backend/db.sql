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
    updated_at TIMESTAMP NULL DEFAULT NULL,
    failed_login_attempts INT DEFAULT 0,
    account_locked_until DATETIME NULL
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
    image_url MEDIUMTEXT,
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

-- Recipe Ingredients (junction table)
CREATE TABLE IF NOT EXISTS recipe_ingredients (
    recipe_ingredient_id INT AUTO_INCREMENT PRIMARY KEY,
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity VARCHAR(100),
    CONSTRAINT fk_ri_recipe FOREIGN KEY (recipe_id) REFERENCES recipe (recipe_id) ON DELETE CASCADE,
    CONSTRAINT fk_ri_ingredient FOREIGN KEY (ingredient_id) REFERENCES ingredient (ingredient_id) ON DELETE CASCADE
);

-- Community cookbook posts (user-owned recipes)
CREATE TABLE IF NOT EXISTS community_cookbook (
    post_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    recipe_title VARCHAR(150) NOT NULL,
    description TEXT,
    image_url MEDIUMTEXT,
    username VARCHAR(100),
    instructions TEXT,
    cook_time INT,
    servings INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT fk_cc_user FOREIGN KEY (user_id) REFERENCES user (user_id) ON DELETE CASCADE
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

-- Resources (both culinary and educational)
CREATE TABLE IF NOT EXISTS resource (
    resource_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    topic VARCHAR(150) NULL,
    resource_type ENUM('Culinary', 'Educational') NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE IF NOT EXISTS event (
    event_id INT AUTO_INCREMENT PRIMARY KEY,
    event_title VARCHAR(150) NOT NULL,
    event_date DATETIME NOT NULL,
    location VARCHAR(255),
    description TEXT,
    image_url VARCHAR(255),
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
    subject_id INT NULL,
    subject VARCHAR(190) NOT NULL,
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

-- Login attempts tracking (for brute force protection)
CREATE TABLE IF NOT EXISTS login_attempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(190) NOT NULL,
    attempts INT DEFAULT 1,
    locked_until DATETIME NULL,
    last_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_locked_until (locked_until)
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
    ('Mexican'),
    ('French'),
    ('American'),
    ('Japanese'),
    ('Greek'),
    ('Korean')
ON DUPLICATE KEY UPDATE
    cuisine_name = VALUES(cuisine_name);

INSERT INTO
    dietary (dietary_name)
VALUES ('None'),
    ('Vegetarian'),
    ('Vegan'),
    ('Gluten Free'),
    ('Dairy Free')
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

-- Insert unique ingredients
INSERT INTO ingredient (ingredient_name) VALUES
    ('Pizza dough'), ('Tomato sauce'), ('Fresh mozzarella'), ('Fresh basil'), ('Olive oil'), ('Salt'),
    ('Green curry paste'), ('Coconut milk'), ('Chicken or tofu'), ('Thai basil'), ('Bell peppers'), ('Bamboo shoots'),
    ('Dark chocolate'), ('Butter'), ('Eggs'), ('Sugar'), ('Flour'), ('Vanilla extract'),
    ('Romaine lettuce'), ('Parmesan cheese'), ('Croutons'), ('Caesar dressing'), ('Lemon juice'), ('Black pepper'),
    ('Ground beef'), ('Taco seasoning'), ('Tortillas'), ('Lettuce'), ('Tomatoes'), ('Cheese'), ('Sour cream'),
    ('Sushi rice'), ('Nori sheets'), ('Fresh salmon'), ('Avocado'), ('Cucumber'), ('Rice vinegar'),
    ('Eggplant'), ('Ground lamb'), ('Onions'), ('Béchamel sauce'), ('Cinnamon'),
    ('Rice noodles'), ('Shrimp'), ('Bean sprouts'), ('Peanuts'), ('Tamarind paste'),
    ('Chicken breast'), ('Yogurt'), ('Tikka masala spices'), ('Heavy cream'), ('Garam masala'),
    ('Quinoa'), ('Sweet potato'), ('Chickpeas'), ('Kale'), ('Tahini'),
    ('Beef broth'), ('Gruyère cheese'), ('Baguette'), ('Thyme'),
    ('Rice'), ('Beef or tofu'), ('Spinach'), ('Carrots'), ('Gochujang'), ('Egg')
ON DUPLICATE KEY UPDATE ingredient_name = VALUES(ingredient_name);

-- Insert recipes from mock data
INSERT INTO recipe (
    recipe_title, description, image_url, cuisine_type_id, dietary_id, difficulty_id, 
    prep_time, cook_time, servings, instructions
) VALUES
    (
        'Classic Margherita Pizza',
        'Authentic Italian pizza with fresh mozzarella, basil, and homemade tomato sauce',
        '/margherita-pizza-fresh-basil.jpg',
        1, 2, 2, 15, 15, 4,
        'Preheat oven to 475°F (245°C). Roll out pizza dough on a floured surface. Spread tomato sauce evenly. Add mozzarella cheese. Bake for 12-15 minutes until crust is golden. Top with fresh basil and drizzle with olive oil.'
    ),
    (
        'Thai Green Curry',
        'Aromatic and spicy curry with coconut milk, vegetables, and fragrant herbs',
        '/thai-green-curry-coconut.jpg',
        4, 4, 2, 15, 30, 4,
        'Heat oil in a large pan. Add curry paste and cook for 1 minute. Pour in coconut milk and bring to simmer. Add protein and vegetables. Cook for 20 minutes until tender. Garnish with Thai basil.'
    ),
    (
        'Chocolate Lava Cake',
        'Decadent dessert with a molten chocolate center and vanilla ice cream',
        '/chocolate-lava-cake-molten-center.jpg',
        6, 2, 3, 13, 12, 4,
        'Preheat oven to 425°F (220°C). Melt chocolate and butter together. Whisk eggs and sugar until thick. Fold in chocolate mixture and flour. Pour into greased ramekins. Bake for 12 minutes until edges are firm.'
    ),
    (
        'Caesar Salad',
        'Crisp romaine lettuce with parmesan, croutons, and creamy Caesar dressing',
        '/caesar-salad-parmesan-croutons.jpg',
        7, 2, 1, 15, 0, 4,
        'Wash and chop romaine lettuce. Make Caesar dressing with anchovies, garlic, and lemon. Toss lettuce with dressing. Add croutons and parmesan. Season with black pepper. Serve immediately.'
    ),
    (
        'Beef Tacos',
        'Seasoned ground beef with fresh toppings in crispy or soft tortillas',
        '/beef-tacos-fresh-toppings.jpg',
        5, 4, 1, 5, 15, 4,
        'Brown ground beef in a skillet. Add taco seasoning and water. Simmer for 5 minutes. Warm tortillas. Fill with beef and toppings. Serve with lime wedges.'
    ),
    (
        'Sushi Rolls',
        'Fresh sushi rolls with salmon, avocado, and cucumber',
        '/cooking-kitchen-food-prep.png',
        8, 4, 3, 30, 0, 4,
        'Cook and season sushi rice. Place nori on bamboo mat. Spread rice evenly. Add salmon, avocado, and cucumber. Roll tightly using the mat. Slice into pieces.'
    ),
    (
        'Greek Moussaka',
        'Layered eggplant casserole with spiced meat and béchamel sauce',
        '/meal-prep-guide.jpg',
        9, 1, 3, 30, 45, 6,
        'Slice and salt eggplant, let drain. Brown ground lamb with onions and spices. Layer eggplant and meat in baking dish. Prepare béchamel sauce. Pour sauce over layers. Bake at 350°F for 45 minutes.'
    ),
    (
        'Pad Thai',
        'Classic Thai stir-fried noodles with shrimp, peanuts, and tamarind sauce',
        '/thai-green-curry-coconut.jpg',
        4, 4, 2, 15, 15, 4,
        'Soak rice noodles in warm water. Stir-fry shrimp until pink. Push aside and scramble eggs. Add noodles and sauce. Toss with bean sprouts. Top with peanuts and lime.'
    ),
    (
        'Chicken Tikka Masala',
        'Tender chicken in a creamy tomato-based curry sauce',
        '/beef-tacos-fresh-toppings.jpg',
        3, 4, 2, 20, 30, 4,
        'Marinate chicken in yogurt and spices. Grill or pan-fry chicken pieces. Make sauce with tomatoes and spices. Add cream and simmer. Add chicken to sauce. Serve with rice or naan.'
    ),
    (
        'Vegan Buddha Bowl',
        'Nutritious bowl with quinoa, roasted vegetables, and tahini dressing',
        '/caesar-salad-parmesan-croutons.jpg',
        7, 3, 1, 15, 25, 2,
        'Cook quinoa according to package. Roast sweet potato and chickpeas. Massage kale with lemon juice. Arrange ingredients in bowl. Make tahini dressing. Drizzle and serve.'
    ),
    (
        'French Onion Soup',
        'Rich beef broth with caramelized onions and melted Gruyère cheese',
        '/cookbook-recipes-collection.jpg',
        6, 2, 2, 15, 60, 4,
        'Caramelize onions slowly in butter. Add broth and simmer for 30 minutes. Toast baguette slices. Ladle soup into oven-safe bowls. Top with bread and cheese. Broil until cheese is bubbly.'
    ),
    (
        'Korean Bibimbap',
        'Mixed rice bowl with vegetables, egg, and spicy gochujang sauce',
        '/margherita-pizza-fresh-basil.jpg',
        10, 4, 2, 25, 20, 4,
        'Cook rice and keep warm. Sauté each vegetable separately. Cook beef or tofu with marinade. Fry eggs sunny-side up. Arrange ingredients over rice. Serve with gochujang sauce.'
    )
ON DUPLICATE KEY UPDATE recipe_title = VALUES(recipe_title);

-- Insert recipe-ingredient relationships
-- Recipe 1: Classic Margherita Pizza
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
    (1, 1, '1 ball'), (1, 2, '1/2 cup'), (1, 3, '8 oz'), (1, 4, '1/4 cup'), (1, 5, '2 tbsp'), (1, 6, 'to taste');

-- Recipe 2: Thai Green Curry
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
    (2, 7, '3 tbsp'), (2, 8, '14 oz can'), (2, 9, '1 lb'), (2, 10, '1 cup'), (2, 11, '2 cups'), (2, 12, '1 cup');

-- Recipe 3: Chocolate Lava Cake
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
    (3, 13, '4 oz'), (3, 14, '1/2 cup'), (3, 15, '2 large'), (3, 16, '1/4 cup'), (3, 17, '2 tbsp'), (3, 18, '1 tsp');

-- Recipe 4: Caesar Salad
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
    (4, 19, '1 head'), (4, 20, '1/2 cup'), (4, 21, '1 cup'), (4, 22, '1/2 cup'), (4, 23, '2 tbsp'), (4, 24, 'to taste');

-- Recipe 5: Beef Tacos
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
    (5, 25, '1 lb'), (5, 26, '1 packet'), (5, 27, '8 pieces'), (5, 28, '1 cup'), (5, 29, '2 medium'), (5, 30, '1 cup'), (5, 31, '1/2 cup');

-- Recipe 6: Sushi Rolls
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
    (6, 32, '2 cups'), (6, 33, '4 sheets'), (6, 34, '8 oz'), (6, 35, '1 medium'), (6, 36, '1 medium'), (6, 37, '2 tbsp');

-- Recipe 7: Greek Moussaka
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
    (7, 38, '2 large'), (7, 39, '1 lb'), (7, 29, '2 medium'), (7, 40, '2 cups'), (7, 41, '1 tsp');

-- Recipe 8: Pad Thai
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
    (8, 42, '8 oz'), (8, 43, '1 lb'), (8, 15, '2 large'), (8, 44, '1 cup'), (8, 45, '1/2 cup'), (8, 46, '2 tbsp');

-- Recipe 9: Chicken Tikka Masala
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
    (9, 47, '1.5 lbs'), (9, 48, '1 cup'), (9, 49, '2 tbsp'), (9, 2, '1 cup'), (9, 50, '1/2 cup'), (9, 51, '1 tsp');

-- Recipe 10: Vegan Buddha Bowl
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
    (10, 52, '1 cup'), (10, 53, '1 large'), (10, 54, '1 can'), (10, 55, '2 cups'), (10, 35, '1 medium'), (10, 56, '1/4 cup');

-- Recipe 11: French Onion Soup
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
    (11, 39, '4 large'), (11, 57, '6 cups'), (11, 58, '1 cup'), (11, 59, '1 loaf'), (11, 14, '2 tbsp'), (11, 60, '2 sprigs');

-- Recipe 12: Korean Bibimbap
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity) VALUES
    (12, 61, '4 cups'), (12, 62, '1 lb'), (12, 63, '2 cups'), (12, 64, '2 medium'), (12, 44, '1 cup'), (12, 65, '2 tbsp'), (12, 66, '4 large');

-- Insert sample community cookbook posts
INSERT INTO community_cookbook (user_id, recipe_title, description, image_url, created_at) VALUES
    (1, 'Grandma''s Apple Pie', 'A family recipe passed down through generations with a flaky crust and cinnamon-spiced apples', '/chocolate-lava-cake-molten-center.jpg', '2024-06-10'),
    (2, 'Spicy Korean Fried Chicken', 'Crispy double-fried chicken coated in a sweet and spicy gochujang glaze', '/beef-tacos-fresh-toppings.jpg', '2024-06-12'),
    (3, 'Mediterranean Quinoa Salad', 'Fresh and healthy salad with quinoa, cucumbers, tomatoes, feta, and lemon dressing', '/caesar-salad-parmesan-croutons.jpg', '2024-06-14'),
    (4, 'Homemade Ramen Bowl', 'Rich pork broth with noodles, soft-boiled eggs, and traditional toppings', '/thai-green-curry-coconut.jpg', '2024-06-08'),
    (5, 'Vegan Chocolate Brownies', 'Fudgy and decadent brownies made without eggs or dairy', '/chocolate-lava-cake-molten-center.jpg', '2024-06-15'),
    (5, 'Authentic Paella Valenciana', 'Traditional Spanish rice dish with chicken, rabbit, and vegetables', '/margherita-pizza-fresh-basil.jpg', '2024-06-11');

-- Insert sample contact messages
INSERT INTO contact_message (name, email, subject_id, subject, message) VALUES
    ('Emily Watson', 'emily.watson@example.com', 1, 'General Inquiry', 'Hi! I would like to know more about your recipe submission guidelines.'),
    ('James Lee', 'james.lee@example.com', 2, 'Recipe Question', 'Can I substitute almond flour for all-purpose flour in the chocolate cake recipe?'),
    ('Sophia Turner', 'sophia.turner@example.com', 3, 'Technical Support', 'I''m having trouble uploading my profile picture — it says unsupported file type.'),
    ('Liam Johnson', 'liam.johnson@example.com', 4, 'Feedback', 'I love the clean layout of the website! Maybe add a dark mode option in the future?'),
    ('Olivia Smith', 'olivia.smith@example.com', 5, 'Partnership', 'We are interested in collaborating with your brand for a holiday baking campaign.'),
    ('Daniel Kim', 'daniel.kim@example.com', 6, 'Other', 'Can you please delete my account and all related data?');

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
    )
ON DUPLICATE KEY UPDATE
    title = VALUES(title);
