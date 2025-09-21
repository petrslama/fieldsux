fu.fields.undefined = class fu_fields_undefined extends fu.fields.abstract {

	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'fu_name': template.fu_name,
			'children':[
				{
					'class': 'fu_label',
					'html': 'Field is not defined!'
				},{
					'error_code': JSON.stringify(template, null, 2)
				}
			]
		});
	}
};

customElements.define('fu-undefined', fu.fields.undefined);
