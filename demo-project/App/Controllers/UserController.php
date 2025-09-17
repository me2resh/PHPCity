<?php

namespace App\Controllers;

class UserController extends BaseController
{
    private $userService;

    public function index() { /* list users */ }
    public function show($id) { /* show user */ }
    public function create() { /* create user */ }
    public function update($id) { /* update user */ }
    public function delete($id) { /* delete user */ }
}