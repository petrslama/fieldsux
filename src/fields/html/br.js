fu.fields.br = class fu_fields_br extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		const height = template.height ? template.height : '32px';
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'style': 'height:' + height
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-br', fu.fields.br);