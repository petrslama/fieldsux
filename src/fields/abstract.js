fu.fields.abstract = class fu_fields_abstract extends HTMLElement {

	get fu_name(){
		return this.getAttribute('fu_name') ?? '';
	}

	set fu_name(fu_name){
		if( fu_name )
			this.setAttribute('fu_name', fu_name);
	}

	get value(){
		return null;
	}

	set value(value){
		;
	}

	edit_as_json(){
		this.classList.add('fu_dialog_caller');

		const main = this.closest('fu-main');
		const dialogs = main.querySelector('.fu_dialogs')
		const dialog_json = dialogs.querySelector('fu-dialog_json');
		dialog_json.value = fu.JSON.stringify(this.value);
		dialog_json.notice = '';
		dialog_json.open();

		return dialog_json;
	}

	async paste(){
		try {
			const clipboard_text = await navigator.clipboard.readText();
			const JSON_object = fu.JSON.parse( clipboard_text );

			if( JSON_object ){
				this.value = JSON.parse( clipboard_text );
			} else {
				const JSON_dialog = this.edit_as_json();
				JSON_dialog.notice = '<b>Unable to paste</b><p>Your JSON is not valid.<br>Please recheck your JSON.</p>';
			}
		} catch (error) {
			const JSON_dialog = this.edit_as_json();
			JSON_dialog.notice = '<b>Unable to paste to clipboard</b><p>Please check web browser permissions for your site.<br>To paste manually: press Ctrl+V (Windows) or Cmd+V (Mac), then press <b>Use</b></p>';
			JSON_dialog.select_text();
			console.warn('Clipboard paste failed:', error);
		}
	}


	show_to_copy(){
		this.classList.add('fu_dialog_caller');

		const main = this.closest('fu-main');
		const dialogs = main.querySelector('.fu_dialogs')
		const dialog_copy = dialogs.querySelector('fu-dialog_copy');
		dialog_copy.value = fu.JSON.stringify(this.value);
		dialog_copy.notice = '';
		dialog_copy.open();

		return dialog_copy;
	}


	async copy(){
		try {
			const JSON_string = fu.JSON.stringify( this.value );
			await navigator.clipboard.writeText(JSON_string);
		} catch (error) {
			const JSON_dialog = this.show_to_copy();
			JSON_dialog.notice = '<b>Unable to copy to clipboard</b><p>Please check web browser permissions for your site.<br>To copy manually: press Ctrl+C (Windows) or Cmd+C (Mac), then press Esc</p>';
			JSON_dialog.select_text();
			console.warn('Clipboard copy failed:', error);
		}
	}

	set_width( element, template ) {
		if( ! template?.width ) {
			element.classList.add('fu_gw_default');
			return;
		}

		if( 'fullwidth' == template.width ) {
			element.classList.add('fu_gw_fullwidth');
		}

		let class_added = false;
		let last_size = 2;

		for( let breakpoint = 0; breakpoint <= 5; breakpoint ++) {
			let current_size = parseInt(template[`size_${breakpoint}`]) || last_size;

			const max_columns = (breakpoint + 1) * 2;
			if (current_size > max_columns) {
				current_size = max_columns;
			}

			if( last_size == current_size ) {
				continue;
			}

			element.classList.add(`fu_gw_${breakpoint + 1}_${current_size}`);
			class_added = true;

			last_size = current_size;
		}

		if( class_added ) {
			element.classList.add('fu_gw_custom');
		} else {
			element.classList.add('fu_gw_default');

		}
	}
}
