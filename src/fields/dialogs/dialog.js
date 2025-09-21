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