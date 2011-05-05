
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

	openClosed: function (tile, value) {
		tile.value = value || 'empty';

		if (value == 0) {
			tile.eachNeighbour(function (tile) {
				this.open( tile, true );
			}.bind(this));
		} else if (value == 'mine') {
			this.fail( tile );
		}
	},

	openNeighbours: function (tile, value) {
		if (value && value.between(1, 8, true) && tile.countNeighbours('flag') == value) {
			tile.eachNeighbour(function (tile) {
				this.open( tile, true );
			}.bind(this));
			return true;
		}
		return false;
	},

	open: function (tile, sub) {
		var value = this.field[tile.y][tile.x];
		if (tile.value == 'closed') {
			this.openClosed( tile, value );
			return !sub;
		} else if (!sub && this.openNeighbours( tile, Number(value) )) {
			return true;
		}
		return false;
	},

	fail: function ( explode ) {
		var m = this.matrix, f = this.field, y = f.length, width = f[0].length, x;
		for (; y--;) for (x = width; x--;) {
			var tile = new Mines.Tile(x, y), current = tile.clone();
			tile.matrix    = f;
			current.matrix = m;
			if (tile.value == 'mine') {
				if (current.value != 'flag') current.value = 'mine';
			} else if (current.value == 'flag') {
				current.value = 'wrong';
			}
		}
		explode.value = 'explode';
	},

	flag: function (tile) {
		tile.toggleValue( 'flag', 'closed' );
		return true;
	},

	isFlag: function (tile, flag) {
		return flag && ['flag', 'closed'].contains( tile.value );
	},

	click: function (point, flag) {
		point = new Mines.Tile( this.engine.getCell( point ) );
		point.matrix = this.matrix;

		if (!this.field) this.generate(point);

		var redraw = this.isFlag( point, flag ) ?
			this.flag( point ):
			this.open( point );

		if (redraw) this.engine.update();
	},

	generate: function (point) {
		this.field = new Mines.Generator( this.options.fieldSize, this.options.mines, 'mine' ).generate( point );
	}
});