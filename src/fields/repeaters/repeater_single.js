
fu.fields.repeater_single = class fu_fields_repeater_single extends fu.fields.repeater {

	create_row(value){
		const row = fu.DOM.create({
			'tag': 'fu-row',
			'template': this.single_template,
		});

		row.value = value;

		return row;
	}

	init_repeater( template ){
		const templates = template.templates;
		this.single_template = templates[0];
		this.single_template_id = fu.Templates.register_template(templates[0]);

		return this.template_group_id = fu.Templates.register_group({
			'': this.single_template_id
		});
	}

	add_row(caller, position){
		document.activeElement.blur();

		const created_row = this.create_row();
		created_row.classList.add('fu_open_row');

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

customElements.define('fu-repeater_single', fu.fields.repeater_single);
