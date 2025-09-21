fu.fields.dialog_copy = class fu_fields_dialog_copy extends fu.fields.dialog {

	get value(){
		return this.querySelector('textarea').value;
	}

	set value(value){
		this.querySelector('textarea').value = value;
	}

	close(){
		super.close();
		const caller = document.querySelector('.fu_dialog_caller');
		if( null === caller ) {
			return;
		}
		caller.classList.remove('fu_dialog_caller');
	}

	select_text(){
		const t = this.querySelector('textarea');
		t.focus();
		t.select()
	}

	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_dialog',
			'children': [
				{
					'class': 'fu_backdrop',
					'events': {
						'click': (e) => this.close()
					}
				},{
					'class': 'fu_header',
					'children': [
						{
							'tag': 'span',
							'html': template.title ?? ''
						},{
							'tag': 'i',
							'events': {
								'click': (e) => this.close()
							}
						}
					]
				},{
					'class': 'fu_notice',
					'events': {
						'click': () => {
							this.notice = '';
						}
					}
				},{
					'class': 'fu_section',
					'children': [{
						'tag': 'textarea',
						'id': fu.DOM.getIndex()
					}]
				},{
					'class': 'fu_footer',
					'children': [
						{
							'tag': 'button',
							'type': 'button',
							'class': 'fu_button fu_compress_json',
							'html': 'Compress',
							'events': {
								'click': () => {
									let JSON_object = fu.JSON.parse(this.value);
									if( JSON_object ) {
										this.value = JSON.stringify(JSON_object);
									} else {
										this.notice = '<b>Unable to compress</b><p>Your JSON is not valid.<br>Please recheck your JSON.</p>';
									}
								}
							}
						},{
							'tag': 'button',
							'type': 'button',
							'class': 'fu_button fu_beautify_json',
							'html': 'Beautify',
							'events': {
								'click': () => {
									let JSON_object = fu.JSON.parse(this.value);
									if( JSON_object ) {
										this.value = fu.JSON.stringify(JSON_object);
									} else {
										this.notice = '<b>Unable to beautify</b><p>Your JSON is not valid.<br>Please recheck your JSON.</p>';
									}
								}
							}
						}
					]
				}
			]
		});
	}
};

customElements.define('fu-dialog_copy', fu.fields.dialog_copy);