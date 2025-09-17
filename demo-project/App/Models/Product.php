<?php

namespace App\Models;

class Product extends Model
{
    private $name;
    private $price;
    private $description;

    public function getName() { return $this->name; }
    public function getPrice() { return $this->price; }
    public function setPrice($price) { $this->price = $price; }
}