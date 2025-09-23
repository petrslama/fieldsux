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