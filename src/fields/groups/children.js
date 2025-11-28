fu.fields.children = class fu_fields_children extends fu.fields.abstract {

	get value(){
		const value = [...this.childNodes].reduce((acc, field) => {
			const fu_name = field.fu_name;
			const value = field.value;

			if (!fu_name) {
				return field.classList.contains('fu_field')
					? { ...acc, ...value }
					: acc;
			}

			if (!value) return acc;

			const merged = acc[fu_name] && typeof acc[fu_name] === 'object' && typeof value === 'object'
				? { ...acc[fu_name], ...value }
				: value;

			return { ...acc, [fu_name]: merged };
		}, {});


		const keys = Object.keys(value);
		return keys.length === 0 ? null :
			keys.length === 1 && value['0'] ? [value['0']] : value;
	}

	set value(value){
		[...this.childNodes].forEach(field => {
			const fu_name = field.fu_name;

			if( value )
				if ( fu_name )
					field.value = value[fu_name] ?? '';
				else if ( field.classList.contains('fu_field') && ! field.classList.contains('fu_field_input') )
					field.value = value;
			else
				field.value = '';
		});
	}

	append_fields( children ){

		children?.forEach( (template) => {
			switch(template.fu_type) {
				case 'from_definition':
					const definition = fu.Definitions[template.definition];
					this.append_fields(definition);
					return;
				case 'function':
					if( ( ! template.fu_name ) || ( 'function' !== typeof window[template.fu_name]) ) {
						console?.error('Function "' + template.fu_name + '()" defined by attribute fu_name does not exist or is not a function.');
						return;
					}
					const function_elements = window[template.fu_name]();
					this.append_fields(function_elements);
					return;
				default:
					const child
						= fu.fields[template.fu_type]
						? fu.DOM.create({ 'tag': 'fu-' + template.fu_type } )
						: fu.DOM.create({ 'tag': 'fu-undefined' } )

					child.template = template;
					this.appendChild( child );
			}
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

customElements.define('fu-children', fu.fields.children);
