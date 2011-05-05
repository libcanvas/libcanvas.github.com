Mines.Tile = atom.Class({
	Extends: Point,

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

	eachNeighbour: function (fn) {
		var n = this.neighbours, i = 0, l = n.length;
		for (;i < l; i++) {
			if (n[i].exists) fn.call(this, n[i]);
		}
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
			return (this.value = values.length > i+1 ? values[i+1] : values[0]);
		}
		return null;
	},

	clone: function () {
		var tile = this.parent();
		tile.matrix = this.matrix;
		return tile;
	}
});