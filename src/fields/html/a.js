fu.fields.a = class fu_fields_a extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'children':[{
				'tag': 'a',
				'html': template.html ?? '',
				'href': template.href ?? '#',
				'target': template.target ?? '_blank',
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-a', fu.fields.a);