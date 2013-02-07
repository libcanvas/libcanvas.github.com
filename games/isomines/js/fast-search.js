/** @class IsoMines.FastSearch */
atom.declare( 'IsoMines.FastSearch', App.ElementsMouseSearch, {
	// It is fast hex search. Default variant just move through all elements
	initialize: function (shift, projection) {
		this.projection = projection;
		this.shift = shift;
		this.cells = {};
	},

	add: function (cell) {
		this.cells[cell.point.y + '.' + cell.point.x] = cell;

		return this;
	},

	remove: function (cell) {
		this.cells[cell.point.y + '.' + cell.point.x] = null;
		return this;
	},

	findByPoint: function (point) {
		point = point.clone().move(this.shift.getShift(), true);

		var
			path = this.projection.to3D(point),
			cell  = this.cells[Math.floor(path.y) + '.' + Math.floor(path.x)];

		return cell ? [ cell ] : [];
	}
});