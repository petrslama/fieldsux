fu.fields.dialog_json = class fu_fields_dialog_json extends fu.fields.dialog {

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
						},{
							'tag': 'button',
							'type': 'button',
							'class': 'fu_button fu_button_primary fu_use_json',
							'html': 'Use',
							'events': {
								'click': () => {
									const caller = document.querySelector('.fu_dialog_caller');
									const JSON_object = fu.JSON.parse( this.value );
									if( JSON_object ){
										caller.value = JSON_object;
										this.close();

										const value_after = JSON.stringify( caller.value );
										const value_before = JSON.stringify( JSON_object );

										if( value_before != value_after ) {
											caller.classList.add('fu_dialog_caller');
											const dialog_diff = this.parentNode.querySelector('fu-dialog_diff')
											dialog_diff.compare(value_before, value_after);
										}
									} else {
										this.notice = '<b>Unable to Use</b><p>Your JSON is not valid.<br>Please recheck your JSON.</p>';
									}
								}
							}
						},
					]
				}
			]
		});
	}
};

customElements.define('fu-dialog_json', fu.fields.dialog_json);