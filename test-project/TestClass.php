<?php

namespace App\Models;

class TestClass extends BaseClass implements TestInterface
{
    private $attribute1;
    protected $attribute2;
    public $attribute3;

    public function method1()
    {
        return "test";
    }

    public function method2($param)
    {
        return $param;
    }

    private function privateMethod()
    {
        return true;
    }
}