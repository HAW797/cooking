<?php

// CommunityPost Model extends BaseModel
class CommunityPost extends BaseModel
{
    protected string $table = 'community_cookbook';
    protected string $primaryKey = 'post_id';
    protected array $fillable = [
        'user_id',
        'post_title',
        'description',
        'image_url'
    ];
    
    public function getAllWithAuthor(): array
    {
        $sql = "SELECT 
                    c.post_id, 
                    c.post_title, 
                    c.description, 
                    c.image_url, 
                    c.created_at,
                    c.user_id,
                    CONCAT(u.first_name, ' ', u.last_name) as author_name
                FROM {$this->table} c
                INNER JOIN user u ON c.user_id = u.user_id
                ORDER BY c.created_at DESC";
        
        return $this->query($sql)->fetchAll();
    }
    
    public function getByUser(int $userId): array
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }
    
    public function isOwner(int $postId, int $userId): bool
    {
        $stmt = $this->db->prepare("SELECT post_id FROM {$this->table} WHERE post_id = ? AND user_id = ?");
        $stmt->execute([$postId, $userId]);
        return (bool)$stmt->fetch();
    }
}


