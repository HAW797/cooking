<?php
/**
 * Get lookup data for filters (cuisines, dietaries, difficulties, contact subjects)
 * GET /api/lookups.php
 */
require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

// Fetch all lookup data
$cuisines = $pdo->query('SELECT cuisine_type_id, cuisine_name FROM cuisine_type ORDER BY cuisine_name')->fetchAll();
$dietaries = $pdo->query('SELECT dietary_id, dietary_name FROM dietary ORDER BY dietary_name')->fetchAll();
$difficulties = $pdo->query('SELECT difficulty_id, difficulty_level FROM difficulty ORDER BY difficulty_id')->fetchAll();
$subjects = $pdo->query('SELECT subject_id, subject_name FROM contact_subject ORDER BY subject_id')->fetchAll();

// Return success response
success_response('Lookup data retrieved successfully', [
    'cuisines' => $cuisines,
    'dietaries' => $dietaries,
    'difficulties' => $difficulties,
    'subjects' => $subjects
]);