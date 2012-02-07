
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
		var f = this.field, result = [];
		for (var y = f.height; y--;) for (var x = f.width; x--;) {
			if (ignore && ignore.x == x && ignore.y == y) continue;
			result.push([x, y]);
		}
		return result;
	},

	mines: function (empty) {
		var snapshot = this.snapshot( empty );

		return Array.create(this.count, function () {
			return new Mines.Tile( snapshot.popRandom() );
		});
	},

	generate: function (empty) {
		var mine   = this.index, f = this.field,
		    matrix = Array.fillMatrix( f.width, f.height, 0 );

		this.mines( empty ).forEach(function (cell) {
			cell.belongsTo( matrix ).value = mine;

			var nb = cell.neighbours, i = nb.length;

			while (i--) if (nb[i].value != mine) {
				nb[i].value++;
			}
		});
		return matrix;
	}

});