Mines.Tile = atom.Class({
	Extends: Point,

	Static: {
		each: function (matrix, fn) {
			var y = matrix.length, width = matrix[0].length, x;

			while (y--) for (x = width; x--;) {
				fn.call(this, new Mines.Tile(x, y).belongsTo( matrix ));
			}
			return this;
		}
	},

	matrix: null,

	get value () {
		return this.matrix[this.y][this.x];
	},

	set value (value) {
		this.matrix[this.y][this.x] = value;
	},

	get exists() {
		var row = this.matrix[this.y];
		return row != null && row[this.x] != null;
	},

	get neighbours () {
		return this.getNeighbours( true ).filter(function (nb) {
			return nb.exists;
		});
	},

	belongsTo: function (matrix) {
		this.matrix = matrix;
		return this;
	},

	countNeighbours: function (value) {
		var count = 0, nb = this.neighbours, i = nb.length;

		if (value == null) return i;
		
		while (i--) if (nb[i].value == value) {
			count++;
		}
		return count;
	},

	toggleValue: function (first, second) {
		var v = this.value;
		if (v == first ) return this.value = second;
		if (v == second) return this.value = first;
		return null;
	},

	clone: function () {
		return this.parent().belongsTo( this.matrix );
	}
});