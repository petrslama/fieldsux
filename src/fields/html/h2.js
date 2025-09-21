fc.fields.h2 = class fc_fields_h2 extends fc.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fc.DOM.attrs(this, {
			'class': 'fc_html',
			'children':[{
				'tag': 'h2',
				'html': template.html ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fc-h2', fc.fields.h2);