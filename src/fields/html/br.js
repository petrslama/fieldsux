fu.fields.br = class fu_fields_br extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'fu_colspan': template.fu_colspan ?? '',
			'style': 'height:' + ( template.height || '32px' )
		});
	}
};

customElements.define('fu-br', fu.fields.br);