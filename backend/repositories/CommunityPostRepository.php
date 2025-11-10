<?php

class CommunityPostRepository extends BaseRepository
{
    protected string $table = 'community_cookbook';
    protected string $primaryKey = 'post_id';
    
    public function getAllWithDetails(int $currentUserId = null): array
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
        
        $posts = $this->query($sql)->fetchAll();
        
        foreach ($posts as &$post) {
            $post['like_count'] = $this->getLikeCount($post['post_id']);
            $post['user_liked'] = $currentUserId ? $this->isLikedByUser($post['post_id'], $currentUserId) : false;
        }
        
        return $posts;
    }
    
    public function getLikeCount(int $postId): int
    {
        $stmt = $this->query('SELECT COUNT(*) as count FROM cookbook_likes WHERE post_id = ?', [$postId]);
        $result = $stmt->fetch();
        return (int)$result['count'];
    }
    
    public function isLikedByUser(int $postId, int $userId): bool
    {
        $stmt = $this->query('SELECT like_id FROM cookbook_likes WHERE post_id = ? AND user_id = ?', [$postId, $userId]);
        return (bool)$stmt->fetch();
    }
    
    public function isOwner(int $postId, int $userId): bool
    {
        $stmt = $this->query("SELECT post_id FROM {$this->table} WHERE post_id = ? AND user_id = ?", [$postId, $userId]);
        return (bool)$stmt->fetch();
    }
    
    public function toggleLike(int $postId, int $userId): array
    {
        if ($this->isLikedByUser($postId, $userId)) {
            $stmt = $this->db->prepare('DELETE FROM cookbook_likes WHERE post_id = ? AND user_id = ?');
            $stmt->execute([$postId, $userId]);
            $liked = false;
        } else {
            $stmt = $this->db->prepare('INSERT INTO cookbook_likes (post_id, user_id) VALUES (?, ?)');
            $stmt->execute([$postId, $userId]);
            $liked = true;
        }
        
        return [
            'liked' => $liked,
            'likes_count' => $this->getLikeCount($postId)
        ];
    }
}


