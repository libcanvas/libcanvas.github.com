Grafiti.Slider = new Class({
	Extends : LibCanvas.Behaviors.Drawable,
	Implements : [
		LibCanvas.Behaviors.MouseListener,
		LibCanvas.Behaviors.Draggable,
		LibCanvas.Behaviors.Clickable
	],
	line : null,
	msg  : '',
	initialize : function (line, msg, pos) {
		var slider = this;

		if (line.from.y != line.to.y) {
			throw 'Wrong line in slider (y not equals)'
		}
		this.line = line;
		this.msg  = msg || '';
		this.setShape(new LibCanvas.Shapes.Circle(
			line.from.clone().move({
				x : (line.to.x - line.from.x) * (pos || 0),
				y : 0
			}), 6
		));
		this.bind('libcanvasSet', function () {
			var shift = {x:5, y:5};
			this.libcanvas.createGrip({
				shape : new LibCanvas.Shapes.Rectangle(
					this.line.from.clone().move(shift, true),
					this.line.to  .clone().move(shift)
				)
			})
			.listenMouse()
			.bind('click', function (eName, e) {
				this.getShape().center
					.moveTo(this.libcanvas.mouse.getOffset(e), 320)
			}.bind(this));
		});
		var lcUpdate = function () {
			this.libcanvas.update();
		}.bind(this);

		this.bind('statusChanged', lcUpdate);

		this.getShape().center.bind('move', function (distance) {
			if (!distance.x && !distance.y) return;
			this.moveTo({
				x : this.x.limit(line.from.x, line.to.x),
				y : line.from.y
			});
			slider.bind('change', [slider.getValue()]);
			lcUpdate();
		});
	},
	getValue : function () {
		return (this.getShape().center.x - this.line.from.x) / (this.line.to.x - this.line.from.x);
	},
	draw : function () {
		var ctx = this.libcanvas.ctx;

		var textW = ctx.save()
			.set('font', '15px sans-serif')
			.measureText(this.msg).width;

		ctx
			.set('fillStyle', this.disabled ? '#999' : '#000')
			.fillText(this.msg, this.line.from.x - textW - 20, this.line.from.y + 4)
			.set('lineWidth', 2)
			.set('lineCap' , 'round')
			.beginPath(this.line.from)
			.lineTo(this.line.to)
			.stroke(this.disabled ? '#999' : '#069');
		if (!this.disabled) {
			ctx
				.fill(this.getShape(), this.active || this.hover ? '#9cf' : '#fff')
				.stroke(this.getShape(), '#069');
		}
		ctx.restore();
	}
});