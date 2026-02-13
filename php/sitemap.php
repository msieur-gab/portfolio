<?php
/**
 * Sitemap endpoint — GET /sitemap.xml
 */

function handle_sitemap(array $cfg): never {
    $baseDir = dirname(__DIR__);
    $items = get_all_published($baseDir, $cfg['content_dir'], $cfg['content_folders']);
    $siteUrl = rtrim($cfg['site_url'], '/');

    header('Content-Type: application/xml; charset=utf-8');
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";

    // Homepage
    echo "  <url>\n";
    echo '    <loc>' . e($siteUrl) . '/</loc>' . "\n";
    echo "    <changefreq>weekly</changefreq>\n";
    echo "    <priority>1.0</priority>\n";
    echo "  </url>\n";

    // Published content
    foreach ($items as $item) {
        $urlPath = file_to_url_path($item['file']);
        $loc = $siteUrl . '/' . $urlPath;
        $lastmod = $item['date'] ? date('Y-m-d', strtotime($item['date'])) : '';

        echo "  <url>\n";
        echo '    <loc>' . e($loc) . '</loc>' . "\n";
        if ($lastmod) {
            echo '    <lastmod>' . $lastmod . '</lastmod>' . "\n";
        }
        echo "  </url>\n";
    }

    echo '</urlset>';
    exit;
}
