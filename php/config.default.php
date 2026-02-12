<?php
/**
 * Default configuration template
 * Copy to config.php and customize, or use install.php to generate it.
 */

return [
    'site_title'       => '../',
    'site_url'         => 'http://localhost:8000',
    'site_description' => 'the lost.directory — the work of Gabriel Baude.',
    'admin_password'   => '', // bcrypt hash — use password_hash() or install.php
    'content_dir'      => __DIR__ . '/../content',
    'content_folders'  => ['projects', 'experiments', 'research'],
    'upload_targets'   => [
        'projects'   => __DIR__ . '/../content/projects',
        'experiments' => __DIR__ . '/../content/experiments',
        'research'   => __DIR__ . '/../content/research',
        'media'      => __DIR__ . '/../content/media',
        'prototypes' => __DIR__ . '/../content/prototypes',
    ],
];
