/** @class Dune.FastSearch */
atom.declare( 'Dune.FastSearch', App.PointSearch, {
	initialize: function (size, cell, shift) {
		this.size  = size;
		this.cell  = cell;
		this.shift = shift;
		this.items = new Array(size.width * size.height);
	},

	set: function (item, value) {
		var from = item.from, size = item.size, x, y;

		for (y = from.y; y < from.y + size.y; y++) {
			for (x = from.x; x < from.x + size.x; x++) {
				this.items[ x + y * this.size.width ] = value;
			}
		}

		return this;
	},

	add: function (item) {
		this.set(item, item);
		return this;
	},

	remove: function (item) {
		this.set(item, null);
		return this;
	},

	findByPoint: function (point) {
		var cell, item;

		point = point.clone().move( this.shift.shift, true );

		cell = new Point(point.x/this.cell.x, point.y/this.cell.y).invoke('floor');
		item = this.items[ cell.x + cell.y * this.size.width ];

		return item ? [ item ] : [];
	}
});