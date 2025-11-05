<?php
/**
 * Get list of contact subjects (for dropdown)
 * GET /api/subjects.php
 */
require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

// Fetch all subjects
$subjects = $pdo->query('SELECT subject_id, subject_name FROM contact_subject ORDER BY subject_id')->fetchAll();

// Return success response
success_response('Subjects retrieved successfully', [
    'subjects' => $subjects,
    'count' => count($subjects)
]);
