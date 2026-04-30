fu.fields.checkboxes = class fu_fields_checkboxes extends fu.fields.input {

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
		this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
	}

	get inputs(){
		return Array.from(
			this.querySelectorAll('.fu_choices_wrapper input[type="checkbox"]')
		);
	}

	get repeater_label(){
		const labels = [];
		Array.from(
			this.querySelectorAll('input:checked + div')
		).forEach((label) => {
			labels.push( label.innerHTML.trim() )
		});
		return labels.join(', ');
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		fu.DOM.attrs(this, {
			'fu_name': template.fu_name,
			'class': 'fu_choices',
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
								'type': 'checkbox',
								'value': config.fu_value ?? '',
								'events': {
									'change': () => this.dispatchEvent( new CustomEvent( 'fu_field_input' ) )
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

		this.set_width( this, template );
	}
};

customElements.define('fu-checkboxes', fu.fields.checkboxes);
