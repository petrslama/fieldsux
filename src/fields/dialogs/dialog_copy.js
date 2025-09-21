fc.fields.dialog_copy = class fc_fields_dialog_copy extends fc.fields.dialog {

	get value(){
		return this.querySelector('textarea').value;
	}

	set value(value){
		this.querySelector('textarea').value = value;
	}

	close(){
		super.close();
		const caller = document.querySelector('.fc_dialog_caller');
		if( null === caller ) {
			return;
		}
		caller.classList.remove('fc_dialog_caller');
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
		fc.DOM.attrs(this, {
			'class': 'fc_dialog',
			'children': [
				{
					'class': 'fc_backdrop',
					'events': {
						'click': (e) => this.close()
					}
				},{
					'class': 'fc_header',
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
					'class': 'fc_notice',
					'events': {
						'click': () => {
							this.notice = '';
						}
					}
				},{
					'class': 'fc_section',
					'children': [{
						'tag': 'textarea',
						'id': fc.DOM.getIndex()
					}]
				},{
					'class': 'fc_footer',
					'children': [
						{
							'tag': 'button',
							'type': 'button',
							'class': 'fc_button fc_compress_json',
							'html': 'Compress',
							'events': {
								'click': () => {
									let JSON_object = fc.JSON.parse(this.value);
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
							'class': 'fc_button fc_beautify_json',
							'html': 'Beautify',
							'events': {
								'click': () => {
									let JSON_object = fc.JSON.parse(this.value);
									if( JSON_object ) {
										this.value = fc.JSON.stringify(JSON_object);
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

customElements.define('fc-dialog_copy', fc.fields.dialog_copy);