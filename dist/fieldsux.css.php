<?php
@header('Content-Type: text/css');
@header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
@header("Cache-Control: post-check=0, pre-check=0", false);
@header("Pragma: no-cache");

$_SRC_DIR =  dirname( __DIR__ )  . '/src';

ob_start();

foreach([
	'/misc/icon.css',
	'/misc/debug.css',
	'/misc/wp.css',

	'/fields/dialogs/dialog.css',
	'/fields/dialogs/dialog_json.css',
	'/fields/dialogs/dialog_copy.css',
	'/fields/dialogs/dialog_diff.css',

	'/fields/groups/groups.css',

	'/fields/inputs/inputs.css',

	'/fields/repeaters/repeater.css',
	'/fields/repeaters/row.css',

	'/fields/html/html.css',

	'/fc.css',

] as $filepath ){
	if( ! file_exists( $_SRC_DIR . $filepath )) {
		continue;
	}
	echo "\n\n";
	echo "/* " . $filepath . ' */';
	echo "\n\n";
	readfile( $_SRC_DIR . $filepath );
}

$css = ob_get_clean();
$minified = $css;
$minified = preg_replace('/\/\*[\s\S]*?\*\//', '', $minified); // Remove comments
$minified = preg_replace('/\s+/', ' ', $minified); // Replace multiple spaces with single space
$minified = preg_replace('/;\s*}/', '}', $minified); // Remove semicolon before closing brace
$minified = preg_replace('/\s*{\s*/', '{', $minified); // Remove spaces around opening brace
$minified = preg_replace('/;\s*/', ';', $minified); // Remove spaces after semicolons
$minified = preg_replace('/,\s*/', ',', $minified); // Remove spaces after commas
$minified = trim($minified);

echo $minified;

file_put_contents( __DIR__ . '/fieldsux.css', $css );