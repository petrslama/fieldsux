fc.fields.row_table = class fc_fields_row_table extends fc.fields.row {

	get value(){
		let value = {};
		this.querySelectorAll('.fc_row_fields input[fc_name]').forEach( (field) => {
			const field_name = field.getAttribute('fc_name');
			if( ! field_name ) return;
			const field_value = field.value ?? '';
			if( ! field_value ) return;
			value[field_name] = field_value;
		});
		return Object.keys(value).length ? value : null;
	}

	set value(value){
		if (!value) return;
		this.querySelectorAll('.fc_row_fields input[fc_name]').forEach( (field) => {
			const field_name = field.getAttribute('fc_name');
			const field_value = value[field_name] ?? '';
			field.value = field_value;
		});
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		fc.DOM.attrs(this, {
			'class': 'fc_row fc_switch',
			'children':[
				{
					'class': 'fc_header fc_row_header',
					'children':[
						this.button_add_to_top(),
						this.button_add_to_bottom(),
						this.icon_move(),
						this.checkbox(),
						this.index(),
						{
							'class': 'fc_row_fields',
							'children': template.fields?.map(field => {
								const index = fc.DOM.getIndex();
								return {
									'tag': 'label',
									'class': 'fc_label',
									'for': index,
									'children':[{
										'tag': 'input',
										'type': field.fc_type??'',
										'fc_name': field.fc_name??'',
										'id': index,
									}]
								};
							})
						},{
							'class': 'fc_actions',
							'children': [
								this.button_delete(),
								this.button_duplicate(),
								this.button_up(),
								this.button_down(),
							]
						},
					],
				},
			],
		});
	}
};

customElements.define('fc-row_table', fc.fields.row_table);
