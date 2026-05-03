fu.fields.p = class fu_fields_p extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'fu_colspan': template.fu_colspan ?? '',
			'children':[{
				'tag': 'p',
				'html': template.fu_label ?? ''
			}]
		});
	}
};

customElements.define('fu-p', fu.fields.p);