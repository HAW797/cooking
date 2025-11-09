<?php
/**
 * Quick Database Connection Test
 * Access this via browser: http://localhost:8000/test_connection.php
 */

header('Content-Type: application/json');

$result = [
    'success' => false,
    'checks' => []
];

// Check 1: PDO MySQL Extension
$result['checks']['pdo_mysql_extension'] = extension_loaded('pdo_mysql');

// Check 2: MySQL Server Connection
try {
    $pdo = new PDO('mysql:host=127.0.0.1;charset=utf8mb4', 'root', '', [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    $result['checks']['mysql_server'] = true;
} catch (PDOException $e) {
    $result['checks']['mysql_server'] = false;
    $result['error'] = $e->getMessage();
    echo json_encode($result, JSON_PRETTY_PRINT);
    exit;
}

// Check 3: Database Exists
try {
    $stmt = $pdo->query("SHOW DATABASES LIKE 'cooking_app'");
    $result['checks']['database_exists'] = $stmt->rowCount() > 0;
} catch (PDOException $e) {
    $result['checks']['database_exists'] = false;
}

// Check 4: Connect to Database
if ($result['checks']['database_exists']) {
    try {
        $pdo = new PDO('mysql:host=127.0.0.1;dbname=cooking_app;charset=utf8mb4', 'root', '', [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        ]);
        $result['checks']['database_connection'] = true;
        
        // Check 5: Tables
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $result['checks']['tables_count'] = count($tables);
        $result['checks']['tables'] = $tables;
        
        // Check 6: User count
        try {
            $stmt = $pdo->query("SELECT COUNT(*) FROM user");
            $result['checks']['user_count'] = (int)$stmt->fetchColumn();
        } catch (PDOException $e) {
            $result['checks']['user_count'] = 0;
        }
        
    } catch (PDOException $e) {
        $result['checks']['database_connection'] = false;
        $result['error'] = $e->getMessage();
    }
}

// Overall success
$result['success'] = $result['checks']['pdo_mysql_extension'] 
    && $result['checks']['mysql_server'] 
    && $result['checks']['database_exists'] 
    && $result['checks']['database_connection'];

if ($result['success']) {
    $result['message'] = 'All checks passed! Database is properly configured.';
} else {
    $result['message'] = 'Some checks failed. See details above.';
}

echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);



