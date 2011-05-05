
Mines.Field = atom.Class({
	Implements: [ atom.Class.Options ],


	initialize: function (libcanvas, options) {
		this.setOptions(options);

		this.libcanvas = libcanvas.createLayer('field', Infinity, { backBuffer: 'off' });

		this.engine = new LibCanvas.Engines.Tile( this.libcanvas )
			.setSize( this.options.tileSize )
			.createMatrix( this.options.fieldSize, 'closed' );

		new Mines.Draw( this.engine );

		this.libcanvas.size( this.engine.countSize() ).shift( this.options.fieldShift );

		this.engine.update();
	},

	get matrix () {
		return this.engine.matrix;
	},

	open: function (tile, sub) {
		var value = this.field[tile.y][tile.x];
		if (tile.value == 'closed') {
			tile.value = value || 'empty';

			if (value == 0) {
				tile.eachNeighbour(function (tile) {
					this.open( tile, true );
				}.bind(this));
			} else if (value == 'mine') {
				this.fail();
			}
			if (!sub) this.engine.update();
		} else if (!sub && Array.range(1,8).contains(value)) {

			if (tile.countNeighbours('flag') == value) {
				tile.eachNeighbour(function (tile) {
					this.open( tile, true );
				}.bind(this));
				this.engine.update();
			}
		}
	},

	fail: function () {
		var m = this.matrix, f = this.field, y = f.length, width = f[0].length, x;
		for (; y--;) for (x = width; x--;) {
			var tile = new Mines.Tile(x, y);
			tile.matrix = f;
			if (tile.value == 'mine') {
				tile.matrix = m;
				tile.value = 'mine';
			}
		}
	},

	flag: function (tile) {
		tile.toggleValue( 'flag', 'closed' );
		this.engine.update();
	},

	click: function (point, flag) {
		
		point = new Mines.Tile( this.engine.getCell( point ) );

		if (!this.field) this.generate(point);

		point.matrix = this.matrix;
		if (['closed', 'flag'].contains(point.value) && flag) {
			this.flag( point )
		} else {
			this.open( point, false );
		}
	},

	generate: function (point) {
		this.field = new Mines.Generator( this.options.fieldSize, this.options.mines, 'mine' ).generate( point );
	}
});