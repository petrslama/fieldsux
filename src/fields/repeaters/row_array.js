fu.fields.row_array = class fu_fields_row_array extends fu.fields.row_table {

	get value(){
		const input = this.querySelector('[fu_name="fu_row_array_field"]');
		return input.value ?? '';
	}

	set value(value){
		const input = this.querySelector('[fu_name="fu_row_array_field"]');
		input.value = value ?? '';
	}
};

customElements.define('fu-row_array', fu.fields.row_array);
