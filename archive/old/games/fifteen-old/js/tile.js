
var Tile = atom.Class({
	Implements: [ Drawable, Animatable, Clickable ],

	Generators: {
		buffer: function () {
			return ['hover', 'standard'].associate(function (status) {
				var buffer = LibCanvas.Buffer(this.shape.width, this.shape.height, true);

				var shape = this.rectangle;
				buffer.ctx
					.fill(shape, this.gradient(shape, status == 'hover'))
					.text({
						text : this.index,
						to   : shape,
						size : shape.height / 2,
						color: 'white',
						weigth : 'bold', /* bold|normal */
						align  : 'center',
						padding : [shape.height/8, shape.width/4]
					})
					.set({ globalAlpha: 0.3, lineWidth: 1 })
					.stroke(shape, '#ccc');

				return buffer;
			}.bind(this));
		}
	},

	zIndex: 15,

	index: 0,

	initialize: function (field, index, position) {
		this.field    = field;
		this.index    = index;
		this.position = position;

		this.addEvent('libcanvasSet', function () {
			this.listenMouse().clickable(this.redraw.bind(this, false));
		});

		this.addEvent('click', field.move.bind(field, this));
	},

	move: function (point) {
		this.field.blocked = true;
		this.animate({
			time: 150,
			props: { x: point.x, y: point.y },
			onProccess: this.redraw.bind(this, true),
			onFinish: function () {
				this.field.blocked = false;
				this.field.redraw();
			},
			fn: 'sine-out'
		});
	},

	gradient: function (shape, status) {
		var gradient = this.libcanvas.ctx.createLinearGradient( shape );

		gradient.addColorStop(0, status ? '#666' : '#444');
		gradient.addColorStop(1, status ? '#333' : '#111');

		return gradient;
	},

	get rectangle () {
		var rect = this.shape.clone().moveTo(new Point(0, 0))
		  , x = rect.width / 16
		  , y = rect.height / 16;
		rect.from.move([x/2,y/2]);
		rect.width  -= x;
		rect.height -= y;
		return rect.snapToPixel();
	},

	redraw: function (move) {
		if (move) {
			this.libcanvas.ctx
				.clearRect( this.shape )
				.clearRect( this.field.emptyRect );
		}
		this.draw();
	},

	draw: function () {
		var status = this.hover && this.field.isMoveable(this) ? 'hover' : 'standard';
		this.libcanvas.ctx.drawImage({
			image: this.buffer[status],
			draw : this.shape
		});
	},


	// Need for animation, mapping Tile coords
	setCoord: function (coord, value) {
		var shape = this.shape, diff = value - shape.from[coord], point;

		if (diff) {
			point = { x: 0, y : 0 };
			point[coord] = diff;
			shape.move(point);
		}
	},
	set x (value) {
		this.setCoord('x', value);
	},
	set y (value) {
		this.setCoord('y', value);
	},
	get x () {
		return this.shape.from.x;
	},
	get y () {
		return this.shape.from.y;
	}
});