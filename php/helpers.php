<?php
/**
 * Shared helpers: frontmatter parser, content scanner, slug matching, utilities
 */

/**
 * Parse YAML-like frontmatter from a markdown file
 */
function parse_frontmatter(string $filepath): ?array {
    if (!is_file($filepath)) return null;

    $raw = file_get_contents($filepath);
    if (!str_starts_with($raw, '---')) return null;

    $end = strpos($raw, "\n---", 3);
    if ($end === false) return null;

    $block = substr($raw, 3, $end - 3);
    $lines = explode("\n", trim($block));

    $data = [];
    $currentKey = null;

    foreach ($lines as $line) {
        if (trim($line) === '') continue;

        // Indented line — array item (tags)
        if (preg_match('/^    - (.+)$/', $line, $m)) {
            if ($currentKey && is_array($data[$currentKey] ?? null)) {
                $data[$currentKey][] = trim($m[1]);
            } elseif ($currentKey) {
                $data[$currentKey] = [trim($m[1])];
            }
            continue;
        }

        // Indented line — nested key-value
        if (preg_match('/^    (\w+):\s*(.*)$/', $line, $m)) {
            if ($currentKey) {
                if (!is_array($data[$currentKey] ?? null)) {
                    $data[$currentKey] = [];
                }
                $data[$currentKey][trim($m[1])] = trim($m[2]);
            }
            continue;
        }

        // Top-level key
        if (preg_match('/^(\w[\w-]*):\s*(.*)$/', $line, $m)) {
            $currentKey = trim($m[1]);
            $value = trim($m[2], " \t\"'");
            $data[$currentKey] = $value !== '' ? $value : null;
        }
    }

    return $data;
}

/**
 * Scan content directories for markdown files
 */
function scan_content_files(string $contentDir, array $folders): array {
    $files = [];

    // Root-level files (about.md, etc.)
    foreach (glob($contentDir . '/*.md') as $f) {
        $files[] = 'content/' . basename($f);
    }

    // Subdirectory files
    foreach ($folders as $folder) {
        $dir = $contentDir . '/' . $folder;
        if (!is_dir($dir)) continue;
        foreach (glob($dir . '/*.md') as $f) {
            $files[] = 'content/' . $folder . '/' . basename($f);
        }
    }

    return $files;
}

/**
 * Get all published content items sorted by date
 */
function get_all_published(string $baseDir, string $contentDir, array $folders): array {
    $items = [];
    foreach (scan_content_files($contentDir, $folders) as $relpath) {
        $fm = parse_frontmatter($baseDir . '/' . $relpath);
        if (!$fm) continue;

        $status = $fm['status'] ?? '';
        if ($status !== 'published') continue;

        $items[] = [
            'file'        => $relpath,
            'title'       => $fm['title'] ?? basename($relpath, '.md'),
            'description' => $fm['description'] ?? '',
            'date'        => $fm['date']['published'] ?? null,
            'tags'        => is_array($fm['tags'] ?? null) ? $fm['tags'] : [],
            'featured'    => ($fm['featured'] ?? '') === 'true',
            'thumbnail'   => $fm['thumbnail'] ?? '',
            'category'    => $fm['category'] ?? null,
        ];
    }

    usort($items, function ($a, $b) {
        if (!$a['date'] && !$b['date']) return 0;
        if (!$a['date']) return 1;
        if (!$b['date']) return -1;
        return strcmp($b['date'], $a['date']);
    });

    return $items;
}

/**
 * HTML-escape helper
 */
function e(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * JSON response helper
 */
function json_out($data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

/**
 * Extract slug from a content file path
 */
function slug_from_path(string $relpath): string {
    return pathinfo($relpath, PATHINFO_FILENAME);
}

/**
 * Convert a content file path to a clean URL path
 * e.g. "content/projects/cypher.md" → "projects/cypher"
 */
function file_to_url_path(string $relpath): string {
    return preg_replace('#^content/|\.md$#', '', $relpath);
}

/**
 * Find a doc by matching a clean URL path against content files
 * e.g. "projects/cypher" matches "content/projects/cypher.md"
 */
function find_doc_by_path(string $urlPath, string $baseDir, string $contentDir, array $folders): ?array {
    $filepath = $contentDir . '/' . $urlPath . '.md';
    if (!is_file($filepath)) return null;

    // Ensure resolved path stays inside content directory
    $real = realpath($filepath);
    if (!$real || !str_starts_with($real, realpath($contentDir) . '/')) return null;

    $relpath = 'content/' . $urlPath . '.md';
    $fm = parse_frontmatter($filepath);
    return $fm ? array_merge($fm, ['_file' => $relpath]) : null;
}

/**
 * Check if the current session is authenticated as admin
 */
function is_admin(): bool {
    return ($_SESSION['admin'] ?? false) === true;
}
