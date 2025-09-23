fu.fields.radiotabs = class fu_fields_radiotabs extends fu.fields.abstract {

	get buttons(){
		return Array.from( this.querySelector('.fu_radiotabs_buttons').childNodes );
	}

	get panels(){
		return Array.from( this.querySelector('.fu_radiotabs_panels').childNodes );
	}

	get value(){
		const panel_value = this.querySelector('.fu_radiotabs_panels').querySelector('.fu_open_tab')?.value;

		const button = this.querySelector('.fu_radiotabs_buttons').querySelector('input:checked');
		if (!button) return panel_value;

		const button_value = button.getAttribute('value');
		const button_name = this.getAttribute('fu_radio_name');

		if ( !button_value || !button_name) {
			return panel_value;
		}

		return { [button_name]: button_value, ...panel_value }
	}

	set value(value){
		const fu_radio_name = this.getAttribute('fu_radio_name');
		const fu_radio_value = value[fu_radio_name];
		if( ( fu_radio_value ) && ( /[a-zA-Z0-9_\-]+/g.test(fu_radio_value) ) ){
			const found = this.querySelector('.fu_radiotabs_buttons').querySelector('input[value="'+fu_radio_value+'"]');
			if( found ) {
				found.parentNode.dispatchEvent( new Event('click') );
			} else {
				this.buttons[0].dispatchEvent( new Event('click') );
			}
		} else {
			this.buttons[0].dispatchEvent( new Event('click') );
		}

		this.panels.forEach( (children) => children.value = value );
	}

	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_radiotabs fu_field',
			'fu_radio_name': template.fu_name,
			'children':[
				! template.fu_label ? null : {
					'class': 'fu_label',
					'html': template.fu_label
				},
				{
					'class': 'fu_radiotabs_buttons',
					'children': template.tabs?.map((tab, index)=> ({
						'tag': 'label',
						'class': 'fu_radiotab_button',
						'data-index': index,
						'children':[
							{
								'tag': 'input',
								'id': fu.DOM.getIndex(),
								'class': 'fu_radio',
								'type': 'radio',
								'value': tab.fu_value ?? '',
							},{
								'tag': 'span',
								'html': tab.fu_label ?? '',
							}
						],
						'events': {
							'click': (e) => {
								const buttons = this.buttons;
								buttons.forEach((button) => {
									button.classList.remove('fu_switch');
									const radio = button.querySelector('input');
									radio.checked = false;
								});

								const button = buttons[ index ]
								button.classList.add('fu_switch');
								button.querySelector('input').checked = true;

								const panels = this.panels;
								panels.forEach((button) => button.classList.remove('fu_open_tab') );
								panels[ index ].classList.add('fu_open_tab');
							}
						}
					})),
				},{
					'class': 'fu_radiotabs_panels fu_switch fu_container',
					'children': template.tabs?.map(tab => ({
						'tag': 'fu-children',
						'template': tab.fields??[],
					})),
				},
			],
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-radiotabs', fu.fields.radiotabs);
