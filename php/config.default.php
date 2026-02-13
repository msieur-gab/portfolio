<?php
/**
 * Default configuration template
 * Copy to config.php and customize, or use install.php to generate it.
 */

return [
    'site_title'       => './tldr',
    'site_url'         => 'http://localhost:8000',
    'site_description' => 'the lost.directory — the work of Gabriel Baude. Systems designer and builder — projects, explorations, and notes on presence, intent, and agency in technology.',
    'admin_password'   => '', // bcrypt hash — use password_hash() or install.php
    'content_dir'      => __DIR__ . '/../content',
    'content_folders'  => ['projects', 'explorations', 'notes'],
    'upload_targets'   => [
        'projects'     => __DIR__ . '/../content/projects',
        'explorations' => __DIR__ . '/../content/explorations',
        'notes'        => __DIR__ . '/../content/notes',
        'media'      => __DIR__ . '/../content/media',
        'prototypes' => __DIR__ . '/../content/prototypes',
    ],
];
