<?php
function parseNode($ast, $data) {
    if (! $ast instanceof ast\Node) {
        return;
    }

    $kind = ast\get_kind_name($ast->kind);

    switch($kind) {
        case 'AST_NAMESPACE':
            $data['namespace'] = $ast->children['name'];
            break;
        case 'AST_CLASS':
            $data['name'] = $ast->children['name'] ?? 'Unknown';

            // Handle extends - check if it exists and get the name
            $data['extends'] = null;
            if ($ast->children['extends'] instanceof ast\Node) {
                $data['extends'] = $ast->children['extends']->children['name'] ?? null;
            }

            // Handle implements - check if it exists and get the first interface name
            $data['implements'] = null;
            if ($ast->children['implements'] instanceof ast\Node && !empty($ast->children['implements']->children)) {
                $firstInterface = $ast->children['implements']->children[0];
                if ($firstInterface instanceof ast\Node) {
                    $data['implements'] = $firstInterface->children['name'] ?? null;
                }
            }

            $data['no_lines'] = $ast->endLineno - $ast->lineno;
            $data['no_attrs'] = countType($ast->children['stmts'], 'AST_PROP_DECL');
            $data['no_methods'] = countType($ast->children['stmts'], 'AST_METHOD');

            $data = determineFlags($ast, $data);
            break;
    }

    return $data;
}

function countType($ast, $type) {
    $count = 0;

    if ($ast instanceof ast\Node) {
        foreach ($ast->children as $i => $child) {
            if (ast\get_kind_name($child->kind) == $type) {
                $count++;
            }
        }
    }

    return $count;
}

function determineFlags($ast, $data) {
    $flags = format_flags($ast->kind, $ast->flags);

    $data['abstract']  = strpos($flags, 'CLASS_ABSTRACT') !== false;
    $data['final']     = strpos($flags, 'CLASS_FINAL') !== false;
    $data['trait']     = strpos($flags, 'CLASS_TRAIT') !== false;
    $data['type']      = strpos($flags, 'CLASS_INTERFACE') !== false ? 'interface' : 'class';
    $data['anonymous'] = strpos($flags, 'CLASS_ANONYMOUS') !== false;

    return $data;
}

function generateJSONFile($finalData, $projectName) {
    $fileName   = mb_ereg_replace("([^\w\s\d\-_~,;\[\]\(\).])", '-', $projectName);
    $fileHandle = fopen('./output/' . $fileName . '.json', 'w');

    fwrite($fileHandle, json_encode($finalData));

    return $fileName;
}
