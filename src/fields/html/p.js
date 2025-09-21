fc.fields.p = class fc_fields_p extends fc.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fc.DOM.attrs(this, {
			'class': 'fc_html',
			'children':[{
				'tag': 'p',
				'html': template.html ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fc-p', fc.fields.p);