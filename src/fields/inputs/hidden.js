fc.fields.hidden = class fc_fields_hidden extends fc.fields.input {

	get_input(){
		return this.querySelector('input');
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		const index = fc.DOM.getIndex();

		fc.DOM.attrs(this, {
			'fc_name': template.fc_name,
			'class': 'fc_field fc_field_input fc_field_hidden',
			'children':[
				{
					'tag': 'label',
					'class': 'fc_label',
					'for': index,
					'html': '<s>Hidden</s>',
				},{
					'class': 'fc_input_wrapper',
					'children': [{
						'tag': 'input',
						'id': index,
						'type': 'text',
						'class': 'fc_input',
					}]
				}
			]
		});
	}

};

customElements.define('fc-hidden', fc.fields.hidden);
