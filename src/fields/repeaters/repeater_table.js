
fc.fields.repeater_table = class fc_fields_repeater_table extends fc.fields.repeater_single {

	get value(){
		const value = Array.from(this.rows.childNodes)
			.filter(row => row.tagName.toLowerCase() === 'fc-row_table')
			.map(row => row.value);

		return value.length ? value : null;
	}

	set value(value){
		super.value = value;
	}

	create_row(value){
		const row = fc.DOM.create({
			'tag': 'fc-row_table',
			'template': this.single_template,
		});

		row.value = value;

		return row;
	}

	init_repeater( template ){
		this.single_template = template.templates[0];
		this.single_template_id = fc.Templates.register_template(template.templates[0]);

		this.template_labels = this.single_template.fields?.map(field => {
			return {
				'fc_label': field.fc_label??'',
				'width': field.width??'',
			};
		});

		return this.template_group_id = fc.Templates.register_group({
			'': this.single_template_id
		});
	}

	add_row(caller, position){
		document.activeElement.blur();
		const created_row = this.create_row();

		switch(position){
			case 'before':
				caller.before( created_row );
				return;
			case 'after':
				caller.after( created_row );
				return;
			case 'append':
				this.rows.append( created_row );
		}
	}

};

customElements.define('fc-repeater_table', fc.fields.repeater_table);
