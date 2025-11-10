<?php

class ResourceController extends BaseController
{
    private ResourceRepository $resourceRepo;
    private AuthService $authService;
    
    public function __construct()
    {
        $this->resourceRepo = new ResourceRepository();
        $this->authService = new AuthService();
    }
    
    protected function get(): void
    {
        $type = $_GET['type'] ?? null;
        
        if ($type && in_array($type, ['Culinary', 'Educational'])) {
            $resources = $this->resourceRepo->getByType($type);
        } else {
            $resources = $this->resourceRepo->getAll(['orderBy' => 'created_at DESC']);
        }
        
        $this->successResponse('Resources retrieved successfully', [
            'items' => $resources,
            'count' => count($resources)
        ]);
    }
    
    protected function post(): void
    {
        $this->authService->requireAuth();
        
        $body = $this->getRequestBody();
        $errors = $this->validateRequired($body, ['title', 'description', 'resource_type', 'file_url']);
        
        if (!empty($errors)) {
            $this->errorResponse(implode(', ', $errors), 422);
        }
        
        if (!in_array($body['resource_type'], ['Culinary', 'Educational'])) {
            $this->errorResponse('Invalid resource type', 422);
        }
        
        $resourceId = $this->resourceRepo->insert([
            'title' => trim($body['title']),
            'description' => trim($body['description']),
            'topic' => trim($body['topic'] ?? ''),
            'resource_type' => $body['resource_type'],
            'file_url' => trim($body['file_url'])
        ]);
        
        $this->successResponse('Resource created successfully', [
            'resource_id' => $resourceId
        ], 201);
    }
}


