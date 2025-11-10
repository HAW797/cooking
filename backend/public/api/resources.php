<?php

require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $resourceType = $_GET['type'] ?? null;
    
    $sql = 'SELECT resource_id, title, description, topic, resource_type, file_url, created_at 
            FROM resource';
    
    $params = [];
    
    if ($resourceType && in_array($resourceType, ['Culinary', 'Educational'])) {
        $sql .= ' WHERE resource_type = ?';
        $params[] = $resourceType;
    }
    
    $sql .= ' ORDER BY created_at DESC';
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $resources = $stmt->fetchAll();
    
    $formattedResources = array_map(function($resource) {
        return [
            'resource_id' => (int)$resource['resource_id'],
            'title' => $resource['title'],
            'description' => $resource['description'],
            'topic' => $resource['topic'],
            'resource_type' => $resource['resource_type'],
            'file_url' => $resource['file_url'],
            'created_at' => $resource['created_at']
        ];
    }, $resources);
    
    success_response('Resources retrieved successfully', [
        'items' => $formattedResources,
        'count' => count($formattedResources)
    ]);
}

if ($method === 'POST') {
    $user = require_auth();
    
    $body = read_json_body();
    $title = trim($body['title'] ?? '');
    $description = trim($body['description'] ?? '');
    $topic = trim($body['topic'] ?? '');
    $resourceType = $body['resource_type'] ?? '';
    $fileUrl = trim($body['file_url'] ?? '');
    
    if ($title === '' || $description === '' || $resourceType === '' || $fileUrl === '') {
        error_response('All required fields must be filled', 422);
    }
    
    if (!in_array($resourceType, ['Culinary', 'Educational'])) {
        error_response('Invalid resource type', 422);
    }
    
    $stmt = $pdo->prepare('INSERT INTO resource (title, description, topic, resource_type, file_url) 
                           VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$title, $description, $topic, $resourceType, $fileUrl]);
    
    $resourceId = (int)$pdo->lastInsertId();
    
    success_response('Resource created successfully', [
        'resource_id' => $resourceId
    ], 201);
}

error_response('Method not allowed', 405);



