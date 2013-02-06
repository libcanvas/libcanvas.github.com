/** @class Mines.Generator */
atom.declare( 'Mines.Generator', {

	mines: null,

	initialize: function (fieldSize, minesCount) {
		this.bindMethods([ 'isValidPoint', 'isMine' ]);

		this.fieldSize  = fieldSize;
		this.minesCount = minesCount;
	},

	isReady: function () {
		return this.mines != null;
	},

	isMine: function (point) {
		return this.mines[point.y][point.x];
	},

	generate: function (ignore) {
		var mines, minesIndex,
			size = this.fieldSize;

		mines = this.createMines(this.minesCount, ignore);

		minesIndex = atom.array.fillMatrix(size.width, size.height, 0);

		mines.forEach(function (point) {
			minesIndex[point.y][point.x] = 1;
		});

		this.mines = minesIndex;
	},

	getValue: function (point) {
		return this.getNeighbours(point)
			.map(this.isMine)
			.sum();
	},

	isValidPoint: function (point) {
		return point.x >= 0
			&& point.y >= 0
			&& point.x < this.fieldSize.width
			&& point.y < this.fieldSize.height;
	},

	/** @private */
	getNeighbours: function (point) {
		return point.neighbours.filter( this.isValidPoint );
	},

	/** @private */
	snapshot: function (ignore) {
		var x, y, point,
			result = [],
			size = this.fieldSize;

		for (y = size.height; y--;) for (x = size.width; x--;) {
			point = new Point(x, y);

			if (!point.equals(ignore)) {
				result.push(point);
			}
		}

		return result;
	},

	/** @private */
	createMines: function (count, ignore) {
		var snapshot = this.snapshot( ignore );

		return atom.array.create(count, function () {
			return snapshot.popRandom();
		});
	}

});