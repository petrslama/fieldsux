fu.fields.color = class fu_fields_color extends fu.fields.input {

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
			? '<i class="fu_color_example" style="background:'+this.value+'"></i>' + this.value
			: ''
	}

	create_field( index, template ){
		return fu.DOM.create({
			'class': 'fu_input_wrapper',
			'children': [
				( ! template.fu_before ) ? null : {
					'class': 'fu_before',
					'html': ' ' + template.fu_before + ' ',
				},{
					'class': 'fu_color',
					'children': [
						{
							'tag': 'input',
							'type': 'color',
							'events': {
								'input': () => {
									const color = this.querySelector('input[type="color"]');
									const hex = this.querySelector('input[type="text"]');
									hex.value = color.value;
									this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
								}
							}
						},{
							'tag': 'input',
							'type': 'text',
							'id': index,
							'pattern': '^#[0-9A-Fa-f]{6}$',
							'readonly': template.fu_readonly ? true: null,
							'list': template.fu_list,
							'events': {
								'input': () => {
									const color = this.querySelector('input[type="color"]');
									const hex = this.querySelector('input[type="text"]');
									if (hex.checkValidity()) {
										color.value = hex.value;
									}
									this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
								}
							}
						}
					]
				},( ! template.fu_after ) ? null : {
					'class': 'fu_after',
					'html': ' ' + template.fu_after + ' ',
				}
			]
		});
	}

};

customElements.define('fu-color', fu.fields.color);