<?php

declare(strict_types=1);

namespace PHPCity;

use ast\Node;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;
use RegexIterator;
use RecursiveRegexIterator;
use UnexpectedValueException;

/**
 * Parses PHP projects and extracts class information for visualization
 */
class ProjectParser
{
    private const AST_VERSION = 120;

    public function __construct()
    {
        if (!extension_loaded('ast')) {
            throw new \RuntimeException('The php-ast extension is required');
        }
    }

    /**
     * Parse a directory containing PHP files
     */
    public function parseDirectory(string $baseDir): array
    {
        try {
            $directory = new RecursiveDirectoryIterator($baseDir);
        } catch (UnexpectedValueException $e) {
            throw new \InvalidArgumentException("The directory '$baseDir' could not be found or accessed", 0, $e);
        }

        $iterator = new RecursiveIteratorIterator($directory);
        $regex = new RegexIterator($iterator, '/^.+\.php$/i', RecursiveRegexIterator::GET_MATCH);

        $finalData = [];

        foreach ($regex as $name => $object) {
            $data = [
                "file" => preg_replace("/^" . preg_quote($baseDir . DIRECTORY_SEPARATOR, '/') . "/", '', $name, 1)
            ];

            $ast = \ast\parse_file($name, self::AST_VERSION);

            if ($ast instanceof Node) {
                foreach ($ast->children as $child) {
                    $data = $this->parseNode($child, $data);
                }
            }

            if (!isset($data['type'])) {
                continue;
            }

            $finalData[] = $data;
        }

        return $finalData;
    }

    /**
     * Parse an individual AST node
     */
    private function parseNode($ast, array $data): array
    {
        if (!$ast instanceof Node) {
            return $data;
        }

        $kind = \ast\get_kind_name($ast->kind);

        switch ($kind) {
            case 'AST_NAMESPACE':
                $data['namespace'] = $ast->children['name'];
                break;
            case 'AST_CLASS':
                $data['name'] = $ast->children['name'] ?? 'Unknown';

                // Handle extends - check if it exists and get the name
                $data['extends'] = null;
                if ($ast->children['extends'] instanceof Node) {
                    $data['extends'] = $ast->children['extends']->children['name'] ?? null;
                }

                // Handle implements - check if it exists and get the first interface name
                $data['implements'] = null;
                if ($ast->children['implements'] instanceof Node && !empty($ast->children['implements']->children)) {
                    $firstInterface = $ast->children['implements']->children[0];
                    if ($firstInterface instanceof Node) {
                        $data['implements'] = $firstInterface->children['name'] ?? null;
                    }
                }

                $data['no_lines'] = $ast->endLineno - $ast->lineno;
                $data['no_attrs'] = $this->countType($ast->children['stmts'], 'AST_PROP_DECL');
                $data['no_methods'] = $this->countType($ast->children['stmts'], 'AST_METHOD');

                $data = $this->determineFlags($ast, $data);
                break;
        }

        return $data;
    }

    /**
     * Count nodes of a specific type
     */
    private function countType($ast, string $type): int
    {
        $count = 0;

        if ($ast instanceof Node) {
            foreach ($ast->children as $child) {
                if (\ast\get_kind_name($child->kind) === $type) {
                    $count++;
                }
            }
        }

        return $count;
    }

    /**
     * Determine class flags and type information
     */
    private function determineFlags(Node $ast, array $data): array
    {
        $flags = $this->formatFlags($ast->kind, $ast->flags);

        $data['abstract'] = strpos($flags, 'CLASS_ABSTRACT') !== false;
        $data['final'] = strpos($flags, 'CLASS_FINAL') !== false;
        $data['trait'] = strpos($flags, 'CLASS_TRAIT') !== false;
        $data['type'] = strpos($flags, 'CLASS_INTERFACE') !== false ? 'interface' : 'class';
        $data['anonymous'] = strpos($flags, 'CLASS_ANONYMOUS') !== false;

        return $data;
    }

    /**
     * Format AST flags for display
     */
    private function formatFlags(int $kind, int $flags): string
    {
        // For classes, we primarily care about these flags
        if ($kind === \ast\AST_CLASS) {
            $flagNames = [];

            if ($flags & \ast\flags\CLASS_ABSTRACT) {
                $flagNames[] = 'CLASS_ABSTRACT';
            }
            if ($flags & \ast\flags\CLASS_FINAL) {
                $flagNames[] = 'CLASS_FINAL';
            }
            if ($flags & \ast\flags\CLASS_TRAIT) {
                $flagNames[] = 'CLASS_TRAIT';
            }
            if ($flags & \ast\flags\CLASS_INTERFACE) {
                $flagNames[] = 'CLASS_INTERFACE';
            }
            if ($flags & \ast\flags\CLASS_ANONYMOUS) {
                $flagNames[] = 'CLASS_ANONYMOUS';
            }

            return implode(' | ', $flagNames);
        }

        return (string) $flags;
    }

    /**
     * Generate JSON file with parsed data
     */
    public function generateJsonFile(array $data, string $projectName, string $outputDir = './output'): string
    {
        if (!is_dir($outputDir)) {
            mkdir($outputDir, 0755, true);
        }

        $fileName = preg_replace('/[^\w\s\d\-_~,;\[\]\(\).]/', '-', $projectName);
        $filePath = $outputDir . DIRECTORY_SEPARATOR . $fileName . '.json';

        $result = file_put_contents($filePath, json_encode($data, JSON_PRETTY_PRINT));

        if ($result === false) {
            throw new \RuntimeException("Failed to write JSON file to '$filePath'");
        }

        return $fileName;
    }
}