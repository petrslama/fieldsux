fu.fields.h1 = class fu_fields_h1 extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'children':[{
				'tag': 'h1',
				'html': template.fu_label ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-h1', fu.fields.h1);