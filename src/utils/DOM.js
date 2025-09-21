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