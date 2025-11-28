fu.fields.tabs = class fu_fields_tabs extends fu.fields.abstract {

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

		let last_index = 0;

		fu.DOM.attrs(this, {
			'class': 'fu_tabs fu_field',
			'children':[
				{
					'class': 'fu_tabs_buttons',
					'children': [
						template.tabs?.map((tab, index)=> ({
							'tag': 'button', 'type': 'button',
							'id': fu.DOM.getIndex(),
							'class': 'fu_tab_button',
							'data-index': last_index = index,
							'html': tab.fu_label??'',
							'events': {
								'click': (e) => {
									const buttons = this.buttons;
									buttons.forEach((button) => button.classList.remove('fu_switch') );
									buttons[ index ].classList.add('fu_switch');

									const panels = [...this.childNodes[1].childNodes];
									panels.forEach((button) => button.classList.remove('fu_open_tab') );
									panels[ index ].classList.add('fu_open_tab');
								}
							}
						})),						{
							'tag': 'button', 'type': 'button',
							'id': fu.DOM.getIndex(),
							'class': 'fu_tab_button fu_tab_button_debug',
							'data-index': last_index + 1,
							'html': '- Everything -',
							'events': {
								'click': (e) => {
									const buttons = this.buttons;
									buttons.forEach((button) => button.classList.remove('fu_switch') );
									buttons[ last_index + 1 ].classList.add('fu_switch');

									this.panels.forEach((button) => button.classList.add('fu_open_tab') );
								}
							}
						},
					]
				},{
					'class': 'fu_tabs_panels fu_switch fu_container',
					'children': template.tabs?.map(tab => ({
						'tag': 'fu-children',
						'class': 'fu_grid',
						'template': tab.fields??[],
					})),
				},
			],
		});

		this.set_width( this, template );

		this.buttons[0]?.dispatchEvent( new Event('click') );
	}
};

customElements.define('fu-tabs', fu.fields.tabs);
