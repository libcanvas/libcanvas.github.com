atom.declare( 'Fifteen.Field', {
	initialize: function (settings) {
		var app, layer, mouse;

		this.settings = new atom.Settings( settings );

		app = new LibCanvas.App({
			size: this.size(),
			simple: true
		});

		mouse = new Mouse(app.container.bounds);
		this.mouseHandler = new App.MouseHandler({ mouse: mouse, app: app });
		
		layer = app.createLayer({ intersection: 'manual' });

		this.generate( layer );
		this.bindTouch();

		this.activate(false);
		this.shuffle(100);
	},

	bindTouch: function () {
		var tiles = this.tiles;
		document.addEventListener( 'touchstart', function (e) {
			var
				offset = Mouse.getOffset(e),
				y, x, t;

			for (y in tiles) for (x in tiles[y]) {
				t = tiles[y][x];
				if (t && t.isTriggerPoint(offset)) {
					this.move(t);
					break;
				}
			}
			e.preventDefault();
		}.bind(this), false);

		document.addEventListener( 'touchmove', Mouse.prevent, false );
		document.addEventListener( 'touchend' , Mouse.prevent, false );
	},

	move: function (tile, onFinish, fast) {
		if (tile.activated && !this.blocked) {
			var empty = this.empty, position = tile.position;

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
		this.move( atom.array.random(t), onFinish, true );
		return this;
	},

	shuffle: function (times) {
		var trace = atom.trace( times );
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
		var pos = tile.position, empty = this.empty, diff = pos.diff(empty);
		return (diff.x == 0 && Math.abs(diff.y) == 1) || (diff.y == 0 && Math.abs(diff.x) == 1);
	},

	generate: function (layer) {
		var
			y, x, position, index,
			tiles = {},
			indexes = atom.array.range( 1, 15 );
		for (y = 0; y < 4; y++) {
			tiles[y] = {};
			for (x = 0; x < 4; x++) {
				position = new Point( x, y );
				if (indexes.length) {
					index = indexes.shift();
					tiles[y][x] = this.createTile( layer, index, position );
				} else {
					this.empty = position;
				}
			}
		}

		this.tiles = tiles;
		return this;
	},

	createTile: function (layer, index, position) {
		var tile = new Fifteen.Tile( layer, {
			position: position,
			shape: this.tileShape(position),
			index: index
		});
		this.mouseHandler.subscribe(tile);
		tile.events.add( 'mousedown', function (e) {
			e.preventDefault();
			this.move( tile );
		}.bind(this));

		return tile;
	},

	size: function () {
		var tile = this.settings.get( 'tile' );
		return new Size(
			4 * tile.width  + 5 * tile.margin + 1,
			4 * tile.height + 5 * tile.margin + 1
		);
	},

	translatePoint: function (pos) {
		var size = this.settings.get('tile');
		return new Point(pos.x * (size.width + size.margin) + size.margin , pos.y * (size.height + size.margin) + size.margin);
	},
	
	tileShape: function (pos) {
		return new Rectangle({
			from: this.translatePoint(pos),
			size: this.settings.get('tile')
		});
	}
});