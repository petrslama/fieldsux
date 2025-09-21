fc.fields.children = class fc_fields_children extends fc.fields.abstract {

	get value(){
		const value = [...this.childNodes].reduce((acc, field) => {
			const fc_name = field.fc_name;
			const value = field.value;

			if (!fc_name) {
				return field.classList.contains('fc_field')
					? { ...acc, ...value }
					: acc;
			}

			if (!value) return acc;

			const merged = acc[fc_name] && typeof acc[fc_name] === 'object' && typeof value === 'object'
				? { ...acc[fc_name], ...value }
				: value;

			return { ...acc, [fc_name]: merged };
		}, {});


		const keys = Object.keys(value);
		return keys.length === 0 ? null :
			keys.length === 1 && value['0'] ? [value['0']] : value;
	}

	set value(value){
		[...this.childNodes].forEach(field => {
			const fc_name = field.fc_name;

			if( value )
				if ( fc_name )
					field.value = value[fc_name] ?? '';
				else if ( field.classList.contains('fc_field') && ! field.classList.contains('fc_field_input') )
					field.value = value;
			else
				field.value = '';
		});
	}

	append_fields( children ){

		children?.forEach( (template) => {
			if( 'from_definition' == template.fc_type) {
				const definition = fc.Definitions[template.definition];
				this.append_fields(definition);
				return;
			}

			const child
				= fc.fields[template.fc_type]
				? fc.DOM.create({ 'tag': 'fc-' + template.fc_type } )
				: fc.DOM.create({ 'tag': 'fc-undefined' } )

			child.template = template;
			this.appendChild( child );
		});

	}

	/**
	 * @param {Object} children
	 */
	set template(children){

		if( ! children ){
			return;
		}

		this.append_fields(children);
	}
};

customElements.define('fc-children', fc.fields.children);
