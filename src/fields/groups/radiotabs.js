fc.fields.radiotabs = class fc_fields_radiotabs extends fc.fields.abstract {

	get buttons(){
		return Array.from( this.querySelector('.fc_tabs_buttons').childNodes );
	}

	get panels(){
		return Array.from( this.querySelector('.fc_tabs_panels').childNodes );
	}

	get value(){
		const panel_value = this.querySelector('.fc_tabs_panels').querySelector('.fc_open_tab')?.value;

		const button = this.querySelector('.fc_tabs_buttons').querySelector('input:checked');
		if (!button) return panel_value;

		const button_value = button.getAttribute('value');
		const button_name = this.getAttribute('fc_radio_name');

		if ( !button_value || !button_name) {
			return panel_value;
		}

		return { [button_name]: button_value, ...panel_value }
	}

	set value(value){
		const fc_radio_name = this.getAttribute('fc_radio_name');
		const fc_radio_value = value[fc_radio_name];
		if( ( fc_radio_value ) && ( /[a-zA-Z0-9_\-]+/g.test(fc_radio_value) ) ){
			const found = this.querySelector('.fc_tabs_buttons').querySelector('input[value="'+fc_radio_value+'"]');
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
		fc.DOM.attrs(this, {
			'class': 'fc_tabs fc_field',
			'fc_radio_name': template.fc_name,
			'children':[
				! template.fc_label ? null : {
					'class': 'fc_label',
					'html': template.fc_label
				},
				{
					'class': 'fc_tabs_buttons',
					'children': template.tabs?.map((tab, index)=> ({
						'tag': 'label',
						'class': 'fc_tab_button',
						'data-index': index,
						'children':[
							{
								'tag': 'input',
								'id': fc.DOM.getIndex(),
								'class': 'fc_radio',
								'type': 'radio',
								'value': tab.fc_value ?? '',
							},{
								'tag': 'span',
								'html': tab.fc_label ?? '',
							}
						],
						'events': {
							'click': (e) => {
								const buttons = this.buttons;
								buttons.forEach((button) => {
									button.classList.remove('fc_switch');
									const radio = button.querySelector('input');
									radio.checked = false;
								});

								const button = buttons[ index ]
								button.classList.add('fc_switch');
								button.querySelector('input').checked = true;

								const panels = this.panels;
								panels.forEach((button) => button.classList.remove('fc_open_tab') );
								panels[ index ].classList.add('fc_open_tab');
							}
						}
					})),
				},{
					'class': 'fc_tabs_panels fc_switch fc_container',
					'children': template.tabs?.map(tab => ({
						'tag': 'fc-children',
						'template': tab.fields??[],
					})),
				},
			],
		});

		this.set_width( this, template );
	}
};

customElements.define('fc-radiotabs', fc.fields.radiotabs);
