fu.fields.img = class fu_fields_img extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'children':[{
				'tag': 'img',
				'src': template.src ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-img', fu.fields.img);