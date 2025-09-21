fu.fields.row_table = class fu_fields_row_table extends fu.fields.row {

	get value(){
		let value = {};
		this.querySelectorAll('.fu_row_fields input[fu_name]').forEach( (field) => {
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
		this.querySelectorAll('.fu_row_fields input[fu_name]').forEach( (field) => {
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
			'class': 'fu_row fu_switch',
			'children':[
				{
					'class': 'fu_header fu_row_header',
					'children':[
						this.button_add_to_top(),
						this.button_add_to_bottom(),
						this.icon_move(),
						this.checkbox(),
						this.index(),
						{
							'class': 'fu_row_fields',
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
							'class': 'fu_actions',
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
