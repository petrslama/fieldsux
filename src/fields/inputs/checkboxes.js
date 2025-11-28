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
			this.querySelectorAll('input:checked + .fu_checkboxes_label')
		).forEach((label) => {
			labels.push( label.innerHTML.trim() )
		});
		return labels.join(', ');
	}

	create_field( index, template ){
		return fu.DOM.create({
			'class': 'fu_choices_wrapper fu_container',
			'children': [{
				'class': 'fu_grid',
				'children': template.values?.map(config => {
					index = fu.DOM.getIndex();
					return {
						'class': 'fu_input_wrapper',
						'tag': 'label',
						'for': index,
						'children': [
							{
								'tag': 'input',
								'type': 'checkbox',
								'id': index,
								'class': 'fu_checkbox',
								'value': config.fu_value ?? 'undefined checkboxes item value',
								'events': {
									'change': () => this.dispatchEvent( new CustomEvent( 'fu_field_input' ) )
								},
							}, ( ! config.fu_label ) ? null : {
								'class': 'fu_checkboxes_label',
								'html': config.fu_label,
							}
						],
					};
				}),
			}],
		});
	}
};

customElements.define('fu-checkboxes', fu.fields.checkboxes);
