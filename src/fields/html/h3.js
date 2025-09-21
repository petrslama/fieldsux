fc.fields.h3 = class fc_fields_h3 extends fc.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fc.DOM.attrs(this, {
			'class': 'fc_html',
			'children':[{
				'tag': 'h3',
				'html': template.html ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fc-h3', fc.fields.h3);