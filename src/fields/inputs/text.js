fc.fields.text = class fc_fields_text extends fc.fields.input {

	get_input(){
		return this.querySelector('input');
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
					'id': index,
					'class': 'fc_input',
					'type': template.fc_validate_as ?? 'text',
					'minlength': template.fc_minlength,
					'maxlength': template.fc_maxlength,
					'autocomplete': template.fc_autocomplete,
					'placeholder': template.fc_placeholder,
					'pattern': template.fc_pattern,
					'required': template.fc_required ? true : null,
					'aria-required': template.fc_required ? 'true' : '',
					'readonly': template.fc_readonly ? true : null,
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

customElements.define('fc-text', fc.fields.text);
