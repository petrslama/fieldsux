fu.fields.hidden = class fu_fields_hidden extends fu.fields.input {

	get_input(){
		return this.querySelector('input');
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		const index = fu.DOM.getIndex();

		fu.DOM.attrs(this, {
			'fu_name': template.fu_name,
			'class': 'fu_field fu_field_input fu_field_hidden',
			'children':[
				{
					'tag': 'label',
					'class': 'fu_label',
					'for': index,
					'html': '<s>Hidden</s>',
				},{
					'class': 'fu_input_wrapper',
					'children': [{
						'tag': 'input',
						'id': index,
						'type': 'text',
						'class': 'fu_input',
					}]
				}
			]
		});
	}

};

customElements.define('fu-hidden', fu.fields.hidden);
