fu.fields.radiotabs = class fu_fields_radiotabs extends fu.fields.abstract {

	get buttons(){
		return Array.from(this.childNodes[0].childNodes);
	}

	get panels(){
		return Array.from(this.childNodes[1].childNodes);
	}

	get value(){
		const panel_value = this.panels.find(p => !p.hidden)?.value;

		const input = this.childNodes[0].querySelector('input:checked');
		if(!input) return panel_value;

		const button_value = input.getAttribute('value');
		const button_name = this.getAttribute('fu_radio_name');

		if(!button_value || !button_name) return panel_value;

		return { [button_name]: button_value, ...panel_value };
	}

	set value(value){
		const fu_radio_name = this.getAttribute('fu_radio_name');
		const fu_radio_value = value[fu_radio_name];

		const index = fu_radio_value && /[a-zA-Z0-9_\-]+/.test(fu_radio_value)
			? this.buttons.findIndex(b => b.querySelector('input')?.getAttribute('value') === fu_radio_value)
			: -1;

		this.select(index !== -1 ? index : 0);
		this.panels.forEach((panel) => panel.value = value);
	}

	select(index){
		this.buttons.forEach((button, i) => {
			const selected = i === index;
			button.querySelector('input').checked = selected;
			button.setAttribute('aria-selected', selected);
			button.tabIndex = selected ? 0 : -1;
		});
		this.panels.forEach((panel, i) => panel.hidden = i !== index);
	}

	on_keydown(e){
		const buttons = this.buttons.filter(b => b.checkVisibility());
		const current = buttons.indexOf(e.target.closest('.fu_button'));
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
			'class': 'fu_radiotabs fu_field',
			'fu_colspan': template.fu_colspan ?? '',
			'id': ID,
			'fu_radio_name': template.fu_name,
			'children': [
				{
					'class': 'fu_buttons',
					'role': 'tablist',
					'events': {
						'keydown': (e) => this.on_keydown(e),
					},
					'children': [
						(template.tabs ?? []).map((tab, index) => ({
							'tag': 'label',
							'id': `${ID}_${index}_button`,
							'class': 'fu_button',
							'role': 'tab',
							'aria-controls': `${ID}_${index}_panel`,
							'aria-selected': false,
							'tabindex': -1,
							'data-index': index,
							'children': [
								{
									'tag': 'input',
									'id': `${ID}_${index}_radio`,
									'name': ID,
									'class': 'fu_radio',
									'type': 'radio',
									'value': tab.fu_value ?? '',
									'tabindex': -1,
								}, {
									'tag': 'span',
									'html': tab.fu_label ?? '',
								}
							],
							'events': {
								'click': () => this.select(index),
							}
						})),
					],
				}, {
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
	}
};

customElements.define('fu-radiotabs', fu.fields.radiotabs);
