<?php
@header('Content-Type: application/javascript');
@header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
@header("Cache-Control: post-check=0, pre-check=0", false);
@header("Pragma: no-cache");

$_SRC_DIR =  dirname( __DIR__ )  . '/src';

$js = ob_start();

echo '(function() {' . "\n";
echo '\'use strict\';'  . "\n";

foreach([

	'/fu.js',
	'/utils/JSON.js',
	'/utils/DOM.js',
	'/utils/Templates.js',
	'/utils/Opened.js',

	'/fields/abstract.js',
	'/fields/undefined.js',

	'/fields/dialogs/dialog.js',
	'/fields/dialogs/dialog_json.js',
	'/fields/dialogs/dialog_copy.js',
	'/fields/dialogs/dialog_diff.js',

	'/fields/groups/children.js',
	'/fields/groups/group.js',
	'/fields/groups/main.js',
	'/fields/groups/tabs.js',
	'/fields/groups/radiotabs.js',

	'/fields/inputs/input.js',
	'/fields/inputs/text.js',
	'/fields/inputs/number.js',
	'/fields/inputs/textarea.js',
	'/fields/inputs/checkbox.js',
	'/fields/inputs/color.js',
	'/fields/inputs/hidden.js',

	'/fields/inputs/checkboxes.js',
	'/fields/inputs/radios.js',
	'/fields/inputs/select.js',

	'/fields/repeaters/row.js',
	'/fields/repeaters/row_table.js',
	'/fields/repeaters/row_array.js',
	'/fields/repeaters/repeater.js',
	'/fields/repeaters/repeater_single.js',
	'/fields/repeaters/repeater_table.js',
	'/fields/repeaters/repeater_array.js',
	'/fields/repeaters/repeater_multiple.js',

	'/fields/html/h1.js',
	'/fields/html/h2.js',
	'/fields/html/h3.js',
	'/fields/html/p.js',
	'/fields/html/img.js',
	'/fields/html/a.js',
	'/fields/html/br.js',
	'/fields/html/hr.js',


] as $filepath ){
	if( ! file_exists( $_SRC_DIR . $filepath )) {
		continue;
	}

	echo "\n\n";
	echo "// " . $filepath;
	echo "\n\n";
	readfile( $_SRC_DIR . $filepath );
}
echo  "\n\n\n";
echo "fu.init();";
echo "\n\n\n\n";


echo '})();' . "\n";

$js = ob_get_clean();
echo $js;
file_put_contents( __DIR__ . '/fieldsux.js', $js );