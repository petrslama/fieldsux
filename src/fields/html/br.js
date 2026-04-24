fu.fields.br = class fu_fields_br extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'style': 'height:' + ( template.height || '32px' )
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-br', fu.fields.br);