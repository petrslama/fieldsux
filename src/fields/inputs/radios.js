fu.fields.radios = class fu_fields_radios extends fu.fields.input {

	get value(){
		const checked = this.querySelector('input[type="radio"]:checked');
		return checked ? checked.value : null;
	}

	set value(value){
		const radios =  Array.from( this.querySelectorAll('input[type="radio"]') );
		radios.forEach((input) => {
			input.checked = ( -1 != value.indexOf( input.value ) )
		});
		this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
	}

	get repeater_label(){
		const after = this.querySelector('input:checked + .fu_radios_label')
		return after ? after.innerHTML : '';
	}

	create_field( index, template ){
		return fu.DOM.create({
			'class': 'fu_choices_wrapper',
			'children': template.values?.map(radio => {
				index = fu.DOM.getIndex();
				return {
					'class': 'fu_input_wrapper',
					'tag': 'label',
					'for': index,
					'children': [
						{
							'tag': 'input',
							'id': index,
							'class': 'fu_radio',
							'type': 'radio',
							'value': radio.fu_value ?? '1',
							'events': {
								'change': () => this.value = radio.fu_value ?? '1',
							},
						}, ( ! radio.fu_label ) ? null : {
							'class': 'fu_radios_label',
							'html': ' ' + radio.fu_label.replace(/\b([a-zA-Z]{1,2})\s/g, '$1&nbsp;') + ' ',
						}
					]
				};
			})
		});
	}
};

customElements.define('fu-radios', fu.fields.radios);
