<?php

namespace App\Models;

class User extends Model implements AuthenticatableContract
{
    private $id;
    private $email;
    private $password;
    private $createdAt;

    public function getId() { return $this->id; }
    public function getEmail() { return $this->email; }
    public function setEmail($email) { $this->email = $email; }
    public function authenticate($password) { return true; }
    public function save() { /* save logic */ }
}