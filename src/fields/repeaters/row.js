fu.fields.row = class fu_fields_row extends fu.fields.group {

	get repeater(){
		return this.closest('.fu_repeater');
	}

	open(){
		this.toggle_open_state(); // Open things after initialization
	}

	toggle_open_state(){
		if( this.classList.contains('fu_open_row') ){
			Array.from( this.querySelectorAll('.fu_open_row') ).forEach(
				el => el.classList.remove('fu_open_row')
			);
		}
		this.classList.toggle('fu_open_row');
		this.repeater.update_open_state();
	}

	button_add_to_top(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fu_icon fu_add to_top',
		'aria-label': 'Add before row',
		'events': {
			'click': (e) => {
				this.repeater.add_row(this, 'before');
			},
		}
	}}

	button_add_to_bottom(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fu_icon fu_add to_bottom',
		'aria-label': 'Add after row',
		'events': {
			'click': (e) => {
				this.repeater.add_row(this, 'after');
			},
		}
	}}

	icon_move(){ return {
		'class': 'fu_icon fu_move'
	}}

	checkbox(){ return {
		'tag': 'label',
		'class': 'fu_r_checkbox',
		'children': [
			{
				'tag': 'input',
				'type': 'checkbox',
				'id': fu.DOM.getIndex(),
				'events': {
					'change': (e) => {
						this.repeater.update_check_state();
					},
				},
			}
		]
	}}

	index(){ return  {
		'class': 'fu_index'
	}}

	button_delete(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fu_icon fu_delete',
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
		'class': 'fu_icon fu_x2',
		'aria-label': 'Duplicate',
		'events': {
			'click': () => {
				const new_row = this.repeater.create_row( this.value );
				new_row.classList.add('fu_open_row');
				this.after(new_row);
			},
		},
	}}

	button_up(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fu_icon fu_up',
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
		'class': 'fu_icon fu_down',
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
		'class': 'fu_icon fu_toggle',
		'aria-label': 'Open / Close',
		'events': {
			'click': () => this.toggle_open_state(),
		},
	}}


	/**
	 * @param {Object} template
	 */
	set template(template){

		fu.DOM.attrs(this, {
			'id': fu.DOM.getIndex(),
			'class': 'fu_row fu_switch',
			'children':[
				{
					'class': 'fu_header fu_row_header',
					'children':[
						this.icon_move(),
						this.checkbox(),
						this.button_add_to_top(),
						this.button_add_to_bottom(),
						this.index(),
						{
							'class': 'fu_row__labels',
							'events': {
								'click': () => this.toggle_open_state(),
							},
							'children': template.fu_row__labels?.map(config => {
								if( ! config ){
									return;
								}
								return {
									'class': 'fu_label',
									'style': config.width ? `flex-grow:${config.width}` : '',
									'children': [{ 'html': config.fu_label ?? '' }],
								};
							}),
						},{
							'class': 'fu_actions',
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
					'class': 'fu_container',
					'children': [{
						'tag': 'fu-children',
						'template': template.fields
					}]
				}
			]
		});

		this.querySelector('.fu_row_header').querySelectorAll('[data-from]')?.forEach( (label) => {
			const from = label.getAttribute('data-from');
			let field;

			field = this.querySelector('[fu_name="'+from+'"]');
			if( ! field ) {
				return
			}

			field.addEventListener( 'fu_field_input', (e) => {
				label.innerHTML = '';
				fu.DOM.attrs( label, {
					'html': field.repeater_label
				});
			});
			field.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
		});
	}
};

customElements.define('fu-row', fu.fields.row);
