
fu.fields.group = class fu_fields_group extends fu.fields.abstract {

	set children( element ){
		if( this.children ) {
			this.replaceChild( element, this.children );
		} else {
			this.appendChild( element );
		}
	}

	get children(){
		return this.querySelector('fu-children');
	}

	get value(){
		const children = this.children;
		if( children ) {
			return this.children.value;
		}
		return null;
	}

	set value(value){
		const children = this.children;
		if( children ) {
			this.children.value = value;
		}
	}

	append_value(value){
		this.value = value;
	}

		/**
	 * @param {Object} template
	 */
	set template(template){

		const index = fu.DOM.getIndex();

		fu.DOM.attrs(this, {
			'class': 'fu_field',
			'fu_name': template.fu_name,
			'id': index,
			'children': [{
				'class': 'fu_container',
				'children': [
					! template.fu_label ? null : {
						'class': 'fu_label',
						'html': template.fu_label
					},
					{
						'tag': 'fu-children',
						'template': template.fields
					}
				],
			}]
		});

		this.set_width( this, template );
	}
};


customElements.define('fu-group', fu.fields.group);