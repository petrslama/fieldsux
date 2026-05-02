<?php
@header('Content-Type: text/css');
@header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
@header("Cache-Control: post-check=0, pre-check=0", false);
@header("Pragma: no-cache");

$_SRC_DIR =  dirname( __DIR__ )  . '/src';

ob_start();

foreach([
	'/fu.css',

	'/misc/icon.css',
	'/misc/debug.css',
	'/misc/wp.css',

	'/fields/dialogs/dialog.css',

	'/fields/groups/groups.css',

	'/fields/inputs/inputs.css',

	'/fields/repeaters/repeater.css',

	'/fields/html/html.css',

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

$minified = preg_replace('/\s+([>+~;,{}])/', '$1', $minified); // Remove spaces before combinators
$minified = preg_replace('/([>+~;,{}])\s+/', '$1', $minified); // Remove spaces after combinators

$minified = preg_replace('/;\s*}/', '}', $minified); // Remove semicolon before closing brace
$minified = preg_replace('/\s*{\s*/', '{', $minified); // Remove spaces around opening brace
$minified = preg_replace('/;\s*/', ';', $minified); // Remove spaces after semicolons
$minified = preg_replace('/,\s*/', ',', $minified); // Remove spaces after commas

$minified = preg_replace('/\s+:/', ':', $minified); // Remove spaces before colons (properties)
$minified = preg_replace('/:\s+/', ':', $minified); // Remove spaces after colons (properties)

$minified = str_replace( ')+', ') + ', $minified); // Add spaces to better css calc

$minified = trim($minified);

echo $minified;

file_put_contents( __DIR__ . '/fieldsux.css', $css );