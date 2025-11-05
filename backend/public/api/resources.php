<?php
/**
 * Get resources (Culinary or Educational)
 * GET /api/resources.php
 * GET /api/resources.php?type=Culinary
 * GET /api/resources.php?type=Educational
 */
require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

// Get optional filter type
$resourceType = $_GET['type'] ?? '';

// Build WHERE clause
$whereClause = '';
$params = [];

if (in_array($resourceType, ['Culinary', 'Educational'], true)) {
    $whereClause = 'WHERE resource_type = ?';
    $params[] = $resourceType;
}

// Build and execute query
$sql = 'SELECT resource_id, title, description, resource_type, file_url, created_at 
        FROM resource ' . $whereClause . ' 
        ORDER BY created_at DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$resources = $stmt->fetchAll();

// Fix file URLs - remove /public prefix if present (since document root is already public)
foreach ($resources as &$resource) {
    if (isset($resource['file_url']) && strpos($resource['file_url'], '/public/downloads/') === 0) {
        $resource['file_url'] = str_replace('/public/downloads/', '/downloads/', $resource['file_url']);
    }
}

// Return success response
success_response('Resources retrieved successfully', [
    'items' => $resources,
    'count' => count($resources)
]);