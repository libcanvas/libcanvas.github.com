ExtendedCurves.Grip = atom.Class({
	Implements: [ atom.Class.Events ],
	
	initialize: function (point, libcanvas) {
		var realtime = atom.dom('[name="realtime"]').first;
		
		this.libcanvas = libcanvas;
		this.point     = new Point(point);
		this.shaper    = libcanvas.createShaper({
			shape : new Circle(this.point, 5),
			fill  : '#0f0',
			stroke: '#090',
			hover: { fill: '#090', stroke: '#090'}
		})
		.setZIndex(2)
		.clickable()
		.draggable()
		.addEvent('moveDrag', function () {
			if (realtime.checked) this.fireEvent('update');
		}.bind(this))
		.addEvent('stopDrag', this.fireEvent.bind(this, 'update'));
	},
	link: function (grip) {
		this.libcanvas.createShaper({
			shape : new Line( this.point, grip.point ),
			stroke: '#090'
		}).setZIndex(1);
	}
});

ExtendedCurves.Curve = atom.Class({
	Extends: atom.Class.Options,
	
	Implements: [ Drawable ],
	
	initialize: function (options) {
		this.setOptions(options);
	},
	
	setOptions: function () {
		this.parent.apply( this, arguments );
		this.redraw();
	},
	
	redraw: function () {
		if (this.libcanvas) this.libcanvas.update();
	},
		
	draw: function () {
		this.libcanvas.ctx.drawCurve(this.options);
	}
});