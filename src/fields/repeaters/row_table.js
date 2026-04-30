fu.fields.row_table = class fu_fields_row_table extends fu.fields.row {

	get value(){
		let value = {};
		this.querySelectorAll('.fu_header>.fu_fields input[fu_name]').forEach( (field) => {
			const field_name = field.getAttribute('fu_name');
			if( ! field_name ) return;
			const field_value = field.value ?? '';
			if( ! field_value ) return;
			value[field_name] = field_value;
		});
		return Object.keys(value).length ? value : null;
	}

	set value(value){
		if (!value) return;
		this.querySelectorAll('.fu_header>.fu_fields input[fu_name]').forEach( (field) => {
			const field_name = field.getAttribute('fu_name');
			const field_value = value[field_name] ?? '';
			field.value = field_value;
		});
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		fu.DOM.attrs(this, {
			'class': 'fu_row',
			'children':[
				{
					'class': 'fu_header',
					'children':[
						this.icon_move(),
						this.index(),
						this.checkbox(),
						{
							'class': 'fu_fields',
							'children': template.fields?.map(field => {
								const index = fu.DOM.getIndex();
								return {
									'tag': 'label',
									'class': 'fu_label',
									'for': index,
									'children':[{
										'tag': 'input',
										'type': field.fu_type??'',
										'fu_name': field.fu_name??'',
										'id': index,
									}]
								};
							})
						},{
							'class': 'fu_buttons',
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

customElements.define('fu-row_table', fu.fields.row_table);
