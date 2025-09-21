fc.fields.tabs = class fc_fields_tabs extends fc.fields.abstract {

	get buttons(){
		return Array.from( this.childNodes[0].childNodes );
	}

	get panels(){
		return Array.from( this.childNodes[1].childNodes );
	}

	get value(){
		const value = this.panels.reduce((acc, obj) => ({ ...acc, ...obj.value }), {});
		return Object.keys(value).length ? value : null;
	}

	set value(value){
		this.panels.forEach( (children) => children.value = value );
	}

	/**
	 * @param {Object} template
	 */
	set template(template){
		fc.DOM.attrs(this, {
			'class': 'fc_tabs fc_field',
			'children':[
				{
					'class': 'fc_tabs_buttons',
					'children': [
						{
							'tag': 'button', 'type': 'button',
							'class': 'fc_tab_button fc_tab_button_debug',
							'data-index': '0',
							'html': '- Everything -',
							'events': {
								'click': (e) => {
									const buttons = this.buttons;
									buttons.forEach((button) => button.classList.remove('fc_switch') );
									buttons[ 0 ].classList.add('fc_switch');

									this.panels.forEach((button) => button.classList.add('fc_open_tab') );
								}
							}
						},
						template.tabs?.map((tab, index)=> ({
							'tag': 'button', 'type': 'button',
							'class': 'fc_tab_button',
							'data-index': index + 1,
							'html': tab.fc_label??'',
							'events': {
								'click': (e) => {
									const buttons = this.buttons;
									buttons.forEach((button) => button.classList.remove('fc_switch') );
									buttons[ index + 1 ].classList.add('fc_switch');

									const panels = [...this.childNodes[1].childNodes];
									panels.forEach((button) => button.classList.remove('fc_open_tab') );
									panels[ index ].classList.add('fc_open_tab');
								}
							}
						})),
					]
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

		this.buttons[1]?.dispatchEvent( new Event('click') );
	}
};

customElements.define('fc-tabs', fc.fields.tabs);
