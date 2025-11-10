<?php

class Resource extends BaseModel
{
    protected string $table = 'resource';
    protected string $primaryKey = 'resource_id';
    protected array $fillable = [
        'title',
        'description',
        'topic',
        'resource_type',
        'file_url'
    ];
    
    public function getByType(string $type): array
    {
        $stmt = $this->db->prepare("SELECT * FROM {$this->table} WHERE resource_type = ? ORDER BY created_at DESC");
        $stmt->execute([$type]);
        return $stmt->fetchAll();
    }
}


