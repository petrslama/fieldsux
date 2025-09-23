
fu.fields.repeater_multiple = class fu_fields_repeater_multiple extends fu.fields.repeater {

	init_repeater( template ){
		const templates = template.templates;
		this.type_to_ID = templates.reduce((acc, tmpl) => {
			acc[tmpl.fu_type] = fu.Templates.register_template(tmpl);
			return acc;
		}, {});

		if( 0 == Object.keys(this.type_to_ID).length ) {
			fu.DOM.attrs(this, {
				'html': 'No Templates'
			});
			return;
		}

		this.picker_options = [{}].concat(templates.map(template => ({
			'fu_type': template.fu_type,
			'fu_label': template.fu_label
		})));

		if( template.picker ){
			this.picker = template.picker;
		}

		return this.template_group_id = fu.Templates.register_group( this.type_to_ID );
	}

	create_row(value){
		let ID = this.type_to_ID[ value['fu_type'] ];
		let template_type = value.fu_type;

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


		const template = fu.Templates.get_template( ID );

		const row = fu.DOM.create({
			'tag': 'fu-row',
			'template': template,
		});

		const picker = row.querySelector('[fu_name="fu_type"]');
		if( picker ) {
			picker.addEventListener( 'input', (e) => {
				const new_row = this.create_row( row.value );
				if( new_row ) {
					new_row.value = row.value;
					new_row.classList.add('fu_open_row');
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
					'fu_type': option.getAttribute('value'),
					'fu_label': option.getAttribute('label'),
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

		const pseudo_row = fu.DOM.create({
			'class': 'row_add_row fu_switch fu_picker_' + picker_id,
			'children': [
				{
					'class': 'fu_backdrop',
					'events': {
						'click': (e) => pseudo_row.remove()
					},
				},{
					'class': 'fu_add_header',
					'children': [
						{
							'class': 'fu_icon fu_add_row',
						},{
							'class': 'fu_add_label',
							'children': [{
								'html': 'Add new row',
							}],
						},{
							'tag': 'button', 'type': 'button',
							'class': 'fu_icon fu_delete',
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
					'class': 'fu_add_options',
					'children': (()=>{
						let actual = null;
						const optgroup = [];
						picker.forEach(option => {
							if( option.fu_type ) {
								if( ! actual ) {
									optgroup.push({'class': 'fu_label'});
									optgroup.push( actual = {
										'class': 'fu_group',
										'children': []
									} );
								}
								actual.children.push({
									'tag': 'button', 'type': 'button',
									'class': ( ! this.type_to_ID[option.fu_type] ) ? 'template_not_defined' : '',
									'html': option.fu_label ?? '???',
									'data-fu_type': option.fu_type,
									'events': {
										'click': (e) => {
											const created_row = this.create_row({ 'fu_type': option.fu_type });
											if( null === created_row ) {
												return;
											}
											created_row.classList.add('fu_open_row');
											pseudo_row.replaceWith(created_row);
											document.removeEventListener('keydown', this.esc_listener);
										},
									},
								});
							} else {
								optgroup.push({
									'class': 'fu_label',
									'html': option.fu_label ?? '???',
								});
								optgroup.push( actual = {
									'class': 'fu_group',
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

customElements.define('fu-repeater_multiple', fu.fields.repeater_multiple);