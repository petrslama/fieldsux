fc.fields.checkboxes = class fc_fields_checkboxes extends fc.fields.input {

	get value(){
		let value = [];
		this.inputs.forEach((input) => {
			if( input.checked ){
				value.push( input.value );
			}
		})
		return value.length ? value : null;
	}

	set value(value){
		this.inputs.forEach((input) => {
			input.checked = ( -1 != value.indexOf( input.value ) )
		});
		this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
	}

	get inputs(){
		return Array.from(
			this.querySelectorAll('.fc_choices_wrapper input[type="checkbox"]')
		);
	}

	get repeater_label(){
		const labels = [];
		Array.from(
			this.querySelectorAll('input:checked + .fc_checkboxes_label')
		).forEach((label) => {
			labels.push( label.innerHTML.trim() )
		});
		return labels.join(', ');
	}

	create_field( index, template ){
		return fc.DOM.create({
			'class': 'fc_choices_wrapper',
			'children': template.values?.map(config => {
				index = fc.DOM.getIndex();
				return {
					'class': 'fc_input_wrapper',
					'tag': 'label',
					'for': index,
					'children': [
						{
							'tag': 'input',
							'type': 'checkbox',
							'id': index,
							'class': 'fc_checkbox',
							'value': config.fc_value ?? '1',
							'events': {
								'change': () => this.dispatchEvent( new CustomEvent( 'fc_field_input' ) )
							},
						}, ( ! config.fc_label ) ? null : {
							'class': 'fc_checkboxes_label',
							'html': ' ' + config.fc_label.replace(/\b([a-zA-Z]{1,2})\s/g, '$1&nbsp;') + ' ',
						}
					]
				};
			})
		});
	}
};

customElements.define('fc-checkboxes', fc.fields.checkboxes);
