<?php
/**
 * Admin panel — login, upload, edit frontmatter, delete files
 */

function handle_admin(string $path, string $method, array $cfg): never {
    $baseDir = dirname(__DIR__);
    $contentDir = $cfg['content_dir'];
    $folders = $cfg['content_folders'];
    $uploadTargets = $cfg['upload_targets'];

    // Login
    if ($path === '/admin/login' && $method === 'POST') {
        $hash = $cfg['admin_password'];
        if ($hash && password_verify($_POST['password'] ?? '', $hash)) {
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

    // Upload handler
    if ($path === '/admin/upload' && $method === 'POST') {
        $target = $_POST['target'] ?? '';

        if (!isset($uploadTargets[$target])) {
            $_SESSION['flash'] = 'Invalid upload target.';
            header('Location: /admin');
            exit;
        }

        $destDir = $uploadTargets[$target];
        if (!is_dir($destDir)) mkdir($destDir, 0755, true);

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

    // Delete file handler
    if ($path === '/admin/delete' && $method === 'POST') {
        $target = $_POST['target'] ?? '';
        $filename = basename($_POST['filename'] ?? '');

        if (isset($uploadTargets[$target]) && $filename) {
            $filepath = $uploadTargets[$target] . '/' . $filename;
            if (is_file($filepath)) {
                unlink($filepath);
                $_SESSION['flash'] = "Deleted {$filename} from {$target}.";
            }
        }
        header('Location: /admin');
        exit;
    }

    // Edit frontmatter handler
    if ($path === '/admin/edit' && $method === 'POST') {
        $file = $_POST['file'] ?? '';

        $fullpath = $baseDir . '/' . $file;
        $realpath = realpath($fullpath);
        $validDir = false;
        if ($realpath && str_ends_with($file, '.md')) {
            foreach ($uploadTargets as $dir) {
                if (str_starts_with($realpath, realpath($dir) . '/')) {
                    $validDir = true;
                    break;
                }
            }
            if (!$validDir && str_starts_with($realpath, realpath($contentDir) . '/') && dirname($realpath) === realpath($contentDir)) {
                $validDir = true;
            }
        }

        if (!$validDir || !is_file($fullpath)) {
            $_SESSION['flash'] = 'Invalid file path.';
            header('Location: /admin');
            exit;
        }

        $raw = file_get_contents($fullpath);

        if (!str_starts_with($raw, '---')) {
            $_SESSION['flash'] = 'File has no frontmatter block.';
            header('Location: /admin');
            exit;
        }

        $end = strpos($raw, "\n---", 3);
        if ($end === false) {
            $_SESSION['flash'] = 'Malformed frontmatter.';
            header('Location: /admin');
            exit;
        }

        $fmBlock = substr($raw, 4, $end - 4);
        $body = substr($raw, $end + 4);

        $editable = [
            'title'       => trim($_POST['fm_title'] ?? ''),
            'description' => trim($_POST['fm_description'] ?? ''),
            'status'      => trim($_POST['fm_status'] ?? ''),
            'category'    => trim($_POST['fm_category'] ?? ''),
            'featured'    => isset($_POST['fm_featured']) ? 'true' : 'false',
            'series'      => trim($_POST['fm_series'] ?? ''),
        ];

        $tagsRaw = trim($_POST['fm_tags'] ?? '');
        $tags = $tagsRaw !== '' ? array_map('trim', explode(',', $tagsRaw)) : [];

        foreach ($editable as $key => $val) {
            if ($val === '' && $key !== 'featured') {
                $fmBlock = preg_replace('/^' . preg_quote($key, '/') . ':.*\n?/m', '', $fmBlock);
                continue;
            }
            if (preg_match('/^' . preg_quote($key, '/') . ':\s*.*/m', $fmBlock)) {
                $fmBlock = preg_replace('/^' . preg_quote($key, '/') . ':\s*.*/m', $key . ': ' . $val, $fmBlock);
            } else {
                $fmBlock = rtrim($fmBlock) . "\n" . $key . ': ' . $val;
            }
        }

        $fmBlock = preg_replace('/^tags:\s*\n(?:    - .+\n?)*/m', '', $fmBlock);
        $fmBlock = preg_replace('/^tags:\s*.+\n?/m', '', $fmBlock);
        if (!empty($tags)) {
            $tagLines = "tags:\n";
            foreach ($tags as $t) {
                $tagLines .= "    - " . $t . "\n";
            }
            $fmBlock = rtrim($fmBlock) . "\n" . $tagLines;
        }

        $fmBlock = trim($fmBlock);
        $newContent = "---\n" . $fmBlock . "\n---" . $body;

        file_put_contents($fullpath, $newContent);

        // Move file to different folder if requested
        $moveTo = trim($_POST['fm_move_to'] ?? '');
        $currentFolder = dirname($file) === 'content' ? '_root' : basename(dirname($file));

        if ($moveTo && $moveTo !== $currentFolder && $moveTo !== '_root') {
            $destDir = $uploadTargets[$moveTo] ?? null;
            if ($destDir && is_dir($destDir)) {
                $destPath = $destDir . '/' . basename($file);
                if (!is_file($destPath)) {
                    rename($fullpath, $destPath);
                    $_SESSION['flash'] = 'Moved ' . basename($file) . ' to ' . $moveTo . '.';
                } else {
                    $_SESSION['flash'] = 'Updated frontmatter but could not move — file already exists in ' . $moveTo . '.';
                }
            } else {
                $_SESSION['flash'] = 'Updated frontmatter for ' . basename($file) . '. (invalid move target)';
            }
        } else {
            $_SESSION['flash'] = 'Updated frontmatter for ' . basename($file) . '.';
        }

        header('Location: /admin');
        exit;
    }

    // Dashboard
    render_admin_dashboard($cfg);
}

function render_admin_dashboard(array $cfg): never {
    $baseDir = dirname(__DIR__);
    $contentDir = $cfg['content_dir'];
    $folders = $cfg['content_folders'];
    $uploadTargets = $cfg['upload_targets'];

    $flash = $_SESSION['flash'] ?? '';
    unset($_SESSION['flash']);

    // Group content by folder
    $grouped = ['_root' => []]; // root-level files (about.md etc.)
    foreach ($folders as $folder) {
        $grouped[$folder] = [];
    }

    foreach (scan_content_files($contentDir, $folders) as $relpath) {
        $fm = parse_frontmatter($baseDir . '/' . $relpath) ?? [];
        $tagsStr = '';
        if (isset($fm['tags']) && is_array($fm['tags'])) {
            $tagsStr = implode(', ', $fm['tags']);
        }

        // Determine which folder this file belongs to
        $parts = explode('/', str_replace('content/', '', $relpath));
        $folder = count($parts) > 1 ? $parts[0] : '_root';

        $grouped[$folder][] = [
            'file'        => $relpath,
            'title'       => $fm['title'] ?? basename($relpath, '.md'),
            'status'      => $fm['status'] ?? '—',
            'description' => $fm['description'] ?? '',
            'tags'        => $tagsStr,
            'featured'    => ($fm['featured'] ?? '') === 'true',
            'series'      => $fm['series'] ?? '',
            'category'    => $fm['category'] ?? '',
        ];
    }

    // Gather media files
    $mediaFiles = [];
    $mediaDir = $contentDir . '/media';
    if (is_dir($mediaDir)) {
        foreach (glob($mediaDir . '/*.*') as $f) {
            $mediaFiles[] = basename($f);
        }
        sort($mediaFiles);
    }

    // Gather prototype files
    $protoFiles = [];
    $protoDir = $contentDir . '/prototypes';
    if (is_dir($protoDir)) {
        foreach (glob($protoDir . '/*.*') as $f) {
            $protoFiles[] = basename($f);
        }
        sort($protoFiles);
    }

    $flashHtml = $flash ? '<div class="flash">' . e($flash) . '</div>' : '';

    // Count totals
    $totalContent = 0;
    foreach ($grouped as $items) { $totalContent += count($items); }

    echo <<<HTML
    <!DOCTYPE html>
    <html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width">
    <title>Admin — Files</title>
    <style>
        * { margin: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem 1rem; color: #222; }
        h1 { font-size: 1.3rem; margin-bottom: 1.5rem; display: flex; justify-content: space-between; align-items: center; }
        h1 span { font-size: .85rem; color: #888; font-weight: normal; }

        /* Section blocks */
        .section { margin-bottom: 2rem; border: 1px solid #e8e8e8; border-radius: 6px; overflow: hidden; }
        .section-header { display: flex; justify-content: space-between; align-items: center; padding: .6rem .75rem; background: #f5f5f5; cursor: pointer; user-select: none; }
        .section-header:hover { background: #ececec; }
        .section-header h2 { font-size: .95rem; margin: 0; border: none; padding: 0; }
        .section-header .meta { font-size: .8rem; color: #888; display: flex; align-items: center; gap: .75rem; }
        .section-header .count { background: #e0e0e0; padding: .1rem .5rem; border-radius: 10px; font-size: .75rem; }
        .section-header .chevron { transition: transform .2s; font-size: .8rem; color: #999; }
        .section-header.collapsed .chevron { transform: rotate(-90deg); }
        .section-body { padding: .5rem .75rem .75rem; }
        .section-body.hidden { display: none; }

        /* Upload row inside section */
        .section-upload { display: flex; gap: .5rem; align-items: center; padding: .5rem .75rem; background: #fafafa; border-bottom: 1px solid #e8e8e8; }
        .section-upload input[type=file] { font-size: .8rem; }
        .section-upload button { font-size: .8rem; padding: .3rem .7rem; }

        .flash { background: #e8f5e9; border: 1px solid #c8e6c9; padding: .5rem .75rem; border-radius: 4px; margin-bottom: 1.5rem; font-size: .9rem; }

        /* Global upload */
        .upload-form { display: flex; gap: .75rem; align-items: end; flex-wrap: wrap; margin-bottom: .5rem; }
        .upload-form select, .upload-form input[type=file] { padding: .45rem; border: 1px solid #ddd; border-radius: 4px; font: inherit; font-size: .9rem; }
        .upload-form select { min-width: 180px; }
        button { padding: .45rem 1rem; background: #111; color: #fff; border: none; border-radius: 4px; cursor: pointer; font-size: .9rem; }
        .hint { font-size: .8rem; color: #888; margin-bottom: 1.5rem; }

        table { width: 100%; border-collapse: collapse; font-size: .85rem; }
        th, td { text-align: left; padding: .4rem .5rem; border-bottom: 1px solid #f0f0f0; }
        th { font-size: .75rem; text-transform: uppercase; color: #888; }
        code { font-size: .8rem; color: #555; }
        ul.file-list { list-style: none; padding: 0; font-size: .85rem; margin: 0; }
        ul.file-list li { padding: .3rem 0; display: flex; align-items: center; gap: .5rem; border-bottom: 1px solid #f5f5f5; }
        ul.file-list li:last-child { border-bottom: none; }
        .del { background: none; color: #c00; border: none; font-size: 1.1rem; padding: 0 .3rem; cursor: pointer; }
        .del:hover { color: #900; }
        a { color: #111; }
        .empty { color: #999; font-size: .85rem; font-style: italic; padding: .5rem 0; }

        .content-row:hover { background: #f5f5f5; }
        .edit-row td { padding: .75rem; background: #fafafa; border-bottom: 2px solid #e0e0e0; }
        .edit-form { margin: 0; }
        .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .5rem .75rem; }
        .edit-grid label { display: flex; flex-direction: column; font-size: .75rem; color: #666; text-transform: uppercase; gap: .2rem; }
        .edit-grid input[type=text], .edit-grid input[type=number], .edit-grid select, .edit-grid textarea {
            padding: .4rem; border: 1px solid #ddd; border-radius: 4px; font: inherit; font-size: .85rem;
        }
        .edit-grid textarea { resize: vertical; }
        .edit-grid .full-width { grid-column: 1 / -1; }
        .edit-grid .checkbox-label { flex-direction: row; align-items: center; gap: .4rem; padding-top: 1.2rem; }
        .edit-grid .checkbox-label input { width: auto; }
        .edit-actions { margin-top: .5rem; display: flex; gap: .5rem; }
    </style></head><body>

    <h1>Admin <span><a href="/">site</a> · <a href="/feed.xml">rss</a> · <a href="/admin/logout">logout</a></span></h1>

    {$flashHtml}
    HTML;

    // ─── Content sections per folder ────────────────────────────────────────
    $rowIdx = 0;
    $sectionOrder = array_merge($folders, ['_root']);

    foreach ($sectionOrder as $folder) {
        $items = $grouped[$folder] ?? [];
        $label = $folder === '_root' ? 'Pages' : ucfirst($folder);
        $uploadTarget = $folder === '_root' ? '' : $folder;
        $count = count($items);
        $published = count(array_filter($items, fn($i) => $i['status'] === 'published'));
        $drafts = count(array_filter($items, fn($i) => $i['status'] === 'draft'));

        $statusHint = [];
        if ($published) $statusHint[] = "{$published} published";
        if ($drafts) $statusHint[] = "{$drafts} draft";
        $statusStr = $statusHint ? implode(', ', $statusHint) : 'empty';

        echo '<div class="section">';
        echo '<div class="section-header" onclick="toggleSection(this)">';
        echo '<h2>' . e($label) . '</h2>';
        echo '<div class="meta"><span>' . e($statusStr) . '</span><span class="count">' . $count . '</span><span class="chevron">▼</span></div>';
        echo '</div>';

        // Inline upload for content folders
        if ($uploadTarget) {
            echo '<form method="POST" action="/admin/upload" enctype="multipart/form-data" class="section-upload">';
            echo '<input type="hidden" name="target" value="' . e($uploadTarget) . '">';
            echo '<input type="file" name="files[]" multiple required accept=".md">';
            echo '<button type="submit">Upload .md</button>';
            echo '</form>';
        }

        echo '<div class="section-body">';

        if (empty($items)) {
            echo '<p class="empty">No files.</p>';
        } else {
            echo '<table><thead><tr><th>Title</th><th>Status</th></tr></thead><tbody>';

            foreach ($items as $item) {
                $statusColor = match ($item['status']) {
                    'published' => '#090',
                    'draft'     => '#c90',
                    default     => '#999',
                };
                $id = 'edit-' . $rowIdx;

                echo '<tr class="content-row" onclick="toggleEdit(\'' . $id . '\')" style="cursor:pointer">';
                echo '<td>' . e($item['title']) . '</td>';
                echo '<td><span style="color:' . $statusColor . '">' . e($item['status']) . '</span></td>';
                echo '</tr>';

                $statusOpts = '';
                foreach (['published', 'draft', 'archive'] as $s) {
                    $sel = $item['status'] === $s ? ' selected' : '';
                    $statusOpts .= '<option value="' . $s . '"' . $sel . '>' . ucfirst($s) . '</option>';
                }
                $featuredChk = $item['featured'] ? ' checked' : '';

                echo '<tr id="' . $id . '" class="edit-row" style="display:none">';
                echo '<td colspan="2">';
                echo '<form method="POST" action="/admin/edit" class="edit-form" onclick="event.stopPropagation()">';
                echo '<input type="hidden" name="file" value="' . e($item['file']) . '">';
                echo '<div class="edit-grid">';
                echo '<label>Title<input type="text" name="fm_title" value="' . e($item['title']) . '" required></label>';
                echo '<label>Status<select name="fm_status">' . $statusOpts . '</select></label>';
                echo '<label>Category<input type="text" name="fm_category" value="' . e($item['category']) . '" placeholder="project, experiment..."></label>';
                echo '<label>Series<input type="number" name="fm_series" value="' . e($item['series']) . '" placeholder="optional"></label>';
                echo '<label>Tags<input type="text" name="fm_tags" value="' . e($item['tags']) . '" placeholder="comma-separated"></label>';
                // Move to dropdown — only for files inside a content folder
                if ($folder !== '_root') {
                    $moveOpts = '<option value="">— keep here —</option>';
                    foreach ($folders as $f) {
                        if ($f !== $folder) {
                            $moveOpts .= '<option value="' . e($f) . '">' . ucfirst(e($f)) . '</option>';
                        }
                    }
                    echo '<label>Move to<select name="fm_move_to">' . $moveOpts . '</select></label>';
                }
                echo '<label class="checkbox-label"><input type="checkbox" name="fm_featured"' . $featuredChk . '> Featured</label>';
                echo '<label class="full-width">Description<textarea name="fm_description" rows="2" placeholder="optional">' . e($item['description']) . '</textarea></label>';
                echo '</div>';
                echo '<div class="edit-actions"><button type="submit">Save</button>';
                echo ' <form method="POST" action="/admin/delete" style="display:inline" onclick="event.stopPropagation()">';
                echo '<input type="hidden" name="target" value="' . e($uploadTarget ?: 'projects') . '">';
                echo '<input type="hidden" name="filename" value="' . e(basename($item['file'])) . '">';
                echo '<button type="submit" onclick="return confirm(\'Delete ' . e(basename($item['file'])) . '?\')" style="background:#c00">Delete</button>';
                echo '</form></div>';
                echo '</form>';
                echo '</td></tr>';

                $rowIdx++;
            }

            echo '</tbody></table>';
        }

        echo '</div></div>';
    }

    // ─── Media section ──────────────────────────────────────────────────────
    echo '<div class="section">';
    echo '<div class="section-header" onclick="toggleSection(this)">';
    echo '<h2>Media</h2>';
    echo '<div class="meta"><span class="count">' . count($mediaFiles) . '</span><span class="chevron">▼</span></div>';
    echo '</div>';

    echo '<form method="POST" action="/admin/upload" enctype="multipart/form-data" class="section-upload">';
    echo '<input type="hidden" name="target" value="media">';
    echo '<input type="file" name="files[]" multiple required accept="image/*">';
    echo '<button type="submit">Upload images</button>';
    echo '</form>';

    echo '<div class="section-body">';
    if ($mediaFiles) {
        echo '<ul class="file-list">';
        foreach ($mediaFiles as $f) {
            echo '<li>' . e($f) . ' <form method="POST" action="/admin/delete" style="display:inline">';
            echo '<input type="hidden" name="target" value="media">';
            echo '<input type="hidden" name="filename" value="' . e($f) . '">';
            echo '<button type="submit" onclick="return confirm(\'Delete ' . e($f) . '?\')" class="del">×</button>';
            echo '</form></li>';
        }
        echo '</ul>';
    } else {
        echo '<p class="empty">No media files.</p>';
    }
    echo '</div></div>';

    // ─── Prototypes section ─────────────────────────────────────────────────
    echo '<div class="section">';
    echo '<div class="section-header" onclick="toggleSection(this)">';
    echo '<h2>Prototypes</h2>';
    echo '<div class="meta"><span class="count">' . count($protoFiles) . '</span><span class="chevron">▼</span></div>';
    echo '</div>';

    echo '<form method="POST" action="/admin/upload" enctype="multipart/form-data" class="section-upload">';
    echo '<input type="hidden" name="target" value="prototypes">';
    echo '<input type="file" name="files[]" multiple required accept=".html,.css,.js,.svg,.jpg,.jpeg,.png,.webp,.gif,.json">';
    echo '<button type="submit">Upload files</button>';
    echo '</form>';

    echo '<div class="section-body">';
    if ($protoFiles) {
        echo '<ul class="file-list">';
        foreach ($protoFiles as $f) {
            echo '<li>' . e($f) . ' <form method="POST" action="/admin/delete" style="display:inline">';
            echo '<input type="hidden" name="target" value="prototypes">';
            echo '<input type="hidden" name="filename" value="' . e($f) . '">';
            echo '<button type="submit" onclick="return confirm(\'Delete ' . e($f) . '?\')" class="del">×</button>';
            echo '</form></li>';
        }
        echo '</ul>';
    } else {
        echo '<p class="empty">No prototype files.</p>';
    }
    echo '</div></div>';

    echo <<<'SCRIPT'
    <script>
    function toggleEdit(id) {
        var r = document.getElementById(id);
        if (r) r.style.display = r.style.display === 'none' ? 'table-row' : 'none';
    }
    function toggleSection(header) {
        header.classList.toggle('collapsed');
        var body = header.parentElement.querySelector('.section-body');
        var upload = header.parentElement.querySelector('.section-upload');
        if (body) body.classList.toggle('hidden');
        if (upload) upload.classList.toggle('hidden');
    }
    </script>
    SCRIPT;

    echo '</body></html>';
    exit;
}
