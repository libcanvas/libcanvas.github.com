(function () {
	

var Beh = LibCanvas.Behaviors;

Grafiti.Button = new Class({
	Extends : Beh.Drawable,
	Implements : [
		Beh.MouseListener,
		Beh.Clickable
	],
	index : null,
	initialize : function (index) {
		this.index = index;
	},
	click : function (fn) {
		this.bind('click', function () {
			this.disabled || fn.call(this);
		});
	},
	getXShift : function () {
		return (this.disabled || this.active) ? 1 :
			this.hover ? 0 : 2;
	},
	draw : function () {
		var shape  = this.getShape();
		var width  = shape.getWidth();
		var height = shape.getHeight()
		try {
		this.libcanvas.ctx.drawImage({
			image : this.libcanvas.getImage('icons').sprite(
				this.getXShift() * width, this.index * height, width, height
			),
			from : shape.from
		});
		} catch (e) { $log(e) }
	}
});

})();