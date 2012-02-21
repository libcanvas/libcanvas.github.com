atom.declare( 'Arkanoid.Controller',
/**
 * @lends Arkanoid.Controller#
 */
{
	/** @constructs */
	initialize: function () {
		this.fieldSize = new Size( 300, 450 );

		var app = new App({ size: this.fieldSize });

		this.drawBackground( app.createScene('background').ctx );
		this.cellsScene  = app.createScene({ name: 'cells' , intersection: 'manual' });
		this.activeScene = app.createScene({ name: 'active', invoke: true });
		this.cells    = this.createCells(this.level);
		this.platform = this.createPlatform(new Point( 150, 430 ), new Size(100, 8));
		this.keyboard = new atom.Keyboard();
		this.createBall(new Point( 160, 420 ));
	},

	get level () {
		var level = Number( location.search.substr(1) || -1 );
		return Arkanoid.levels[level] || Arkanoid.levels.random;
	},

	drawBackground: function (ctx) {
		ctx.fillAll( ctx.createGradient( ctx.rectangle, {
			'0.0': '#cfc',
			'0.2': '#efe',
			'0.4': '#efe',
			'1.0': '#9d9'
		}));
	},

	createCells: function (level) {
		var x, y, cells = new Arkanoid.Cells(this.cellsScene, 5);
		for (x = 1; x < 14; x++) for (y = 4; y < 27; y++) {
			if (level(x, y)) cells.create( x, y );
		}
		return cells;
	},

	createBall: function (center) {
		return new Arkanoid.Ball( this.activeScene, {
			shape: new Circle( center, 5 ),
			controller: this
		});
	},

	createPlatform: function (center, size) {
		return new Arkanoid.Platform( this.activeScene, {
			shape: new Rectangle(
				new Point(
					center.x - size.width / 2,
					center.y - size.height/ 2
				), size),
			speed: 200,
			controller: this
		});
	}
});