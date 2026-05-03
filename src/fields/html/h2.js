fu.fields.h2 = class fu_fields_h2 extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'fu_colspan': template.fu_colspan ?? '',
			'children':[{
				'class': 'fu_h2',
				'html': template.fu_label ?? ''
			}]
		});
	}
};

customElements.define('fu-h2', fu.fields.h2);