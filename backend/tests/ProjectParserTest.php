<?php

declare(strict_types=1);

namespace PHPCity\Tests;

use PHPCity\ProjectParser;
use PHPUnit\Framework\TestCase;

class ProjectParserTest extends TestCase
{
    private ProjectParser $parser;
    private string $testDir;

    protected function setUp(): void
    {
        $this->parser = new ProjectParser();
        $this->testDir = sys_get_temp_dir() . '/phpcity_test_' . uniqid();
        mkdir($this->testDir);
    }

    protected function tearDown(): void
    {
        if (is_dir($this->testDir)) {
            $this->removeDirectory($this->testDir);
        }
    }

    public function testParseSimpleClass(): void
    {
        $classCode = '<?php
namespace Test;

class SimpleClass
{
    private $property1;
    public $property2;

    public function method1() {}
    private function method2() {}
}';

        file_put_contents($this->testDir . '/SimpleClass.php', $classCode);

        $result = $this->parser->parseDirectory($this->testDir);

        $this->assertCount(1, $result);
        $this->assertEquals('SimpleClass', $result[0]['name']);
        $this->assertEquals('Test', $result[0]['namespace']);
        $this->assertEquals('class', $result[0]['type']);
        $this->assertEquals(2, $result[0]['no_methods']);
        $this->assertFalse($result[0]['abstract']);
        $this->assertFalse($result[0]['final']);
    }

    public function testParseAbstractClass(): void
    {
        $classCode = '<?php
namespace Test;

abstract class AbstractClass
{
    abstract public function abstractMethod();
    public function concreteMethod() {}
}';

        file_put_contents($this->testDir . '/AbstractClass.php', $classCode);

        $result = $this->parser->parseDirectory($this->testDir);

        $this->assertCount(1, $result);
        $this->assertEquals('AbstractClass', $result[0]['name']);
        $this->assertTrue($result[0]['abstract']);
        $this->assertEquals('class', $result[0]['type']);
    }

    public function testParseInterface(): void
    {
        $classCode = '<?php
namespace Test;

interface TestInterface
{
    public function method1();
    public function method2();
}';

        file_put_contents($this->testDir . '/TestInterface.php', $classCode);

        $result = $this->parser->parseDirectory($this->testDir);

        $this->assertCount(1, $result);
        $this->assertEquals('TestInterface', $result[0]['name']);
        $this->assertEquals('interface', $result[0]['type']);
        $this->assertEquals(2, $result[0]['no_methods']);
    }

    public function testParseClassWithInheritance(): void
    {
        $classCode = '<?php
namespace Test;

class ChildClass extends ParentClass implements TestInterface
{
    public function method1() {}
}';

        file_put_contents($this->testDir . '/ChildClass.php', $classCode);

        $result = $this->parser->parseDirectory($this->testDir);

        $this->assertCount(1, $result);
        $this->assertEquals('ChildClass', $result[0]['name']);
        $this->assertEquals('ParentClass', $result[0]['extends']);
        $this->assertEquals('TestInterface', $result[0]['implements']);
    }

    public function testParseEmptyDirectory(): void
    {
        $result = $this->parser->parseDirectory($this->testDir);
        $this->assertEmpty($result);
    }

    public function testParseNonExistentDirectory(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        $this->parser->parseDirectory('/non/existent/directory');
    }

    public function testGenerateJsonFile(): void
    {
        $data = [
            [
                'name' => 'TestClass',
                'namespace' => 'Test',
                'type' => 'class',
                'no_methods' => 2,
                'no_attrs' => 1
            ]
        ];

        $outputDir = $this->testDir . '/output';
        $fileName = $this->parser->generateJsonFile($data, 'test-project', $outputDir);

        $this->assertEquals('test-project', $fileName);
        $this->assertFileExists($outputDir . '/test-project.json');

        $jsonContent = file_get_contents($outputDir . '/test-project.json');
        $decodedData = json_decode($jsonContent, true);

        $this->assertEquals($data, $decodedData);
    }

    private function removeDirectory(string $dir): void
    {
        $files = array_diff(scandir($dir), ['.', '..']);
        foreach ($files as $file) {
            $path = $dir . '/' . $file;
            if (is_dir($path)) {
                $this->removeDirectory($path);
            } else {
                unlink($path);
            }
        }
        rmdir($dir);
    }
}