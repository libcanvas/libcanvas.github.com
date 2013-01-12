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

			return !!(cell && atom.number.between(cell,5,8,true));
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
			cellSize: new Size(24, 24),
			cellMargin: new Size(0, 0),
			defaultValue: ' '
		}).setMethod({
			' ': '#ccc',
			'5': '#36f',
			'6': '#000',
			'7': '#999',
			'8': '#963'
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
		'55555555555555555555555555555555'+
		'5                              5'+
		'5  777                         5'+
		'5  7 7  555655555655565        5'+
		'5  7 8     6     6             5'+
		'5    7                         5'+
		'5    7                    755555'+
		'5  7 7                         5'+
		'5  7 8                         6'+
		'5  7 7                         5'+
		'5  777                    755555'+
		'5                              5'+
		'5        777  777              6'+
		'5        777  777              5'+
		'5        777  777         755555'+
		'5        777  777              5'+
		'5  8  86 66666666 688  8       5'+
		'5  8  8             8  8       5'+
		'5  8  8             8  8       5'+
		'5  8  8             8  8       5'+
		'5  8778666  66  66668778       5'+
		'5           66                 5'+
		'5           66                 5'+
		'55555555555555555555555555555555'
	]
});