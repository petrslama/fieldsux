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

			const template = fieldsUX.querySelector('.template');
			if( ! template ) {
				return;
			}

			const data = fieldsUX.querySelector('.data');
			if( ! data ) {
				return;
			}

			fu_main = document.createElement('fu-main');

			fu_main.template = fu.JSON.parse( template.value );
			fu_main.value = fu.JSON.parse( data.value );

			fieldsUX.appendChild( fu_main );

			this.instances.push(fu_main);

			const opened = fieldsUX.querySelector('.opened');
			if( opened ) {
				fu.Opened.set(opened.value);
			}
		});
	},
};

window.fu = fu;

