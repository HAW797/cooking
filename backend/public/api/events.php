<?php

require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $upcoming = isset($_GET['upcoming']) ? (bool)$_GET['upcoming'] : false;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : null;
    
    $sql = 'SELECT event_id, event_title, event_date, location, description, image_url, created_at 
            FROM event';
    
    if ($upcoming) {
        $sql .= ' WHERE event_date >= NOW()';
    }
    
    $sql .= ' ORDER BY event_date ASC';
    
    if ($limit && $limit > 0) {
        $sql .= ' LIMIT ' . $limit;
    }
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute();
    $events = $stmt->fetchAll();
    
    $formattedEvents = array_map(function($event) {
        return [
            'event_id' => (int)$event['event_id'],
            'title' => $event['event_title'],
            'event_title' => $event['event_title'],
            'date' => $event['event_date'],
            'event_date' => $event['event_date'],
            'location' => $event['location'],
            'description' => $event['description'],
            'image' => $event['image_url'],
            'image_url' => $event['image_url'],
            'created_at' => $event['created_at']
        ];
    }, $events);
    
    success_response('Events retrieved successfully', [
        'items' => $formattedEvents,
        'count' => count($formattedEvents)
    ]);
}

if ($method === 'POST') {
    $user = require_auth();
    
    $body = read_json_body();
    $title = trim($body['title'] ?? $body['event_title'] ?? '');
    $eventDate = trim($body['event_date'] ?? '');
    $location = trim($body['location'] ?? '');
    $description = trim($body['description'] ?? '');
    $imageUrl = trim($body['image_url'] ?? '');
    
    if ($title === '' || $eventDate === '') {
        error_response('Title and event date are required', 422);
    }
    
    $stmt = $pdo->prepare('INSERT INTO event (event_title, event_date, location, description, image_url) 
                           VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([$title, $eventDate, $location, $description, $imageUrl]);
    
    $eventId = (int)$pdo->lastInsertId();
    
    success_response('Event created successfully', [
        'event_id' => $eventId
    ], 201);
}

error_response('Method not allowed', 405);



