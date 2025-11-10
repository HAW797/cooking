<?php

// EXAMPLE 2 OF INHERITANCE: UserRepository extends BaseRepository
class UserRepository extends BaseRepository
{
    protected string $table = 'user';
    protected string $primaryKey = 'user_id';
    
    // Child class adds specialized database queries
    public function findByEmail(string $email): ?array
    {
        return $this->findBy('email', $email);
    }
    
    public function emailExists(string $email): bool
    {
        return $this->findByEmail($email) !== null;
    }
    
    public function createUser(string $firstName, string $lastName, string $email, string $password): int
    {
        $passwordHash = password_hash($password, PASSWORD_DEFAULT);
        
        return $this->insert([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'email' => $email,
            'password_hash' => $passwordHash
        ]);
    }
    
    public function verifyPassword(array $user, string $password): bool
    {
        return password_verify($password, $user['password_hash']);
    }
    
    public function updateLoginAttempts(string $email, int $attempts, string $lockedUntil = null): void
    {
        $user = $this->findByEmail($email);
        if (!$user) return;
        
        $this->update($user['user_id'], [
            'failed_login_attempts' => $attempts,
            'account_locked_until' => $lockedUntil
        ]);
    }
}


