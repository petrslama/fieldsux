fu.fields.hr = class fu_fields_hr extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'children':[{
				'tag': 'hr',
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-hr', fu.fields.hr);