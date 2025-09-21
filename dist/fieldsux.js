(function() {
'use strict';


// /fc.js

const fc = {

	version: '0.0.1',

	field_templates: {},

	fields: {},

	instances: [],

	init: function(){
		document.querySelectorAll('.fieldsux').forEach((fieldsUX) => {

			let fc_main = fieldsUX.querySelector('fc-main');
			if( fc_main ) {
				return;
			}

			const templateNode = fieldsUX.querySelector('.template');
			if( ! templateNode ) {
				return;
			}

			const textarea = fieldsUX.querySelector('.data');
			if( ! textarea ) {
				return;
			}

			fc_main = document.createElement('fc-main');

			fc_main.template = fc.JSON.parse( templateNode.value.replace(
				/"fc\.field_templates\.([a-z_]+)"/g,
				(match, fieldName) => {
					return fc.field_templates?.[fieldName]??false
						? fc.JSON.stringify( fc.field_templates[fieldName] )
						: match;
				})
			);
			fc_main.value = fc.JSON.parse( textarea.value.replace(
				/"fc\.field_templates\.([a-z_]+)"/g,
				(match, fieldName) => {
					return fc.field_templates?.[fieldName]??false
						? fc.JSON.stringify( fc.field_templates[fieldName] )
						: match;
				})
			);

			fieldsUX.appendChild( fc_main );

			this.instances.push(fc_main);
		});
	},
};

window.fc = fc;



// /utils/JSON.js

/**
 * Utility class for JSON operations
 */
fc.JSON = class {
	static stringify(obj, formatted = true) {
		if (typeof obj !== 'object') return obj;
		return formatted
			? JSON.stringify(obj, null, 4).replaceAll( /},\n\s*{/gm, '},{' ).replaceAll('    ', "\t")
			: JSON.stringify(obj)
	}

	static parse(text) {
		try {
			return JSON.parse(text);
		} catch (err) {
			console.warn('Invalid JSON:', err);
			const repaired = this.repair(text);
			try {
				return JSON.parse(repaired);
			} catch (repairErr) {
				console.warn('Repair failed:', repairErr);
				return null; // or throw error
			}
		}
	}

	static hash(obj) {
		const text = JSON.stringify(obj);
		let hash = 0;
		for (let i = 0; i < text.length; i++) {
			const chr = text.charCodeAt(i);
			hash = (hash << 5) - hash + chr;
			hash |= 0;
		}
		return hash.toString(36);
	}

	static repair(text) {
		if (!text) return '';

		let repaired = text + "\n";

		repaired = this._normalize_whitespace(repaired);
		repaired = this._add_missing_commas(repaired);
		repaired = this._remove_invalid_commas(repaired);
		repaired = this._cleanup(repaired);

		return repaired;
	}

	static _normalize_whitespace(text) {
		return text
			.replaceAll("\r", "\n")
			.replace(/\s*\n\s*/gm, "\n")
			.replace(/\n,[,\s]*/gm, ",\n")
			.replace(/\n\s*}[,\s]*{\n/gm, "\n},\n{")
			.replace(/\n\s*\][,\s]*\[\n/gm, "\n],\n[")
			.replace(/,[,\s]*\n/gm, ",\n");
	}

	static _add_missing_commas(text) {
		return text
			.replaceAll("}\n{", "},\n{")
			.replaceAll("}\n\"", "},\n\"")
			.replaceAll("]\n[", "],\n[")
			.replaceAll("]\n\"", "],\n\"")
			.replaceAll("\"\n\"", "\",\n\"")
			.replaceAll("\"\n{", "\",\n{");
	}

	static _remove_invalid_commas(text) {
		return text
			.replaceAll("},\n}", "}\n}")
			.replaceAll("},\n]", "}\n]")
			.replaceAll("],\n}", "]\n}")
			.replaceAll("],\n]", "]\n]")
			.replaceAll("\",\n}", "\"\n}")
			.replaceAll("\",\n]", "\"\n]")
			.replaceAll("{,\n", "{\n")
			.replaceAll("[,\n", "[\n");
	}

	static _cleanup(text) {
		text = text.trim();
		if (text.endsWith(',')) {
			text = text.substring(0, text.length - 1);
		}
		return text;
	}
}

// /utils/DOM.js

/**
 * Utility class for DOM and HTMLElements operations
 */
fc.DOM = class {

	static index = 0;

	static getIndex() {
		fc.DOM.index ++;
		return 'fc_' + fc.DOM.index;
	}

	static escape_html( html ) {

	}

	static attrs(element, attrs) {

		for(let key in attrs) {
			const value = attrs[key];

			if( 0 === value){
				element.setAttribute(key, value);
				continue;
			}

			if( ! value)
				continue;

			if('tag' == key)
				continue;

			if('html' == key) {
				let new_value = value.replaceAll('<', '< ');

				new_value = new_value
					.replace(/<!--[\s\S]*?-->/g, '') // Remove comments
					.replace(/<\s\/?[^>]*>/g, (tag) => { // Clean all remaining tags
						const match = tag.match(/<\s\/?(\w+)/);
						const tag_name = match ? match[1].toLowerCase() : '';
						const allowed = ['p', 'u',  'div', 'span', 'b', 'i', 'strong', 'em', 'br', 'ul', 'ol', 'li'];
						if( ! allowed.includes(tag_name) ) {
							return '';
						}
						if( tag.startsWith('< /') ){
							return '</' + tag_name + '>';
						} else {
							return '<' + tag_name + '>';
						}
					});

				if( new_value === value ){
					new_value.match(/\[[a-zA-Z_\-][a-zA-Z0-9_\-]*\]/g)?.forEach(match => {
						const m = match.slice(1, -1);
						new_value = new_value.replaceAll(match, `<span data-from="${m}">${match}</span>`);
					});

					element.innerHTML = new_value
				} else {
					element.innerHTML = 'XSS Error';
					console.error( 'HTML contains tags, that are not supported:', value );
				}
				continue;
			}

			if('error_code' == key) {
				const pre = document.createElement('pre');
				pre.innerHTML = value
					.replaceAll("&", "&amp;")
					.replaceAll("<", "&lt;")
					.replaceAll(">", "&gt;")
					.replaceAll('"', "&quot;")
					.replaceAll("'", "&#039;");
				element.appendChild(pre);
			}

			if('style' == key) {
				if(Array.isArray(value)) {
					if(0 < value.length) {
						element.setAttribute('style', value.join(";"));
					}
				} else if(value) {
					element.setAttribute('style', value);
				}
				continue;
			}

			if('children' == key) {
				value.forEach((child) => {
					if(Array.isArray(child)) {
						fc.DOM.attrs(element, {'children': child});
					} else if(child instanceof HTMLElement) {
						element.appendChild(child);
					} else if( child ) {
						// typeof null == 'object'
						if( typeof child == 'object' ) {
							element.appendChild( this.create(child) );
						}
					}
				});
				continue;
			}

			if('events' == key) {
				for(let events in value) {
					const listener = value[events];
					if(typeof listener == 'function') {
						events.split(' ').forEach( event => {
							element.addEventListener(event, listener);
						});
					}
				}
				continue;
			}

			if('template' == key) {
				element.template = value;
				continue;
			}

			element.setAttribute(key, value);
		}
	}

	static create(attrs) {
		const element = document.createElement(attrs.tag ?? 'div');
		fc.DOM.attrs(element, attrs);
		return element;
	}
}

// /utils/Templates.js

/**
 * Utility class for Repeater templates operations
 */
fc.Templates = class {

	// Templates

	static template_ID_to_template = [""];
	static template_ID_to_hash = [""];

	static register_template( template ){
		if( 'string' == typeof template ){
			if( fc.fields?.[template]?.definition ){
				template = fc.fields[template].definition;
			}
		}

		const hash = fc.JSON.hash(template);
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
		const hash = fc.JSON.hash(group);
		const ID = this.group_ID_to_hash.indexOf(hash);

		if( -1 != ID ) {
			return ID;
		}

		this.group_ID_to_hash.push(hash);
		this.group_ID_to_group.push(group);

		return this.group_ID_to_hash.length - 1;
	}
};

// /utils/Definitions.js

fc.Definitions = {};

// /fields/abstract.js

fc.fields.abstract = class fc_fields_abstract extends HTMLElement {

	get fc_name(){
		return this.getAttribute('fc_name') ?? '';
	}

	set fc_name(fc_name){
		if( fc_name )
			this.setAttribute('fc_name', fc_name);
	}

	get value(){
		return null;
	}

	set value(value){
		;
	}

	edit_as_json(){
		this.classList.add('fc_dialog_caller');

		const main = this.closest('fc-main');
		const dialogs = main.querySelector('.fc_dialogs')
		const dialog_json = dialogs.querySelector('fc-dialog_json');
		dialog_json.value = fc.JSON.stringify(this.value);
		dialog_json.notice = '';
		dialog_json.open();

		return dialog_json;
	}

	async paste(){
		try {
			const clipboard_text = await navigator.clipboard.readText();
			const JSON_object = fc.JSON.parse( clipboard_text );

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
		this.classList.add('fc_dialog_caller');

		const main = this.closest('fc-main');
		const dialogs = main.querySelector('.fc_dialogs')
		const dialog_copy = dialogs.querySelector('fc-dialog_copy');
		dialog_copy.value = fc.JSON.stringify(this.value);
		dialog_copy.notice = '';
		dialog_copy.open();

		return dialog_copy;
	}


	async copy(){
		try {
			const JSON_string = fc.JSON.stringify( this.value );
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
			element.classList.add('fc_gw_default');
			return;
		}

		if( 'fullwidth' == template.width ) {
			element.classList.add('fc_gw_fullwidth');
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

			element.classList.add(`fc_gw_${breakpoint + 1}_${current_size}`);
			class_added = true;

			last_size = current_size;
		}

		if( class_added ) {
			element.classList.add('fc_gw_custom');
		} else {
			element.classList.add('fc_gw_default');

		}
	}
}


// /fields/undefined.js

fc.fields.undefined = class fc_fields_undefined extends fc.fields.abstract {

	/**
	 * @param {Object} template
	 */
	set template(template){
		fc.DOM.attrs(this, {
			'fc_name': template.fc_name,
			'children':[
				{
					'class': 'fc_label',
					'html': 'Field is not defined!'
				},{
					'error_code': JSON.stringify(template, null, 2)
				}
			]
		});
	}
};

customElements.define('fc-undefined', fc.fields.undefined);


// /fields/dialogs/dialog.js

fc.fields.dialog = class fc_fields_dialog extends fc.fields.abstract {

	open(){
		this.classList.add('fc_open');
		document.body.classList.add('fc_dialog_opened');

		this.esc_listener = document.addEventListener('keydown', (event) => {
			if (event.key != 'Escape') {
				return;
			}
			this.close();
		});
	}

	close(){
		this.classList.remove('fc_open');
		document.body.classList.remove('fc_dialog_opened');

		document.removeEventListener('keydown', this.esc_listener);
	}

	/**
	 * @param {string} notice
	 */
	set notice(notice){
		const dialog_notice = this.querySelector('.fc_notice');
		if( ! notice ) {
			dialog_notice.innerHTML = '';
			this.removeAttribute('style');
			return;
		}

		dialog_notice.innerHTML = `<div class="fc_content">${notice}</div>`;
		const fc_content = dialog_notice.querySelector('.fc_content');
		this.setAttribute('style', '--fc_notice_height:' + Math.ceil( fc_content.scrollHeight ) + 'px');
	}
};

// /fields/dialogs/dialog_json.js

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

// /fields/dialogs/dialog_copy.js

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

// /fields/dialogs/dialog_diff.js

fc.fields.dialog_diff = class fc_fields_dialog_diff extends fc.fields.dialog {

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

		const _old = fc.JSON.parse(_old_text);
		const _new = fc.JSON.parse(_new_text);

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
					'children': [
						{
							'tag': 'pre'
						}
					]
				},{
					'class': 'fc_footer',
					'children': [
						{
							'class': 'fc_button fc_beautify_json',
							'html': 'Cancel',
							'events': {
								'click': () => {
									const caller = document.querySelector('.fc_dialog_caller');
									const JSON_object = fc.JSON.parse( this._old_text );
									if( JSON_object ){
										caller.value = JSON_object;
										caller.classList.remove('fc_dialog_caller');
										this.close();
									} else {
										this.notice = '<b>Unable to Use</b><p>Your JSON is not valid.<br>Please recheck your JSON.</p>';
									}
								}
							}
						},{
							'class': 'fc_button fc_button_primary fc_use_json',
							'html': 'Use Anyway',
							'events': {
								'click': () => {
									const caller = document.querySelector('.fc_dialog_caller');
									const JSON_object = fc.JSON.parse( this._new_text );
									if( JSON_object ){
										caller.value = JSON_object;
										caller.classList.remove('fc_dialog_caller');
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

customElements.define('fc-dialog_diff', fc.fields.dialog_diff);

// /fields/groups/children.js

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


// /fields/groups/group.js


fc.fields.group = class fc_fields_group extends fc.fields.abstract {

	set children( element ){
		if( this.children ) {
			this.replaceChild( element, this.children );
		} else {
			this.appendChild( element );
		}
	}

	get children(){
		return this.querySelector('fc-children');
	}

	get value(){
		const children = this.children;
		if( children ) {
			return this.children.value;
		}
		return null;
	}

	set value(value){
		const children = this.children;
		if( children ) {
			this.children.value = value;
		}
	}

	append_value(value){
		this.value = value;
	}

		/**
	 * @param {Object} template
	 */
	set template(template){

		const index = fc.DOM.getIndex();

		fc.DOM.attrs(this, {
			'class': 'fc_field',
			'fc_name': template.fc_name,
			'id': index,
			'children': [{
				'class': 'fc_container',
				'children': [
					! template.fc_label ? null : {
						'class': 'fc_label',
						'html': template.fc_label
					},
					{
						'tag': 'fc-children',
						'template': template.fields
					}
				],
			}]
		});

		this.set_width( this, template );
	}
};


customElements.define('fc-group', fc.fields.group);

// /fields/groups/main.js



fc.fields.main = class fc_fields_main extends fc.fields.group {

	/**
	 * @param {Object} template
	 */
	set template(template){

		const index = fc.DOM.getIndex();

		template.definitions?.forEach(definition => {
			if( fc.Definitions[definition.fc_name] ) {
				console.warn( 'Definition ${definition.fc_name} was rewritten');
			}
			fc.Definitions[definition.fc_name] = definition.fields;
		});

		fc.DOM.attrs(this, {
			'fc_name': template.fc_name,
			'id': index,
			'children': [
				{
					'class': 'fc_main_header',
					'children':[
						{
							'tag': 'strong',
							'html': template.fc_label ?? '',
						},{
							'tag': 'button',
							'type': 'button',
							'class': 'fc_icon fc_debug',
							'aria-label': 'Toggle Debug Mode',
							'events': {
								'click': () => this.classList.toggle('debug')
							},
						},{
							'tag': 'button',
							'type': 'button',
							'class': 'fc_icon fc_json',
							'aria-label': 'Edit as JSON',
							'events': {
								'click': () => this.edit_as_json()
							},
						},{
							'tag': 'button',
							'type': 'button',
							'class': 'fc_icon fc_paste',
							'aria-label': 'Paste',
							'events': {
								'click': async () => this.paste()
							},
						},{
							'tag': 'button',
							'type': 'button',
							'class': 'fc_icon fc_copy',
							'aria-label': 'Copy',
							'events': {
								'click': async () => this.copy()
							},
						},
					]
				}, {
					'class': 'fc_dialogs',
					'children': [
						{
							'tag': 'fc-dialog_json',
							'template': {
								'title': 'Edit fields as JSON'
							}
						},{
							'tag': 'fc-dialog_copy',
							'template': {
								'title': 'Unable to use clipboard'
							}
						},{
							'tag': 'fc-dialog_diff',
							'template': {
								'title': 'Compare Fields in JSON'
							}
						},
					],
				},{
					'class': 'fc_datalists',
					'children': template.datalists?.map((datalist)=> {
						return {
							'tag': 'datalist',
							'id': datalist.id,
							'children': datalist.values?.map((option)=> {
								return {
									'tag': 'option',
									'value': option.fc_value ?? '',
									'label': option.fc_label ?? '',
								}
							})
						};
					}),
				},{
					'class': 'fc_container',
					'children': [{
						'tag': 'fc-children',
						'template': template.fields
					}]
				}
			],
		});
	}
};

customElements.define('fc-main', fc.fields.main);


// /fields/groups/tabs.js

fc.fields.tabs = class fc_fields_tabs extends fc.fields.abstract {

	get buttons(){
		return Array.from( this.childNodes[0].childNodes );
	}

	get panels(){
		return Array.from( this.childNodes[1].childNodes );
	}

	get value(){
		const value = this.panels.reduce((acc, obj) => ({ ...acc, ...obj.value }), {});
		return Object.keys(value).length ? value : null;
	}

	set value(value){
		this.panels.forEach( (children) => children.value = value );
	}

	/**
	 * @param {Object} template
	 */
	set template(template){
		fc.DOM.attrs(this, {
			'class': 'fc_tabs fc_field',
			'children':[
				{
					'class': 'fc_tabs_buttons',
					'children': [
						{
							'tag': 'button', 'type': 'button',
							'class': 'fc_tab_button fc_tab_button_debug',
							'data-index': '0',
							'html': '- Everything -',
							'events': {
								'click': (e) => {
									const buttons = this.buttons;
									buttons.forEach((button) => button.classList.remove('fc_switch') );
									buttons[ 0 ].classList.add('fc_switch');

									this.panels.forEach((button) => button.classList.add('fc_open_tab') );
								}
							}
						},
						template.tabs?.map((tab, index)=> ({
							'tag': 'button', 'type': 'button',
							'class': 'fc_tab_button',
							'data-index': index + 1,
							'html': tab.fc_label??'',
							'events': {
								'click': (e) => {
									const buttons = this.buttons;
									buttons.forEach((button) => button.classList.remove('fc_switch') );
									buttons[ index + 1 ].classList.add('fc_switch');

									const panels = [...this.childNodes[1].childNodes];
									panels.forEach((button) => button.classList.remove('fc_open_tab') );
									panels[ index ].classList.add('fc_open_tab');
								}
							}
						})),
					]
				},{
					'class': 'fc_tabs_panels fc_switch fc_container',
					'children': template.tabs?.map(tab => ({
						'tag': 'fc-children',
						'template': tab.fields??[],
					})),
				},
			],
		});

		this.set_width( this, template );

		this.buttons[1]?.dispatchEvent( new Event('click') );
	}
};

customElements.define('fc-tabs', fc.fields.tabs);


// /fields/groups/radiotabs.js

fc.fields.radiotabs = class fc_fields_radiotabs extends fc.fields.abstract {

	get buttons(){
		return Array.from( this.querySelector('.fc_tabs_buttons').childNodes );
	}

	get panels(){
		return Array.from( this.querySelector('.fc_tabs_panels').childNodes );
	}

	get value(){
		const panel_value = this.querySelector('.fc_tabs_panels').querySelector('.fc_open_tab')?.value;

		const button = this.querySelector('.fc_tabs_buttons').querySelector('input:checked');
		if (!button) return panel_value;

		const button_value = button.getAttribute('value');
		const button_name = this.getAttribute('fc_radio_name');

		if ( !button_value || !button_name) {
			return panel_value;
		}

		return { [button_name]: button_value, ...panel_value }
	}

	set value(value){
		const fc_radio_name = this.getAttribute('fc_radio_name');
		const fc_radio_value = value[fc_radio_name];
		if( ( fc_radio_value ) && ( /[a-zA-Z0-9_\-]+/g.test(fc_radio_value) ) ){
			const found = this.querySelector('.fc_tabs_buttons').querySelector('input[value="'+fc_radio_value+'"]');
			if( found ) {
				found.parentNode.dispatchEvent( new Event('click') );
			} else {
				this.buttons[0].dispatchEvent( new Event('click') );
			}
		} else {
			this.buttons[0].dispatchEvent( new Event('click') );
		}

		this.panels.forEach( (children) => children.value = value );
	}

	/**
	 * @param {Object} template
	 */
	set template(template){
		fc.DOM.attrs(this, {
			'class': 'fc_tabs fc_field',
			'fc_radio_name': template.fc_name,
			'children':[
				! template.fc_label ? null : {
					'class': 'fc_label',
					'html': template.fc_label
				},
				{
					'class': 'fc_tabs_buttons',
					'children': template.tabs?.map((tab, index)=> ({
						'tag': 'label',
						'class': 'fc_tab_button',
						'data-index': index,
						'children':[
							{
								'tag': 'input',
								'id': fc.DOM.getIndex(),
								'class': 'fc_radio',
								'type': 'radio',
								'value': tab.fc_value ?? '',
							},{
								'tag': 'span',
								'html': tab.fc_label ?? '',
							}
						],
						'events': {
							'click': (e) => {
								const buttons = this.buttons;
								buttons.forEach((button) => {
									button.classList.remove('fc_switch');
									const radio = button.querySelector('input');
									radio.checked = false;
								});

								const button = buttons[ index ]
								button.classList.add('fc_switch');
								button.querySelector('input').checked = true;

								const panels = this.panels;
								panels.forEach((button) => button.classList.remove('fc_open_tab') );
								panels[ index ].classList.add('fc_open_tab');
							}
						}
					})),
				},{
					'class': 'fc_tabs_panels fc_switch fc_container',
					'children': template.tabs?.map(tab => ({
						'tag': 'fc-children',
						'template': tab.fields??[],
					})),
				},
			],
		});

		this.set_width( this, template );
	}
};

customElements.define('fc-radiotabs', fc.fields.radiotabs);


// /fields/inputs/input.js

fc.fields.input = class fc_fields_input extends fc.fields.abstract {

	get value(){
		const value = this.get_input().value;
		return value ? value : null;
	}

	/**
	 * @param {string|Object} value
	 */
	set value(value){
		const input = this.get_input();
		if( 'object' == typeof value ) {
			value = JSON.stringify(value);
		}
		input.value = value ?? '';
		this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
	}

	get repeater_label(){
		return this.value || '';
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		const index = fc.DOM.getIndex();

		fc.DOM.attrs(this, {
			'fc_name': template.fc_name,
			'class': 'fc_field fc_field_input',
			'children':[
				( ! template.fc_label ) ? null : {
					'tag': 'label',
					'class': 'fc_label',
					'for': index,
					'html': template.fc_label,
				},
				this.create_field( index, template ),
				( ! template.fc_description ) ? null : {
					'class': 'fc_description',
					'html': template.fc_description.replace(/\b([a-zA-Z]{1,2})\s/g, '$1&nbsp;')
				},
			]
		});

		this.set_width( this, template );
	}

}

// /fields/inputs/text.js

fc.fields.text = class fc_fields_text extends fc.fields.input {

	get_input(){
		return this.querySelector('input');
	}

	create_field( index, template ){
		return fc.DOM.create({
			'class': 'fc_input_wrapper',
			'children': [
				( ! template.fc_before ) ? null : {
					'class': 'fc_before',
					'html': ' ' + template.fc_before + ' ',
				},{
					'tag': 'input',
					'id': index,
					'class': 'fc_input',
					'type': template.fc_validate_as ?? 'text',
					'minlength': template.fc_minlength,
					'maxlength': template.fc_maxlength,
					'autocomplete': template.fc_autocomplete,
					'placeholder': template.fc_placeholder,
					'pattern': template.fc_pattern,
					'required': template.fc_required ? true : null,
					'aria-required': template.fc_required ? 'true' : '',
					'readonly': template.fc_readonly ? true : null,
					'list': template.fc_list,
					'events': {
						'input': () => this.dispatchEvent( new CustomEvent( 'fc_field_input' ) )
					},
				},( ! template.fc_after ) ? null : {
					'class': 'fc_after',
					'html': ' ' + template.fc_after + ' ',
				}
			]
		});
	}

};

customElements.define('fc-text', fc.fields.text);


// /fields/inputs/number.js

fc.fields.number = class fc_fields_number extends fc.fields.input {

	get_input(){
		return this.querySelector('input[type="number"]');
	}

	create_field( index, template ){
		return fc.DOM.create({
			'class': 'fc_input_wrapper',
			'children': [
				( ! template.fc_before ) ? null : {
					'class': 'fc_before',
					'html': ' ' + template.fc_before + ' ',
				},{
					'tag': 'input',
					'type': 'number',
					'id': index,
					'class': 'fc_input',
					'min': template.fc_min,
					'max': template.fc_max,
					'step': template.fc_step,
					'placeholder': template.fc_placeholder,
					'pattern': template.fc_pattern,
					'required':template.fc_required,
					'aria-required': template.fc_required ? 'true' : '',
					'readonly':template.fc_readonly,
					'list': template.fc_list,
					'events': {
						'input': () => this.dispatchEvent( new CustomEvent( 'fc_field_input' ) )
					},
				},( ! template.fc_after ) ? null : {
					'class': 'fc_after',
					'html': ' ' + template.fc_after + ' ',
				}
			]
		});
	}

};

customElements.define('fc-number', fc.fields.number);

// /fields/inputs/textarea.js

fc.fields.textarea = class fc_fields_textarea extends fc.fields.input {

	get_input(){ return this.querySelector('textarea'); }

	create_field( index, template ){
		return fc.DOM.create({
			'class': 'fc_input_wrapper',
			'children': [
				{
					'tag': 'textarea',
					'id': index,
					'class': 'fc_input',
					'placeholder': template.fc_placeholder,
					'minlength': template.fc_minlength,
					'maxlength': template.fc_maxlength,
					'required': template.fc_required,
					'aria-required': template.fc_required    ? 'true' : '',
					'readonly': template.fc_readonly,
					'events': {
						'input': () => this.dispatchEvent( new CustomEvent( 'fc_field_input' ) )
					},
				}
			]
		});
	}

};

customElements.define('fc-textarea', fc.fields.textarea);


// /fields/inputs/checkbox.js

fc.fields.checkbox = class fc_fields_checkbox extends fc.fields.input {

	get value(){
		const input = this.get_input();
		return input.checked ? input.value : null;
	}

	set value(value){
		const input = this.get_input();
		input.checked = ( input.value == value );
		this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
	}

	get_input(){
		return this.querySelector('input[type="checkbox"]');
	}

	get repeater_label(){
		const value = this.value;
		if( ! value ) {
			return '';
		}
		const label = this.querySelector('.fc_after');
		if( label ) {
			return label.innerHTML
		}
		return value;
	}

	create_field( index, template ){
		return fc.DOM.create({
			'tag': 'label',
			'for': index,
			'class': 'fc_input_wrapper',
			'children': [
				( ! template.fc_before ) ? null : {
					'class': 'fc_before',
					'html': ' ' + template.fc_before + ' ',
				},{
					'tag': 'input',
					'type': 'checkbox',
					'id': index,
					'class': 'fc_checkbox',
					'value': template.fc_value || '1',
					'required': template.fc_required,
					'aria-required': template.fc_required ? 'true' : '',
					'readonly': template.fc_readonly,
					'events': {
						'change': () => this.dispatchEvent( new CustomEvent( 'fc_field_input' ) )
					},
				},( ! template.fc_after ) ? null : {
					'class': 'fc_after',
					'html': ' ' + template.fc_after + ' ',
				}
			]
		});
	}
};

customElements.define('fc-checkbox', fc.fields.checkbox);


// /fields/inputs/color.js

fc.fields.color = class fc_fields_color extends fc.fields.input {

	get_input(){
		return this.querySelector('input[type="text"]');
	}

	get value(){
		const value = this.get_input().value;
		return value ? value : null;
	}

	/**
	 * @param {string|Object} value
	 */
	set value(value){
		const input = this.get_input();
		input.value = value ?? '#000000';
		input.dispatchEvent( new Event('input') );
	}

	get repeater_label(){
		return /^#[a-fA-F0-9]{6}$/i.test(this.value)
			? '<i class="fc_color_example" style="background:'+this.value+'"></i>' + this.value
			: ''
	}

	create_field( index, template ){
		return fc.DOM.create({
			'class': 'fc_input_wrapper',
			'children': [
				( ! template.fc_before ) ? null : {
					'class': 'fc_before',
					'html': ' ' + template.fc_before + ' ',
				},{
					'class': 'fc_color',
					'children': [
						{
							'tag': 'input',
							'type': 'color',
							'events': {
								'input': () => {
									const color = this.querySelector('input[type="color"]');
									const hex = this.querySelector('input[type="text"]');
									hex.value = color.value;
									this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
								}
							}
						},{
							'tag': 'input',
							'type': 'text',
							'id': index,
							'pattern': '^#[0-9A-Fa-f]{6}$',
							'readonly': template.fc_readonly ? true: null,
							'list': template.fc_list,
							'events': {
								'input': () => {
									const color = this.querySelector('input[type="color"]');
									const hex = this.querySelector('input[type="text"]');
									if (hex.checkValidity()) {
										color.value = hex.value;
									}
									this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
								}
							}
						}
					]
				},( ! template.fc_after ) ? null : {
					'class': 'fc_after',
					'html': ' ' + template.fc_after + ' ',
				}
			]
		});
	}

};

customElements.define('fc-color', fc.fields.color);

// /fields/inputs/hidden.js

fc.fields.hidden = class fc_fields_hidden extends fc.fields.input {

	get_input(){
		return this.querySelector('input');
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		const index = fc.DOM.getIndex();

		fc.DOM.attrs(this, {
			'fc_name': template.fc_name,
			'class': 'fc_field fc_field_input fc_field_hidden',
			'children':[
				{
					'tag': 'label',
					'class': 'fc_label',
					'for': index,
					'html': '<s>Hidden</s>',
				},{
					'class': 'fc_input_wrapper',
					'children': [{
						'tag': 'input',
						'id': index,
						'type': 'text',
						'class': 'fc_input',
					}]
				}
			]
		});
	}

};

customElements.define('fc-hidden', fc.fields.hidden);


// /fields/inputs/checkboxes.js

fc.fields.checkboxes = class fc_fields_checkboxes extends fc.fields.input {

	get value(){
		let value = [];
		this.inputs.forEach((input) => {
			if( input.checked ){
				value.push( input.value );
			}
		})
		return value.length ? value : null;
	}

	set value(value){
		this.inputs.forEach((input) => {
			input.checked = ( -1 != value.indexOf( input.value ) )
		});
		this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
	}

	get inputs(){
		return Array.from(
			this.querySelectorAll('.fc_choices_wrapper input[type="checkbox"]')
		);
	}

	get repeater_label(){
		const labels = [];
		Array.from(
			this.querySelectorAll('input:checked + .fc_checkboxes_label')
		).forEach((label) => {
			labels.push( label.innerHTML.trim() )
		});
		return labels.join(', ');
	}

	create_field( index, template ){
		return fc.DOM.create({
			'class': 'fc_choices_wrapper',
			'children': template.values?.map(config => {
				index = fc.DOM.getIndex();
				return {
					'class': 'fc_input_wrapper',
					'tag': 'label',
					'for': index,
					'children': [
						{
							'tag': 'input',
							'type': 'checkbox',
							'id': index,
							'class': 'fc_checkbox',
							'value': config.fc_value ?? '1',
							'events': {
								'change': () => this.dispatchEvent( new CustomEvent( 'fc_field_input' ) )
							},
						}, ( ! config.fc_label ) ? null : {
							'class': 'fc_checkboxes_label',
							'html': ' ' + config.fc_label.replace(/\b([a-zA-Z]{1,2})\s/g, '$1&nbsp;') + ' ',
						}
					]
				};
			})
		});
	}
};

customElements.define('fc-checkboxes', fc.fields.checkboxes);


// /fields/inputs/radios.js

fc.fields.radios = class fc_fields_radios extends fc.fields.input {

	get value(){
		const checked = this.querySelector('input[type="radio"]:checked');
		return checked ? checked.value : null;
	}

	set value(value){
		const radios =  Array.from( this.querySelectorAll('input[type="radio"]') );
		radios.forEach((input) => {
			input.checked = ( -1 != value.indexOf( input.value ) )
		});
		this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
	}

	get repeater_label(){
		const after = this.querySelector('input:checked + .fc_radios_label')
		return after ? after.innerHTML : '';
	}

	create_field( index, template ){
		return fc.DOM.create({
			'class': 'fc_choices_wrapper',
			'children': template.values?.map(radio => {
				index = fc.DOM.getIndex();
				return {
					'class': 'fc_input_wrapper',
					'tag': 'label',
					'for': index,
					'children': [
						{
							'tag': 'input',
							'id': index,
							'class': 'fc_radio',
							'type': 'radio',
							'value': radio.fc_value ?? '1',
							'events': {
								'change': () => this.value = radio.fc_value ?? '1',
							},
						}, ( ! radio.fc_label ) ? null : {
							'class': 'fc_radios_label',
							'html': ' ' + radio.fc_label.replace(/\b([a-zA-Z]{1,2})\s/g, '$1&nbsp;') + ' ',
						}
					]
				};
			})
		});
	}
};

customElements.define('fc-radios', fc.fields.radios);


// /fields/inputs/select.js

fc.fields.select = class fc_fields_select extends fc.fields.input {

	get value(){
		const select = this.querySelector('select');
		return select.value;
	}

	set value(value){
		const select = this.querySelector('select');
		select.value = value;
		this.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
	}

	get repeater_label(){
		const select = this.querySelector('select');
		if( -1 == select.selectedIndex ) return null;
		if( 0 == select.options.length ) return null;
		return select.options[select.selectedIndex].text ?? null;
	}

	create_field( index, template ){
		return fc.DOM.create({
			'class': 'fc_input_wrapper',
			'children': [
				( ! template.fc_before ) ? null : {
					'class': 'fc_before',
					'html': ' ' + template.fc_before + ' ',
				},{
					'tag': 'select',
					'id': index,
					'class': 'fc_input',
					'children': template.values?.map(config => {
						return {
							'tag': 'option',
							'value': config.fc_value,
							'html': config.fc_label,
						};
					}),
					'events': {
						'change': () => this.dispatchEvent( new CustomEvent( 'fc_field_input' ) )
					},
				},( ! template.fc_after ) ? null : {
					'class': 'fc_after',
					'html': ' ' + template.fc_after + ' ',
				}
			]
		});
	}
};

customElements.define('fc-select', fc.fields.select);


// /fields/repeaters/row.js

fc.fields.row = class fc_fields_row extends fc.fields.group {

	get repeater(){
		return this.closest('.fc_repeater');
	}

	toggle_open_state(){
		if( this.classList.contains('fc_open') ){
			Array.from( this.querySelectorAll('.fc_open') ).forEach(
				el => el.classList.remove('fc_open')
			);
		}
		this.classList.toggle('fc_open');
		this.repeater.update_open_state();
	}

	button_add_to_top(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_add to_top',
		'aria-label': 'Add before row',
		'events': {
			'click': (e) => {
				this.repeater.add_row(this, 'before');
			},
		}
	}}

	button_add_to_bottom(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_add to_bottom',
		'aria-label': 'Add after row',
		'events': {
			'click': (e) => {
				this.repeater.add_row(this, 'after');
			},
		}
	}}

	icon_move(){ return {
		'class': 'fc_icon fc_move'
	}}

	checkbox(){ return {
		'tag': 'label',
		'class': 'fc_r_checkbox',
		'children': [
			{
				'tag': 'input',
				'type': 'checkbox',
				'id': fc.DOM.getIndex(),
				'events': {
					'change': (e) => {
						this.repeater.update_check_state();
					},
				},
			}
		]
	}}

	index(){ return  {
		'class': 'fc_index'
	}}

	button_delete(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_delete',
		'aria-label': 'Delete',
		'events': {
			'click': () => {
				const repeater = this.repeater;
				this.remove();
				repeater.update_open_state();
				repeater.update_check_state();
			},
		},
	}}

	button_duplicate(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_x2',
		'aria-label': 'Duplicate',
		'events': {
			'click': () => {
				const new_row = this.repeater.create_row( this.value );
				if( this.classList.contains('fc_open') ){
					new_row.classList.add('fc_open');
				}
				this.after(new_row);
			},
		},
	}}

	button_up(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_up',
		'aria-label': 'Move Up',
		'events': {
			'click': () => {
				const prev = this.previousSibling;
				! prev || this.after(prev);
			},
		},
	}}

	button_down(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_down',
		'aria-label': 'Move Down',
		'events': {
			'click': () => {
				const next = this.nextSibling;
				! next || this.before(next);
			},
		},
	}}

	button_toggle(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fc_icon fc_toggle',
		'aria-label': 'Open / Close',
		'events': {
			'click': () => this.toggle_open_state(),
		},
	}}


	/**
	 * @param {Object} template
	 */
	set template(template){

		fc.DOM.attrs(this, {
			'class': 'fc_row fc_switch',
			'children':[
				{
					'class': 'fc_header fc_row_header',
					'children':[
						this.icon_move(),
						this.checkbox(),
						this.button_add_to_top(),
						this.button_add_to_bottom(),
						this.index(),
						{
							'class': 'fc_row__labels',
							'events': {
								'click': () => this.toggle_open_state(),
							},
							'children': template.fc_row__labels?.map(config => {
								if( ! config ){
									return;
								}
								return {
									'class': 'fc_label',
									'style': config.width ? `flex-grow:${config.width}` : '',
									'children': [{ 'html': config.fc_label ?? '' }],
								};
							}),
						},{
							'class': 'fc_actions',
							'children': [
								this.button_delete(),
								this.button_duplicate(),
								this.button_up(),
								this.button_down(),
								this.button_toggle(),
							]
						},
					],
				},{
					'class': 'fc_container',
					'children': [{
						'tag': 'fc-children',
						'template': template.fields
					}]
				}
			]
		});

		this.querySelector('.fc_row_header').querySelectorAll('[data-from]')?.forEach( (label) => {
			const from = label.getAttribute('data-from');
			let field;

			field = this.querySelector('[fc_name="'+from+'"]');
			if( ! field ) {
				return
			}

			field.addEventListener( 'fc_field_input', (e) => {
				label.innerHTML = '';
				fc.DOM.attrs( label, {
					'html': field.repeater_label
				});
			});
			field.dispatchEvent( new CustomEvent( 'fc_field_input' ) );
		});
	}
};

customElements.define('fc-row', fc.fields.row);


// /fields/repeaters/row_table.js

fc.fields.row_table = class fc_fields_row_table extends fc.fields.row {

	get value(){
		let value = {};
		this.querySelectorAll('.fc_row_fields input[fc_name]').forEach( (field) => {
			const field_name = field.getAttribute('fc_name');
			if( ! field_name ) return;
			const field_value = field.value ?? '';
			if( ! field_value ) return;
			value[field_name] = field_value;
		});
		return Object.keys(value).length ? value : null;
	}

	set value(value){
		if (!value) return;
		this.querySelectorAll('.fc_row_fields input[fc_name]').forEach( (field) => {
			const field_name = field.getAttribute('fc_name');
			const field_value = value[field_name] ?? '';
			field.value = field_value;
		});
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		fc.DOM.attrs(this, {
			'class': 'fc_row fc_switch',
			'children':[
				{
					'class': 'fc_header fc_row_header',
					'children':[
						this.button_add_to_top(),
						this.button_add_to_bottom(),
						this.icon_move(),
						this.checkbox(),
						this.index(),
						{
							'class': 'fc_row_fields',
							'children': template.fields?.map(field => {
								const index = fc.DOM.getIndex();
								return {
									'tag': 'label',
									'class': 'fc_label',
									'for': index,
									'children':[{
										'tag': 'input',
										'type': field.fc_type??'',
										'fc_name': field.fc_name??'',
										'id': index,
									}]
								};
							})
						},{
							'class': 'fc_actions',
							'children': [
								this.button_delete(),
								this.button_duplicate(),
								this.button_up(),
								this.button_down(),
							]
						},
					],
				},
			],
		});
	}
};

customElements.define('fc-row_table', fc.fields.row_table);


// /fields/repeaters/repeater.js


fc.fields.repeater = class fc_fields_repeater extends fc.fields.abstract {

	get value(){
		const value = Array.from(this.rows.childNodes)
			.filter(row => row.tagName.toLowerCase() === 'fc-row')
			.map(row => row.value);

		return value.length ? value : [];
	}

	set value(value){
		this.rows.innerHTML = '';
		this.append_value(value);
	}

	append_value(value){
		for( let i = 0; i < value.length; i++ ){
			const new_row = this.create_row(value[i]);
			if( new_row ) {
				this.rows.appendChild(new_row);
			}
		}
	}

	update_open_state(){
		const rowNodes = Array.from(this.rows.childNodes);
		const allRowsOpen = rowNodes.every(row => row.classList.contains('fc_open'));
		this.classList.toggle('fc_open', allRowsOpen);
	}

	toggle_open_state(){
		const rowNodes = Array.from(this.rows.childNodes);
		const allRowsOpen = rowNodes.every(row => row.classList.contains('fc_open'));
		if( allRowsOpen ) {
			Array.from( this.querySelectorAll('.fc_open') ).forEach(
				el => el.classList.remove('fc_open')
			);
		} else {
			rowNodes.forEach(row => row.classList.add('fc_open'));
		}
		this.classList.toggle('fc_open', !allRowsOpen);
	}

	update_check_state(){
		const repeater_checkbox
			= this.querySelector('.fc_repeater_header')
			.querySelector('input[type="checkbox"]');

		const rowNodes = Array.from(this.rows.childNodes);
		const checked = rowNodes.filter(row => {
			const row_checkbox = row.querySelector('.fc_row_header')
				.querySelector('input[type="checkbox"]');
			return row_checkbox.checked;
		});

		repeater_checkbox.checked = ( checked.length == rowNodes.length );
		repeater_checkbox.parentNode.classList.toggle('checked', checked.length > 0);

		if (checked.length == rowNodes.length) {
			repeater_checkbox.indeterminate = false;
		} else if (checked.length > 0) {
			repeater_checkbox.indeterminate = true;
		} else {
			repeater_checkbox.indeterminate = false;
		}
	}

	toggle_check_state(){
		const repeater_checkbox
			= this.querySelector('.fc_repeater_header')
			.querySelector('input[type="checkbox"]');

		const repeater_checked = repeater_checkbox.checked;
		const rows = Array.from(this.rows.childNodes);

		rows.forEach( (row) => {
			const row_checkbox
				= row.querySelector('.fc_row_header')
				.querySelector('input[type="checkbox"]');
			row_checkbox.checked = repeater_checked;
		});
	}

	get_checked_rows() {
		const rowNodes = Array.from(this.rows.childNodes);

		const checkedRows = rowNodes.filter(row => {
			const row_checkbox = row.querySelector('.fc_row_header')
				.querySelector('input[type="checkbox"]');
			return row_checkbox && row_checkbox.checked;
		});

		return checkedRows;
	}

	add_row(caller, position){
		// different in multiple / single + table
	}

	async copy_selected(){
		const values = Array.from(this.get_checked_rows())
			.filter(row => row.tagName.toLowerCase() === 'fc-row')
			.map(row => row.value);

		try {
			const JSON_string = fc.JSON.stringify( values );
			await navigator.clipboard.writeText(JSON_string);
		} catch (error) {
			const JSON_dialog = this.show_to_copy();
			JSON_dialog.notice = '<b>Unable to copy to clipboard</b><p>Please check web browser permissions for your site.<br>To copy manually: press Ctrl+C (Windows) or Cmd+C (Mac), then press Esc</p>';
			JSON_dialog.select_text();
			console.warn('Clipboard copy failed:', error);
		}
	}


	/**
	 * @param {Object} template
	 */
	set template(template){

		// Prepare labels

		if( ( ! template.fc_repeater__labels ) || ( 0 == template.fc_repeater__labels.length ) ){
			this.template_labels = [{ 'fc_label': '' }];
		} else {
			this.template_labels = template.fc_repeater__labels
		}

		// Set up templates

		const template_group_id = this.init_repeater( template );

		// Do it

		fc.DOM.attrs(this, {
			'fc_name': template.fc_name,
			'class': 'fc_repeater fc_field',
			'data-group': template_group_id,
			'children': [
				! template.fc_label || {
					'class': 'fc_label',
					'html': template.fc_label,
				},
				{
					'class': 'fc_input_wrapper fc_repeater_wrapper',
					'children': [
						{
							'class': 'fc_header fc_repeater_header',
							'children':[
								{
									'tag': 'label',
									'class': 'fc_r_checkbox',
									'children': [{
										'tag': 'input',
										'type': 'checkbox',
										'id': fc.DOM.getIndex(),
										'events': {
											'change': (e) => {
												this.toggle_check_state();
												this.update_check_state();
											},
										},
									}]
								},{
									'class': 'fc_for_selected_menu',
									'children': [
										{
											'tag': 'button', 'type': 'button',
											'class': 'fc_icon fc_delete',
											'aria-label': 'Delete Selected',
											'events': {
												'click': (e) => {
													this.get_checked_rows().forEach( (row) => row.remove() );
													this.update_check_state();
													this.update_open_state();
												},
											},
										},{
											'tag': 'button', 'type': 'button',
											'class': 'fc_icon fc_copy',
											'aria-label': 'Copy Selected',
											'events': {
												'click': async () => {
													this.copy_selected();
												}
											}
										}
									],
								},{
									'class': 'fc_repeater__labels',
									'events': {
										'click': (e) => this.toggle_open_state(),
									},
									'children': this.template_labels?.map(label => ({
										'class': 'fc_label',
										'style': label.width ? `flex-grow: ${label.width}` : '',
										'children': [{
											'html': label.fc_label ?? ''
										}],
									})),
								},{
									'class': 'fc_actions',
									'children': [
										{
											'tag': 'button', 'type': 'button',
											'class': 'fc_icon fc_delete',
											'aria-label': 'Delete',
											'events': {
												'click': (e) => {
													this.rows.innerHTML = '';
													this.toggle_check_state();
													this.update_open_state();
												},
											},
										},{
											'tag': 'button', 'type': 'button',
											'class': 'fc_icon fc_json',
											'aria-label': 'Edit as JSON',
											'events': {
												'click': () => {
													this.edit_as_json();
												},
											},
										},{
											'tag': 'button', 'type': 'button',
											'class': 'fc_icon fc_paste',
											'aria-label': 'Paste',
											'events': {
												'click': async (e) => {
													this.paste( true );
												},
											},
										},{
											'tag': 'button', 'type': 'button',
											'class': 'fc_icon fc_copy',
											'aria-label': 'Copy',
											'events': {
												'click': async () => this.copy()
											}
										},{
											'tag': 'button', 'type': 'button',
											'class': 'fc_icon fc_toggle',
											'aria-label': 'Open / Close',
											'events': {
												'click': (e) => this.toggle_open_state(),
											},
										},
									],
								},
							],
						},{
							'tag': 'fc-rows',
						},{
							'tag': 'button', 'type': 'button',
							'class': 'add_button fc_icon fc_add',
							'events': {
								'click': () => this.add_row(this, 'append')
							}
						},
					],
				},
			],
		});

		this.set_width( this, template );

		this.rows = this.querySelector('fc-rows');

		this.Sortable = new Sortable( this.rows, {
			group: template_group_id,
			handle: '.fc_icon.fc_move',
			//ghostClass: '',
			animation: 150,
		});
	}

};



// /fields/repeaters/repeater_single.js


fc.fields.repeater_single = class fc_fields_repeater_single extends fc.fields.repeater {

	create_row(value){
		const row = fc.DOM.create({
			'tag': 'fc-row',
			'template': this.single_template,
		});

		row.value = value;

		return row;
	}

	init_repeater( template ){
		const templates = template.templates;
		this.single_template = templates[0];
		this.single_template_id = fc.Templates.register_template(templates[0]);

		return this.template_group_id = fc.Templates.register_group({
			'': this.single_template_id
		});
	}

	add_row(caller, position){
		document.activeElement.blur();

		const created_row = this.create_row();
		created_row.classList.add('fc_open');

		switch(position){
			case 'before':
				caller.before( created_row );
				return;
			case 'after':
				caller.after( created_row );
				return;
			case 'append':
				this.rows.append( created_row );
		}
	}

};

customElements.define('fc-repeater_single', fc.fields.repeater_single);


// /fields/repeaters/repeater_table.js


fc.fields.repeater_table = class fc_fields_repeater_table extends fc.fields.repeater_single {

	get value(){
		const value = Array.from(this.rows.childNodes)
			.filter(row => row.tagName.toLowerCase() === 'fc-row_table')
			.map(row => row.value);

		return value.length ? value : null;
	}

	set value(value){
		super.value = value;
	}

	create_row(value){
		const row = fc.DOM.create({
			'tag': 'fc-row_table',
			'template': this.single_template,
		});

		row.value = value;

		return row;
	}

	init_repeater( template ){
		this.single_template = template.templates[0];
		this.single_template_id = fc.Templates.register_template(template.templates[0]);

		this.template_labels = this.single_template.fields?.map(field => {
			return {
				'fc_label': field.fc_label??'',
				'width': field.width??'',
			};
		});

		return this.template_group_id = fc.Templates.register_group({
			'': this.single_template_id
		});
	}

	add_row(caller, position){
		document.activeElement.blur();
		const created_row = this.create_row();

		switch(position){
			case 'before':
				caller.before( created_row );
				return;
			case 'after':
				caller.after( created_row );
				return;
			case 'append':
				this.rows.append( created_row );
		}
	}

};

customElements.define('fc-repeater_table', fc.fields.repeater_table);


// /fields/repeaters/repeater_multiple.js


fc.fields.repeater_multiple = class fc_fields_repeater_multiple extends fc.fields.repeater {

	init_repeater( template ){
		const templates = template.templates;
		this.type_to_ID = templates.reduce((acc, tmpl) => {
			acc[tmpl.fc_type] = fc.Templates.register_template(tmpl);
			return acc;
		}, {});

		if( 0 == Object.keys(this.type_to_ID).length ) {
			fc.DOM.attrs(this, {
				'html': 'No Templates'
			});
			return;
		}

		this.picker_options = [{}].concat(templates.map(template => ({
			'fc_type': template.fc_type,
			'fc_label': template.fc_label
		})));

		if( template.picker ){
			this.picker = template.picker;
		}

		return this.template_group_id = fc.Templates.register_group( this.type_to_ID );
	}

	create_row(value){
		let ID = this.type_to_ID[ value['fc_type'] ];
		let template_type = value.fc_type;

		if( ! ID ){
			console.warn("Template type is not defined for this repeater", {
				'template type': template_type,
				'value': value
			});
			return null;
		}

		if( this.type_to_ID['type'] ){
			ID = this.type_to_ID[ 'type' ];
			template_type = 'type';
		}


		const template = fc.Templates.get_template( ID );

		const row = fc.DOM.create({
			'tag': 'fc-row',
			'template': template,
		});

		const picker = row.querySelector('[fc_name="fc_type"]');
		if( picker ) {
			picker.addEventListener( 'input', (e) => {
				const new_row = this.create_row( row.value );
				if( new_row ) {
					new_row.value = row.value;
					if(row.classList.contains('fc_open')){
						new_row.classList.add('fc_open');
					}
					row.replaceWith(new_row);
				}
			});
		}

		row.value = value;

		return row;
	}

	add_row(caller, position){
		document.activeElement.blur();

		const picker_id = this.picker ?? '__picker_default';

		let datalist = document.getElementById(picker_id);

		let picker = [];
		if( datalist ) {
			picker = Array.from( datalist.childNodes ).map(option => {
				return {
					'fc_type': option.getAttribute('value'),
					'fc_label': option.getAttribute('label'),
				}
			});
		} else {
			picker = this.picker_options;
		}

		this.esc_listener = document.addEventListener('keydown', (event) => {
			if (event.key != 'Escape') {
				return;
			}
			pseudo_row.remove();
			document.activeElement.blur();
		});

		const pseudo_row = fc.DOM.create({
			'class': 'row_add_row fc_switch fc_picker_' + picker_id,
			'children': [
				{
					'class': 'fc_backdrop',
					'events': {
						'click': (e) => pseudo_row.remove()
					},
				},{
					'class': 'fc_add_header',
					'children': [
						{
							'class': 'fc_icon fc_add_row',
						},{
							'class': 'fc_add_label',
							'children': [{
								'html': 'Add new row',
							}],
						},{
							'tag': 'button', 'type': 'button',
							'class': 'fc_icon fc_delete',
							'aria-label': 'Cancel new row',
							'events': {
								'click': (e) => {
									pseudo_row.remove();
									document.removeEventListener('keydown', this.esc_listener);
								}
							},
						}
					]
				},{
					'class': 'fc_add_options',
					'children': (()=>{
						let actual = null;
						const optgroup = [];
						picker.forEach(option => {
							if( option.fc_type ) {
								if( ! actual ) {
									optgroup.push({'class': 'fc_label'});
									optgroup.push( actual = {
										'class': 'fc_group',
										'children': []
									} );
								}
								actual.children.push({
									'tag': 'button', 'type': 'button',
									'class': ( ! this.type_to_ID[option.fc_type] ) ? 'template_not_defined' : '',
									'html': option.fc_label ?? '???',
									'data-fc_type': option.fc_type,
									'events': {
										'click': (e) => {
											const created_row = this.create_row({ 'fc_type': option.fc_type });
											if( null === created_row ) {
												return;
											}
											created_row.classList.add('fc_open');
											pseudo_row.replaceWith(created_row);
											document.removeEventListener('keydown', this.esc_listener);
										},
									},
								});
							} else {
								optgroup.push({
									'class': 'fc_label',
									'html': option.fc_label ?? '???',
								});
								optgroup.push( actual = {
									'class': 'fc_group',
									'children': []
								} );
							}
						});
						return optgroup;
					})()
				},
			],
		});;

		switch(position){
			case 'before':
				caller.before( pseudo_row );
				return;
			case 'after':
				caller.after( pseudo_row );
				return;
			case 'append':
				this.rows.append( pseudo_row );
		}
	}
};

customElements.define('fc-repeater_multiple', fc.fields.repeater_multiple);

// /fields/html/h1.js

fc.fields.h1 = class fc_fields_h1 extends fc.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fc.DOM.attrs(this, {
			'class': 'fc_html',
			'children':[{
				'tag': 'h1',
				'html': template.html ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fc-h1', fc.fields.h1);

// /fields/html/h2.js

fc.fields.h2 = class fc_fields_h2 extends fc.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fc.DOM.attrs(this, {
			'class': 'fc_html',
			'children':[{
				'tag': 'h2',
				'html': template.html ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fc-h2', fc.fields.h2);

// /fields/html/h3.js

fc.fields.h3 = class fc_fields_h3 extends fc.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fc.DOM.attrs(this, {
			'class': 'fc_html',
			'children':[{
				'tag': 'h3',
				'html': template.html ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fc-h3', fc.fields.h3);

// /fields/html/p.js

fc.fields.p = class fc_fields_p extends fc.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fc.DOM.attrs(this, {
			'class': 'fc_html',
			'children':[{
				'tag': 'p',
				'html': template.html ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fc-p', fc.fields.p);


fc.init();



})();
