fc.fields.select = class fc_fields_select extends fc.fields.input {

	get value(){
		const select = this.querySelector('select');
		return select.value;
	}

	set value(value){
		const select = this.querySelector('select');
		select.value = value;
		this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
	}

	get repeater_label(){
		const select = this.querySelector('select');
		if( -1 == select.selectedIndex ) return null;
		if( 0 == select.options.length ) return null;
		return select.options[select.selectedIndex].text ?? null;
	}

	create_field( index, template ){
		return fc.DOM.create({
			'class': 'fc_input_wrapper',
			'children': [
				( ! template.fc_before ) ? null : {
					'class': 'fc_before',
					'html': ' ' + template.fc_before + ' ',
				},{
					'tag': 'select',
					'id': index,
					'class': 'fc_input',
					'children': template.values?.map(config => {
						return {
							'tag': 'option',
							'value': config.fc_value,
							'html': config.fc_label,
						};
					}),
					'events': {
						'change': () => this.dispatchEvent( new CustomEvent( 'fc_field_input' ) )
					},
				},( ! template.fc_after ) ? null : {
					'class': 'fc_after',
					'html': ' ' + template.fc_after + ' ',
				}
			]
		});
	}
};

customElements.define('fc-select', fc.fields.select);
