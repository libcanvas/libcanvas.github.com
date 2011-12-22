Grafiti.Color = new Class({
	Extends : LibCanvas.Engines.Tile,
	Implements : [
		LibCanvas.Behaviors.Drawable,
		LibCanvas.Behaviors.MouseListener
	],
	createColorMatrix : function () {
		var matrix = [];
		(6).times(function () {
			matrix.push(new Array(36));
		});

		var color = function (i) {
			var c = [0,3,6,9,'c','f'][i];
			return c+''+c;
		};

		for (var r = 6; r--;) {
			for (var g = 6; g--;) {
				for (var b = 6; b--;) {
					matrix[b][r*6 + g] = '#' + color(r) + color(g) + color (b);
				}
			}
		}

		this.addTile('default', function (ctx, rect, cell) {
			ctx.fill(rect, cell.t);
		});

		this.setMatrix(matrix);
		return this;
	},
	draw : function () {
		this.libcanvas.ctx
			.stroke(this.getShape(), '#069')
			.drawImage({ image : this.elem, from : this.getShape().from });
	}
});