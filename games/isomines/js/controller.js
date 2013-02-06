/** @class IsoMines.Controller */
atom.declare( 'IsoMines.Controller', {
	initialize: function () {
		atom.ImagePreloader.run({
			'connect': 'im/connect.png',
			'gates'  : 'im/gates.png',
			'static' : 'im/static.png',
			'walls'  : 'im/walls.png'
		}, this.start.bind(this) );
	},

	start: function (images) {
		this.size  = new Size(10, 10);
		this.mines = 10;

		this.images = images;
		this.view = new IsoMines.View( this, this.size );
	}

});