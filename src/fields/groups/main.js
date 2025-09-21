

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
