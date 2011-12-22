(function () {

var Point = LibCanvas.Point;

Grafiti.Example = new Class({
	Extends : LibCanvas.Behaviors.Drawable,
	initialize : function (size, center) {
		this.center = center;
		this.line   = [new Point(size / 2, size / 2)];
		this.buffer = LibCanvas.Buffer(size, size);
		this.size   = size;
	},
	lastConfig : {},
	run : function (drawer, config) {
		if (!$equals(config, this.lastConfig)) {
			this.lastConfig = config;
			for (var i in config) {
				this.line[i] = config[i];
			}
			var Rect = LibCanvas.Shapes.Rectangle;
			var ctx = this.buffer
				.getContext('2d-libcanvas')
				.fillAll('#eee')
				.fill(new Rect(new Point( 0, 0), this.line[0]), '#666')
				.fill(new Rect(this.line[0], new Point(this.size,this.size)), '#666')
				.strokeAll('#069');
			if (config.brush.type == 'standard') {
				drawer.lineTo(this.line, ctx);
			} else {
				ctx.save().set('globalAlpha', config.brush.opacity);
				config.brush.draw(ctx, this.line[0], true);
				ctx.restore();
			}
		}

	},
	draw : function () {
		this.libcanvas.ctx
			.drawImage({
				image  : this.buffer,
				center : this.center
			});
	}
});

})();