fc.fields.color = class fc_fields_color extends fc.fields.input {

	get_input(){
		return this.querySelector('input[type="text"]');
	}

	get value(){
		const value = this.get_input().value;
		return value ? value : null;
	}

	/**
	 * @param {string|Object} value
	 */
	set value(value){
		const input = this.get_input();
		input.value = value ?? '#000000';
		input.dispatchEvent( new Event('input') );
	}

	get repeater_label(){
		return /^#[a-fA-F0-9]{6}$/i.test(this.value)
			? '<i class="fc_color_example" style="background:'+this.value+'"></i>' + this.value
			: ''
	}

	create_field( index, template ){
		return fc.DOM.create({
			'class': 'fc_input_wrapper',
			'children': [
				( ! template.fc_before ) ? null : {
					'class': 'fc_before',
					'html': ' ' + template.fc_before + ' ',
				},{
					'class': 'fc_color',
					'children': [
						{
							'tag': 'input',
							'type': 'color',
							'events': {
								'input': () => {
									const color = this.querySelector('input[type="color"]');
									const hex = this.querySelector('input[type="text"]');
									hex.value = color.value;
									this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
								}
							}
						},{
							'tag': 'input',
							'type': 'text',
							'id': index,
							'pattern': '^#[0-9A-Fa-f]{6}$',
							'readonly': template.fc_readonly ? true: null,
							'list': template.fc_list,
							'events': {
								'input': () => {
									const color = this.querySelector('input[type="color"]');
									const hex = this.querySelector('input[type="text"]');
									if (hex.checkValidity()) {
										color.value = hex.value;
									}
									this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
								}
							}
						}
					]
				},( ! template.fc_after ) ? null : {
					'class': 'fc_after',
					'html': ' ' + template.fc_after + ' ',
				}
			]
		});
	}

};

customElements.define('fc-color', fc.fields.color);