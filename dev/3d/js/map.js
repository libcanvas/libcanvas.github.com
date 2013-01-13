/** @class Eye.Map */
atom.declare( 'Eye.Map', {
	width : 32,
	height: 24,

	cells : [],
	blocks: [],

	initialize: function (controller) {
		this.controller = controller;
		this.cells = this.constructor.maps[0].split('');
		this.blocks = this.cells.map(function (cell) {
			cell = Number(cell);

			return !!(cell && atom.number.between(cell,1,4,true));
		});

		this.createTileEngine();
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
		'1  3 3                         1'+
		'1  3 4                         2'+
		'1  3 3                         1'+
		'1  333                    311111'+
		'1                              1'+
		'1        333  333              2'+
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
		'11111111111111111111111111111111'
	]
});