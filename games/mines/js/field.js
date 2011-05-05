
Mines.Field = atom.Class({
	Implements: [ atom.Class.Options ],

	marked: 0,
	closed: 0,
	failed: false,
	stopWatch: null,

	initialize: function (libcanvas, options) {
		this.setOptions(options);

		this.libcanvas = libcanvas.createLayer('field', Infinity, { backBuffer: 'off' });

		var engine = this.engine =
			new LibCanvas.Engines.Tile( this.libcanvas )
				.setSize( this.options.tileSize )
				.createMatrix( this.options.fieldSize, 'closed' );

		this.closed = engine.width * engine.height;

		new Mines.Draw( engine, this.libcanvas );

		this.libcanvas.size( engine.countSize() ).shift( this.options.fieldShift );

		this.engine.update();
	},

	get matrix () {
		return this.engine.matrix;
	},

	get time () {
		return this.stopWatch && this.stopWatch.getTime('{m}:{s}');
	},

	get minesLeft () {
		return this.options.mines - this.marked;
	},

	openClosed: function (tile, value) {
		tile.value = value || 'empty';
		if (value == 0) {
			tile.eachNeighbour(function (tile) {
				this.open( tile, true );
			}.bind(this));
		} else if (value == 'mine') {
			return this.fail( tile );
		}
		if (--this.closed <= this.options.mines) {
			this.win();
		}
	},

	openNeighbours: function (tile, value) {
		if (value && value.between(1, 8, true) && tile.countNeighbours('flag') == value) {
			// avoid too deep "Maximum call stack size exceeded", dont use eachNeighbour

			var n = tile.neighbours;
			for (var i = n.length; i--;) {
				if (n[i].exists) this.open( n[i], true );
			}
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
		this.failed = true;
	},
	
	win: function () {
		var m = this.matrix, y = m.length, width = m[0].length, x;
		for (; y--;) for (x = width; x--;) {
			var tile = new Mines.Tile(x, y);
			tile.matrix = m;
			if (tile.value == 'closed') {
				tile.value = 'flag';
			}
		}

		alert.delay(100, window, ['Поздравляем! Вы - обезвредили все мины за ' + this.time + '!']);
	},

	flag: function (tile) {
		var val = tile.toggleValue( 'flag', 'closed' );
		if (val) {
			this.marked += val == 'flag' ? 1 : -1;
		}
		return true;
	},

	isFlag: function (tile, flag) {
		return flag && ['flag', 'closed'].contains( tile.value );
	},

	click: function (point, flag) {
		if (this.failed) return;

		if (!this.stopWatch) {
			this.stopWatch = new StopWatch(true);
		}

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