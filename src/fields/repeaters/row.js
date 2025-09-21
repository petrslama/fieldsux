fc.fields.row = class fc_fields_row extends fc.fields.group {

	get repeater(){
		return this.closest('.fc_repeater');
	}

	toggle_open_state(){
		if( this.classList.contains('fc_open') ){
			Array.from( this.querySelectorAll('.fc_open') ).forEach(
				el => el.classList.remove('fc_open')
			);
		}
		this.classList.toggle('fc_open');
		this.repeater.update_open_state();
	}

	button_add_to_top(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_add to_top',
		'aria-label': 'Add before row',
		'events': {
			'click': (e) => {
				this.repeater.add_row(this, 'before');
			},
		}
	}}

	button_add_to_bottom(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_add to_bottom',
		'aria-label': 'Add after row',
		'events': {
			'click': (e) => {
				this.repeater.add_row(this, 'after');
			},
		}
	}}

	icon_move(){ return {
		'class': 'fc_icon fc_move'
	}}

	checkbox(){ return {
		'tag': 'label',
		'class': 'fc_r_checkbox',
		'children': [
			{
				'tag': 'input',
				'type': 'checkbox',
				'id': fc.DOM.getIndex(),
				'events': {
					'change': (e) => {
						this.repeater.update_check_state();
					},
				},
			}
		]
	}}

	index(){ return  {
		'class': 'fc_index'
	}}

	button_delete(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_delete',
		'aria-label': 'Delete',
		'events': {
			'click': () => {
				const repeater = this.repeater;
				this.remove();
				repeater.update_open_state();
				repeater.update_check_state();
			},
		},
	}}

	button_duplicate(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_x2',
		'aria-label': 'Duplicate',
		'events': {
			'click': () => {
				const new_row = this.repeater.create_row( this.value );
				if( this.classList.contains('fc_open') ){
					new_row.classList.add('fc_open');
				}
				this.after(new_row);
			},
		},
	}}

	button_up(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_up',
		'aria-label': 'Move Up',
		'events': {
			'click': () => {
				const prev = this.previousSibling;
				! prev || this.after(prev);
			},
		},
	}}

	button_down(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_down',
		'aria-label': 'Move Down',
		'events': {
			'click': () => {
				const next = this.nextSibling;
				! next || this.before(next);
			},
		},
	}}

	button_toggle(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_toggle',
		'aria-label': 'Open / Close',
		'events': {
			'click': () => this.toggle_open_state(),
		},
	}}


	/**
	 * @param {Object} template
	 */
	set template(template){

		fc.DOM.attrs(this, {
			'class': 'fc_row fc_switch',
			'children':[
				{
					'class': 'fc_header fc_row_header',
					'children':[
						this.icon_move(),
						this.checkbox(),
						this.button_add_to_top(),
						this.button_add_to_bottom(),
						this.index(),
						{
							'class': 'fc_row__labels',
							'events': {
								'click': () => this.toggle_open_state(),
							},
							'children': template.fc_row__labels?.map(config => {
								if( ! config ){
									return;
								}
								return {
									'class': 'fc_label',
									'style': config.width ? `flex-grow:${config.width}` : '',
									'children': [{ 'html': config.fc_label ?? '' }],
								};
							}),
						},{
							'class': 'fc_actions',
							'children': [
								this.button_delete(),
								this.button_duplicate(),
								this.button_up(),
								this.button_down(),
								this.button_toggle(),
							]
						},
					],
				},{
					'class': 'fc_container',
					'children': [{
						'tag': 'fc-children',
						'template': template.fields
					}]
				}
			]
		});

		this.querySelector('.fc_row_header').querySelectorAll('[data-from]')?.forEach( (label) => {
			const from = label.getAttribute('data-from');
			let field;

			field = this.querySelector('[fc_name="'+from+'"]');
			if( ! field ) {
				return
			}

			field.addEventListener( 'fc_field_input', (e) => {
				label.innerHTML = '';
				fc.DOM.attrs( label, {
					'html': field.repeater_label
				});
			});
			field.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
		});
	}
};

customElements.define('fc-row', fc.fields.row);
