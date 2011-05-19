
Mines.Controller = atom.Class({
	Implements: [ atom.Class.Options ],

	options: {
		 tileSize : { width: 24, height: 24 },
		fieldSize : { width: 30, height: 16 },
		mines: 99
	},

	initialize: function (canvas, options) {
		this.setOptions( options );

		var libcanvas = new LibCanvas(canvas, {
				backBuffer: 'off',
				preloadImages: { field : 'im/flag-mine.png' }
			}).listenMouse();

		libcanvas.addEvent('ready', this.start.bind(this, libcanvas));
	},

	start: function (libcanvas) {
		var field = new Mines.Field( libcanvas, this.options );

		libcanvas.mouse.addEvent({
			// wheel : function () {},
			click      : this.eventListener(field, false),
			contextmenu: this.eventListener(field, true)
		});

		this.showStats(field);
	},

	eventListener: function (field, flags) {
		return function (e) {
			field.action( e.offset , flags || e.button > 0 );
			e.preventDefault();
		};
	},

	showStats: function (field) {
		var $stat  = atom.dom('.stat'),
		    $tiles = $stat.find('.tiles-left em'),
		    $mines = $stat.find('.mines-left em'),
		    $time  = $stat.find('.time em');

		(function () {
			$tiles.html( field.closed );
			$mines.html( field.minesLeft );
			//$time .html( field.time || 'waiting' );
		}.periodical(200, this));
	}

});