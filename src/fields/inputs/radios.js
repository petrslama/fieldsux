fc.fields.radios = class fc_fields_radios extends fc.fields.input {

	get value(){
		const checked = this.querySelector('input[type="radio"]:checked');
		return checked ? checked.value : null;
	}

	set value(value){
		const radios =  Array.from( this.querySelectorAll('input[type="radio"]') );
		radios.forEach((input) => {
			input.checked = ( -1 != value.indexOf( input.value ) )
		});
		this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
	}

	get repeater_label(){
		const after = this.querySelector('input:checked + .fc_radios_label')
		return after ? after.innerHTML : '';
	}

	create_field( index, template ){
		return fc.DOM.create({
			'class': 'fc_choices_wrapper',
			'children': template.values?.map(radio => {
				index = fc.DOM.getIndex();
				return {
					'class': 'fc_input_wrapper',
					'tag': 'label',
					'for': index,
					'children': [
						{
							'tag': 'input',
							'id': index,
							'class': 'fc_radio',
							'type': 'radio',
							'value': radio.fc_value ?? '1',
							'events': {
								'change': () => this.value = radio.fc_value ?? '1',
							},
						}, ( ! radio.fc_label ) ? null : {
							'class': 'fc_radios_label',
							'html': ' ' + radio.fc_label.replace(/\b([a-zA-Z]{1,2})\s/g, '$1&nbsp;') + ' ',
						}
					]
				};
			})
		});
	}
};

customElements.define('fc-radios', fc.fields.radios);
