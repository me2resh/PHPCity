<?php

declare(strict_types=1);

// Legacy compatibility functions for backward compatibility
// These are kept for compatibility with the existing parser.php script

/**
 * @deprecated Use ProjectParser class instead
 */
function parseNode($ast, $data) {
    static $parser;
    if (!$parser) {
        $parser = new \PHPCity\ProjectParser();
    }

    $reflection = new \ReflectionClass($parser);
    $method = $reflection->getMethod('parseNode');
    $method->setAccessible(true);

    return $method->invoke($parser, $ast, $data);
}

/**
 * @deprecated Use ProjectParser class instead
 */
function countType($ast, $type) {
    static $parser;
    if (!$parser) {
        $parser = new \PHPCity\ProjectParser();
    }

    $reflection = new \ReflectionClass($parser);
    $method = $reflection->getMethod('countType');
    $method->setAccessible(true);

    return $method->invoke($parser, $ast, $type);
}

/**
 * @deprecated Use ProjectParser class instead
 */
function determineFlags($ast, $data) {
    static $parser;
    if (!$parser) {
        $parser = new \PHPCity\ProjectParser();
    }

    $reflection = new \ReflectionClass($parser);
    $method = $reflection->getMethod('determineFlags');
    $method->setAccessible(true);

    return $method->invoke($parser, $ast, $data);
}

/**
 * @deprecated Use ProjectParser class instead
 */
function generateJSONFile($finalData, $projectName) {
    static $parser;
    if (!$parser) {
        $parser = new \PHPCity\ProjectParser();
    }

    return $parser->generateJsonFile($finalData, $projectName);
}