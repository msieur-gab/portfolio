<?php
/**
 * OG meta injection — injects Open Graph tags into index.html before serving
 */

/**
 * Build OG meta tags for a specific document
 */
function build_og_tags(array $doc, string $siteUrl, string $urlPath): string {
    $title = e($doc['title'] ?? '');
    $desc = e($doc['description'] ?? '');
    $url = e($siteUrl . '/' . $urlPath);
    $thumbnail = !empty($doc['thumbnail']) ? e($siteUrl . $doc['thumbnail']) : '';

    $og = <<<META
    <meta property="og:title" content="{$title}">
    <meta property="og:description" content="{$desc}">
    <meta property="og:url" content="{$url}">
    <meta property="og:type" content="article">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{$title}">
    <meta name="twitter:description" content="{$desc}">
    <link rel="canonical" href="{$url}">
    META;

    if ($thumbnail) {
        $og .= "\n    " . '<meta property="og:image" content="' . $thumbnail . '">';
        $og .= "\n    " . '<meta name="twitter:image" content="' . $thumbnail . '">';
    }

    return $og;
}

/**
 * Build site-level OG meta tags (fallback)
 */
function build_site_og_tags(string $siteTitle, string $siteDesc, string $siteUrl): string {
    $t = e($siteTitle);
    $d = e($siteDesc);
    $u = e($siteUrl);

    return <<<META
    <meta property="og:title" content="{$t}">
    <meta property="og:description" content="{$d}">
    <meta property="og:url" content="{$u}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{$t}">
    <meta name="twitter:description" content="{$d}">
    <link rel="canonical" href="{$u}">
    META;
}

/**
 * Serve index.html with OG meta tags injected
 */
function serve_with_og(string $indexHtml, string $ogTags): never {
    if (!is_file($indexHtml)) {
        http_response_code(500);
        echo 'index.html not found';
        exit;
    }

    $html = file_get_contents($indexHtml);
    // Replace the static fallback OG tags with document-specific ones
    // Remove existing og/twitter meta tags first, then inject new ones
    $html = preg_replace('/\s*<meta property="og:[^>]+>\s*/s', '', $html);
    $html = preg_replace('/\s*<meta name="twitter:[^>]+>\s*/s', '', $html);
    $html = preg_replace('/\s*<link rel="canonical"[^>]+>\s*/s', '', $html);
    $html = str_replace('</head>', $ogTags . "\n  </head>", $html);

    header('Content-Type: text/html; charset=utf-8');
    echo $html;
    exit;
}
