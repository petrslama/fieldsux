fu.fields.a = class fu_fields_a extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'fu_colspan': template.fu_colspan ?? '',
			'children':[{
				'tag': 'a',
				'html': template.fu_label ?? '',
				'href': template.href ?? '#',
				'target': template.target ?? '_blank',
			}]
		});
	}
};

customElements.define('fu-a', fu.fields.a);