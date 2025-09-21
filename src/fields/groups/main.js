

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
					'class': 'fu_main_header',
					'children':[
						{
							'tag': 'strong',
							'html': template.fu_label ?? '',
						},{
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
						'template': template.fields
					}]
				}
			],
		});
	}
};

customElements.define('fu-main', fu.fields.main);
