/**
 * Utility class for Repeater templates operations
 */
fu.Templates = class {

	// Templates

	static template_ID_to_template = [""];
	static template_ID_to_hash = [""];

	static register_template( template ){
		if( 'string' == typeof template ){
			if( fu.fields?.[template]?.definition ){
				template = fu.fields[template].definition;
			}
		}

		const hash = fu.JSON.hash(template);
		const ID = this.template_ID_to_hash.indexOf(hash);
		if( -1 != ID ) {
			return ID;
		}

		this.template_ID_to_hash.push(hash);
		this.template_ID_to_template.push(template);

		return this.template_ID_to_hash.length - 1;
	}

	static get_template(ID) {
		return this.template_ID_to_template[ID];
	}

	// Templates Groups

	static group_ID_to_group = [""];
	static group_ID_to_hash = [""];

	static register_group( group ){
		const hash = fu.JSON.hash(group);
		const ID = this.group_ID_to_hash.indexOf(hash);

		if( -1 != ID ) {
			return ID;
		}

		this.group_ID_to_hash.push(hash);
		this.group_ID_to_group.push(group);

		return this.group_ID_to_hash.length - 1;
	}
};