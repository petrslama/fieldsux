fu.fields.hr = class fu_fields_hr extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'fu_colspan': template.fu_colspan ?? '',
			'children':[{
				'tag': 'hr',
			}]
		});
	}
};

customElements.define('fu-hr', fu.fields.hr);