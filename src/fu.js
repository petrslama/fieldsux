const fu = {

	version: '0.0.1',

	field_templates: {},

	fields: {},

	instances: [],

	init: function(){
		document.querySelectorAll('.fieldsux').forEach((fieldsUX) => {

			let fu_main = fieldsUX.querySelector('fu-main');
			if( fu_main ) {
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

			fu_main = document.createElement('fu-main');

			fu_main.template = fu.JSON.parse( templateNode.value.replace(
				/"fu\.field_templates\.([a-z_]+)"/g,
				(match, fieldName) => {
					return fu.field_templates?.[fieldName]??false
						? fu.JSON.stringify( fu.field_templates[fieldName] )
						: match;
				})
			);
			fu_main.value = fu.JSON.parse( textarea.value.replace(
				/"fu\.field_templates\.([a-z_]+)"/g,
				(match, fieldName) => {
					return fu.field_templates?.[fieldName]??false
						? fu.JSON.stringify( fu.field_templates[fieldName] )
						: match;
				})
			);

			fieldsUX.appendChild( fu_main );

			this.instances.push(fu_main);
		});
	},
};

window.fu = fu;

