<?php
/**
 * Database Setup and Diagnostic Script
 * Run this file to diagnose database connection issues and set up the database
 */

// Color output for terminal
function colorOutput($text, $color = 'green') {
    $colors = [
        'red' => "\033[0;31m",
        'green' => "\033[0;32m",
        'yellow' => "\033[1;33m",
        'blue' => "\033[0;34m",
        'reset' => "\033[0m"
    ];
    return $colors[$color] . $text . $colors['reset'];
}

echo "\n" . colorOutput("========================================", 'blue') . "\n";
echo colorOutput("Cooking App - Database Setup & Diagnostic", 'blue') . "\n";
echo colorOutput("========================================", 'blue') . "\n\n";

// Step 1: Check if MySQL extension is loaded
echo colorOutput("Step 1: Checking PHP MySQL Extensions...", 'yellow') . "\n";
if (!extension_loaded('pdo_mysql')) {
    echo colorOutput("✗ PDO MySQL extension is NOT loaded!", 'red') . "\n";
    echo "  Please enable PDO MySQL in your php.ini file\n\n";
    exit(1);
}
echo colorOutput("✓ PDO MySQL extension is loaded", 'green') . "\n\n";

// Step 2: Test basic MySQL connection (without database)
echo colorOutput("Step 2: Testing MySQL Server Connection...", 'yellow') . "\n";
try {
    $pdo = new PDO('mysql:host=127.0.0.1;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    echo colorOutput("✓ Successfully connected to MySQL server", 'green') . "\n\n";
} catch (PDOException $e) {
    echo colorOutput("✗ Cannot connect to MySQL server!", 'red') . "\n";
    echo "  Error: " . $e->getMessage() . "\n\n";
    echo colorOutput("Troubleshooting Steps:", 'yellow') . "\n";
    echo "  1. Start XAMPP MySQL service:\n";
    echo "     sudo /Applications/XAMPP/xamppfiles/bin/mysql.server start\n";
    echo "  2. Or use XAMPP Control Panel to start MySQL\n";
    echo "  3. Check if MySQL is running:\n";
    echo "     ps aux | grep mysql\n\n";
    exit(1);
}

// Step 3: Check if database exists
echo colorOutput("Step 3: Checking if 'cooking_app' database exists...", 'yellow') . "\n";
$stmt = $pdo->query("SHOW DATABASES LIKE 'cooking_app'");
$dbExists = $stmt->rowCount() > 0;

if (!$dbExists) {
    echo colorOutput("✗ Database 'cooking_app' does not exist", 'yellow') . "\n";
    echo "  Creating database...\n";
    
    try {
        $pdo->exec("CREATE DATABASE cooking_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        echo colorOutput("✓ Database 'cooking_app' created successfully", 'green') . "\n\n";
    } catch (PDOException $e) {
        echo colorOutput("✗ Failed to create database!", 'red') . "\n";
        echo "  Error: " . $e->getMessage() . "\n\n";
        exit(1);
    }
} else {
    echo colorOutput("✓ Database 'cooking_app' already exists", 'green') . "\n\n";
}

// Step 4: Connect to the cooking_app database
echo colorOutput("Step 4: Connecting to 'cooking_app' database...", 'yellow') . "\n";
try {
    $pdo = new PDO('mysql:host=127.0.0.1;dbname=cooking_app;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    echo colorOutput("✓ Successfully connected to 'cooking_app' database", 'green') . "\n\n";
} catch (PDOException $e) {
    echo colorOutput("✗ Cannot connect to cooking_app database!", 'red') . "\n";
    echo "  Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Step 5: Check if tables exist
echo colorOutput("Step 5: Checking database tables...", 'yellow') . "\n";
$requiredTables = [
    'user', 'user_session', 'login_attempts', 'cuisine_type', 'dietary', 
    'difficulty', 'ingredient', 'recipe', 'recipe_ingredients', 
    'community_cookbook', 'cookbook_likes', 'resource', 'event', 
    'contact_subject', 'contact_message', 'recipe_ratings'
];

$stmt = $pdo->query("SHOW TABLES");
$existingTables = $stmt->fetchAll(PDO::FETCH_COLUMN);
$missingTables = array_diff($requiredTables, $existingTables);

if (count($missingTables) > 0) {
    echo colorOutput("✗ Missing tables: " . implode(', ', $missingTables), 'yellow') . "\n";
    echo "  Running database schema from db.sql...\n";
    
    // Read and execute the SQL file
    $sqlFile = __DIR__ . '/db.sql';
    if (!file_exists($sqlFile)) {
        echo colorOutput("✗ SQL file not found: $sqlFile", 'red') . "\n\n";
        exit(1);
    }
    
    try {
        $sql = file_get_contents($sqlFile);
        // Split by semicolons and execute each statement
        $statements = array_filter(array_map('trim', explode(';', $sql)));
        
        foreach ($statements as $statement) {
            if (!empty($statement)) {
                $pdo->exec($statement);
            }
        }
        
        echo colorOutput("✓ Database schema executed successfully", 'green') . "\n\n";
    } catch (PDOException $e) {
        echo colorOutput("✗ Failed to execute database schema!", 'red') . "\n";
        echo "  Error: " . $e->getMessage() . "\n\n";
        exit(1);
    }
} else {
    echo colorOutput("✓ All required tables exist", 'green') . "\n\n";
}

// Step 6: Verify table counts
echo colorOutput("Step 6: Database Summary", 'yellow') . "\n";
foreach ($requiredTables as $table) {
    try {
        $stmt = $pdo->query("SELECT COUNT(*) FROM `$table`");
        $count = $stmt->fetchColumn();
        echo "  • $table: $count rows\n";
    } catch (PDOException $e) {
        echo colorOutput("  • $table: ERROR - " . $e->getMessage(), 'red') . "\n";
    }
}

echo "\n" . colorOutput("========================================", 'blue') . "\n";
echo colorOutput("✓ Database setup complete!", 'green') . "\n";
echo colorOutput("========================================", 'blue') . "\n\n";

echo "Next steps:\n";
echo "1. Make sure your PHP server is running:\n";
echo "   cd /Applications/XAMPP/xamppfiles/cooking/backend\n";
echo "   php -S localhost:8000 router.php\n\n";
echo "2. Test the API endpoint:\n";
echo "   curl -X POST http://localhost:8000/api/login.php \\\n";
echo "     -H 'Content-Type: application/json' \\\n";
echo "     -d '{\"email\":\"test@example.com\",\"password\":\"test123\"}'\n\n";



