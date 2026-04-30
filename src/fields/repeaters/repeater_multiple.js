
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

		this.picker_options = templates.map(template => ({
			'fu_type': template.fu_type,
			'fu_label': template.fu_label
		}));

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

		const picker = this.picker_options;

		this.esc_handler = (event) => {
			if (event.key !== 'Escape') return;
			pseudo_row.remove();
			document.activeElement.blur();
		};

		const pseudo_row = fu.DOM.create({
			'class': 'row_add_row',
			'children': [
				{
					'class': 'fu_backdrop',
					'events': {
						'click': (e) => pseudo_row.remove()
					},
				},
				{
					'class': 'fu_picker',
					'children': [
						{
							'tag': 'input',
							'type': 'text',
							'id': fu.DOM.getIndex(),
							'placeholder': 'Search…',
							'autocomplete': 'off',
							'spellcheck': 'false',
							'events': {
								'input': ({ target: { value } }) => {
									const q = value.trim().toLowerCase();
									pseudo_row.querySelectorAll('button').forEach(item => {
										item.hidden = q && !item.textContent.toLowerCase().includes(q);
									});
									pseudo_row.querySelectorAll('section').forEach(section => {
										section.hidden = ![ ...section.querySelectorAll('button') ].some(b => !b.hidden);
									});
								},
								'keydown': (e) => {
									const items = [...pseudo_row.querySelectorAll('button')].filter(i => !i.hidden);
									if( !items.length ) return;
									const current = pseudo_row.querySelector('button[data-selected="true"]');
									const idx = items.indexOf(current);
									let next;
									if( e.key === 'ArrowDown' || e.key === 'Tab' ) {
										next = items[(idx + 1) % items.length];
									} else if( e.key === 'ArrowUp' ) {
										next = items[idx <= 0 ? items.length - 1 : idx - 1];
									} else if( e.key === 'Home' ) {
										next = items[0];
									} else if( e.key === 'End' ) {
										next = items[items.length - 1];
									} else if( e.key === 'Enter' ) {
										e.preventDefault();
										current?.click();
										return;
									}
									if( next ) {
										e.preventDefault();
										current?.removeAttribute('data-selected');
										next.setAttribute('data-selected', 'true');
										next.scrollIntoView({ block: 'nearest' });
									}
								},
							},
						},{
							'class': 'fu_results',
							'data-label-empty': 'No results found.',
							'children': Object.values( picker.reduce( (acc, option) => {
								const label = option.fu_label ?? JSON.stringify(option);
								const parts = label.split('>>>');
								const name = parts.length > 1 ? parts[0].trim() : '';
								const text = parts.length > 1 ? parts[1].trim() : label;
								if( ! acc[name] ) acc[name] = {
									'tag': 'section',
									'children': name ? [{ 'tag': 'header', 'html': name }] : [],
								};
								acc[name].children.push({
									'tag': 'button', 'type': 'button',
									'class': ( ! this.type_to_ID[option.fu_type] ) ? 'template_not_defined' : undefined,
									'html': text,
									'data-fu_type': option.fu_type,
									'events': {
										'click': (e) => {
											const created_row = this.create_row({ 'fu_type': option.fu_type });
											if( null === created_row ) return;
											created_row.classList.add('fu_open_row');
											pseudo_row.replaceWith(created_row);
											document.removeEventListener('keydown', this.esc_handler);
										},
									},
								});
								return acc;
							}, {} ) ),
					}],
				},
			],
		});

		switch(position){
			case 'before':  caller.before( pseudo_row ); break;
			case 'after':   caller.after( pseudo_row );  break;
			case 'append':  this.rows.append( pseudo_row );
		}

		pseudo_row.querySelector('input').focus();

		if( pseudo_row.querySelector('.fu_picker').getBoundingClientRect().bottom > window.innerHeight ) {
			pseudo_row.classList.add('fu_flip');
		}
	}
};

customElements.define('fu-repeater_multiple', fu.fields.repeater_multiple);