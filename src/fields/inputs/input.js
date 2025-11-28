fu.fields.input = class fu_fields_input extends fu.fields.abstract {

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
		this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
	}

	get repeater_label(){
		return this.value || '';
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		const index = fu.DOM.getIndex();

		fu.DOM.attrs(this, {
			'fu_name': template.fu_name,
			'class': 'fu_field fu_field_input',
			'children':[
				( ! template.fu_label ) ? null : {
					'tag': 'label',
					'class': 'fu_label',
					'for': index,
					'html': template.fu_label,
				},
				this.create_field( index, template ),
				( ! template.fu_description ) ? null : {
					'class': 'fu_description',
					'html': template.fu_description
				},
			]
		});

		this.set_width( this, template );
	}

}