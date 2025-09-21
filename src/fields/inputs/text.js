fu.fields.text = class fu_fields_text extends fu.fields.input {

	get_input(){
		return this.querySelector('input');
	}

	create_field( index, template ){
		return fu.DOM.create({
			'class': 'fu_input_wrapper',
			'children': [
				( ! template.fu_before ) ? null : {
					'class': 'fu_before',
					'html': ' ' + template.fu_before + ' ',
				},{
					'tag': 'input',
					'id': index,
					'class': 'fu_input',
					'type': template.fu_validate_as ?? 'text',
					'minlength': template.fu_minlength,
					'maxlength': template.fu_maxlength,
					'autocomplete': template.fu_autocomplete,
					'placeholder': template.fu_placeholder,
					'pattern': template.fu_pattern,
					'required': template.fu_required ? true : null,
					'aria-required': template.fu_required ? 'true' : '',
					'readonly': template.fu_readonly ? true : null,
					'list': template.fu_list,
					'events': {
						'input': () => this.dispatchEvent( new CustomEvent( 'fu_field_input' ) )
					},
				},( ! template.fu_after ) ? null : {
					'class': 'fu_after',
					'html': ' ' + template.fu_after + ' ',
				}
			]
		});
	}

};

customElements.define('fu-text', fu.fields.text);
