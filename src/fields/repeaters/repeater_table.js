
fu.fields.repeater_table = class fu_fields_repeater_table extends fu.fields.repeater_single {

	get value(){
		const value = Array.from(this.rows.childNodes)
			.filter(row => row.tagName.toLowerCase() === 'fu-row_table')
			.map(row => row.value);

		return value.length ? value : null;
	}

	set value(value){
		super.value = value;
	}

	create_row(value){
		const row = fu.DOM.create({
			'tag': 'fu-row_table',
			'template': this.single_template,
		});

		row.value = value;

		return row;
	}

	init_repeater( template ){
		this.single_template = template.templates[0];
		this.single_template_id = fu.Templates.register_template(template.templates[0]);

		this.template_labels = this.single_template.fields?.map(field => {
			return {
				'fu_label': field.fu_label??'',
				'width': field.width??'',
			};
		});

		return this.template_group_id = fu.Templates.register_group({
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

customElements.define('fu-repeater_table', fu.fields.repeater_table);
