fc.fields.checkbox = class fc_fields_checkbox extends fc.fields.input {

	get value(){
		const input = this.get_input();
		return input.checked ? input.value : null;
	}

	set value(value){
		const input = this.get_input();
		input.checked = ( input.value == value );
		this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
	}

	get_input(){
		return this.querySelector('input[type="checkbox"]');
	}

	get repeater_label(){
		const value = this.value;
		if( ! value ) {
			return '';
		}
		const label = this.querySelector('.fc_after');
		if( label ) {
			return label.innerHTML
		}
		return value;
	}

	create_field( index, template ){
		return fc.DOM.create({
			'tag': 'label',
			'for': index,
			'class': 'fc_input_wrapper',
			'children': [
				( ! template.fc_before ) ? null : {
					'class': 'fc_before',
					'html': ' ' + template.fc_before + ' ',
				},{
					'tag': 'input',
					'type': 'checkbox',
					'id': index,
					'class': 'fc_checkbox',
					'value': template.fc_value || '1',
					'required': template.fc_required,
					'aria-required': template.fc_required ? 'true' : '',
					'readonly': template.fc_readonly,
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

customElements.define('fc-checkbox', fc.fields.checkbox);
