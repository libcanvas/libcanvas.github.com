
Mines.Generator = atom.Class({

	initialize: function (field, mines, index) {
		this.field = field;
		this.count = mines;
		this.index = index;

		if (this.isOverflowed(field, mines)) throw new Error( 'Mines overflow' );
	},

	isOverflowed: function (field, mines) {
		return field.width * field.height <= mines;
	},

	snapshot: function (ignore) {
		var f = this.field, y = f.height, x, result = [];
		while (y--) for (x = f.width; x--;) {
			if (ignore && ignore.x == x && ignore.y == y) continue;
			result.push([x, y]);
		}
		return result;
	},

	mines: function (empty) {
		var snapshot = this.snapshot( empty && Point.from(empty) );

		return Array.create(this.count, function () {
			return new Mines.Tile( snapshot.popRandom() );
		});
	},

	generate: function (empty) {
		var index = this.index, f = this.field,
		    matrix = Array.fill( f.height, Array.fill( f.width, 0 ) ).clone();

		this.mines( empty ).forEach(function (cell) {
			cell.matrix = matrix;
			cell.value  = index;

			// Увеличиваем всем соседям показатель мин
			cell.eachNeighbour(function(nb) {
				if (nb.value != index) nb.value++;
			});
		}.bind(this));
		return matrix;
	}

});