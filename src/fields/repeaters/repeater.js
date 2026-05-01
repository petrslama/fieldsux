
fu.fields.repeater = class fu_fields_repeater extends fu.fields.abstract {

	get value(){
		const value = Array.from(this.rows.childNodes)
			.filter(row => row.classList.contains('fu_row'))
			.map(row => row.value);

		return value.length ? value : [];
	}

	set value(value){
		this.rows.innerHTML = '';
		this.append_value(value);
	}

	append_value(value){
		for( let i = 0; i < value.length; i++ ){
			const new_row = this.create_row(value[i]);
			if( new_row ) {
				this.rows.appendChild(new_row);
			}
		}
	}

	update_open_state(){
		const rowNodes = Array.from(this.rows.childNodes);
		const allRowsOpen = rowNodes.every(row => row.classList.contains('fu_open_row'));
		this.classList.toggle('fu_open_repeater', allRowsOpen);
	}

	toggle_open_state(){
		const rowNodes = Array.from(this.rows.childNodes);
		const allRowsOpen = rowNodes.every(row => row.classList.contains('fu_open_row'));
		if( allRowsOpen ) {
			Array.from( this.querySelectorAll('.fu_open_row') ).forEach(
				el => el.classList.remove('fu_open_row')
			);
		} else {
			rowNodes.forEach(row => row.classList.add('fu_open_row'));
		}
		this.classList.toggle('fu_open_repeater', !allRowsOpen);
	}

	update_check_state(){
		const repeater_checkbox = this.querySelector('input[type="checkbox"]');

		const rowNodes = Array.from(this.rows.childNodes);
		const checked = rowNodes.filter(row => {
			const row_checkbox = row.querySelector('input[type="checkbox"]');
			return row_checkbox.checked;
		});

		repeater_checkbox.checked = rowNodes.length > 0 && checked.length == rowNodes.length;
		repeater_checkbox.parentNode.classList.toggle('checked', checked.length > 0);

		if (checked.length == rowNodes.length) {
			repeater_checkbox.indeterminate = false;
		} else if (checked.length > 0) {
			repeater_checkbox.indeterminate = true;
		} else {
			repeater_checkbox.indeterminate = false;
		}
	}

	toggle_check_state(){
		const repeater_checkbox = this.querySelector('input[type="checkbox"]');

		const repeater_checked = repeater_checkbox.checked;
		const rows = Array.from(this.rows.childNodes);

		rows.forEach( (row) => {
			const row_checkbox = row.querySelector('input[type="checkbox"]');
			row_checkbox.checked = repeater_checked;
		});
	}

	get_checked_rows() {
		const rowNodes = Array.from(this.rows.childNodes);

		const checkedRows = rowNodes.filter(row => {
			const row_checkbox = row.querySelector('input[type="checkbox"]');
			return row_checkbox && row_checkbox.checked;
		});

		return checkedRows;
	}

	add_row(caller, position){
		// different in multiple / single + table
	}

	async copy_selected(){
		const values = Array.from(this.get_checked_rows())
			.filter(row => row.tagName.toLowerCase() === 'fu-row')
			.map(row => row.value);

		try {
			const JSON_string = fu.JSON.stringify( values );
			await navigator.clipboard.writeText(JSON_string);
		} catch (error) {
			const JSON_dialog = this.show_to_copy();
			JSON_dialog.notice = '<b>Unable to copy to clipboard</b><p>Please check web browser permissions for your site.<br>To copy manually: press Ctrl+C (Windows) or Cmd+C (Mac), then press Esc</p>';
			JSON_dialog.select_text();
			console.warn('Clipboard copy failed:', error);
		}
	}

	button_delete(){ return {
		'tag': 'button', 'type': 'button', 'class': 'fu_icon fu_delete',
		'aria-label': 'Delete',
		'events': {
			'click': (e) => {
				this.rows.innerHTML = '';
				this.toggle_check_state();
				this.update_open_state();
			},
		},
	};}

	button_json(){ return {
		'tag': 'button', 'type': 'button', 'class': 'fu_icon fu_json',
		'aria-label': 'Edit as JSON',
		'events': {
			'click': () => {
				this.edit_as_json();
			},
		}
	};}

	button_paste(){ return {
		'tag': 'button', 'type': 'button', 'class': 'fu_icon fu_paste',
		'aria-label': 'Paste',
		'events': {
			'click': async (e) => {
				this.paste( true );
			},
		}
	};}

	button_copy(){ return {
		'tag': 'button', 'type': 'button', 'class': 'fu_icon fu_copy',
		'aria-label': 'Copy',
		'events': {
			'click': async () => this.copy()
		}
	};}

	button_toggle(){ return {
		'tag': 'button', 'type': 'button', 'class': 'fu_icon fu_toggle',
		'aria-label': 'Open / Close',
		'events': {
			'click': (e) => this.toggle_open_state(),
		},
	};}

	buttons(){ return {
		'class': 'fu_buttons',
		'children': [
			this.button_delete(),
			this.button_json(),
			this.button_paste(),
			this.button_copy(),
			this.button_toggle(),
		],
	};}

	/**
	 * @param {Object} template
	 */
	set template(template){

		// Prepare labels

		if( ( ! template.fu_repeater__labels ) || ( 0 == template.fu_repeater__labels.length ) ){
			this.template_labels = [{ 'fu_label': '' }];
		} else {
			this.template_labels = template.fu_repeater__labels
		}

		// Set up templates

		const template_group_id = this.init_repeater( template );

		// Do it

		fu.DOM.attrs(this, {
			'fu_name': template.fu_name,
			'class': 'fu_repeater fu_field',
			'data-group': template_group_id,
			'children': [{
				'class': 'fu_header',
				'children':[
					{
						'class': 'fu_move',
						'html': '&nbsp;'
					},{
						'class': 'fu_index',
						'html': '#'
					},{
						'tag': 'label',
						'children': [{
							'tag': 'input',
							'type': 'checkbox',
							'id': fu.DOM.getIndex(),
							'events': {
								'change': (e) => {
									this.toggle_check_state();
									this.update_check_state();
								},
							},
						},{
							'class': 'fu_menu',
							'children': [
								{
									'tag': 'button', 'type': 'button',
									'class': 'fu_icon fu_delete',
									'aria-label': 'Delete Selected',
									'events': {
										'click': (e) => {
											this.get_checked_rows().forEach( (row) => row.remove() );
											this.update_check_state();
											this.update_open_state();
										},
									},
								},{
									'tag': 'button', 'type': 'button',
									'class': 'fu_icon fu_copy',
									'aria-label': 'Copy Selected',
									'events': {
										'click': async () => {
											this.copy_selected();
										}
									}
								}
							],
						}]
					},{
						'class': 'fu_labels',
						'events': {
							'click': (e) => this.toggle_open_state(),
						},
						'children': this.template_labels?.map(label => ({
							'class': 'fu_label',
							'style': label.width ? `flex-grow: ${label.width}` : '',
							'children': [{
								'html': label.fu_label ?? ''
							}],
						})),
					},
					this.buttons()
				],
			},{
				'tag': 'fu-rows',
			},{
				'class': 'fu_footer',
				'events': {
					'click': () => this.add_row(this, 'append')
				},
				'children': [{
					'tag': 'button', 'type': 'button',
					'class': 'fu_icon fu_add',
					'aria-label': 'Add row',
				}]
			}],
		});

		this.set_width( this, template );

		this.rows = this.querySelector('fu-rows');

		if( 'undefined' == typeof Sortable ) {
			throw new Error('Sortable is not defined, please be sure, that script with SortableJS is loaded before FieldsUX');
		} else {
			this.Sortable = new Sortable( this.rows, {
				group: template_group_id,
				handle: '.fu_icon.fu_move',
				animation: 150,
				onStart: (e) => {
					document.body.classList.add('sortable-dragging');
					document.documentElement.classList.add('sortable-dragging');
				},
				onEnd: () => {
					document.body.classList.remove('sortable-dragging');
					document.documentElement.classList.remove('sortable-dragging');
				}
			});
		}
	}

};

