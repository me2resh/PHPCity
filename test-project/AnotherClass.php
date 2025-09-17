<?php

namespace App\Services;

abstract class AnotherClass
{
    public $data;
    private $config;

    abstract public function process();

    public function getData()
    {
        return $this->data;
    }
}