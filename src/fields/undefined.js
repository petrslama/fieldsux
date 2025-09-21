fc.fields.undefined = class fc_fields_undefined extends fc.fields.abstract {

	/**
	 * @param {Object} template
	 */
	set template(template){
		fc.DOM.attrs(this, {
			'fc_name': template.fc_name,
			'children':[
				{
					'class': 'fc_label',
					'html': 'Field is not defined!'
				},{
					'error_code': JSON.stringify(template, null, 2)
				}
			]
		});
	}
};

customElements.define('fc-undefined', fc.fields.undefined);
