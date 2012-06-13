atom.declare( 'Arkanoid.Cells', {

	initialize: function (layer, ballRadius) {
		this.radius  = ballRadius;
		this.layer   = layer;
		this.size    = new Size(19, 9);
		this.padding = 1;
		this.index   = {};
		this.limit   = null;
	},

	create: function (xIndex, yIndex) {
		var index = this.index, size = this.size, cell;

		cell = new Arkanoid.Cell( this.layer, {
			xIndex: xIndex,
			yIndex: yIndex,
			shape: new Rectangle(
				(size.width +this.padding)*xIndex,
				(size.height+this.padding)*yIndex,
				size.width,
				size.height
			)
		});
		if (!index[yIndex]) index[yIndex] = {};
		index[yIndex][xIndex] = cell;

		var shape = cell.getCollisionRectangle(this.radius), limit = this.limit;
		if (!this.limit) {
			this.limit = shape.clone();
		} else {
			limit.from.x = Math.min( limit.from.x, shape.from.x );
			limit.from.y = Math.min( limit.from.y, shape.from.y );
			limit. to .x = Math.max( limit. to .x, shape. to .x );
			limit. to .y = Math.max( limit. to .y, shape. to .y );
		}
		return cell;
	},

	erase: function (cell) {
		delete this.index[cell.y][cell.x];
		return this;
	},

	find: function (point) {
		var size, xIndex, yIndex, shift, row, cell, x, y;

		if (!this.limit.hasPoint(point)) return null;

		size   = this.size;
		xIndex = (point.x / (size.width  + this.padding)).floor();
		yIndex = (point.y / (size.height + this.padding)).floor();
		shift  = [-1, 0, 1];

		for (x = shift.length; x--;) for (y = shift.length; y--;) {
			row  = this.index[yIndex+shift[y]];
			cell = row && row[xIndex+shift[x]];
			if (cell && cell.getCollisionRectangle(this.radius).hasPoint(point)) {
				return cell;
			}
		}
		return null;
	}
});