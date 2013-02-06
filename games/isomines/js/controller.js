/** @class IsoMines.Controller */
atom.declare( 'IsoMines.Controller', {
	initialize: function () {
		atom.ImagePreloader.run({
			'gates-animation'   : 'im/gates.png',

			'gates-opened': 'im/gates.png [180:104]{11:1}',
			'gates-closed': 'im/gates.png [180:104]{0:1}',
			'gates-locked': 'im/gates.png [180:104]{11:0}',

			'static-carcass-0'  : 'im/static.png [180:104]{0:0}',
			'static-carcass-1'  : 'im/static.png [180:104]{1:0}',
			'static-carcass-2'  : 'im/static.png [180:104]{2:0}',
			'static-carcass-3'  : 'im/static.png [180:104]{3:0}',
			'static-carcass-4'  : 'im/static.png [180:104]{4:0}',
			'static-carcass-5'  : 'im/static.png [180:104]{5:0}',
			'static-background' : 'im/static.png [180:104]{6:0}',

			'static-mine'       : 'im/static.png [180:104]{0:1}',
			'static-number-1'   : 'im/static.png [180:104]{1:1}',
			'static-number-2'   : 'im/static.png [180:104]{2:1}',
			'static-number-3'   : 'im/static.png [180:104]{3:1}',
			'static-number-4'   : 'im/static.png [180:104]{4:1}',
			'static-number-5'   : 'im/static.png [180:104]{5:1}',
			'static-number-6'   : 'im/static.png [180:104]{6:1}',
			'static-number-7'   : 'im/static.png [180:104]{7:1}',
			'static-number-8'   : 'im/static.png [180:104]{8:1}',

			'walls-right-empty' : 'im/walls.png [90:105]{2:0}',
			'walls-right-arrows': 'im/walls.png [90:105]{3:0}',
			'walls-left-empty'  : 'im/walls.png [90:105]{2:1}',
			'walls-left-arrows' : 'im/walls.png [90:105]{3:1}'
		}, this.start.bind(this) );
	},

	start: function (images) {
		this.size  = new Size(8, 8);
		this.mines = 10;

		this.images = images;
		this.view = new IsoMines.View( this, this.size );
	}

});