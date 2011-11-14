Arkanoid.Cells = atom.Class({

	options: {
		width  : 19,
		height : 9,
		padding: 1
	},

	initialize: function (scene, ballRadius) {
		this.radius = ballRadius;
		this.scene  = scene;
		this.index  = {};
		this.limit  = null;
	},

	create: function (xIndex, yIndex) {
		var index = this.index;
		var size = this.options;
		var cell = new Arkanoid.Cell( this.scene, {
			xIndex: xIndex,
			yIndex: yIndex,
			shape: new Rectangle(
				(size.width +size.padding)*xIndex,
				(size.height+size.padding)*yIndex,
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
		var row = this.index[cell.options.yIndex];
		delete row[cell.options.xIndex];
		return this;
	},

	find: function (point) {
		if (!this.limit.hasPoint(point)) return null;

		var size   = this.options;
		var xIndex = (point.x / (size.width  + size.padding)).floor();
		var yIndex = (point.y / (size.height + size.padding)).floor();
		var shift  = [-1, 0, 1];

		for (var x = shift.length; x--;) for (var y = shift.length; y--;) {
			var row  = this.index[yIndex+shift[y]];
			var cell = row && row[xIndex+shift[x]];
			if (cell && cell.getCollisionRectangle(this.radius).hasPoint(point)) {
				return cell;
			}
		}
		return null;
	}
});