<?php
/**
 * Atom feed endpoint — GET /feed.xml
 */

function handle_feed(array $cfg): never {
    $baseDir = dirname(__DIR__);
    $items = get_all_published($baseDir, $cfg['content_dir'], $cfg['content_folders']);
    $siteUrl = rtrim($cfg['site_url'], '/');
    $siteTitle = $cfg['site_title'];
    $siteDesc = $cfg['site_description'];

    header('Content-Type: application/xml; charset=utf-8');
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<feed xmlns="http://www.w3.org/2005/Atom">' . "\n";
    echo '  <title>' . e($siteTitle) . '</title>' . "\n";
    echo '  <link href="' . e($siteUrl) . '/" />' . "\n";
    echo '  <link rel="self" href="' . e($siteUrl) . '/feed.xml" />' . "\n";
    echo '  <subtitle>' . e($siteDesc) . '</subtitle>' . "\n";

    $latestDate = $items[0]['date'] ?? null;
    $updated = $latestDate ? date('c', strtotime($latestDate)) : date('c');
    echo '  <updated>' . $updated . '</updated>' . "\n";
    echo '  <id>' . e($siteUrl) . '/</id>' . "\n";

    foreach ($items as $item) {
        $urlPath = file_to_url_path($item['file']);
        $url = $siteUrl . '/' . $urlPath;
        $pubDate = $item['date'] ? date('c', strtotime($item['date'])) : date('c');

        echo "  <entry>\n";
        echo '    <title>' . e($item['title']) . '</title>' . "\n";
        echo '    <link href="' . e($url) . '" />' . "\n";
        echo '    <id>' . e($siteUrl . '/' . $item['file']) . '</id>' . "\n";
        echo '    <updated>' . $pubDate . '</updated>' . "\n";
        if ($item['description']) {
            echo '    <summary>' . e($item['description']) . '</summary>' . "\n";
        }
        echo "  </entry>\n";
    }

    echo '</feed>';
    exit;
}
