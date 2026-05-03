fu.fields.h3 = class fu_fields_h3 extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'fu_colspan': template.fu_colspan ?? '',
			'children':[{
				'class': 'fu_h3',
				'html': template.fu_label ?? ''
			}]
		});
	}
};

customElements.define('fu-h3', fu.fields.h3);