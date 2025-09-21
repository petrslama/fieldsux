fc.fields.input = class fc_fields_input extends fc.fields.abstract {

	get value(){
		const value = this.get_input().value;
		return value ? value : null;
	}

	/**
	 * @param {string|Object} value
	 */
	set value(value){
		const input = this.get_input();
		if( 'object' == typeof value ) {
			value = JSON.stringify(value);
		}
		input.value = value ?? '';
		this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
	}

	get repeater_label(){
		return this.value || '';
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		const index = fc.DOM.getIndex();

		fc.DOM.attrs(this, {
			'fc_name': template.fc_name,
			'class': 'fc_field fc_field_input',
			'children':[
				( ! template.fc_label ) ? null : {
					'tag': 'label',
					'class': 'fc_label',
					'for': index,
					'html': template.fc_label,
				},
				this.create_field( index, template ),
				( ! template.fc_description ) ? null : {
					'class': 'fc_description',
					'html': template.fc_description.replace(/\b([a-zA-Z]{1,2})\s/g, '$1&nbsp;')
				},
			]
		});

		this.set_width( this, template );
	}

}