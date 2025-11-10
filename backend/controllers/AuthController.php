<?php

// EXAMPLE 3 OF INHERITANCE: AuthController extends BaseController
class AuthController extends BaseController
{
    private UserRepository $userRepo;
    private AuthService $authService;
    
    public function __construct()
    {
        $this->userRepo = new UserRepository();
        $this->authService = new AuthService();
    }
    
    // Child class implements specific HTTP methods
    protected function post(): void
    {
        $endpoint = $_SERVER['REQUEST_URI'];
        
        if (strpos($endpoint, 'login') !== false) {
            $this->login();
        } elseif (strpos($endpoint, 'register') !== false) {
            $this->register();
        } elseif (strpos($endpoint, 'logout') !== false) {
            $this->logout();
        } else {
            $this->errorResponse('Invalid endpoint', 404);
        }
    }
    
    protected function get(): void
    {
        $endpoint = $_SERVER['REQUEST_URI'];
        
        if (strpos($endpoint, 'check_auth') !== false) {
            $this->checkAuth();
        } else {
            $this->errorResponse('Invalid endpoint', 404);
        }
    }
    
    private function login(): void
    {
        $body = $this->getRequestBody();
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';
        $rememberMe = (bool)($body['remember_me'] ?? false);
        
        $errors = $this->validateRequired($body, ['email', 'password']);
        if (!empty($errors)) {
            $this->errorResponse(implode(', ', $errors), 400);
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->errorResponse('Valid email is required', 400);
        }
        
        try {
            $result = $this->authService->login($email, $password, $rememberMe);
            $this->successResponse('Login successful', $result);
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), $e->getCode() ?: 401);
        }
    }
    
    private function register(): void
    {
        $body = $this->getRequestBody();
        $firstName = trim($body['first_name'] ?? '');
        $lastName = trim($body['last_name'] ?? '');
        $email = trim($body['email'] ?? '');
        $password = $body['password'] ?? '';
        
        $errors = $this->validateRequired($body, ['first_name', 'last_name', 'email', 'password']);
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = 'Valid email is required';
        }
        
        $passwordErrors = $this->authService->validatePassword($password);
        $errors = array_merge($errors, $passwordErrors);
        
        if (!empty($errors)) {
            $this->jsonResponse([
                'message' => 'Validation failed',
                'errors' => $errors
            ], 422);
        }
        
        if ($this->userRepo->emailExists($email)) {
            $this->errorResponse('Email already registered', 422);
        }
        
        try {
            $userId = $this->authService->register($firstName, $lastName, $email, $password);
            $this->successResponse('User registered successfully', [
                'user_id' => $userId,
                'email' => $email,
                'csrf_token' => $this->authService->getCsrfToken()
            ], 201);
        } catch (Exception $e) {
            $this->errorResponse($e->getMessage(), 500);
        }
    }
    
    private function logout(): void
    {
        if (!$this->authService->isAuthenticated()) {
            $this->errorResponse('Not authenticated', 401);
        }
        
        $this->authService->logout();
        $this->successResponse('Logged out successfully');
    }
    
    private function checkAuth(): void
    {
        $user = $this->authService->getAuthenticatedUser();
        
        if (!$user) {
            $this->errorResponse('Not authenticated', 401);
        }
        
        $this->successResponse('Authenticated', [
            'user' => $user,
            'csrf_token' => $this->authService->getCsrfToken()
        ]);
    }
}


