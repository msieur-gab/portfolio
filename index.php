<?php
/**
 * Thin router — dispatches to php/ modules
 *
 * Usage: php -S localhost:8000 index.php
 */

session_start();

$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Serve install.php directly (built-in server routes everything through index.php)
if ($path === '/install.php' && is_file(__DIR__ . '/install.php')) {
    require __DIR__ . '/install.php';
    exit;
}

// Load config
$configPath = __DIR__ . '/php/config.php';
if (!is_file($configPath)) {
    // No config — run install wizard
    if (is_file(__DIR__ . '/install.php')) {
        require __DIR__ . '/install.php';
        exit;
    }
    http_response_code(500);
    echo 'Missing php/config.php — run install.php first.';
    exit;
}

$cfg = require $configPath;
$cfg['site_url'] = rtrim($cfg['site_url'], '/');

// Load shared helpers
require __DIR__ . '/php/helpers.php';
$method = $_SERVER['REQUEST_METHOD'];

// ─── API / special routes ────────────────────────────────────────────────────

if ($path === '/content/manifest.json') {
    require __DIR__ . '/php/manifest.php';
    handle_manifest($cfg);
}

if ($path === '/feed.xml' || $path === '/rss') {
    require __DIR__ . '/php/feed.php';
    handle_feed($cfg);
}

if (str_starts_with($path, '/admin')) {
    require __DIR__ . '/php/admin.php';
    handle_admin($path, $method, $cfg);
}

// ─── Static files ────────────────────────────────────────────────────────────

if ($path !== '/' && $path !== '') {
    $filePath = __DIR__ . $path;

    if (is_file($filePath)) {
        $mimes = [
            'js'   => 'application/javascript', 'mjs'  => 'application/javascript',
            'css'  => 'text/css',               'svg'  => 'image/svg+xml',
            'png'  => 'image/png',              'jpg'  => 'image/jpeg',
            'jpeg' => 'image/jpeg',             'webp' => 'image/webp',
            'gif'  => 'image/gif',              'ico'  => 'image/x-icon',
            'woff' => 'font/woff',              'woff2'=> 'font/woff2',
            'ttf'  => 'font/ttf',               'otf'  => 'font/otf',
            'json' => 'application/json',        'md'   => 'text/markdown',
            'xml'  => 'application/xml',         'txt'  => 'text/plain',
            'html' => 'text/html',               'map'  => 'application/json',
            'php'  => 'text/plain',
        ];
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        if (isset($mimes[$ext])) {
            header('Content-Type: ' . $mimes[$ext]);
        }
        readfile($filePath);
        exit;
    }
}

// ─── Clean URL routing + OG meta injection ──────────────────────────────────

require __DIR__ . '/php/og.php';

$indexHtml = __DIR__ . '/index.html';

// Try to match path to a content document (e.g. /projects/cypher)
$urlPath = ltrim($path, '/');
if ($urlPath !== '' && $urlPath !== 'index.html') {
    $doc = find_doc_by_path($urlPath, __DIR__, $cfg['content_dir'], $cfg['content_folders']);
    if ($doc) {
        $ogTags = build_og_tags($doc, $cfg['site_url'], $urlPath);
        serve_with_og($indexHtml, $ogTags);
    }
}

// ─── SPA fallback (homepage or unmatched path) ──────────────────────────────

if (is_file($indexHtml)) {
    // Inject site-level OG tags for homepage
    $ogTags = build_site_og_tags($cfg['site_title'], $cfg['site_description'], $cfg['site_url']);
    serve_with_og($indexHtml, $ogTags);
} else {
    http_response_code(404);
    echo '<!DOCTYPE html><html><body><p>index.html not found</p></body></html>';
}
