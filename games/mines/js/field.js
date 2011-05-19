
Mines.Field = atom.Class({
	Implements: [ atom.Class.Options ],
	
	Generators: {
		size: function () {
			return this.engine.countSize();
		},
		rect: function () {
			return new Rectangle({ from: [0,0], size: this.size });
		},
		engine: function () {
			return new LibCanvas.Engines.Tile( this.libcanvas )
				.setSize( this.options.tileSize )
				.createMatrix( this.options.fieldSize, 'closed' );
		}
	},

	/** created in "generate" */
	field: null,
	/** number of flags on the field */
	marked: 0,
	/** number of closed cells left */
	closed: 0,
	/** is game failed already? */
	failed: false,
	/** created in "startTime" */
	stopWatch: null,

	initialize: function (libcanvas, options) {
		this.setOptions( options );
		this.libcanvas = libcanvas;

		var engine = this.engine;
		this.closed = engine.width * engine.height;
		new Mines.Draw( engine, libcanvas.size( this.size, true ) );
		engine.update();
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

	startTime: function () {
		if (!this.stopWatch) {
			this.stopWatch = new StopWatch(true);
		}
	},

	getTile: function (point) {
		return new Mines.Tile(
			this.engine.getCell( point )
		).belongsTo( this.matrix );
	},

	openClosed: function (tile, value) {
		if (value == 'mine') {
			this.fail( tile );
			return;
		}

		if (value == 0) {
			tile.value = 'empty';
			this.openFlood( tile.neighbours );
		} else {
			tile.value = value;
		}

		if (--this.closed <= this.options.mines) this.win();
	},

	openFlood: function (tiles) {
		for (var i = tiles.length; i--;) {
			this.open( tiles[i], true );
		}
	},

	openNeighbours: function (tile, value) {
		if (value && value.between(1, 8, true) && tile.countNeighbours('flag') == value) {
			this.openFlood( tile.neighbours );
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
		Mines.Tile.each(this.field, function ( tile ) {
			var current = tile.clone().belongsTo( this.matrix ),
				t = tile.value,
				c = current.value;

				if (t == 'mine' && c != 'flag') current.value = 'mine';
				if (t != 'mine' && c == 'flag') current.value = 'wrong';
		}.bind(this));
		explode.value = 'explode';
		this.failed   = true;
	},
	
	win: function () {
		Mines.Tile.each( this.field, function ( tile ) {
			if (tile.value == 'closed') tile.value = 'flag';
		});

		alert.delay(100, window, ['Congratulations! Mines has been neutralized in '+this.time+'!']);
	},

	flag: function (tile) {
		var value = tile.toggleValue( 'flag', 'closed' );
		if (value) {
			if (value == 'flag'  ) this.marked++;
			if (value == 'closed') this.marked--;
			return true;
		}
		return false;
	},

	isFlag: function (tile, flag) {
		return flag && ['flag', 'closed'].contains( tile.value );
	},

	action: function (point, flag) {
		if (this.failed) return;

		this.startTime();

		point = this.getTile( point );

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