<?php

class CommunityController extends BaseController
{
    private CommunityPostRepository $postRepo;
    private AuthService $authService;
    
    public function __construct()
    {
        $this->postRepo = new CommunityPostRepository();
        $this->authService = new AuthService();
    }
    
    protected function get(): void
    {
        $currentUserId = null;
        $user = $this->authService->getAuthenticatedUser();
        if ($user) {
            $currentUserId = (int)$user['user_id'];
        }
        
        $postsRaw = $this->postRepo->getAllWithDetails($currentUserId);
        
        $posts = [];
        foreach ($postsRaw as $post) {
            $posts[] = [
                'id' => (string)$post['post_id'],
                'post_id' => (int)$post['post_id'],
                'title' => $post['post_title'],
                'post_title' => $post['post_title'],
                'description' => $post['description'],
                'image' => $post['image_url'],
                'image_url' => $post['image_url'],
                'author' => $post['author_name'],
                'authorId' => (string)$post['user_id'],
                'likes' => (int)$post['like_count'],
                'like_count' => (int)$post['like_count'],
                'createdAt' => $post['created_at'],
                'created_at' => $post['created_at'],
                'reactions' => ['heart' => (int)$post['like_count']],
                'userLiked' => (bool)$post['user_liked'],
                'user_liked' => (bool)$post['user_liked']
            ];
        }
        
        $this->successResponse('Posts retrieved successfully', [
            'items' => $posts,
            'count' => count($posts)
        ]);
    }
    
    protected function post(): void
    {
        $user = $this->authService->requireAuth();
        $userId = (int)$user['user_id'];
        
        $body = $this->getRequestBody();
        $title = trim($body['title'] ?? $body['post_title'] ?? '');
        $description = trim($body['description'] ?? '');
        $imageUrl = $body['image_url'] ?? $body['image'] ?? null;
        
        if ($title === '') {
            $this->errorResponse('Title is required', 422);
        }
        
        if ($description === '') {
            $this->errorResponse('Description is required', 422);
        }
        
        $postId = $this->postRepo->insert([
            'user_id' => $userId,
            'post_title' => $title,
            'description' => $description,
            'image_url' => $imageUrl
        ]);
        
        $this->successResponse('Post created successfully', [
            'post_id' => $postId
        ], 201);
    }
    
    protected function put(): void
    {
        $user = $this->authService->requireAuth();
        $userId = (int)$user['user_id'];
        
        $postId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        
        if (!$postId) {
            $this->errorResponse('Post ID is required', 400);
        }
        
        if (!$this->postRepo->isOwner($postId, $userId)) {
            $this->errorResponse('Post not found or access denied', 404);
        }
        
        $body = $this->getRequestBody();
        $title = trim($body['title'] ?? $body['post_title'] ?? '');
        $description = trim($body['description'] ?? '');
        $imageUrl = $body['image_url'] ?? $body['image'] ?? null;
        
        if ($title === '') {
            $this->errorResponse('Title is required', 422);
        }
        
        $this->postRepo->update($postId, [
            'post_title' => $title,
            'description' => $description,
            'image_url' => $imageUrl
        ]);
        
        $this->successResponse('Post updated successfully', ['post_id' => $postId]);
    }
    
    protected function delete(): void
    {
        $user = $this->authService->requireAuth();
        $userId = (int)$user['user_id'];
        
        $postId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
        
        if (!$postId) {
            $this->errorResponse('Post ID is required', 400);
        }
        
        if (!$this->postRepo->isOwner($postId, $userId)) {
            $this->errorResponse('Post not found or access denied', 404);
        }
        
        $this->postRepo->delete($postId);
        $this->successResponse('Post deleted successfully', ['post_id' => $postId]);
    }
}


