Spread.Utils = {
	sizes: function (tree, padding) {
		var limits = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

		tree.forEach(function (point) {
			limits.minX = Math.min( point.x, limits.minX );
			limits.maxX = Math.max( point.x, limits.maxX );
			limits.minY = Math.min( point.y, limits.minY );
			limits.maxY = Math.max( point.y, limits.maxY );
		});

		return {

			size : new Size([
				Math.ceil((limits.maxX - limits.minX) + padding * 2),
				Math.ceil((limits.maxY - limits.minY) + padding * 2)
			]),
			center: new Point(
				Math.round(-limits.minX + padding),
				Math.round(-limits.minY + padding)
			)
		};
	}
};