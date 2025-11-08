<?php

require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

$method = $_SERVER['REQUEST_METHOD'];

// GET - List all events or get single event (public, no auth required)
if ($method === 'GET') {
    $eventId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if ($eventId > 0) {
        // Get single event
        $stmt = $pdo->prepare('SELECT event_id, event_title, event_date, location, description, image_url, created_at 
                               FROM event 
                               WHERE event_id = ?');
        $stmt->execute([$eventId]);
        $event = $stmt->fetch();
        
        if (!$event) {
            error_response('Event not found', 404);
        }
        
        // Format event_date
        $event['event_date'] = $event['event_date'];
        
        success_response('Event retrieved successfully', $event);
    } else {
        // Get all events
        // Optional filter by upcoming/past
        $filter = $_GET['filter'] ?? 'all'; // 'all', 'upcoming', 'past'
        $whereClause = '';
        $params = [];
        
        if ($filter === 'upcoming') {
            $whereClause = 'WHERE event_date >= NOW()';
        } elseif ($filter === 'past') {
            $whereClause = 'WHERE event_date < NOW()';
        }
        
        $sql = 'SELECT event_id, event_title, event_date, location, description, image_url, created_at 
                FROM event ' . $whereClause . ' 
                ORDER BY event_date ASC';
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $events = $stmt->fetchAll();
        
        success_response('Events retrieved successfully', [
            'items' => $events,
            'count' => count($events)
        ]);
    }
}

// POST/PUT/DELETE require authentication
$user = require_auth();

// POST - Create new event
if ($method === 'POST') {
    $body = read_json_body();
    $eventTitle = trim($body['event_title'] ?? '');
    $eventDate = trim($body['event_date'] ?? '');
    
    $errors = [];
    
    if ($eventTitle === '') {
        $errors[] = 'Event title is required';
    }
    
    if ($eventDate === '') {
        $errors[] = 'Event date is required';
    } else {
        // Validate date format
        $dateTime = DateTime::createFromFormat('Y-m-d H:i:s', $eventDate);
        if (!$dateTime) {
            $dateTime = DateTime::createFromFormat('Y-m-d\TH:i:s', $eventDate);
        }
        if (!$dateTime) {
            $dateTime = DateTime::createFromFormat('Y-m-d', $eventDate);
        }
        if (!$dateTime) {
            $errors[] = 'Invalid event date format. Use Y-m-d H:i:s, Y-m-dTH:i:s, or Y-m-d';
        } else {
            $eventDate = $dateTime->format('Y-m-d H:i:s');
        }
    }
    
    if (!empty($errors)) {
        json_response([
            'message' => 'Validation failed',
            'errors' => $errors
        ], 422);
    }
    
    $stmt = $pdo->prepare('INSERT INTO event (event_title, event_date, location, description, image_url) 
                           VALUES (?, ?, ?, ?, ?)');
    $stmt->execute([
        $eventTitle,
        $eventDate,
        $body['location'] ?? null,
        $body['description'] ?? null,
        $body['image_url'] ?? null
    ]);
    
    $eventId = (int)$pdo->lastInsertId();
    
    // Fetch created event
    $fetchStmt = $pdo->prepare('SELECT event_id, event_title, event_date, location, description, image_url, created_at 
                                FROM event 
                                WHERE event_id = ?');
    $fetchStmt->execute([$eventId]);
    $createdEvent = $fetchStmt->fetch();
    
    success_response('Event created successfully', [
        'event_id' => $eventId,
        'event' => $createdEvent
    ], 201);
}

// PUT and DELETE require event ID
$eventId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($eventId <= 0) {
    error_response('Event ID is required', 400);
}

// Check if event exists
$checkStmt = $pdo->prepare('SELECT event_id FROM event WHERE event_id = ?');
$checkStmt->execute([$eventId]);

if (!$checkStmt->fetch()) {
    error_response('Event not found', 404);
}

// PUT - Update event
if ($method === 'PUT') {
    $body = read_json_body();
    $eventTitle = trim($body['event_title'] ?? '');
    $eventDate = trim($body['event_date'] ?? '');
    
    $errors = [];
    
    // Get existing event to preserve values if not provided
    $existingStmt = $pdo->prepare('SELECT event_title, event_date, location, description, image_url FROM event WHERE event_id = ?');
    $existingStmt->execute([$eventId]);
    $existing = $existingStmt->fetch();
    
    if ($eventTitle === '' && !$existing) {
        $errors[] = 'Event title is required';
    }
    
    if ($eventDate === '' && !$existing) {
        $errors[] = 'Event date is required';
    } else if ($eventDate !== '') {
        // Validate date format
        $dateTime = DateTime::createFromFormat('Y-m-d H:i:s', $eventDate);
        if (!$dateTime) {
            $dateTime = DateTime::createFromFormat('Y-m-d\TH:i:s', $eventDate);
        }
        if (!$dateTime) {
            $dateTime = DateTime::createFromFormat('Y-m-d', $eventDate);
        }
        if (!$dateTime) {
            $errors[] = 'Invalid event date format. Use Y-m-d H:i:s, Y-m-dTH:i:s, or Y-m-d';
        } else {
            $eventDate = $dateTime->format('Y-m-d H:i:s');
        }
    }
    
    if (!empty($errors)) {
        json_response([
            'message' => 'Validation failed',
            'errors' => $errors
        ], 422);
    }
    
    // Use provided values or keep existing ones
    $finalTitle = $eventTitle !== '' ? $eventTitle : $existing['event_title'];
    $finalDate = $eventDate !== '' ? $eventDate : $existing['event_date'];
    $finalLocation = isset($body['location']) ? ($body['location'] !== '' ? $body['location'] : null) : $existing['location'];
    $finalDescription = isset($body['description']) ? ($body['description'] !== '' ? $body['description'] : null) : $existing['description'];
    $finalImageUrl = isset($body['image_url']) ? ($body['image_url'] !== '' ? $body['image_url'] : null) : $existing['image_url'];
    
    $stmt = $pdo->prepare('UPDATE event 
                           SET event_title = ?, 
                               event_date = ?, 
                               location = ?, 
                               description = ?, 
                               image_url = ? 
                           WHERE event_id = ?');
    $stmt->execute([
        $finalTitle,
        $finalDate,
        $finalLocation,
        $finalDescription,
        $finalImageUrl,
        $eventId
    ]);
    
    // Fetch updated event
    $fetchStmt = $pdo->prepare('SELECT event_id, event_title, event_date, location, description, image_url, created_at 
                                FROM event 
                                WHERE event_id = ?');
    $fetchStmt->execute([$eventId]);
    $updatedEvent = $fetchStmt->fetch();
    
    success_response('Event updated successfully', [
        'event' => $updatedEvent
    ]);
}

// DELETE - Delete event
if ($method === 'DELETE') {
    $deleteStmt = $pdo->prepare('DELETE FROM event WHERE event_id = ?');
    $deleteStmt->execute([$eventId]);
    
    success_response('Event deleted successfully');
}

error_response('Method not allowed', 405);

