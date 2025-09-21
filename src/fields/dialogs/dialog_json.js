fc.fields.dialog_json = class fc_fields_dialog_json extends fc.fields.dialog {

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
						},{
							'tag': 'button',
							'type': 'button',
							'class': 'fc_button fc_button_primary fc_use_json',
							'html': 'Use',
							'events': {
								'click': () => {
									const caller = document.querySelector('.fc_dialog_caller');
									const JSON_object = fc.JSON.parse( this.value );
									if( JSON_object ){
										caller.value = JSON_object;
										this.close();

										const value_after = JSON.stringify( caller.value );
										const value_before = JSON.stringify( JSON_object );

										if( value_before != value_after ) {
											caller.classList.add('fc_dialog_caller');
											const dialog_diff = this.parentNode.querySelector('fc-dialog_diff')
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

customElements.define('fc-dialog_json', fc.fields.dialog_json);