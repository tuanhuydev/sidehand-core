<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;


/**
 * Category
 *
 * @mixin Builder
 */
class Category extends Model
{
    use HasFactory;

    protected $hidden = ['type', 'created_at', 'updated_at', 'deleted_at'];
    public function tasks()
    {
      $this->hasMany(Task::class);
    }
}
