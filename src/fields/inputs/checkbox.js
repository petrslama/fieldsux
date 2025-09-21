fu.fields.checkbox = class fu_fields_checkbox extends fu.fields.input {

	get value(){
		const input = this.get_input();
		return input.checked ? input.value : null;
	}

	set value(value){
		const input = this.get_input();
		input.checked = ( input.value == value );
		this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
	}

	get_input(){
		return this.querySelector('input[type="checkbox"]');
	}

	get repeater_label(){
		const value = this.value;
		if( ! value ) {
			return '';
		}
		const label = this.querySelector('.fu_after');
		if( label ) {
			return label.innerHTML
		}
		return value;
	}

	create_field( index, template ){
		return fu.DOM.create({
			'tag': 'label',
			'for': index,
			'class': 'fu_input_wrapper',
			'children': [
				( ! template.fu_before ) ? null : {
					'class': 'fu_before',
					'html': ' ' + template.fu_before + ' ',
				},{
					'tag': 'input',
					'type': 'checkbox',
					'id': index,
					'class': 'fu_checkbox',
					'value': template.fu_value || '1',
					'required': template.fu_required,
					'aria-required': template.fu_required ? 'true' : '',
					'readonly': template.fu_readonly,
					'events': {
						'change': () => this.dispatchEvent( new CustomEvent( 'fu_field_input' ) )
					},
				},( ! template.fu_after ) ? null : {
					'class': 'fu_after',
					'html': ' ' + template.fu_after + ' ',
				}
			]
		});
	}
};

customElements.define('fu-checkbox', fu.fields.checkbox);
