fc.fields.number = class fc_fields_number extends fc.fields.input {

	get_input(){
		return this.querySelector('input[type="number"]');
	}

	create_field( index, template ){
		return fc.DOM.create({
			'class': 'fc_input_wrapper',
			'children': [
				( ! template.fc_before ) ? null : {
					'class': 'fc_before',
					'html': ' ' + template.fc_before + ' ',
				},{
					'tag': 'input',
					'type': 'number',
					'id': index,
					'class': 'fc_input',
					'min': template.fc_min,
					'max': template.fc_max,
					'step': template.fc_step,
					'placeholder': template.fc_placeholder,
					'pattern': template.fc_pattern,
					'required':template.fc_required,
					'aria-required': template.fc_required ? 'true' : '',
					'readonly':template.fc_readonly,
					'list': template.fc_list,
					'events': {
						'input': () => this.dispatchEvent( new CustomEvent( 'fc_field_input' ) )
					},
				},( ! template.fc_after ) ? null : {
					'class': 'fc_after',
					'html': ' ' + template.fc_after + ' ',
				}
			]
		});
	}

};

customElements.define('fc-number', fc.fields.number);