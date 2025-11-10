<?php

class AuthService
{
    private UserRepository $userRepo;
    private const MAX_FAILED_ATTEMPTS = 3;
    private const LOCKOUT_MINUTES = 3;
    
    public function __construct()
    {
        $this->userRepo = new UserRepository();
    }
    
    public function login(string $email, string $password, bool $rememberMe = false): array
    {
        $this->checkLoginLockout($email);
        
        $user = $this->userRepo->findByEmail($email);
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            $this->recordFailedLogin($email);
            throw new Exception('Invalid email or password', 401);
        }
        
        $this->clearLoginAttempts($email);
        $this->loginUser($user, $rememberMe);
        
        return [
            'csrf_token' => $this->getCsrfToken(),
            'user' => [
                'user_id' => (int)$user['user_id'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'email' => $user['email']
            ]
        ];
    }
    
    public function register(string $firstName, string $lastName, string $email, string $password): int
    {
        $userId = $this->userRepo->createUser($firstName, $lastName, $email, $password);
        
        $user = $this->userRepo->findById($userId);
        $this->loginUser($user, true);
        
        return $userId;
    }
    
    public function validatePassword(string $password): array
    {
        $errors = [];
        
        if (strlen($password) < 8) {
            $errors[] = 'Password must be at least 8 characters';
        }
        if (!preg_match('/[A-Z]/', $password)) {
            $errors[] = 'Password must contain at least one uppercase letter';
        }
        if (!preg_match('/[a-z]/', $password)) {
            $errors[] = 'Password must contain at least one lowercase letter';
        }
        if (!preg_match('/[0-9]/', $password)) {
            $errors[] = 'Password must contain at least one number';
        }
        if (!preg_match('/[^A-Za-z0-9]/', $password)) {
            $errors[] = 'Password must contain at least one special character';
        }
        
        return $errors;
    }
    
    public function isAuthenticated(): bool
    {
        return isset($_SESSION['authenticated']) && $_SESSION['authenticated'] === true && isset($_SESSION['user_id']);
    }
    
    public function getAuthenticatedUser(): ?array
    {
        if (!$this->isAuthenticated()) {
            if (isset($_COOKIE['remember_token'])) {
                return $this->loginFromRememberToken($_COOKIE['remember_token']);
            }
            return null;
        }
        
        return [
            'user_id' => $_SESSION['user_id'],
            'email' => $_SESSION['user_email'],
            'first_name' => $_SESSION['user_first_name'],
            'last_name' => $_SESSION['user_last_name']
        ];
    }
    
    public function requireAuth(): array
    {
        $user = $this->getAuthenticatedUser();
        if (!$user) {
            throw new Exception('Authentication required', 401);
        }
        return $user;
    }
    
    public function getCsrfToken(): string
    {
        if (!isset($_SESSION['csrf_token'])) {
            $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
        }
        return $_SESSION['csrf_token'];
    }
    
    public function logout(): void
    {
        if (isset($_COOKIE['remember_token'])) {
            $this->deleteRememberToken($_COOKIE['remember_token']);
        }
        
        $_SESSION = [];
        
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 3600,
                'path' => $params['path'],
                'domain' => $params['domain'],
                'secure' => $params['secure'],
                'httponly' => $params['httponly'],
                'samesite' => $params['samesite']
            ]);
        }
        
        session_destroy();
    }
    
    private function loginUser(array $user, bool $rememberMe): void
    {
        session_regenerate_id(true);
        
        $_SESSION['user_id'] = (int)$user['user_id'];
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_first_name'] = $user['first_name'];
        $_SESSION['user_last_name'] = $user['last_name'];
        $_SESSION['authenticated'] = true;
        $_SESSION['CREATED_AT'] = time();
        $_SESSION['LAST_ACTIVITY'] = time();
        
        $this->getCsrfToken();
        
        if ($rememberMe) {
            $this->setRememberMeCookie($user['user_id']);
        }
    }
    
    private function setRememberMeCookie(int $userId): void
    {
        $token = bin2hex(random_bytes(32));
        $db = Database::getInstance();
        
        $stmt = $db->prepare('INSERT INTO user_session (session_token, user_id, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))');
        $stmt->execute([$token, $userId]);
        
        setcookie('remember_token', $token, [
            'expires' => time() + REMEMBER_ME_LIFETIME,
            'path' => '/',
            'domain' => '',
            'secure' => false,
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    }
    
    private function loginFromRememberToken(string $token): ?array
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('
            SELECT u.* 
            FROM user_session s 
            JOIN user u ON u.user_id = s.user_id 
            WHERE s.session_token = ? 
            AND (s.expires_at IS NULL OR s.expires_at > NOW())
        ');
        $stmt->execute([$token]);
        $user = $stmt->fetch();
        
        if ($user) {
            $this->loginUser($user, true);
            return $user;
        }
        
        return null;
    }
    
    private function deleteRememberToken(string $token): void
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('DELETE FROM user_session WHERE session_token = ?');
        $stmt->execute([$token]);
        
        setcookie('remember_token', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Lax'
        ]);
    }
    
    private function checkLoginLockout(string $email): void
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT attempts, locked_until FROM login_attempts WHERE email = ?');
        $stmt->execute([$email]);
        $attempt = $stmt->fetch();
        
        if ($attempt && $attempt['locked_until']) {
            $lockedUntil = new DateTime($attempt['locked_until']);
            $now = new DateTime();
            
            if ($lockedUntil > $now) {
                $minutesRemaining = ceil(($lockedUntil->getTimestamp() - $now->getTimestamp()) / 60);
                throw new Exception("Account locked due to too many failed login attempts. Please try again in {$minutesRemaining} minute(s).", 423);
            } else {
                $this->clearLoginAttempts($email);
            }
        }
    }
    
    private function recordFailedLogin(string $email): void
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('SELECT attempts FROM login_attempts WHERE email = ?');
        $stmt->execute([$email]);
        $attempt = $stmt->fetch();
        
        if ($attempt) {
            $newAttempts = (int)$attempt['attempts'] + 1;
            
            if ($newAttempts >= self::MAX_FAILED_ATTEMPTS) {
                $lockedUntil = date('Y-m-d H:i:s', strtotime("+" . self::LOCKOUT_MINUTES . " minutes"));
                $stmt = $db->prepare('UPDATE login_attempts SET attempts = ?, locked_until = ?, last_attempt_at = NOW() WHERE email = ?');
                $stmt->execute([$newAttempts, $lockedUntil, $email]);
                throw new Exception("Too many failed login attempts. Your account has been locked for " . self::LOCKOUT_MINUTES . " minutes.", 423);
            } else {
                $stmt = $db->prepare('UPDATE login_attempts SET attempts = ?, last_attempt_at = NOW() WHERE email = ?');
                $stmt->execute([$newAttempts, $email]);
            }
        } else {
            $stmt = $db->prepare('INSERT INTO login_attempts (email, attempts, last_attempt_at) VALUES (?, 1, NOW())');
            $stmt->execute([$email]);
        }
    }
    
    private function clearLoginAttempts(string $email): void
    {
        $db = Database::getInstance();
        $stmt = $db->prepare('DELETE FROM login_attempts WHERE email = ?');
        $stmt->execute([$email]);
    }
}


