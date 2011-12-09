
Fifteen.Field = atom.Class({
	Extends: atom.Class.Options,

	initialize: function (options) {
		var libcanvas, scene;

		this.setOptions( options );

		libcanvas = new LibCanvas( 'canvas', {
				invoke: true,
				fps   : 40,
				clear : false
			})
			.listenMouse()
			.size( this.size( 'width' ), this.size( 'height' ), true )
			.start();
		
		scene = new LibCanvas.Scene.Standard( libcanvas, { intersection: 'manual' });
		this.generate( scene.createFactory( Fifteen.Tile ) );

		this.activate();
		this.shuffle( 128 );

		libcanvas.mouse.addEvent( ['down', 'up', 'click' ], function (e) { e.preventDefault() });
	},

	move: function (tile, onFinish, fast) {
		if (tile.activated && !this.blocked) {
			var empty = this.empty, position = tile.options.position;

			this.blocked = true;
			this.activate( true );

			tile.moveTo( this.translatePoint( empty ), function () {
				var newPosition = empty.clone();
				empty.moveTo( position );
				position.moveTo( newPosition );
				this.activate();
				this.blocked = false;
				onFinish && onFinish.call( this, tile );
			}.bind(this), fast);
		}
		return this;
	},

	moveRandom: function (onFinish, previous) {
		var x, y, t = [], tiles = this.tiles;
		for (x = 4; x--;) for (y = 4; y--;) {
			var tile = tiles[y][x];
			if (tile && tile.activated && tile != previous) t.push( tile );
		}
		this.move( t.random, onFinish, true );
		return this;
	},

	shuffle: function (times) {
		var trace = new Trace( times );
		var field = this;
		(function next (tile) {
			if (times-- > 0) {
				trace.value = times;
				field.moveRandom(next, tile);
			} else {
				trace.destroy();
			}
		})(null);
		return this;
	},

	activate: function ( disableAll ) {
		var y, x, tile;
		for (y = 0; y < 4; y++) for (x = 0; x < 4; x++) {
			tile = this.tiles[y][x];
			if (tile) {
				tile.activated = disableAll ? false : this.isMovable( tile );
				tile.redraw();
			}
		}
		return this;
	},

	isMovable: function ( tile ) {
		var pos = tile.options.position, empty = this.empty, diff = pos.diff(empty);
		return (diff.x == 0 && diff.y.abs() == 1) || (diff.y == 0 && diff.x.abs() == 1);
	},

	generate: function (factory) {
		var
			y, x, position, index,
			tiles = {},
			indexes = Array.range( 1, 15 );
		for (y = 0; y < 4; y++) {
			tiles[y] = {};
			for (x = 0; x < 4; x++) {
				position = new Point( x, y );
				if (indexes.length) {
					index = indexes.shift();
					tiles[y][x] = this.createTile( factory, index, position );
				} else {
					this.empty = position;
				}
			}
		}
		this.tiles = tiles;
		return this;
	},

	createTile: function (factory, index, position) {
		var tile = factory({
			position: position,
			shape: this.tileShape(position),
			index: index
		})
		.redraw()
		.addEvent( 'mousedown', function (e) {
			e.prevent().stop();
			this.move( tile );
		}.bind(this));
		return tile;
	},

	size: function (size) {
		var tile = this.options.tile;
		return 4 * tile[size] + 5 * tile.margin + 1;
	},

	translatePoint: function (pos) {
		var opt = this.options, size = opt.tile;
		return new Point(pos.x * (size.width + size.margin) + size.margin , pos.y * (size.height + size.margin) + size.margin);
	},
	
	tileShape: function (pos) {
		return new Rectangle({
			from: this.translatePoint(pos),
			size: this.options.tile
		});
	}
});