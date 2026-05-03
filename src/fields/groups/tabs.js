fu.fields.tabs = class fu_fields_tabs extends fu.fields.abstract {

	get buttons(){
		return Array.from(this.childNodes[0].childNodes);
	}

	get panels(){
		return Array.from(this.childNodes[1].childNodes);
	}

	get value(){
		const value = this.panels.reduce((acc, obj) => ({ ...acc, ...obj.value }), {});
		return Object.keys(value).length ? value : null;
	}

	set value(value){
		this.panels.forEach((panel) => panel.value = value);
	}

	select(index){
		this.buttons.forEach((button, i) => {
			const selected = i === index;
			button.setAttribute('aria-selected', selected);
			button.tabIndex = selected ? 0 : -1;
		});
		this.panels.forEach((panel, i) => panel.hidden = i !== index);
		this.classList.remove('fu_tabs_show_all');
	}

	show_all(){
		this.panels.forEach(panel => panel.hidden = false);
		this.classList.add('fu_tabs_show_all');
		this.querySelectorAll(':scope .fu_tabs').forEach(nested => {
			nested.panels.forEach(panel => panel.hidden = false);
			nested.classList.add('fu_tabs_show_all');
		});
	}

	on_keydown(e){
		const buttons = this.buttons.filter(b => b.checkVisibility());
		const current = buttons.indexOf(e.target);
		if( current === -1 ) return;

		const total = buttons.length;
		const next = {
			'ArrowRight': (current + 1) % total,
			'ArrowLeft':  (current - 1 + total) % total,
			'Home': 0,
			'End': total - 1,
		}[e.key];
		if( next === undefined ) return;

		e.preventDefault();
		e.stopPropagation();
		this.select(next);
		this.buttons[next]?.focus();
	}

	/**
	 * @param {Object} template
	 */
	set template(template){
		const ID = fu.DOM.getIndex();

		fu.DOM.attrs(this, {
			'class': 'fu_tabs fu_field',
			'fu_colspan': template.fu_colspan ?? '',
			'id': ID,
			'children': [
				{
					'class': 'fu_buttons',
					'role': 'tablist',
					'events': {
						'keydown': (e) => this.on_keydown(e),
					},
					'children': [
						(template.tabs ?? []).map((tab, index) => ({
							'tag': 'button', 'type': 'button',
							'id': `${ID}_${index}_button`,
							'class': 'fu_button',
							'role': 'tab',
							'aria-controls': `${ID}_${index}_panel`,
							'data-index': index,
							'html': tab.fu_label ?? '',
							'events': {
								'click': () => this.select(index),
							},
						})),
						{
							'tag': 'button', 'type': 'button',
							'id': fu.DOM.getIndex(),
							'class': 'fu_tab_button fu_tab_button_debug',
							'role': 'presentation',
							'html': '- Everything -',
							'events': {
								'click': () => this.show_all(),
							},
						},
					],
				},
				{
					'class': 'fu_panels',
					'children': (template.tabs ?? []).map((tab, index) => ({
						'tag': 'fu-children',
						'id': `${ID}_${index}_panel`,
						'role': 'tabpanel',
						'aria-labelledby': `${ID}_${index}_button`,
						'tabindex': 0,
						'template': tab.fields ?? [],
					})),
				},
			],
		});

		this.select(0);
	}
};

customElements.define('fu-tabs', fu.fields.tabs);