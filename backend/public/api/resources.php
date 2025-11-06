<?php

require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

$resourceType = $_GET['type'] ?? '';

$whereClause = '';
$params = [];

if (in_array($resourceType, ['Culinary', 'Educational'], true)) {
    $whereClause = 'WHERE resource_type = ?';
    $params[] = $resourceType;
}

$sql = 'SELECT resource_id, title, description, resource_type, file_url, created_at 
        FROM resource ' . $whereClause . ' 
        ORDER BY created_at DESC';

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$resources = $stmt->fetchAll();

foreach ($resources as &$resource) {
    if (isset($resource['file_url']) && strpos($resource['file_url'], '/public/downloads/') === 0) {
        $resource['file_url'] = str_replace('/public/downloads/', '/downloads/', $resource['file_url']);
    }
}

success_response('Resources retrieved successfully', [
    'items' => $resources,
    'count' => count($resources)
]);