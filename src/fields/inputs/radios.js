fu.fields.radios = class fu_fields_radios extends fu.fields.input {

	get value(){
		const checked = this.querySelector('input[type="radio"]:checked');
		return checked ? checked.getAttribute('value') : null;
	}

	set value(value){
		const radios =  Array.from( this.querySelectorAll('input[type="radio"]') );
		if( '' == value ) {
			radios.forEach((input) => {
				const input_value = input.getAttribute('value');
				input.checked = ( input_value == null );
			});
		} else {
			radios.forEach((input) => {
				input.checked = ( -1 != value.indexOf( input.value ) )
			});
		}
		this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
	}

	get repeater_label(){
		const label = this.querySelector('input:checked + div')
		return label ? label.innerHTML : '';
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		const index = fu.DOM.getIndex();

		fu.DOM.attrs(this, {
			'class': 'fu_field fu_field_choices',
			'fu_colspan': template.fu_colspan ?? '',
			'fu_name': template.fu_name,
			'children':[
				( ! template.fu_label ) ? null : {
					'class': 'fu_label',
					'html': template.fu_label,
				},
				template.values?.map(config => {
					return {
						'tag': 'label',
						'children': [
							{
								'tag': 'input',
								'type': 'radio',
								'name': index + '__radio',
								'value': config.fu_value ?? '',
								'events': {
									'change': () => this.value = config.fu_value ?? '',
								},
							}, ( ! config.fu_label ) ? null : {
								'html': config.fu_label,
							}
						],
					};
				}),
				( ! template.fu_description ) ? null : {
					'class': 'fu_description',
					'html': template.fu_description
				},
			]
		});
	}
};

customElements.define('fu-radios', fu.fields.radios);
