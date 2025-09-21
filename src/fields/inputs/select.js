fu.fields.select = class fu_fields_select extends fu.fields.input {

	get value(){
		const select = this.querySelector('select');
		return select.value;
	}

	set value(value){
		const select = this.querySelector('select');
		select.value = value;
		this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
	}

	get repeater_label(){
		const select = this.querySelector('select');
		if( -1 == select.selectedIndex ) return null;
		if( 0 == select.options.length ) return null;
		return select.options[select.selectedIndex].text ?? null;
	}

	create_field( index, template ){
		return fu.DOM.create({
			'class': 'fu_input_wrapper',
			'children': [
				( ! template.fu_before ) ? null : {
					'class': 'fu_before',
					'html': ' ' + template.fu_before + ' ',
				},{
					'tag': 'select',
					'id': index,
					'class': 'fu_input',
					'children': template.values?.map(config => {
						return {
							'tag': 'option',
							'value': config.fu_value,
							'html': config.fu_label,
						};
					}),
					'events': {
						'change': () => this.dispatchEvent( new CustomEvent( 'fu_field_input' ) )
					},
				},( ! template.fu_after ) ? null : {
					'class': 'fu_after',
					'html': ' ' + template.fu_after + ' ',
				}
			]
		});
	}
};

customElements.define('fu-select', fu.fields.select);
