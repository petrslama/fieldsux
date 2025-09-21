const fc = {

	version: '0.0.1',

	field_templates: {},

	fields: {},

	instances: [],

	init: function(){
		document.querySelectorAll('.fieldsux').forEach((fieldsUX) => {

			let fc_main = fieldsUX.querySelector('fc-main');
			if( fc_main ) {
				return;
			}

			const templateNode = fieldsUX.querySelector('.template');
			if( ! templateNode ) {
				return;
			}

			const textarea = fieldsUX.querySelector('.data');
			if( ! textarea ) {
				return;
			}

			fc_main = document.createElement('fc-main');

			fc_main.template = fc.JSON.parse( templateNode.value.replace(
				/"fc\.field_templates\.([a-z_]+)"/g,
				(match, fieldName) => {
					return fc.field_templates?.[fieldName]??false
						? fc.JSON.stringify( fc.field_templates[fieldName] )
						: match;
				})
			);
			fc_main.value = fc.JSON.parse( textarea.value.replace(
				/"fc\.field_templates\.([a-z_]+)"/g,
				(match, fieldName) => {
					return fc.field_templates?.[fieldName]??false
						? fc.JSON.stringify( fc.field_templates[fieldName] )
						: match;
				})
			);

			fieldsUX.appendChild( fc_main );

			this.instances.push(fc_main);
		});
	},
};

window.fc = fc;

