<?php
/**
 * Filesystem-aware content server
 * Dynamically discovers markdown files on disk — no manifest maintenance needed.
 *
 * Features:
 * - Dynamic manifest endpoint (replaces static manifest.json)
 * - OG meta injection for social sharing / crawlers
 * - Atom feed generation from frontmatter
 * - Email subscribe/unsubscribe
 * - Admin panel for file uploads (md, images, prototypes)
 * - Static file serving + SPA fallback
 *
 * Usage: php -S localhost:8000 index.php
 */

// ─── Config ───────────────────────────────────────────────────────────────────

define('SITE_TITLE', '../');
define('SITE_URL', rtrim($_ENV['SITE_URL'] ?? 'http://localhost:8000', '/'));
define('SITE_DESCRIPTION', 'Design, technology, and experiments');
define('ADMIN_PASSWORD', $_ENV['ADMIN_PASSWORD'] ?? 'changeme');
define('CONTENT_DIR', __DIR__ . '/content');
define('INDEX_HTML', __DIR__ . '/index.html');
define('DB_PATH', __DIR__ . '/subscribers.db');

// Content subdirectories to scan
define('CONTENT_FOLDERS', ['projects', 'experiments', 'research']);

// Upload targets
define('UPLOAD_TARGETS', [
    'projects'   => CONTENT_DIR . '/projects',
    'experiments' => CONTENT_DIR . '/experiments',
    'research'   => CONTENT_DIR . '/research',
    'media'      => CONTENT_DIR . '/media',
    'prototypes' => CONTENT_DIR . '/prototypes',
]);

// ─── Database (subscribers only) ─────────────────────────────────────────────

function has_sqlite(): bool {
    return extension_loaded('sqlite3');
}

function db(): ?SQLite3 {
    static $db = null;
    if ($db) return $db;
    if (!has_sqlite()) return null;

    $db = new SQLite3(DB_PATH);
    $db->enableExceptions(true);
    $db->exec('PRAGMA journal_mode=WAL');

    $db->exec('CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        confirmed INTEGER DEFAULT 0,
        token TEXT NOT NULL,
        subscribed_at TEXT DEFAULT CURRENT_TIMESTAMP
    )');

    return $db;
}

// ─── Frontmatter parser ──────────────────────────────────────────────────────

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

        // Indented line — nested value
        if (preg_match('/^    - (.+)$/', $line, $m)) {
            // Array item (tags)
            if ($currentKey && is_array($data[$currentKey] ?? null)) {
                $data[$currentKey][] = trim($m[1]);
            } elseif ($currentKey) {
                $data[$currentKey] = [trim($m[1])];
            }
            continue;
        }

        if (preg_match('/^    (\w+):\s*(.*)$/', $line, $m)) {
            // Nested key-value (e.g. date: published: 2025-01-27)
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

// ─── Content discovery ───────────────────────────────────────────────────────

function scan_content_files(): array {
    $files = [];

    // Root-level files (about.md, etc.)
    foreach (glob(CONTENT_DIR . '/*.md') as $f) {
        $files[] = 'content/' . basename($f);
    }

    // Subdirectory files
    foreach (CONTENT_FOLDERS as $folder) {
        $dir = CONTENT_DIR . '/' . $folder;
        if (!is_dir($dir)) continue;
        foreach (glob($dir . '/*.md') as $f) {
            $files[] = 'content/' . $folder . '/' . basename($f);
        }
    }

    return $files;
}

function get_all_published(): array {
    $items = [];
    foreach (scan_content_files() as $relpath) {
        $fm = parse_frontmatter(__DIR__ . '/' . $relpath);
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

    // Sort by date descending, undated last
    usort($items, function ($a, $b) {
        if (!$a['date'] && !$b['date']) return 0;
        if (!$a['date']) return 1;
        if (!$b['date']) return -1;
        return strcmp($b['date'], $a['date']);
    });

    return $items;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function e(string $s): string {
    return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function is_crawler(): bool {
    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    $bots = ['facebookexternalhit', 'Twitterbot', 'LinkedInBot', 'Slackbot',
             'WhatsApp', 'TelegramBot', 'Discordbot', 'Googlebot', 'bingbot'];
    foreach ($bots as $bot) {
        if (stripos($ua, $bot) !== false) return true;
    }
    return false;
}

function json_out($data, int $status = 200): never {
    http_response_code($status);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    echo json_encode($data, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT);
    exit;
}

function slug_from_path(string $relpath): string {
    return pathinfo($relpath, PATHINFO_FILENAME);
}

function find_doc_by_slug(string $slug): ?array {
    foreach (scan_content_files() as $relpath) {
        if (slug_from_path($relpath) === $slug) {
            $fm = parse_frontmatter(__DIR__ . '/' . $relpath);
            return $fm ? array_merge($fm, ['_file' => $relpath]) : null;
        }
    }
    return null;
}

function is_admin(): bool {
    return ($_SESSION['admin'] ?? false) === true;
}

// ─── Routing ─────────────────────────────────────────────────────────────────

session_start();

$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// ─── Dynamic manifest ────────────────────────────────────────────────────────

if ($path === '/content/manifest.json') {
    $files = scan_content_files();
    json_out(['files' => $files]);
}

// ─── Atom feed ───────────────────────────────────────────────────────────────

if ($path === '/feed.xml' || $path === '/rss') {
    $items = get_all_published();

    header('Content-Type: application/xml; charset=utf-8');
    echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    echo '<feed xmlns="http://www.w3.org/2005/Atom">' . "\n";
    echo '  <title>' . e(SITE_TITLE) . '</title>' . "\n";
    echo '  <link href="' . e(SITE_URL) . '/" />' . "\n";
    echo '  <link rel="self" href="' . e(SITE_URL) . '/feed.xml" />' . "\n";
    echo '  <subtitle>' . e(SITE_DESCRIPTION) . '</subtitle>' . "\n";

    $latestDate = $items[0]['date'] ?? null;
    $updated = $latestDate ? date('c', strtotime($latestDate)) : date('c');
    echo '  <updated>' . $updated . '</updated>' . "\n";
    echo '  <id>' . e(SITE_URL) . '/</id>' . "\n";

    foreach ($items as $item) {
        $slug = slug_from_path($item['file']);
        $url = SITE_URL . '/#' . $slug;
        $pubDate = $item['date'] ? date('c', strtotime($item['date'])) : date('c');

        echo "  <entry>\n";
        echo '    <title>' . e($item['title']) . '</title>' . "\n";
        echo '    <link href="' . e($url) . '" />' . "\n";
        echo '    <id>' . e(SITE_URL . '/' . $item['file']) . '</id>' . "\n";
        echo '    <updated>' . $pubDate . '</updated>' . "\n";
        if ($item['description']) {
            echo '    <summary>' . e($item['description']) . '</summary>' . "\n";
        }
        echo "  </entry>\n";
    }

    echo '</feed>';
    exit;
}

// ─── Subscribe ───────────────────────────────────────────────────────────────

if ($path === '/api/subscribe' && $method === 'POST') {
    if (!has_sqlite()) json_out(['error' => 'Subscriptions unavailable (SQLite not installed)'], 503);

    $input = json_decode(file_get_contents('php://input'), true);
    $email = filter_var($input['email'] ?? '', FILTER_VALIDATE_EMAIL);
    if (!$email) json_out(['error' => 'Invalid email'], 400);

    $token = bin2hex(random_bytes(16));
    $stmt = db()->prepare('INSERT OR IGNORE INTO subscribers (email, token) VALUES (:email, :token)');
    $stmt->bindValue(':email', $email);
    $stmt->bindValue(':token', $token);
    $stmt->execute();

    json_out(['ok' => true, 'message' => 'Subscribed']);
}

if (preg_match('#^/unsubscribe/([a-f0-9]+)$#', $path, $m)) {
    if (has_sqlite()) {
        $stmt = db()->prepare('DELETE FROM subscribers WHERE token = :token');
        $stmt->bindValue(':token', $m[1]);
        $stmt->execute();
    }
    echo '<!DOCTYPE html><html><body><p>Unsubscribed. You won\'t receive further emails.</p></body></html>';
    exit;
}

// ─── Admin ───────────────────────────────────────────────────────────────────

if (str_starts_with($path, '/admin')) {

    // Login
    if ($path === '/admin/login' && $method === 'POST') {
        if (hash_equals(ADMIN_PASSWORD, $_POST['password'] ?? '')) {
            $_SESSION['admin'] = true;
        }
        header('Location: /admin');
        exit;
    }

    if ($path === '/admin/logout') {
        $_SESSION['admin'] = false;
        header('Location: /admin');
        exit;
    }

    // Auth gate
    if (!is_admin() && $path !== '/admin/login') {
        echo <<<'HTML'
        <!DOCTYPE html>
        <html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width">
        <title>Admin — Login</title>
        <style>
            * { margin: 0; box-sizing: border-box; }
            body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 100vh; background: #fafafa; }
            form { display: flex; flex-direction: column; gap: .75rem; width: 280px; }
            input { padding: .6rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
            button { padding: .6rem; background: #111; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
        </style></head><body>
        <form method="POST" action="/admin/login">
            <input type="password" name="password" placeholder="Password" autofocus>
            <button type="submit">Enter</button>
        </form></body></html>
        HTML;
        exit;
    }

    // ─── Upload handler ──────────────────────────────────────────────────

    if ($path === '/admin/upload' && $method === 'POST') {
        $target = $_POST['target'] ?? '';

        if (!isset(UPLOAD_TARGETS[$target])) {
            $_SESSION['flash'] = 'Invalid upload target.';
            header('Location: /admin');
            exit;
        }

        $destDir = UPLOAD_TARGETS[$target];
        if (!is_dir($destDir)) mkdir($destDir, 0755, true);

        // Allowed extensions per target
        $allowedExt = match ($target) {
            'projects', 'experiments', 'research' => ['md'],
            'media' => ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg'],
            'prototypes' => ['html', 'css', 'js', 'svg', 'jpg', 'jpeg', 'png', 'webp', 'gif', 'json'],
        };

        $uploaded = 0;
        $skipped = 0;
        $files = $_FILES['files'] ?? null;

        if ($files && is_array($files['name'])) {
            $count = count($files['name']);
            for ($i = 0; $i < $count; $i++) {
                if ($files['error'][$i] !== UPLOAD_ERR_OK) { $skipped++; continue; }

                $name = basename($files['name'][$i]);
                $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));

                if (!in_array($ext, $allowedExt)) { $skipped++; continue; }

                // Sanitize filename: lowercase, hyphens, no spaces
                $safeName = preg_replace('/[^a-z0-9.\-]/', '-', strtolower($name));
                $safeName = preg_replace('/-+/', '-', $safeName);

                if (move_uploaded_file($files['tmp_name'][$i], $destDir . '/' . $safeName)) {
                    $uploaded++;
                } else {
                    $skipped++;
                }
            }
        }

        $_SESSION['flash'] = "{$uploaded} file(s) uploaded to {$target}." . ($skipped ? " {$skipped} skipped." : '');
        header('Location: /admin');
        exit;
    }

    // ─── Delete file handler ─────────────────────────────────────────────

    if ($path === '/admin/delete' && $method === 'POST') {
        $target = $_POST['target'] ?? '';
        $filename = basename($_POST['filename'] ?? '');

        if (isset(UPLOAD_TARGETS[$target]) && $filename) {
            $filepath = UPLOAD_TARGETS[$target] . '/' . $filename;
            if (is_file($filepath)) {
                unlink($filepath);
                $_SESSION['flash'] = "Deleted {$filename} from {$target}.";
            }
        }
        header('Location: /admin');
        exit;
    }

    // ─── Admin dashboard ─────────────────────────────────────────────────

    $subs = has_sqlite() ? db()->querySingle('SELECT COUNT(*) FROM subscribers') : '—';
    $flash = $_SESSION['flash'] ?? '';
    unset($_SESSION['flash']);

    // Gather content files with status
    $allContent = [];
    foreach (scan_content_files() as $relpath) {
        $fm = parse_frontmatter(__DIR__ . '/' . $relpath);
        $allContent[] = [
            'file'   => $relpath,
            'title'  => $fm['title'] ?? basename($relpath, '.md'),
            'status' => $fm['status'] ?? '—',
        ];
    }

    // Gather media files
    $mediaFiles = [];
    $mediaDir = CONTENT_DIR . '/media';
    if (is_dir($mediaDir)) {
        foreach (glob($mediaDir . '/*.*') as $f) {
            $mediaFiles[] = basename($f);
        }
        sort($mediaFiles);
    }

    // Gather prototype files
    $protoFiles = [];
    $protoDir = CONTENT_DIR . '/prototypes';
    if (is_dir($protoDir)) {
        foreach (glob($protoDir . '/*.*') as $f) {
            $protoFiles[] = basename($f);
        }
        sort($protoFiles);
    }

    // Build content table rows
    $contentRows = '';
    foreach ($allContent as $item) {
        $statusColor = match ($item['status']) {
            'published' => '#090',
            'draft'     => '#c90',
            default     => '#999',
        };
        $contentRows .= '<tr>';
        $contentRows .= '<td>' . e($item['title']) . '</td>';
        $contentRows .= '<td><code>' . e($item['file']) . '</code></td>';
        $contentRows .= '<td><span style="color:' . $statusColor . '">' . e($item['status']) . '</span></td>';
        $contentRows .= '</tr>';
    }

    // Build media list
    $mediaList = '';
    foreach ($mediaFiles as $f) {
        $mediaList .= '<li>' . e($f) . ' <form method="POST" action="/admin/delete" style="display:inline">';
        $mediaList .= '<input type="hidden" name="target" value="media">';
        $mediaList .= '<input type="hidden" name="filename" value="' . e($f) . '">';
        $mediaList .= '<button type="submit" onclick="return confirm(\'Delete ' . e($f) . '?\')" class="del">×</button>';
        $mediaList .= '</form></li>';
    }

    // Build prototypes list
    $protoList = '';
    foreach ($protoFiles as $f) {
        $protoList .= '<li>' . e($f) . ' <form method="POST" action="/admin/delete" style="display:inline">';
        $protoList .= '<input type="hidden" name="target" value="prototypes">';
        $protoList .= '<input type="hidden" name="filename" value="' . e($f) . '">';
        $protoList .= '<button type="submit" onclick="return confirm(\'Delete ' . e($f) . '?\')" class="del">×</button>';
        $protoList .= '</form></li>';
    }

    // Build target options for upload form
    $targetOptions = '';
    foreach (array_keys(UPLOAD_TARGETS) as $t) {
        $label = ucfirst($t);
        $hint = match ($t) {
            'projects', 'experiments', 'research' => '.md',
            'media' => 'images',
            'prototypes' => '.html, .css, .js, images',
        };
        $targetOptions .= '<option value="' . e($t) . '">' . e($label) . ' (' . $hint . ')</option>';
    }

    $flashHtml = $flash ? '<div class="flash">' . e($flash) . '</div>' : '';

    echo <<<HTML
    <!DOCTYPE html>
    <html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width">
    <title>Admin — Files</title>
    <style>
        * { margin: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem 1rem; color: #222; }
        h1 { font-size: 1.3rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        h1 span { font-size: .85rem; color: #888; font-weight: normal; }
        h2 { font-size: 1.1rem; margin: 2rem 0 .75rem; border-bottom: 1px solid #eee; padding-bottom: .5rem; }
        .flash { background: #e8f5e9; border: 1px solid #c8e6c9; padding: .5rem .75rem; border-radius: 4px; margin-bottom: 1.5rem; font-size: .9rem; }

        /* Upload form */
        .upload-form { display: flex; gap: .75rem; align-items: end; flex-wrap: wrap; margin-bottom: .5rem; }
        .upload-form select, .upload-form input[type=file] { padding: .45rem; border: 1px solid #ddd; border-radius: 4px; font: inherit; font-size: .9rem; }
        .upload-form select { min-width: 180px; }
        button { padding: .45rem 1rem; background: #111; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: .9rem; }
        .hint { font-size: .8rem; color: #888; margin-bottom: 1.5rem; }

        /* Content table */
        table { width: 100%; border-collapse: collapse; font-size: .85rem; }
        th, td { text-align: left; padding: .4rem .5rem; border-bottom: 1px solid #f0f0f0; }
        th { font-size: .75rem; text-transform: uppercase; color: #888; }
        code { font-size: .8rem; color: #555; }

        /* File lists */
        ul { list-style: none; padding: 0; font-size: .85rem; }
        li { padding: .3rem 0; display: flex; align-items: center; gap: .5rem; border-bottom: 1px solid #f5f5f5; }
        .del { background: none; color: #c00; border: none; font-size: 1.1rem; padding: 0 .3rem; cursor: pointer; }
        .del:hover { color: #900; }

        a { color: #111; }
        .empty { color: #999; font-size: .85rem; font-style: italic; }
    </style></head><body>

    <h1>Files <span>{$subs} subscribers · <a href="/feed.xml">RSS</a> · <a href="/admin/logout">logout</a></span></h1>

    {$flashHtml}

    <h2>Upload</h2>
    <form method="POST" action="/admin/upload" enctype="multipart/form-data" class="upload-form">
        <select name="target">{$targetOptions}</select>
        <input type="file" name="files[]" multiple required>
        <button type="submit">Upload</button>
    </form>
    <p class="hint">Markdown files go to content folders. Images go to media. Prototypes accept .html, .css, .js, and images.</p>

    <h2>Content</h2>
    <table>
        <thead><tr><th>Title</th><th>File</th><th>Status</th></tr></thead>
        <tbody>{$contentRows}</tbody>
    </table>

    <h2>Media</h2>
    HTML;

    if ($mediaList) {
        echo "<ul>{$mediaList}</ul>";
    } else {
        echo '<p class="empty">No media files.</p>';
    }

    echo '<h2>Prototypes</h2>';

    if ($protoList) {
        echo "<ul>{$protoList}</ul>";
    } else {
        echo '<p class="empty">No prototype files.</p>';
    }

    echo '</body></html>';
    exit;
}

// ─── Crawler: OG meta injection ──────────────────────────────────────────────

if (is_crawler()) {
    $doc = null;
    $docSlug = $_GET['doc'] ?? null;

    if ($docSlug) {
        $doc = find_doc_by_slug($docSlug);
    }

    if (!is_file(INDEX_HTML)) {
        http_response_code(500);
        echo 'index.html not found';
        exit;
    }

    $html = file_get_contents(INDEX_HTML);

    if ($doc) {
        $title = e($doc['title'] ?? SITE_TITLE);
        $desc = e($doc['description'] ?? SITE_DESCRIPTION);
        $url = e(SITE_URL . '/?doc=' . $docSlug);
        $thumbnail = !empty($doc['thumbnail']) ? e(SITE_URL . $doc['thumbnail']) : '';

        $og = <<<META
        <meta property="og:title" content="{$title}">
        <meta property="og:description" content="{$desc}">
        <meta property="og:url" content="{$url}">
        <meta property="og:type" content="article">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{$title}">
        <meta name="twitter:description" content="{$desc}">
        META;

        if ($thumbnail) {
            $og .= "\n" . '  <meta property="og:image" content="' . $thumbnail . '">';
            $og .= "\n" . '  <meta name="twitter:image" content="' . $thumbnail . '">';
        }
    } else {
        $sTitle = e(SITE_TITLE);
        $sDesc = e(SITE_DESCRIPTION);
        $sUrl = e(SITE_URL);
        $og = <<<META
        <meta property="og:title" content="{$sTitle}">
        <meta property="og:description" content="{$sDesc}">
        <meta property="og:url" content="{$sUrl}">
        <meta property="og:type" content="website">
        <meta name="twitter:card" content="summary">
        <meta name="twitter:title" content="{$sTitle}">
        <meta name="twitter:description" content="{$sDesc}">
        META;
    }

    $html = str_replace('</head>', $og . "\n</head>", $html);

    header('Content-Type: text/html; charset=utf-8');
    echo $html;
    exit;
}

// ─── Static files ────────────────────────────────────────────────────────────

if ($path !== '/' && $path !== '') {
    $filePath = __DIR__ . $path;

    if (is_file($filePath)) {
        $mimes = [
            'js'    => 'application/javascript',
            'mjs'   => 'application/javascript',
            'css'   => 'text/css',
            'svg'   => 'image/svg+xml',
            'png'   => 'image/png',
            'jpg'   => 'image/jpeg',
            'jpeg'  => 'image/jpeg',
            'webp'  => 'image/webp',
            'gif'   => 'image/gif',
            'ico'   => 'image/x-icon',
            'woff'  => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf'   => 'font/ttf',
            'otf'   => 'font/otf',
            'json'  => 'application/json',
            'md'    => 'text/markdown',
            'xml'   => 'application/xml',
            'txt'   => 'text/plain',
            'html'  => 'text/html',
            'map'   => 'application/json',
        ];
        $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
        if (isset($mimes[$ext])) {
            header('Content-Type: ' . $mimes[$ext]);
        }
        readfile($filePath);
        exit;
    }
}

// ─── SPA fallback ────────────────────────────────────────────────────────────

if (is_file(INDEX_HTML)) {
    header('Content-Type: text/html; charset=utf-8');
    readfile(INDEX_HTML);
} else {
    http_response_code(404);
    echo '<!DOCTYPE html><html><body><p>index.html not found</p></body></html>';
}
