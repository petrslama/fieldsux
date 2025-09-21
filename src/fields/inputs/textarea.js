fc.fields.textarea = class fc_fields_textarea extends fc.fields.input {

	get_input(){ return this.querySelector('textarea'); }

	create_field( index, template ){
		return fc.DOM.create({
			'class': 'fc_input_wrapper',
			'children': [
				{
					'tag': 'textarea',
					'id': index,
					'class': 'fc_input',
					'placeholder': template.fc_placeholder,
					'minlength': template.fc_minlength,
					'maxlength': template.fc_maxlength,
					'required': template.fc_required,
					'aria-required': template.fc_required    ? 'true' : '',
					'readonly': template.fc_readonly,
					'events': {
						'input': () => this.dispatchEvent( new CustomEvent( 'fc_field_input' ) )
					},
				}
			]
		});
	}

};

customElements.define('fc-textarea', fc.fields.textarea);
