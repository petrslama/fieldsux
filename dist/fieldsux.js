(function() {
'use strict';


// /fu.js

const fu = {

	version: '0.0.1',

	Definitions: {},

	field_templates: {},

	fields: {},

	instances: [],

	init: function(){
		document.querySelectorAll('.fieldsux').forEach((fieldsUX) => {

			let fu_main = fieldsUX.querySelector('fu-main');
			if( fu_main ) {
				return;
			}

			const template = fieldsUX.querySelector('.fu_template');
			if( ! template ) {
				return;
			}

			const data = fieldsUX.querySelector('.fu_data');
			if( ! data ) {
				return;
			}

			fu_main = document.createElement('fu-main');

			fu_main.template = fu.JSON.parse( template.value );
			fu_main.value = fu.JSON.parse( data.value );

			fieldsUX.appendChild( fu_main );

			this.instances.push(fu_main);

			const opened = fieldsUX.querySelector('.fu_opened');
			if( opened ) {
				fu.Opened.set(opened.value);
			}

			const scroll = fieldsUX.querySelector('.fu_scroll');
			if( scroll ) {
				document.documentElement.scrollTop = scroll.value;
			}
		});
	},
};

window.fu = fu;



// /utils/JSON.js

/**
 * Utility class for JSON operations
 */
fu.JSON = class {
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
fu.DOM = class {

	static index = 0;

	static getIndex() {
		fu.DOM.index ++;
		return 'fu_' + fu.DOM.index;
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
				let new_value = value;

				new_value.match(/\[[a-zA-Z_\-][a-zA-Z0-9_\-]*\]/g)?.forEach(match => {
					const m = match.slice(1, -1);
					new_value = new_value.replaceAll(match, `<span data-from="${m}">${match}</span>`);
				});

				element.innerHTML = new_value

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
						fu.DOM.attrs(element, {'children': child});
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
		fu.DOM.attrs(element, attrs);
		return element;
	}
}

// /utils/Templates.js

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

// /utils/Opened.js

fu.Opened = {
	selectors: [
		'.fu_tab_button.fu_switch:not([data-index="0"])',
		'.fu_open_row',
	],
	get: function(){
		const opened = Array.from( document.querySelectorAll( fu.Opened.selectors.join(',') ) );

		const IDs = [];
		opened.forEach( fuel => {
			IDs.push( fuel.id.replace(/\D/g, '') );
		});
		return IDs.join(',');
	},
	set: function(IDs){
		IDs.split(',').forEach( id_part => {
			const ID = 'fu_' + id_part;
			const el = document.getElementById(ID);

			if( ! el ) return;

			if( 'function' === typeof el.open ){
				el.open();
			} else {
				el.dispatchEvent( new Event('click') );
			}
		});
	}
};

// /fields/abstract.js

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
		let last_size = 1;

		for( let breakpoint = 0; breakpoint <= 6; breakpoint ++) {
			let current_size = parseInt(template[`size_${breakpoint}`]) || last_size;

			const max_columns = breakpoint + 1;
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


// /fields/undefined.js

fu.fields.undefined = class fu_fields_undefined extends fu.fields.abstract {

	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'fu_name': template.fu_name,
			'children':[
				{
					'class': 'fu_label',
					'html': 'Field is not defined!'
				},{
					'error_code': JSON.stringify(template, null, 2)
				}
			]
		});
	}
};

customElements.define('fu-undefined', fu.fields.undefined);


// /fields/dialogs/dialog.js

fu.fields.dialog = class fu_fields_dialog extends fu.fields.abstract {

	open(){
		this.classList.add('fu_open_dialog');
		document.body.classList.add('fu_dialog_opened');

		this.esc_listener = document.addEventListener('keydown', (event) => {
			if (event.key != 'Escape') {
				return;
			}
			this.close();
		});
	}

	close(){
		this.classList.remove('fu_open_dialog');
		document.body.classList.remove('fu_dialog_opened');

		document.removeEventListener('keydown', this.esc_listener);
	}

	/**
	 * @param {string} notice
	 */
	set notice(notice){
		const dialog_notice = this.querySelector('.fu_notice');
		if( ! notice ) {
			dialog_notice.innerHTML = '';
			this.removeAttribute('style');
			return;
		}

		dialog_notice.innerHTML = `<div class="fu_content">${notice}</div>`;
		const fu_content = dialog_notice.querySelector('.fu_content');
		this.setAttribute('style', '--fu_notice_height:' + Math.ceil( fu_content.scrollHeight ) + 'px');
	}
};

// /fields/dialogs/dialog_json.js

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

// /fields/dialogs/dialog_copy.js

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

// /fields/dialogs/dialog_diff.js

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

// /fields/groups/children.js

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


// /fields/groups/group.js


fu.fields.group = class fu_fields_group extends fu.fields.abstract {

	set children( element ){
		if( this.children ) {
			this.replaceChild( element, this.children );
		} else {
			this.appendChild( element );
		}
	}

	get children(){
		return this.querySelector('fu-children');
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

		const index = fu.DOM.getIndex();

		fu.DOM.attrs(this, {
			'class': 'fu_field',
			'fu_name': template.fu_name,
			'id': index,
			'children': [{
				'class': 'fu_container',
				'children': [
					! template.fu_label ? null : {
						'class': 'fu_label',
						'html': template.fu_label
					},
					{
						'tag': 'fu-children',
						'class': 'fu_grid',
						'template': template.fields
					}
				],
			}]
		});

		this.set_width( this, template );
	}
};


customElements.define('fu-group', fu.fields.group);

// /fields/groups/main.js



fu.fields.main = class fu_fields_main extends fu.fields.group {

	/**
	 * @param {Object} template
	 */
	set template(template){

		const index = fu.DOM.getIndex();

		template.definitions?.forEach(definition => {
			if( fu.Definitions[definition.fu_name] ) {
				console.warn( 'Definition ${definition.fu_name} was rewritten');
			}
			fu.Definitions[definition.fu_name] = definition.fields;
		});

		fu.DOM.attrs(this, {
			'fu_name': template.fu_name,
			'id': index,
			'children': [
				{
					'class': 'fu_main_actions',
					'children':[
						{
							'tag': 'button',
							'type': 'button',
							'class': 'fu_icon fu_debug',
							'aria-label': 'Toggle Debug Mode',
							'events': {
								'click': () => this.classList.toggle('debug')
							},
						},{
							'tag': 'button',
							'type': 'button',
							'class': 'fu_icon fu_json',
							'aria-label': 'Edit as JSON',
							'events': {
								'click': () => this.edit_as_json()
							},
						},{
							'tag': 'button',
							'type': 'button',
							'class': 'fu_icon fu_paste',
							'aria-label': 'Paste',
							'events': {
								'click': async () => this.paste()
							},
						},{
							'tag': 'button',
							'type': 'button',
							'class': 'fu_icon fu_copy',
							'aria-label': 'Copy',
							'events': {
								'click': async () => this.copy()
							},
						},
					]
				}, {
					'class': 'fu_dialogs',
					'children': [
						{
							'tag': 'fu-dialog_json',
							'template': {
								'title': 'Edit fields as JSON'
							}
						},{
							'tag': 'fu-dialog_copy',
							'template': {
								'title': 'Unable to use clipboard'
							}
						},{
							'tag': 'fu-dialog_diff',
							'template': {
								'title': 'Compare Fields in JSON'
							}
						},
					],
				},{
					'class': 'fu_datalists',
					'children': template.datalists?.map((datalist)=> {
						return {
							'tag': 'datalist',
							'id': datalist.id,
							'children': datalist.values?.map((option)=> {
								return {
									'tag': 'option',
									'value': option.fu_value ?? '',
									'label': option.fu_label ?? '',
								}
							})
						};
					}),
				},{
					'class': 'fu_container',
					'children': [{
						'tag': 'fu-children',
						'class': 'fu_grid',
						'template': template.fields
					}]
				}
			],
		});
	}
};

customElements.define('fu-main', fu.fields.main);


// /fields/groups/tabs.js

fu.fields.tabs = class fu_fields_tabs extends fu.fields.abstract {

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

		let last_index = 0;

		fu.DOM.attrs(this, {
			'class': 'fu_tabs fu_field',
			'children':[
				{
					'class': 'fu_tabs_buttons',
					'children': [
						template.tabs?.map((tab, index)=> ({
							'tag': 'button', 'type': 'button',
							'id': fu.DOM.getIndex(),
							'class': 'fu_tab_button',
							'data-index': last_index = index,
							'html': tab.fu_label??'',
							'events': {
								'click': (e) => {
									const buttons = this.buttons;
									buttons.forEach((button) => button.classList.remove('fu_switch') );
									buttons[ index ].classList.add('fu_switch');

									const panels = [...this.childNodes[1].childNodes];
									panels.forEach((button) => button.classList.remove('fu_open_tab') );
									panels[ index ].classList.add('fu_open_tab');
								}
							}
						})),						{
							'tag': 'button', 'type': 'button',
							'id': fu.DOM.getIndex(),
							'class': 'fu_tab_button fu_tab_button_debug',
							'data-index': last_index + 1,
							'html': '- Everything -',
							'events': {
								'click': (e) => {
									const buttons = this.buttons;
									buttons.forEach((button) => button.classList.remove('fu_switch') );
									buttons[ last_index + 1 ].classList.add('fu_switch');

									this.panels.forEach((button) => button.classList.add('fu_open_tab') );
								}
							}
						},
					]
				},{
					'class': 'fu_tabs_panels fu_switch fu_container',
					'children': template.tabs?.map(tab => ({
						'tag': 'fu-children',
						'class': 'fu_grid',
						'template': tab.fields??[],
					})),
				},
			],
		});

		this.set_width( this, template );

		this.buttons[0]?.dispatchEvent( new Event('click') );
	}
};

customElements.define('fu-tabs', fu.fields.tabs);


// /fields/groups/radiotabs.js

fu.fields.radiotabs = class fu_fields_radiotabs extends fu.fields.abstract {

	get buttons(){
		return Array.from( this.querySelector('.fu_radiotabs_buttons').childNodes );
	}

	get panels(){
		return Array.from( this.querySelector('.fu_radiotabs_panels').childNodes );
	}

	get value(){
		const panel_value = this.querySelector('.fu_radiotabs_panels').querySelector('.fu_open_tab')?.value;

		const button = this.querySelector('.fu_radiotabs_buttons').querySelector('input:checked');
		if (!button) return panel_value;

		const button_value = button.getAttribute('value');
		const button_name = this.getAttribute('fu_radio_name');

		if ( !button_value || !button_name) {
			return panel_value;
		}

		return { [button_name]: button_value, ...panel_value }
	}

	set value(value){
		const fu_radio_name = this.getAttribute('fu_radio_name');
		const fu_radio_value = value[fu_radio_name];
		if( ( fu_radio_value ) && ( /[a-zA-Z0-9_\-]+/g.test(fu_radio_value) ) ){
			const found = this.querySelector('.fu_radiotabs_buttons').querySelector('input[value="'+fu_radio_value+'"]');
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
		fu.DOM.attrs(this, {
			'class': 'fu_radiotabs fu_field',
			'fu_radio_name': template.fu_name,
			'children':[
				! template.fu_label ? null : {
					'class': 'fu_label',
					'html': template.fu_label
				},
				{
					'class': 'fu_radiotabs_buttons',
					'children': template.tabs?.map((tab, index)=> ({
						'tag': 'label',
						'class': 'fu_radiotab_button',
						'data-index': index,
						'children':[
							{
								'tag': 'input',
								'id': fu.DOM.getIndex(),
								'class': 'fu_radio',
								'type': 'radio',
								'value': tab.fu_value ?? '',
							},{
								'tag': 'span',
								'html': tab.fu_label ?? '',
							}
						],
						'events': {
							'click': (e) => {
								const buttons = this.buttons;
								buttons.forEach((button) => {
									button.classList.remove('fu_switch');
									const radio = button.querySelector('input');
									radio.checked = false;
								});

								const button = buttons[ index ]
								button.classList.add('fu_switch');
								button.querySelector('input').checked = true;

								const panels = this.panels;
								panels.forEach((button) => button.classList.remove('fu_open_tab') );
								panels[ index ].classList.add('fu_open_tab');
							}
						}
					})),
				},{
					'class': 'fu_radiotabs_panels fu_switch fu_container',
					'children': template.tabs?.map(tab => ({
						'tag': 'fu-children',
						'class': 'fu_grid',
						'template': tab.fields??[],
					})),
				},
			],
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-radiotabs', fu.fields.radiotabs);


// /fields/inputs/input.js

fu.fields.input = class fu_fields_input extends fu.fields.abstract {

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
		this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
	}

	get repeater_label(){
		return this.value || '';
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		const index = fu.DOM.getIndex();

		fu.DOM.attrs(this, {
			'fu_name': template.fu_name,
			'class': 'fu_field fu_field_input',
			'children':[
				( ! template.fu_label ) ? null : {
					'tag': 'label',
					'class': 'fu_label',
					'for': index,
					'html': template.fu_label,
				},
				this.create_field( index, template ),
				( ! template.fu_description ) ? null : {
					'class': 'fu_description',
					'html': template.fu_description
				},
			]
		});

		this.set_width( this, template );
	}

}

// /fields/inputs/text.js

fu.fields.text = class fu_fields_text extends fu.fields.input {

	get_input(){
		return this.querySelector('input');
	}

	create_field( index, template ){
		return fu.DOM.create({
			'class': 'fu_input_wrapper',
			'children': [
				( ! template.fu_before ) ? null : {
					'class': 'fu_before',
					'html': ' ' + template.fu_before + ' ',
				},{
					'tag': 'input',
					'id': index,
					'class': 'fu_input',
					'type': template.fu_validate_as ?? 'text',
					'minlength': template.fu_minlength,
					'maxlength': template.fu_maxlength,
					'autocomplete': template.fu_autocomplete,
					'placeholder': template.fu_placeholder,
					'pattern': template.fu_pattern,
					'required': template.fu_required ? true : null,
					'aria-required': template.fu_required ? 'true' : '',
					'readonly': template.fu_readonly ? true : null,
					'list': template.fu_list,
					'events': {
						'input': () => this.dispatchEvent( new CustomEvent( 'fu_field_input' ) )
					},
				},( ! template.fu_after ) ? null : {
					'class': 'fu_after',
					'html': ' ' + template.fu_after + ' ',
				}
			]
		});
	}

};

customElements.define('fu-text', fu.fields.text);


// /fields/inputs/number.js

fu.fields.number = class fu_fields_number extends fu.fields.input {

	get_input(){
		return this.querySelector('input[type="number"]');
	}

	create_field( index, template ){
		return fu.DOM.create({
			'class': 'fu_input_wrapper',
			'children': [
				( ! template.fu_before ) ? null : {
					'class': 'fu_before',
					'html': ' ' + template.fu_before + ' ',
				},{
					'tag': 'input',
					'type': 'number',
					'id': index,
					'class': 'fu_input',
					'min': template.fu_min,
					'max': template.fu_max,
					'step': template.fu_step,
					'placeholder': template.fu_placeholder,
					'pattern': template.fu_pattern,
					'required':template.fu_required,
					'aria-required': template.fu_required ? 'true' : '',
					'readonly':template.fu_readonly,
					'list': template.fu_list,
					'events': {
						'input': () => this.dispatchEvent( new CustomEvent( 'fu_field_input' ) )
					},
				},( ! template.fu_after ) ? null : {
					'class': 'fu_after',
					'html': ' ' + template.fu_after + ' ',
				}
			]
		});
	}

};

customElements.define('fu-number', fu.fields.number);

// /fields/inputs/textarea.js

fu.fields.textarea = class fu_fields_textarea extends fu.fields.input {

	get_input(){ return this.querySelector('textarea'); }

	create_field( index, template ){
		return fu.DOM.create({
			'class': 'fu_input_wrapper',
			'children': [
				{
					'tag': 'textarea',
					'id': index,
					'class': 'fu_input',
					'placeholder': template.fu_placeholder,
					'minlength': template.fu_minlength,
					'maxlength': template.fu_maxlength,
					'required': template.fu_required,
					'aria-required': template.fu_required    ? 'true' : '',
					'readonly': template.fu_readonly,
					'events': {
						'input': () => this.dispatchEvent( new CustomEvent( 'fu_field_input' ) )
					},
				}
			]
		});
	}

};

customElements.define('fu-textarea', fu.fields.textarea);


// /fields/inputs/checkbox.js

fu.fields.checkbox = class fu_fields_checkbox extends fu.fields.input {

	get value(){
		const input = this.get_input();
		return input.checked ? input.value : null;
	}

	set value(value){
		const input = this.get_input();
		input.checked = ( input.value == value );
		this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
	}

	get_input(){
		return this.querySelector('input[type="checkbox"]');
	}

	get repeater_label(){
		const value = this.value;
		if( ! value ) {
			return '';
		}
		const label = this.querySelector('.fu_after');
		if( label ) {
			return label.innerHTML
		}
		return value;
	}

	create_field( index, template ){
		return fu.DOM.create({
			'tag': 'label',
			'for': index,
			'class': 'fu_input_wrapper',
			'children': [
				( ! template.fu_before ) ? null : {
					'class': 'fu_before',
					'html': ' ' + template.fu_before + ' ',
				},{
					'tag': 'input',
					'type': 'checkbox',
					'id': index,
					'class': 'fu_checkbox',
					'value': template.fu_value || '1',
					'required': template.fu_required,
					'aria-required': template.fu_required ? 'true' : '',
					'readonly': template.fu_readonly,
					'events': {
						'change': () => this.dispatchEvent( new CustomEvent( 'fu_field_input' ) )
					},
				},( ! template.fu_after ) ? null : {
					'class': 'fu_after',
					'html': ' ' + template.fu_after + ' ',
				}
			]
		});
	}
};

customElements.define('fu-checkbox', fu.fields.checkbox);


// /fields/inputs/color.js

fu.fields.color = class fu_fields_color extends fu.fields.input {

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
			? '<i class="fu_color_example" style="background:'+this.value+'"></i>' + this.value
			: ''
	}

	create_field( index, template ){
		return fu.DOM.create({
			'class': 'fu_input_wrapper',
			'children': [
				( ! template.fu_before ) ? null : {
					'class': 'fu_before',
					'html': ' ' + template.fu_before + ' ',
				},{
					'class': 'fu_color',
					'children': [
						{
							'tag': 'input',
							'type': 'color',
							'events': {
								'input': () => {
									const color = this.querySelector('input[type="color"]');
									const hex = this.querySelector('input[type="text"]');
									hex.value = color.value;
									this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
								}
							}
						},{
							'tag': 'input',
							'type': 'text',
							'id': index,
							'pattern': '^#[0-9A-Fa-f]{6}$',
							'readonly': template.fu_readonly ? true: null,
							'list': template.fu_list,
							'events': {
								'input': () => {
									const color = this.querySelector('input[type="color"]');
									const hex = this.querySelector('input[type="text"]');
									if (hex.checkValidity()) {
										color.value = hex.value;
									}
									this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
								}
							}
						}
					]
				},( ! template.fu_after ) ? null : {
					'class': 'fu_after',
					'html': ' ' + template.fu_after + ' ',
				}
			]
		});
	}

};

customElements.define('fu-color', fu.fields.color);

// /fields/inputs/hidden.js

fu.fields.hidden = class fu_fields_hidden extends fu.fields.input {

	get_input(){
		return this.querySelector('input');
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		const index = fu.DOM.getIndex();

		fu.DOM.attrs(this, {
			'fu_name': template.fu_name,
			'class': 'fu_field fu_field_input fu_field_hidden',
			'children':[
				{
					'tag': 'label',
					'class': 'fu_label',
					'for': index,
					'html': '<s>Hidden</s>',
				},{
					'class': 'fu_input_wrapper',
					'children': [{
						'tag': 'input',
						'id': index,
						'type': 'text',
						'class': 'fu_input',
					}]
				}
			]
		});
	}

};

customElements.define('fu-hidden', fu.fields.hidden);


// /fields/inputs/checkboxes.js

fu.fields.checkboxes = class fu_fields_checkboxes extends fu.fields.input {

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
		this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
	}

	get inputs(){
		return Array.from(
			this.querySelectorAll('.fu_choices_wrapper input[type="checkbox"]')
		);
	}

	get repeater_label(){
		const labels = [];
		Array.from(
			this.querySelectorAll('input:checked + .fu_checkboxes_label')
		).forEach((label) => {
			labels.push( label.innerHTML.trim() )
		});
		return labels.join(', ');
	}

	create_field( index, template ){
		return fu.DOM.create({
			'class': 'fu_choices_wrapper fu_container',
			'children': [{
				'class': 'fu_grid',
				'children': template.values?.map(config => {
					index = fu.DOM.getIndex();
					return {
						'class': 'fu_input_wrapper',
						'tag': 'label',
						'for': index,
						'children': [
							{
								'tag': 'input',
								'type': 'checkbox',
								'id': index,
								'class': 'fu_checkbox',
								'value': config.fu_value ?? 'undefined checkboxes item value',
								'events': {
									'change': () => this.dispatchEvent( new CustomEvent( 'fu_field_input' ) )
								},
							}, ( ! config.fu_label ) ? null : {
								'class': 'fu_checkboxes_label',
								'html': config.fu_label,
							}
						],
					};
				}),
			}],
		});
	}
};

customElements.define('fu-checkboxes', fu.fields.checkboxes);


// /fields/inputs/radios.js

fu.fields.radios = class fu_fields_radios extends fu.fields.input {

	get value(){
		const checked = this.querySelector('input[type="radio"]:checked');
		return checked ? checked.value : null;
	}

	set value(value){
		const radios =  Array.from( this.querySelectorAll('input[type="radio"]') );
		if( '' == value ) {
			radios.forEach((input) => {
				const input_value = input.getAttribute('value');
				input.checked = ( input_value == null );
			});
		} else {
			radios.forEach((input) => {
				input.checked = ( -1 != value.indexOf( input.value ) )
			});
		}
		this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
	}

	get repeater_label(){
		const after = this.querySelector('input:checked + .fu_radios_label')
		return after ? after.innerHTML : '';
	}

	create_field( index, template ){
		return fu.DOM.create({
			'class': 'fu_choices_wrapper fu_container',
			'children': [{
				'class': 'fu_grid',
				'children': template.values?.map(radio => {
					index = fu.DOM.getIndex();
					return {
						'class': 'fu_input_wrapper',
						'tag': 'label',
						'for': index,
						'children': [
							{
								'tag': 'input',
								'id': index,
								'class': 'fu_radio',
								'type': 'radio',
								'value': radio.fu_value ?? '',
								'events': {
									'change': () => this.value = radio.fu_value ?? '',
								},
							}, ( ! radio.fu_label ) ? null : {
								'class': 'fu_radios_label',
								'html': radio.fu_label,
							}
						]
					};
				})
			}]
		});
	}
};

customElements.define('fu-radios', fu.fields.radios);


// /fields/inputs/select.js

fu.fields.select = class fu_fields_select extends fu.fields.input {

	get value(){
		const select = this.querySelector('select');
		return select.value;
	}

	set value(value){
		const select = this.querySelector('select');
		select.value = value;
		this.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
	}

	get repeater_label(){
		const select = this.querySelector('select');
		if( -1 == select.selectedIndex ) return null;
		if( 0 == select.options.length ) return null;
		return select.options[select.selectedIndex].text ?? null;
	}

	create_field( index, template ){
		return fu.DOM.create({
			'class': 'fu_input_wrapper',
			'children': [
				( ! template.fu_before ) ? null : {
					'class': 'fu_before',
					'html': ' ' + template.fu_before + ' ',
				},{
					'tag': 'select',
					'id': index,
					'class': 'fu_input',
					'children': template.values?.map(config => {
						return {
							'tag': 'option',
							'value': config.fu_value,
							'html': config.fu_label,
						};
					}),
					'events': {
						'change': () => this.dispatchEvent( new CustomEvent( 'fu_field_input' ) )
					},
				},( ! template.fu_after ) ? null : {
					'class': 'fu_after',
					'html': ' ' + template.fu_after + ' ',
				}
			]
		});
	}
};

customElements.define('fu-select', fu.fields.select);


// /fields/repeaters/row.js

fu.fields.row = class fu_fields_row extends fu.fields.group {

	get repeater(){
		return this.closest('.fu_repeater');
	}

	open(){
		this.toggle_open_state(); // Open things after initialization
	}

	toggle_open_state(){
		if( this.classList.contains('fu_open_row') ){
			Array.from( this.querySelectorAll('.fu_open_row') ).forEach(
				el => el.classList.remove('fu_open_row')
			);
		}
		this.classList.toggle('fu_open_row');
		this.repeater.update_open_state();
	}

	button_add_to_top(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fu_icon fu_add to_top',
		'aria-label': 'Add before row',
		'events': {
			'click': (e) => {
				this.repeater.add_row(this, 'before');
			},
		}
	}}

	button_add_to_bottom(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fu_icon fu_add to_bottom',
		'aria-label': 'Add after row',
		'events': {
			'click': (e) => {
				this.repeater.add_row(this, 'after');
			},
		}
	}}

	icon_move(){ return {
		'class': 'fu_icon fu_move'
	}}

	checkbox(){ return {
		'tag': 'label',
		'class': 'fu_r_checkbox',
		'children': [
			{
				'tag': 'input',
				'type': 'checkbox',
				'id': fu.DOM.getIndex(),
				'events': {
					'change': (e) => {
						this.repeater.update_check_state();
					},
				},
			}
		]
	}}

	index(){ return  {
		'class': 'fu_index'
	}}

	button_delete(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fu_icon fu_delete',
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
		'class': 'fu_icon fu_x2',
		'aria-label': 'Duplicate',
		'events': {
			'click': () => {
				const new_row = this.repeater.create_row( this.value );
				new_row.classList.add('fu_open_row');
				this.after(new_row);
			},
		},
	}}

	button_up(){ return {
		'tag': 'button', 'type': 'button',
		'class': 'fu_icon fu_up',
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
		'class': 'fu_icon fu_down',
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
		'class': 'fu_icon fu_toggle',
		'aria-label': 'Open / Close',
		'events': {
			'click': () => this.toggle_open_state(),
		},
	}}


	/**
	 * @param {Object} template
	 */
	set template(template){

		fu.DOM.attrs(this, {
			'id': fu.DOM.getIndex(),
			'class': 'fu_row fu_switch',
			'children':[
				{
					'class': 'fu_header fu_row_header',
					'children':[
						this.icon_move(),
						this.checkbox(),
						this.button_add_to_top(),
						this.button_add_to_bottom(),
						this.index(),
						{
							'class': 'fu_row__labels',
							'events': {
								'click': () => this.toggle_open_state(),
							},
							'children': template.fu_row__labels?.map(config => {
								if( ! config ){
									return;
								}
								return {
									'class': 'fu_label',
									'style': config.width ? `flex-grow:${config.width}` : '',
									'children': [{ 'html': config.fu_label ?? '' }],
								};
							}),
						},{
							'class': 'fu_actions',
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
					'class': 'fu_container',
					'children': [{
						'tag': 'fu-children',
						'class': 'fu_grid',
						'template': template.fields
					}]
				}
			]
		});

		this.querySelector('.fu_row_header').querySelectorAll('[data-from]')?.forEach( (label) => {
			const from = label.getAttribute('data-from');
			let field;

			field = this.querySelector('[fu_name="'+from+'"]');
			if( ! field ) {
				return
			}

			field.addEventListener( 'fu_field_input', (e) => {
				label.innerHTML = '';
				fu.DOM.attrs( label, {
					'html': field.repeater_label
				});
			});
			field.dispatchEvent( new CustomEvent( 'fu_field_input' ) );
		});
	}
};

customElements.define('fu-row', fu.fields.row);


// /fields/repeaters/row_table.js

fu.fields.row_table = class fu_fields_row_table extends fu.fields.row {

	get value(){
		let value = {};
		this.querySelectorAll('.fu_row_fields input[fu_name]').forEach( (field) => {
			const field_name = field.getAttribute('fu_name');
			if( ! field_name ) return;
			const field_value = field.value ?? '';
			if( ! field_value ) return;
			value[field_name] = field_value;
		});
		return Object.keys(value).length ? value : null;
	}

	set value(value){
		if (!value) return;
		this.querySelectorAll('.fu_row_fields input[fu_name]').forEach( (field) => {
			const field_name = field.getAttribute('fu_name');
			const field_value = value[field_name] ?? '';
			field.value = field_value;
		});
	}

	/**
	 * @param {Object} template
	 */
	set template(template){

		fu.DOM.attrs(this, {
			'class': 'fu_row fu_switch',
			'children':[
				{
					'class': 'fu_header fu_row_header',
					'children':[
						this.button_add_to_top(),
						this.button_add_to_bottom(),
						this.icon_move(),
						this.checkbox(),
						this.index(),
						{
							'class': 'fu_row_fields',
							'children': template.fields?.map(field => {
								const index = fu.DOM.getIndex();
								return {
									'tag': 'label',
									'class': 'fu_label',
									'for': index,
									'children':[{
										'tag': 'input',
										'type': field.fu_type??'',
										'fu_name': field.fu_name??'',
										'id': index,
									}]
								};
							})
						},{
							'class': 'fu_actions',
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

customElements.define('fu-row_table', fu.fields.row_table);


// /fields/repeaters/row_array.js

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


// /fields/repeaters/repeater.js


fu.fields.repeater = class fu_fields_repeater extends fu.fields.abstract {

	get value(){
		const value = Array.from(this.rows.childNodes)
			.filter(row => row.classList.contains('fu_row'))
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
		const allRowsOpen = rowNodes.every(row => row.classList.contains('fu_open_row'));
		this.classList.toggle('fu_open_repeater', allRowsOpen);
	}

	toggle_open_state(){
		const rowNodes = Array.from(this.rows.childNodes);
		const allRowsOpen = rowNodes.every(row => row.classList.contains('fu_open_row'));
		if( allRowsOpen ) {
			Array.from( this.querySelectorAll('.fu_open_row') ).forEach(
				el => el.classList.remove('fu_open_row')
			);
		} else {
			rowNodes.forEach(row => row.classList.add('fu_open_row'));
		}
		this.classList.toggle('fu_open_repeater', !allRowsOpen);
	}

	update_check_state(){
		const repeater_checkbox
			= this.querySelector('.fu_repeater_header')
			.querySelector('input[type="checkbox"]');

		const rowNodes = Array.from(this.rows.childNodes);
		const checked = rowNodes.filter(row => {
			const row_checkbox = row.querySelector('.fu_row_header')
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
			= this.querySelector('.fu_repeater_header')
			.querySelector('input[type="checkbox"]');

		const repeater_checked = repeater_checkbox.checked;
		const rows = Array.from(this.rows.childNodes);

		rows.forEach( (row) => {
			const row_checkbox
				= row.querySelector('.fu_row_header')
				.querySelector('input[type="checkbox"]');
			row_checkbox.checked = repeater_checked;
		});
	}

	get_checked_rows() {
		const rowNodes = Array.from(this.rows.childNodes);

		const checkedRows = rowNodes.filter(row => {
			const row_checkbox = row.querySelector('.fu_row_header')
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
			.filter(row => row.tagName.toLowerCase() === 'fu-row')
			.map(row => row.value);

		try {
			const JSON_string = fu.JSON.stringify( values );
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

		if( ( ! template.fu_repeater__labels ) || ( 0 == template.fu_repeater__labels.length ) ){
			this.template_labels = [{ 'fu_label': '' }];
		} else {
			this.template_labels = template.fu_repeater__labels
		}

		// Set up templates

		const template_group_id = this.init_repeater( template );

		// Do it

		fu.DOM.attrs(this, {
			'fu_name': template.fu_name,
			'class': 'fu_repeater fu_field',
			'data-group': template_group_id,
			'children': [
				! template.fu_label || {
					'class': 'fu_label',
					'html': template.fu_label,
				},
				{
					'class': 'fu_input_wrapper fu_repeater_wrapper',
					'children': [
						{
							'class': 'fu_header fu_repeater_header',
							'children':[
								{
									'tag': 'label',
									'class': 'fu_r_checkbox',
									'children': [{
										'tag': 'input',
										'type': 'checkbox',
										'id': fu.DOM.getIndex(),
										'events': {
											'change': (e) => {
												this.toggle_check_state();
												this.update_check_state();
											},
										},
									}]
								},{
									'class': 'fu_for_selected_menu',
									'children': [
										{
											'tag': 'button', 'type': 'button',
											'class': 'fu_icon fu_delete',
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
											'class': 'fu_icon fu_copy',
											'aria-label': 'Copy Selected',
											'events': {
												'click': async () => {
													this.copy_selected();
												}
											}
										}
									],
								},{
									'class': 'fu_repeater__labels',
									'events': {
										'click': (e) => this.toggle_open_state(),
									},
									'children': this.template_labels?.map(label => ({
										'class': 'fu_label',
										'style': label.width ? `flex-grow: ${label.width}` : '',
										'children': [{
											'html': label.fu_label ?? ''
										}],
									})),
								},{
									'class': 'fu_actions',
									'children': [
										{
											'tag': 'button', 'type': 'button',
											'class': 'fu_icon fu_delete',
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
											'class': 'fu_icon fu_json',
											'aria-label': 'Edit as JSON',
											'events': {
												'click': () => {
													this.edit_as_json();
												},
											},
										},{
											'tag': 'button', 'type': 'button',
											'class': 'fu_icon fu_paste',
											'aria-label': 'Paste',
											'events': {
												'click': async (e) => {
													this.paste( true );
												},
											},
										},{
											'tag': 'button', 'type': 'button',
											'class': 'fu_icon fu_copy',
											'aria-label': 'Copy',
											'events': {
												'click': async () => this.copy()
											}
										},{
											'tag': 'button', 'type': 'button',
											'class': 'fu_icon fu_toggle',
											'aria-label': 'Open / Close',
											'events': {
												'click': (e) => this.toggle_open_state(),
											},
										},
									],
								},
							],
						},{
							'tag': 'fu-rows',
						},{
							'tag': 'button', 'type': 'button',
							'class': 'add_button fu_icon fu_add',
							'events': {
								'click': () => this.add_row(this, 'append')
							}
						},
					],
				},
			],
		});

		this.set_width( this, template );

		this.rows = this.querySelector('fu-rows');

		if( 'undefined' == typeof Sortable ) {
			throw new Error('Sortable is not defined, please be sure, that script with SortableJS is loaded before FieldsUX');
		} else {
			this.Sortable = new Sortable( this.rows, {
				group: template_group_id,
				handle: '.fu_icon.fu_move',
				//ghostClass: '',
				animation: 150,
			});
		}
	}

};



// /fields/repeaters/repeater_single.js


fu.fields.repeater_single = class fu_fields_repeater_single extends fu.fields.repeater {

	create_row(value){
		const row = fu.DOM.create({
			'tag': 'fu-row',
			'template': this.single_template,
		});

		row.value = value;

		return row;
	}

	init_repeater( template ){
		const templates = template.templates;
		this.single_template = templates[0];
		this.single_template_id = fu.Templates.register_template(templates[0]);

		return this.template_group_id = fu.Templates.register_group({
			'': this.single_template_id
		});
	}

	add_row(caller, position){
		document.activeElement.blur();

		const created_row = this.create_row();
		created_row.classList.add('fu_open_row');

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

customElements.define('fu-repeater_single', fu.fields.repeater_single);


// /fields/repeaters/repeater_table.js


fu.fields.repeater_table = class fu_fields_repeater_table extends fu.fields.repeater_single {

	create_row(value){
		const row = fu.DOM.create({
			'tag': 'fu-row_table',
			'template': this.single_template,
		});

		row.value = value;

		return row;
	}

	init_repeater( template ){
		this.single_template = template.templates[0];
		this.single_template_id = fu.Templates.register_template(template.templates[0]);

		this.template_labels = this.single_template.fields?.map(field => {
			return {
				'fu_label': field.fu_label??'',
				'width': field.width??'',
			};
		});

		return this.template_group_id = fu.Templates.register_group({
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

customElements.define('fu-repeater_table', fu.fields.repeater_table);


// /fields/repeaters/repeater_array.js


fu.fields.repeater_array = class fu_fields_repeater_array extends fu.fields.repeater_table {

	array_template(){
		return {
			"fields": [{
				"fu_type": "text",
				"fu_name": "fu_row_array_field",
			}]
		}
	}

	create_row(value){
		const row = fu.DOM.create({
			'tag': 'fu-row_array',
			'template': this.single_template,
		});

		row.value = value;

		return row;
	}

	init_repeater( template ){
		const forced_template = this.array_template();
		this.single_template = forced_template;
		this.single_template_id = fu.Templates.register_template(forced_template);

		this.template_labels = [{
			"fu_label": template.heading ?? ""
		}];

		return this.template_group_id = fu.Templates.register_group({
			'': this.single_template_id
		});
	}

};

customElements.define('fu-repeater_array', fu.fields.repeater_array);


// /fields/repeaters/repeater_multiple.js


fu.fields.repeater_multiple = class fu_fields_repeater_multiple extends fu.fields.repeater {

	init_repeater( template ){
		const templates = template.templates;
		this.type_to_ID = templates.reduce((acc, tmpl) => {
			acc[tmpl.fu_type] = fu.Templates.register_template(tmpl);
			return acc;
		}, {});

		if( 0 == Object.keys(this.type_to_ID).length ) {
			fu.DOM.attrs(this, {
				'html': 'No Templates'
			});
			return;
		}

		this.picker_options = [{}].concat(templates.map(template => ({
			'fu_type': template.fu_type,
			'fu_label': template.fu_label
		})));

		if( template.picker ){
			this.picker = template.picker;
		}

		return this.template_group_id = fu.Templates.register_group( this.type_to_ID );
	}

	create_row(value){
		let ID = this.type_to_ID[ value['fu_type'] ];
		let template_type = value.fu_type;

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


		const template = fu.Templates.get_template( ID );

		const row = fu.DOM.create({
			'tag': 'fu-row',
			'template': template,
		});

		const picker = row.querySelector('[fu_name="fu_type"]');
		if( picker ) {
			picker.addEventListener( 'input', (e) => {
				const new_row = this.create_row( row.value );
				if( new_row ) {
					new_row.value = row.value;
					new_row.classList.add('fu_open_row');
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
					'fu_type': option.getAttribute('value'),
					'fu_label': option.getAttribute('label'),
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

		const pseudo_row = fu.DOM.create({
			'class': 'row_add_row fu_switch fu_picker_' + picker_id,
			'children': [
				{
					'class': 'fu_backdrop',
					'events': {
						'click': (e) => pseudo_row.remove()
					},
				},{
					'class': 'fu_add_header',
					'children': [
						{
							'class': 'fu_icon fu_add_row',
						},{
							'class': 'fu_add_label',
							'children': [{
								'html': 'Add new row',
							}],
						},{
							'tag': 'button', 'type': 'button',
							'class': 'fu_icon fu_delete',
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
					'class': 'fu_add_options',
					'children': (()=>{
						let actual = null;
						const optgroup = [];
						picker.forEach(option => {
							if( option.fu_type ) {
								if( ! actual ) {
									optgroup.push({'class': 'fu_label'});
									optgroup.push( actual = {
										'class': 'fu_group',
										'children': []
									} );
								}
								actual.children.push({
									'tag': 'button', 'type': 'button',
									'class': ( ! this.type_to_ID[option.fu_type] ) ? 'template_not_defined' : '',
									'html': option.fu_label ?? '???',
									'data-fu_type': option.fu_type,
									'events': {
										'click': (e) => {
											const created_row = this.create_row({ 'fu_type': option.fu_type });
											if( null === created_row ) {
												return;
											}
											created_row.classList.add('fu_open_row');
											pseudo_row.replaceWith(created_row);
											document.removeEventListener('keydown', this.esc_listener);
										},
									},
								});
							} else {
								optgroup.push({
									'class': 'fu_label',
									'html': option.fu_label ?? '???',
								});
								optgroup.push( actual = {
									'class': 'fu_group',
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

customElements.define('fu-repeater_multiple', fu.fields.repeater_multiple);

// /fields/html/h1.js

fu.fields.h1 = class fu_fields_h1 extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'children':[{
				'tag': 'h1',
				'html': template.fu_label ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-h1', fu.fields.h1);

// /fields/html/h2.js

fu.fields.h2 = class fu_fields_h2 extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'children':[{
				'tag': 'h2',
				'html': template.fu_label ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-h2', fu.fields.h2);

// /fields/html/h3.js

fu.fields.h3 = class fu_fields_h3 extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'children':[{
				'tag': 'h3',
				'html': template.fu_label ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-h3', fu.fields.h3);

// /fields/html/p.js

fu.fields.p = class fu_fields_p extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'children':[{
				'tag': 'p',
				'html': template.fu_label ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-p', fu.fields.p);

// /fields/html/img.js

fu.fields.img = class fu_fields_img extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'children':[{
				'tag': 'img',
				'src': template.src ?? ''
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-img', fu.fields.img);

// /fields/html/a.js

fu.fields.a = class fu_fields_a extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'children':[{
				'tag': 'a',
				'html': template.fu_label ?? '',
				'href': template.href ?? '#',
				'target': template.target ?? '_blank',
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-a', fu.fields.a);

// /fields/html/br.js

fu.fields.br = class fu_fields_br extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		const height = template.height ? template.height : '32px';
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'style': 'height:' + height
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-br', fu.fields.br);

// /fields/html/hr.js

fu.fields.hr = class fu_fields_hr extends fu.fields.abstract {
	/**
	 * @param {Object} template
	 */
	set template(template){
		fu.DOM.attrs(this, {
			'class': 'fu_html',
			'children':[{
				'tag': 'hr',
			}]
		});

		this.set_width( this, template );
	}
};

customElements.define('fu-hr', fu.fields.hr);


fu.init();



})();
