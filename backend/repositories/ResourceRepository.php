<?php

class ResourceRepository extends BaseRepository
{
    protected string $table = 'resource';
    protected string $primaryKey = 'resource_id';
    
    public function getByType(string $type): array
    {
        return $this->getAll([
            'where' => [
                'condition' => 'resource_type = ?',
                'params' => [$type]
            ],
            'orderBy' => 'created_at DESC'
        ]);
    }
}


