fu.fields.textarea = class fu_fields_textarea extends fu.fields.input {

	get_input(){ return this.querySelector('textarea'); }

	create_field( index, template ){
		return fu.DOM.create({
			'class': 'fu_input_wrapper',
			'children': [
				{
					'tag': 'textarea',
					'id': index,
					'class': 'fu_input',
					'placeholder': template.fu_placeholder,
					'minlength': template.fu_minlength,
					'maxlength': template.fu_maxlength,
					'required': template.fu_required,
					'aria-required': template.fu_required    ? 'true' : '',
					'readonly': template.fu_readonly,
					'events': {
						'input': () => this.dispatchEvent( new CustomEvent( 'fu_field_input' ) )
					},
				}
			]
		});
	}

};

customElements.define('fu-textarea', fu.fields.textarea);
