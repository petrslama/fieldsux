
fc.fields.repeater = class fc_fields_repeater extends fc.fields.abstract {

	get value(){
		const value = Array.from(this.rows.childNodes)
			.filter(row => row.tagName.toLowerCase() === 'fc-row')
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
		const allRowsOpen = rowNodes.every(row => row.classList.contains('fc_open'));
		this.classList.toggle('fc_open', allRowsOpen);
	}

	toggle_open_state(){
		const rowNodes = Array.from(this.rows.childNodes);
		const allRowsOpen = rowNodes.every(row => row.classList.contains('fc_open'));
		if( allRowsOpen ) {
			Array.from( this.querySelectorAll('.fc_open') ).forEach(
				el => el.classList.remove('fc_open')
			);
		} else {
			rowNodes.forEach(row => row.classList.add('fc_open'));
		}
		this.classList.toggle('fc_open', !allRowsOpen);
	}

	update_check_state(){
		const repeater_checkbox
			= this.querySelector('.fc_repeater_header')
			.querySelector('input[type="checkbox"]');

		const rowNodes = Array.from(this.rows.childNodes);
		const checked = rowNodes.filter(row => {
			const row_checkbox = row.querySelector('.fc_row_header')
				.querySelector('input[type="checkbox"]');
			return row_checkbox.checked;
		});

		repeater_checkbox.checked = ( checked.length == rowNodes.length );
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
		const repeater_checkbox
			= this.querySelector('.fc_repeater_header')
			.querySelector('input[type="checkbox"]');

		const repeater_checked = repeater_checkbox.checked;
		const rows = Array.from(this.rows.childNodes);

		rows.forEach( (row) => {
			const row_checkbox
				= row.querySelector('.fc_row_header')
				.querySelector('input[type="checkbox"]');
			row_checkbox.checked = repeater_checked;
		});
	}

	get_checked_rows() {
		const rowNodes = Array.from(this.rows.childNodes);

		const checkedRows = rowNodes.filter(row => {
			const row_checkbox = row.querySelector('.fc_row_header')
				.querySelector('input[type="checkbox"]');
			return row_checkbox && row_checkbox.checked;
		});

		return checkedRows;
	}

	add_row(caller, position){
		// different in multiple / single + table
	}

	async copy_selected(){
		const values = Array.from(this.get_checked_rows())
			.filter(row => row.tagName.toLowerCase() === 'fc-row')
			.map(row => row.value);

		try {
			const JSON_string = fc.JSON.stringify( values );
			await navigator.clipboard.writeText(JSON_string);
		} catch (error) {
			const JSON_dialog = this.show_to_copy();
			JSON_dialog.notice = '<b>Unable to copy to clipboard</b><p>Please check web browser permissions for your site.<br>To copy manually: press Ctrl+C (Windows) or Cmd+C (Mac), then press Esc</p>';
			JSON_dialog.select_text();
			console.warn('Clipboard copy failed:', error);
		}
	}


	/**
	 * @param {Object} template
	 */
	set template(template){

		// Prepare labels

		if( ( ! template.fc_repeater__labels ) || ( 0 == template.fc_repeater__labels.length ) ){
			this.template_labels = [{ 'fc_label': '' }];
		} else {
			this.template_labels = template.fc_repeater__labels
		}

		// Set up templates

		const template_group_id = this.init_repeater( template );

		// Do it

		fc.DOM.attrs(this, {
			'fc_name': template.fc_name,
			'class': 'fc_repeater fc_field',
			'data-group': template_group_id,
			'children': [
				! template.fc_label || {
					'class': 'fc_label',
					'html': template.fc_label,
				},
				{
					'class': 'fc_input_wrapper fc_repeater_wrapper',
					'children': [
						{
							'class': 'fc_header fc_repeater_header',
							'children':[
								{
									'tag': 'label',
									'class': 'fc_r_checkbox',
									'children': [{
										'tag': 'input',
										'type': 'checkbox',
										'id': fc.DOM.getIndex(),
										'events': {
											'change': (e) => {
												this.toggle_check_state();
												this.update_check_state();
											},
										},
									}]
								},{
									'class': 'fc_for_selected_menu',
									'children': [
										{
											'tag': 'button', 'type': 'button',
											'class': 'fc_icon fc_delete',
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
											'class': 'fc_icon fc_copy',
											'aria-label': 'Copy Selected',
											'events': {
												'click': async () => {
													this.copy_selected();
												}
											}
										}
									],
								},{
									'class': 'fc_repeater__labels',
									'events': {
										'click': (e) => this.toggle_open_state(),
									},
									'children': this.template_labels?.map(label => ({
										'class': 'fc_label',
										'style': label.width ? `flex-grow: ${label.width}` : '',
										'children': [{
											'html': label.fc_label ?? ''
										}],
									})),
								},{
									'class': 'fc_actions',
									'children': [
										{
											'tag': 'button', 'type': 'button',
											'class': 'fc_icon fc_delete',
											'aria-label': 'Delete',
											'events': {
												'click': (e) => {
													this.rows.innerHTML = '';
													this.toggle_check_state();
													this.update_open_state();
												},
											},
										},{
											'tag': 'button', 'type': 'button',
											'class': 'fc_icon fc_json',
											'aria-label': 'Edit as JSON',
											'events': {
												'click': () => {
													this.edit_as_json();
												},
											},
										},{
											'tag': 'button', 'type': 'button',
											'class': 'fc_icon fc_paste',
											'aria-label': 'Paste',
											'events': {
												'click': async (e) => {
													this.paste( true );
												},
											},
										},{
											'tag': 'button', 'type': 'button',
											'class': 'fc_icon fc_copy',
											'aria-label': 'Copy',
											'events': {
												'click': async () => this.copy()
											}
										},{
											'tag': 'button', 'type': 'button',
											'class': 'fc_icon fc_toggle',
											'aria-label': 'Open / Close',
											'events': {
												'click': (e) => this.toggle_open_state(),
											},
										},
									],
								},
							],
						},{
							'tag': 'fc-rows',
						},{
							'tag': 'button', 'type': 'button',
							'class': 'add_button fc_icon fc_add',
							'events': {
								'click': () => this.add_row(this, 'append')
							}
						},
					],
				},
			],
		});

		this.set_width( this, template );

		this.rows = this.querySelector('fc-rows');

		this.Sortable = new Sortable( this.rows, {
			group: template_group_id,
			handle: '.fc_icon.fc_move',
			//ghostClass: '',
			animation: 150,
		});
	}

};

