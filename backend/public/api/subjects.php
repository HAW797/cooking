<?php

require_once __DIR__ . '/../../api/bootstrap.php';

$pdo = get_pdo();

$subjects = $pdo->query('SELECT subject_id, subject_name FROM contact_subject ORDER BY subject_id')->fetchAll();

success_response('Subjects retrieved successfully', [
    'subjects' => $subjects,
    'count' => count($subjects)
]);
