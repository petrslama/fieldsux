
fc.fields.repeater_multiple = class fc_fields_repeater_multiple extends fc.fields.repeater {

	init_repeater( template ){
		const templates = template.templates;
		this.type_to_ID = templates.reduce((acc, tmpl) => {
			acc[tmpl.fc_type] = fc.Templates.register_template(tmpl);
			return acc;
		}, {});

		if( 0 == Object.keys(this.type_to_ID).length ) {
			fc.DOM.attrs(this, {
				'html': 'No Templates'
			});
			return;
		}

		this.picker_options = [{}].concat(templates.map(template => ({
			'fc_type': template.fc_type,
			'fc_label': template.fc_label
		})));

		if( template.picker ){
			this.picker = template.picker;
		}

		return this.template_group_id = fc.Templates.register_group( this.type_to_ID );
	}

	create_row(value){
		let ID = this.type_to_ID[ value['fc_type'] ];
		let template_type = value.fc_type;

		if( ! ID ){
			console.warn("Template type is not defined for this repeater", {
				'template type': template_type,
				'value': value
			});
			return null;
		}

		if( this.type_to_ID['type'] ){
			ID = this.type_to_ID[ 'type' ];
			template_type = 'type';
		}


		const template = fc.Templates.get_template( ID );

		const row = fc.DOM.create({
			'tag': 'fc-row',
			'template': template,
		});

		const picker = row.querySelector('[fc_name="fc_type"]');
		if( picker ) {
			picker.addEventListener( 'input', (e) => {
				const new_row = this.create_row( row.value );
				if( new_row ) {
					new_row.value = row.value;
					if(row.classList.contains('fc_open')){
						new_row.classList.add('fc_open');
					}
					row.replaceWith(new_row);
				}
			});
		}

		row.value = value;

		return row;
	}

	add_row(caller, position){
		document.activeElement.blur();

		const picker_id = this.picker ?? '__picker_default';

		let datalist = document.getElementById(picker_id);

		let picker = [];
		if( datalist ) {
			picker = Array.from( datalist.childNodes ).map(option => {
				return {
					'fc_type': option.getAttribute('value'),
					'fc_label': option.getAttribute('label'),
				}
			});
		} else {
			picker = this.picker_options;
		}

		this.esc_listener = document.addEventListener('keydown', (event) => {
			if (event.key != 'Escape') {
				return;
			}
			pseudo_row.remove();
			document.activeElement.blur();
		});

		const pseudo_row = fc.DOM.create({
			'class': 'row_add_row fc_switch fc_picker_' + picker_id,
			'children': [
				{
					'class': 'fc_backdrop',
					'events': {
						'click': (e) => pseudo_row.remove()
					},
				},{
					'class': 'fc_add_header',
					'children': [
						{
							'class': 'fc_icon fc_add_row',
						},{
							'class': 'fc_add_label',
							'children': [{
								'html': 'Add new row',
							}],
						},{
							'tag': 'button', 'type': 'button',
							'class': 'fc_icon fc_delete',
							'aria-label': 'Cancel new row',
							'events': {
								'click': (e) => {
									pseudo_row.remove();
									document.removeEventListener('keydown', this.esc_listener);
								}
							},
						}
					]
				},{
					'class': 'fc_add_options',
					'children': (()=>{
						let actual = null;
						const optgroup = [];
						picker.forEach(option => {
							if( option.fc_type ) {
								if( ! actual ) {
									optgroup.push({'class': 'fc_label'});
									optgroup.push( actual = {
										'class': 'fc_group',
										'children': []
									} );
								}
								actual.children.push({
									'tag': 'button', 'type': 'button',
									'class': ( ! this.type_to_ID[option.fc_type] ) ? 'template_not_defined' : '',
									'html': option.fc_label ?? '???',
									'data-fc_type': option.fc_type,
									'events': {
										'click': (e) => {
											const created_row = this.create_row({ 'fc_type': option.fc_type });
											if( null === created_row ) {
												return;
											}
											created_row.classList.add('fc_open');
											pseudo_row.replaceWith(created_row);
											document.removeEventListener('keydown', this.esc_listener);
										},
									},
								});
							} else {
								optgroup.push({
									'class': 'fc_label',
									'html': option.fc_label ?? '???',
								});
								optgroup.push( actual = {
									'class': 'fc_group',
									'children': []
								} );
							}
						});
						return optgroup;
					})()
				},
			],
		});;

		switch(position){
			case 'before':
				caller.before( pseudo_row );
				return;
			case 'after':
				caller.after( pseudo_row );
				return;
			case 'append':
				this.rows.append( pseudo_row );
		}
	}
};

customElements.define('fc-repeater_multiple', fc.fields.repeater_multiple);