/**
	{0:[0,1,2,3]
	.1:[0,1,2,3]
	.2:[0,1,2,3]
	.3:[0,1,2,3]
	}
 */

var Field = atom.Class({
	Extends: Drawable,

	Implements: [ atom.Class.Options ],

	zIndex: 5,

	blocked: false,

	options: {
		tile  : { width: 32, height: 32 },
		margin: { horisontal: 8, vertical: 8 }
	},
	/**
	 * @var {Tiles[][]} tiles
	 */
	tiles: null,

	/**
	 * @var {Point} empty
	 */
	empty: null,

	get size () {
		var opt = this.options;
		return {
			width : opt.tile.width  * 4 + opt.margin.horisontal * 2,
			height: opt.tile.height * 4 + opt.margin.vertical * 2
		};
	},

	initialize: function (options) {
		this.setOptions(options);
		this.addEvent('libcanvasSet', function () {
			this.createTiles( this.libcanvas.createLayer('tiles', Infinity, { backBuffer: 'off' }) );
		});
	},

	makeArray: function (length) {
		return Array.create( length, function() { return new Array(length) } );
	},

	/**
	 * @var {Point[]} emptyTiles
	 */
	emptyTiles: null,
	genEmptyTiles: function (recount) {
		var et = this.emptyTiles || [], tiles = this.tiles;
		for (var y = tiles.length; y--;) for (var x = tiles[y].length; x--;) {
			if (tiles[y][x] == null) et.push(new Point(x, y));
		}
		return this.emptyTiles = et;
	},

	pullEmptyPosition: function () {
		var et = this.emptyTiles, elem;
		if (!et) et = this.genEmptyTiles();
		et.erase(elem = et.random);
		return elem;
	},

	translatePoint: function (pos) {
		var opt = this.options, mar = opt.margin, size = opt.tile;
		return new Point(pos.x * size.width + mar.horisontal , pos.y * size.height + mar.vertical);
	},

	tileShape: function (pos) {
		return new Rectangle({
			from: this.translatePoint(pos),
			size: this.options.tile
		});
	},

	createTiles: function (libcanvas) {
		var i = 16, pos, tile, tiles = this.tiles = this.makeArray(4);
		while (--i > 0) {
			pos = this.pullEmptyPosition();
			tiles[pos.y][pos.x] = tile = new Tile(this, i, pos);
			tile.shape = this.tileShape(pos);
			libcanvas.addElement(tile);
		}
		this.empty = this.emptyTiles.pop();
		this.emptyRect = this.tileShape(this.empty);
		return tiles;
	},

	each: function (fn) {
		var tiles = this.tiles, x, y = tiles.length;
		while (y-- > 0) for (x = tiles[0].length; x-- > 0;) fn(tiles[y][x]);
	},

	redraw: function () {
		this.each(function (tile) { tile && tile.redraw() });
	},

	draw: function () {
		this.libcanvas.ctx.fillAll( '#333' );
	},

	isMoveable: function (tile) {
		if (this.blocked) return false;

		var pos = tile.position, empty = this.empty, diff = pos.diff(empty);
		return (diff.x == 0 && diff.y.abs() == 1) || (diff.y == 0 && diff.x.abs() == 1);
	},

	move: function (tile) {
		if ( this.isMoveable(tile) ) {
			var pos = tile.position, empty = this.empty, diff = pos.diff(empty);
			empty.move(diff, true);
			  pos.move(diff);
			this.emptyRect.moveTo(this.translatePoint(empty));
			tile.move(this.translatePoint(pos));
		}
	}
});