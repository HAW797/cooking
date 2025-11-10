<?php

// EXAMPLE 1 OF INHERITANCE: User Model extends BaseModel
class User extends BaseModel
{
    protected string $table = 'user';
    protected string $primaryKey = 'user_id';
    protected array $fillable = [
        'first_name',
        'last_name', 
        'email',
        'password_hash',
        'failed_login_attempts',
        'account_locked_until'
    ];
    
    // Child class adds specialized methods
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE email = ?");
        $stmt->execute([$email]);
        $result = $stmt->fetch();
        return $result ?: null;
    }
    
    public function incrementFailedAttempts(int $userId): void
    {
        $stmt = $this->db->prepare(
            "UPDATE {$this->table} 
             SET failed_login_attempts = failed_login_attempts + 1 
             WHERE {$this->primaryKey} = ?"
        );
        $stmt->execute([$userId]);
    }
    
    public function resetFailedAttempts(int $userId): void
    {
        $stmt = $this->db->prepare(
            "UPDATE {$this->table} 
             SET failed_login_attempts = 0, account_locked_until = NULL 
             WHERE {$this->primaryKey} = ?"
        );
        $stmt->execute([$userId]);
    }
    
    public function lockAccount(int $userId, int $minutes): void
    {
        $lockedUntil = date('Y-m-d H:i:s', strtotime("+{$minutes} minutes"));
        $stmt = $this->db->prepare(
            "UPDATE {$this->table} 
             SET account_locked_until = ? 
             WHERE {$this->primaryKey} = ?"
        );
        $stmt->execute([$lockedUntil, $userId]);
    }
}


