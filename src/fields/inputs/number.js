fu.fields.number = class fu_fields_number extends fu.fields.input {

	get_input(){
		return this.querySelector('input[type="number"]');
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
					'type': 'number',
					'id': index,
					'class': 'fu_input',
					'min': template.fu_min,
					'max': template.fu_max,
					'step': template.fu_step,
					'placeholder': template.fu_placeholder,
					'pattern': template.fu_pattern,
					'required':template.fu_required,
					'aria-required': template.fu_required ? 'true' : '',
					'readonly':template.fu_readonly,
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

customElements.define('fu-number', fu.fields.number);