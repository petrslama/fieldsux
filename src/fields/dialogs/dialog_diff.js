fu.fields.dialog_diff = class fu_fields_dialog_diff extends fu.fields.dialog {

	diff_stringyfy(_val, _spaces){
		return JSON.stringify( _val, null, 4 )
			.replaceAll("\n", "\n\t" + _spaces)
			.replaceAll("    ", "\t")
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
	}

	diff( _old, _new, _spaces = "" ){
		const type_of_new = _new === null ? 'null' : typeof _new;
		const type_of_old = _old === null ? 'null' : typeof _old;

		if( type_of_old != type_of_new ){
			return '<s>' + this.diff_stringyfy(_old, _spaces) + '</s><b>' + this.diff_stringyfy(_new, _spaces) + '</b>';
		}

		if (['string', 'number', 'boolean', 'null'].includes(type_of_new)) {
			if( _old == _new ) {
				return this.diff_stringyfy(_new);
			}
			return '<s>' + this.diff_stringyfy(_old, _spaces) + '</s><b>' + this.diff_stringyfy(_new, _spaces) + '</b>';
		}

		if( Array.isArray(_new) ) {
			const ret = [];
			const minLength = Math.min(_old.length, _new.length);

			for (let i = 0; i < minLength; i++) {
				ret.push(this.diff(_old[i], _new[i], _spaces + "\t"));
			}

			if (_new.length > minLength) {
				for (let i = minLength; i < _new.length; i++) {
					ret.push('<b>' + this.diff_stringyfy(_new[i], _spaces) + '</b>');
				}
			}

			if (_old.length > minLength) {
				for (let i = minLength; i < _old.length; i++) {
					ret.push('<s>' + this.diff_stringyfy(_old[i], _spaces) + '</s>');
				}
			}

			return `[\n\t${_spaces}${ret.join(`,\n\t${_spaces}`)}\n${_spaces}]`;
		}

		if( 'object' == type_of_new ) {
			const ret = [];
			for (let key of Object.keys(_old)) {
				if (!_new.hasOwnProperty(key)) {
					ret.push(
						'<s>'
						+ JSON.stringify(key) + ': '
						+ this.diff_stringyfy(_old[key], _spaces)
						+ '</s>'
					);
				}
			}
			for (const key in _new) {
				if (key in _old) {
					ret.push(
						JSON.stringify(key) + ': '
						+ this.diff(_old[key], _new[key], _spaces + "\t" )
					);
				} else {
					ret.push(
						'<b>'
						+ JSON.stringify(key) + ': '
						+ this.diff_stringyfy(_new[key], _spaces)
						+ '</b>'
					);
				}
			}

			return `{\n\t${_spaces}${ret.join(`,\n\t${_spaces}`)}\n${_spaces}}`;
		}
	}

	compare( _old_text, _new_text ){

		this._old_text = _old_text;
		this._new_text = _new_text;

		const _old = fu.JSON.parse(_old_text);
		const _new = fu.JSON.parse(_new_text);

		if( ! _new ) {
			this.notice = '<b>Unable to Use</b><p>Your JSON is not valid.<br>Please recheck your JSON.</p>';
			return;
		}

		const pre = this.querySelector('pre');
		pre.innerHTML = this.diff( _old, _new );

		const first_diff = pre.querySelector( 's,b' );
		if( first_diff ) {
			this.open();
			this.notice = this.notice = '<b>Warning</b><p>What you insert is different from what is applied!</p>';
			try {
				first_diff.scrollIntoView({ behavior: 'smooth' });
			} catch (err) {}
		}
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
					'children': [
						{
							'tag': 'pre'
						}
					]
				},{
					'class': 'fu_footer',
					'children': [
						{
							'class': 'fu_button fu_beautify_json',
							'html': 'Cancel',
							'events': {
								'click': () => {
									const caller = document.querySelector('.fu_dialog_caller');
									const JSON_object = fu.JSON.parse( this._old_text );
									if( JSON_object ){
										caller.value = JSON_object;
										caller.classList.remove('fu_dialog_caller');
										this.close();
									} else {
										this.notice = '<b>Unable to Use</b><p>Your JSON is not valid.<br>Please recheck your JSON.</p>';
									}
								}
							}
						},{
							'class': 'fu_button fu_button_primary fu_use_json',
							'html': 'Use Anyway',
							'events': {
								'click': () => {
									const caller = document.querySelector('.fu_dialog_caller');
									const JSON_object = fu.JSON.parse( this._new_text );
									if( JSON_object ){
										caller.value = JSON_object;
										caller.classList.remove('fu_dialog_caller');
										this.close();
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

customElements.define('fu-dialog_diff', fu.fields.dialog_diff);