#!/usr/bin/env php
<?php

declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';

use PHPCity\ProjectParser;

error_reporting(E_ERROR | E_WARNING | E_PARSE);

function main(): void
{
    global $argc, $argv;

    if ($argc < 2) {
        echo "Usage: php parse-project.php <project-directory> [output-directory]\n";
        echo "       php parse-project.php /path/to/php/project ./output\n";
        exit(1);
    }

    $projectDir = $argv[1];
    $outputDir = $argv[2] ?? './output';

    if (!is_dir($projectDir)) {
        echo "Error: Directory '$projectDir' does not exist or is not accessible.\n";
        exit(1);
    }

    try {
        $parser = new ProjectParser();
        $data = $parser->parseDirectory($projectDir);

        if (empty($data)) {
            echo "No PHP classes found in the specified directory.\n";
            exit(0);
        }

        $projectName = basename($projectDir);
        $fileName = $parser->generateJsonFile($data, $projectName, $outputDir);

        echo "Successfully parsed " . count($data) . " classes.\n";
        echo "JSON file generated: $outputDir/$fileName.json\n";

        // Show summary
        $classes = array_filter($data, fn($item) => $item['type'] === 'class');
        $interfaces = array_filter($data, fn($item) => $item['type'] === 'interface');
        $abstracts = array_filter($data, fn($item) => $item['abstract'] === true);
        $traits = array_filter($data, fn($item) => $item['trait'] === true);

        echo "\nSummary:\n";
        echo "  Classes: " . count($classes) . "\n";
        echo "  Interfaces: " . count($interfaces) . "\n";
        echo "  Abstract classes: " . count($abstracts) . "\n";
        echo "  Traits: " . count($traits) . "\n";

    } catch (Exception $e) {
        echo "Error: " . $e->getMessage() . "\n";
        exit(1);
    }
}

main();