/** @class IsoMines.FastSearch */
atom.declare( 'IsoMines.FastSearch', App.ElementsMouseSearch, {

	initialize: function (shift, projection) {
		this.projection = projection;
		this.shift = shift;
		this.cells = {};
	},

	add: function (cell) {
		return this.set(cell, cell);
	},

	remove: function (cell) {
		return this.set(cell, null);
	},

	set: function (cell, value) {
		this.cells[cell.point.y + '.' + cell.point.x] = value;
		return this;
	},

	findByPoint: function (point) {
		point = point.clone().move(this.shift.getShift(), true);

		var
			path = this.projection.to3D(point),
			cell = this.cells[Math.floor(path.y) + '.' + Math.floor(path.x)];

		return cell ? [ cell ] : [];
	}
});