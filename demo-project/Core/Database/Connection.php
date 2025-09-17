<?php

namespace Core\Database;

abstract class Connection
{
    protected $host;
    protected $database;
    protected $username;
    protected $password;

    abstract public function connect();
    abstract public function query($sql);
    abstract public function prepare($sql);

    public function getHost() { return $this->host; }
    public function getDatabase() { return $this->database; }
}