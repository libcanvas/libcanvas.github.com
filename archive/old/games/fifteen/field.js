
Fifteen.Field = atom.Class({
	Extends: atom.Class.Options,

	initialize: function (options) {
		var app, scene;

		this.setOptions( options );

		app = new LibCanvas.App( 'canvas', {
				mouse : true,
				width : this.size('width'),
				height: this.size('height')
			});
		
		scene = app.createScene( 'cells', { intersection: 'manual' });
		this.generate( scene );

		this.bindTouch(app.libcanvas.mouse);

		this.activate(false);
		this.shuffle(100);
	},

	bindTouch: function (mouse) {
		var tiles = this.tiles;
		document.addEventListener( 'touchstart', function (e) {
			var
				offset = mouse.getOffset(e),
				y, x, t;

			for (y in tiles) for (x in tiles[y]) {
				t = tiles[y][x];
				if (t && t.shape.hasPoint(offset)) {
					this.move(t);
					break;
				}
			}
			e.preventDefault();
		}.bind(this), false);

		var prevent = function(e){e.preventDefault()};
		document.addEventListener( 'touchmove', prevent, false );
		document.addEventListener( 'touchend' , prevent, false );
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
				this.activate( false );
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

	generate: function (scene) {
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
					tiles[y][x] = this.createTile( scene, index, position );
				} else {
					this.empty = position;
				}
			}
		}

		this.tiles = tiles;
		return this;
	},

	createTile: function (scene, index, position) {
		var tile = new Fifteen.Tile( scene, {
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