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

			'walls-right-empty': 'im/walls.png [90:104]{2:0}',
			'walls-right-arrow': 'im/walls.png [90:104]{3:0}',
			'walls-left-empty' : 'im/walls.png [90:104]{2:1}',
			'walls-left-arrow' : 'im/walls.png [90:104]{3:1}'
		}, this.start.bind(this) );
	},

	start: function (images) {
		this.size  = new Size(16, 16);
		this.mines = 40;
		this.images = images;

		this.screenfull();
		this.launch();
	},

	screenfull: function () {
		if (!screenfull.enabled) return;

		atom.dom.create('p')
		    .html('Click here to <b>fullscreen</b>')
		    .appendTo('body')
			.bind('click', function () {
				screenfull.request( this.view.app.container.wrapper.first );
			}.bind(this));

	    screenfull.onchange = function() {
		    this.view.fullscreen(screenfull.isFullscreen);
	    }.bind(this);
	},

	launch: function () {
		this.view = new IsoMines.View( this, this.size );
		this.generator = new IsoMines.Generator( this.size, this.mines );
	},

	checkReady: function (point) {
		if (!this.generator.isReady()) {
			var gen = this.generator.generate(point);

			this.view.cells.forEach(function (cell) {
				cell.value = gen.isMine(cell.point) ?
					'mine' : gen.getValue(cell.point);
			});

		}
	}

});