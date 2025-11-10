<?php

class Event extends BaseModel
{
    protected string $table = 'event';
    protected string $primaryKey = 'event_id';
    protected array $fillable = [
        'event_title',
        'event_date',
        'location',
        'description',
        'image_url'
    ];
    
    public function getUpcoming(int $limit = null): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE event_date >= NOW() ORDER BY event_date ASC";
        if ($limit) {
            $sql .= " LIMIT {$limit}";
        }
        return $this->db->query($sql)->fetchAll();
    }
    
    public function getPast(int $limit = null): array
    {
        $sql = "SELECT * FROM {$this->table} WHERE event_date < NOW() ORDER BY event_date DESC";
        if ($limit) {
            $sql .= " LIMIT {$limit}";
        }
        return $this->db->query($sql)->fetchAll();
    }
}


