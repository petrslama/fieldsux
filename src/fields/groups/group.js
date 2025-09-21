
fc.fields.group = class fc_fields_group extends fc.fields.abstract {

	set children( element ){
		if( this.children ) {
			this.replaceChild( element, this.children );
		} else {
			this.appendChild( element );
		}
	}

	get children(){
		return this.querySelector('fc-children');
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

		const index = fc.DOM.getIndex();

		fc.DOM.attrs(this, {
			'class': 'fc_field',
			'fc_name': template.fc_name,
			'id': index,
			'children': [{
				'class': 'fc_container',
				'children': [
					! template.fc_label ? null : {
						'class': 'fc_label',
						'html': template.fc_label
					},
					{
						'tag': 'fc-children',
						'template': template.fields
					}
				],
			}]
		});

		this.set_width( this, template );
	}
};


customElements.define('fc-group', fc.fields.group);