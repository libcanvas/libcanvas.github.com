Mines.Tile = atom.Class({
	Extends: Point,

	matrix: null,

	get value () {
		return this.matrix[this.y][this.x];
	},

	set value (value) {
		this.matrix[this.y][this.x] = value;
	},

	eachNeighbour: function (fn) {
		var m = this.matrix;
		this.neighbours.forEach(function (point) {
			var row = m[point.y];
			if (row != null && row[point.x] != null) {
				var tile = this.self.from(point);
				tile.matrix = this.matrix;
				fn.call(this, tile);
			}
		}.bind(this));
		return this;
	},

	countNeighbours: function (value) {
		var count = 0;
		this.eachNeighbour(function (tile) {
			if (value == null || tile.value == value ) {
				count++;
			}
		});
		return count;
	},

	toggleValue: function () {
		var values = Array.from(arguments), v = this.value, i = values.indexOf(v);
		if (i >= 0) {
			this.value = values.length > i+1 ? values[i+1] : values[0];
		}
		return this;
	}
});