
fu.fields.repeater_array = class fu_fields_repeater_array extends fu.fields.repeater_table {

	array_template(){
		return {
			"fields": [{
				"fu_type": "text",
				"fu_name": "fu_row_array_field",
			}]
		}
	}

	create_row(value){
		const row = fu.DOM.create({
			'tag': 'fu-row_array',
			'template': this.single_template,
		});

		row.value = value;

		return row;
	}

	init_repeater( template ){
		const forced_template = this.array_template();
		this.single_template = forced_template;
		this.single_template_id = fu.Templates.register_template(forced_template);

		this.template_labels = [{
			"fu_label": template.heading ?? ""
		}];

		return this.template_group_id = fu.Templates.register_group({
			'': this.single_template_id
		});
	}

};

customElements.define('fu-repeater_array', fu.fields.repeater_array);
