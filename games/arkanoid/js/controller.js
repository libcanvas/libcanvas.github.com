Arkanoid.Controller = atom.Class(
/**
 * @lends Arkanoid.Controller#
 */
{
	options: {
		platform: {
			width : 100,
			height: 8
		}
	},

	/** @constructs */
	initialize: function () {
		this.libcanvas = new LibCanvas( 'canvas', {
				clear : false,
				invoke: true,
				fps: 60
			})
			.start()
			.listenKeyboard()
			.size( 300, 450, true );

		this.drawBackground( this.libcanvas.ctx );

		this.cellsScene  = new LibCanvas.Scene.Standard( this.libcanvas.createLayer( 'cells'  ), { intersection: 'manual' });
		this.activeScene = new LibCanvas.Scene.Standard( this.libcanvas.createLayer( 'active' ) );
		this.cells    = this.createCells();
		this.platform = this.createPlatform(new Point( 150, 430 ));
		this.createBall(new Point( 150, 420 ));
	},

	drawBackground: function (ctx) {
		ctx.fillAll( ctx.createGradient( ctx.rectangle, {
			'0.0': '#cfc',
			'0.2': '#efe',
			'0.4': '#efe',
			'1.0': '#9d9'
		}));
	},

	createCells: function () {
		var x, y, cells = new Arkanoid.Cells(this.cellsScene, 5);
		for (x = 2; x < 13; x++) for (y = 4; y < 27; y++) {
			if (y !=  9 && y != 15 && y != 21) cells.create( x, y );
		}
		return cells;
	},

	createBall: function (center) {
		return new Arkanoid.Ball( this.activeScene, {
			shape   : new Circle( center, 5 ),
			platform: this.platform,
			cells   : this.cells
		});
	},

	createPlatform: function (center) {
		var platform = this.options.platform;
		return new Arkanoid.Platform( this.activeScene, {
			shape: new Rectangle({
				from: center.clone().move( [-platform.width/2, -platform.height/2] ),
				size: platform
			})
		});
	}
});