fc.fields.h1 = class fc_fields_h1 extends fc.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fc.DOM.attrs(this, {
			'class': 'fc_html',
			'children':[{
				'tag': 'h1',
				'html': template.html ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fc-h1', fc.fields.h1);