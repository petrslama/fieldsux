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