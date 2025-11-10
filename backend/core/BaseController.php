<?php

abstract class BaseController
{
    protected array $allowedMethods = ['GET', 'POST', 'PUT', 'DELETE'];
    
    // Handle request routing
    public function handleRequest(): void
    {
        $method = $_SERVER['REQUEST_METHOD'];
        
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(204);
            exit;
        }
        
        if (!in_array($method, $this->allowedMethods)) {
            $this->errorResponse('Method not allowed', 405);
        }
        
        $methodName = strtolower($method);
        
        if (method_exists($this, $methodName)) {
            $this->$methodName();
        } else {
            $this->errorResponse('Method not implemented', 501);
        }
    }
    
    // JSON response helpers
    protected function jsonResponse(array $data, int $status = 200): void
    {
        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    protected function successResponse(string $message, $data = null, int $status = 200): void
    {
        $response = [
            'success' => true,
            'message' => $message
        ];
        if ($data !== null) {
            $response['data'] = $data;
        }
        $this->jsonResponse($response, $status);
    }
    
    protected function errorResponse(string $message, int $status = 400): void
    {
        $this->jsonResponse([
            'success' => false,
            'message' => $message,
            'error' => $message
        ], $status);
    }
    
    // Read JSON body
    protected function getRequestBody(): array
    {
        $raw = file_get_contents('php://input');
        $data = json_decode($raw ?: '[]', true);
        return is_array($data) ? $data : [];
    }
    
    // Validate required fields
    protected function validateRequired(array $data, array $required): array
    {
        $errors = [];
        foreach ($required as $field) {
            if (!isset($data[$field]) || trim($data[$field]) === '') {
                $errors[] = ucfirst(str_replace('_', ' ', $field)) . ' is required';
            }
        }
        return $errors;
    }
    
    // Sanitize input
    protected function sanitize(string $input): string
    {
        return htmlspecialchars(trim($input), ENT_QUOTES, 'UTF-8');
    }
}


