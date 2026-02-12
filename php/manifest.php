<?php
/**
 * Dynamic manifest endpoint — GET /content/manifest.json
 */

function handle_manifest(array $cfg): never {
    $files = scan_content_files($cfg['content_dir'], $cfg['content_folders']);
    json_out(['files' => $files]);
}
