
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
			var random = snapshot.random;
			snapshot.erase( random );
			return new Point( random );
		});
	},

	generate: function (empty) {
		var index = this.index, f = this.field,
		    matrix = Array.fill( f.height, Array.fill( f.width, 0 ) ).clone();

		this.mines( empty ).forEach(function (cell) {
			matrix[cell.y][cell.x] = index;

			cell.neighbours.forEach(function(cell) {
				var row = matrix[cell.y];
				if (row && row[cell.x] != null && row[cell.x] != index) {
					row[cell.x]++;
				}
			});
		}.bind(this));
		return matrix;
	}

});