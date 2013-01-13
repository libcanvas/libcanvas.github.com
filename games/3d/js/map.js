/** @class Eye.Map */
atom.declare( 'Eye.Map', {
	width : 32,
	height: 48,

	cells : [],
	blocks: [],

	initialize: function (controller) {
		this.controller = controller;
		this.cells = this.constructor.maps[0].split('');
		this.blocks = this.cells.map(
			this.isBlocker.bind(this)
		);

		this.createTileEngine();
	},

	isBlocker: function (value) {
		value = Number(value);

		return !!(value && atom.number.between(value,1,4,true));
	},

	get size () {
		return this.tileEngine.countSize();
	},

	get cellSize () {
		return this.tileEngine.settings.get('cellSize');
	},

	isBlocked: function (x, y) {
		return this.blocks[x + this.width * y];
	},

	createTileEngine: function () {
		this.tileEngine = new TileEngine({
			size: new Size(this.width, this.height),
			cellSize: new Size(5, 5),
			cellMargin: new Size(0, 0),
			defaultValue: ' '
		}).setMethod({
			' ': '#ccc',
			'1': '#36f',
			'2': '#000',
			'3': '#999',
			'4': '#963'
		});

		this.eachCell(function (value, x, y) {
			this.tileEngine.getCellByIndex([x, y]).value = value;
		});
	},

	change: function (x, y, value) {
		this.tileEngine.getCellByIndex([x, y]).value = value;
		this.blocks[x + this.width * y] = this.isBlocker(value);
		this.cells [x + this.width * y] = value;
	},

	eachCell: function (fn) {
		for (var x = this.width; x--;) for (var y = this.height; y--;) {
			fn.call(this, this.cells[x + y*this.width], x, y);
		}
	},

	appendTileEngine: function () {
		TileEngine.Element.app( this.controller.app, this.tileEngine );
	}

}).own({
	maps: [
		'11111111111111111111111111111111'+
		'1                              1'+
		'1  333                         1'+
		'1  3 3  111211111211121        1'+
		'1  3 4                         1'+
		'1    3                         1'+
		'1    3                    311111'+
		'1  3 3        4                1'+
		'1  3 4                         1'+
		'1  3 3                         1'+
		'1  333                    311111'+
		'1                              1'+
		'1        333  333              1'+
		'1        333  333              1'+
		'1        333  333         311111'+
		'1        333  333              1'+
		'1  4  42 22222222 244  4       1'+
		'1  4  4             4  4       1'+
		'1  4  4             4  4       1'+
		'1  4  4             4  4       1'+
		'1  4334222  22  22224334       1'+
		'1           22                 1'+
		'1           22                 1'+
		'1                              1'+
		'1                              1'+
		'1                              1'+
		'1  44444443333333332222222222221'+
		'1  4 3  4 4        1   2   1   1'+
		'1  4  3   4          2   2 111 1'+
		'1  4 3333 3333333331222222   1 1'+
		'1  4  3 3 3 3 3 3 3 2      2   1'+
		'1  4 3               111111111 1'+
		'1  4 111111111111111 1         1'+
		'1  4               1 1 111111111'+
		'1  33333333 33333333 1 1       1'+
		'1                  3     44444 1'+
		'1  33333333333333  3333333     1'+
		'1  2   3        1          44441'+
		'1  2 2 3 33333 1444444444444   1'+
		'1  2 2 3     3 1   4   4   4 4 1'+
		'1  2 2 33333 3 114   4   4   4 1'+
		'1  2 2       3  12222222222224 1'+
		'1    2 33333334 1   2          1'+
		'122222 4 1111 4 1 1 2 2222222221'+
		'1    4 4      4   1 2          1'+
		'1 4444 444444 41111 2222222222 1'+
		'1             4                1'+
		'11111111111111111111111111111111'
	]
});