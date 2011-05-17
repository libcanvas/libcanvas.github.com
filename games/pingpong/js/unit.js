
Pong.Unit = atom.Class({
	Implements: [ Drawable ],

	size: { width: 20, height: 100, padding: 20 },
	speed: new Point( 0, 110 ),
	score: 0,

	controls: function (up, down) {
		this.addEvent('libcanvasSet', function () {
			var lc = this.libcanvas.addFunc(function (time) {
				if (lc.getKey(up)) {
					this.move( -time );
				} else if (lc.getKey(down)) {
					this.move(  time );
				}
			}.bind(this));
		});
		return this;
	},

	appendTo: function (field, number) {
		var s = this.size;

		this.field  = field;
		this.number = number;
		this.shape = new Rectangle({ // field.width, field.height
			from: [
				(number == 2 ? field.width - s.width - s.padding : s.padding),
				(field.height - s.height) / 2
			],
			size: s
		});
		return this;
	},

	fitToField: function () {
		var shape = this.shape;
		
		var top = shape.from.y, bottom = shape.to.y - this.field.height;

		if (top    < 0) shape.move(new Point(0, -top));
		if (bottom > 0) shape.move(new Point(0, -bottom));
	},

	move: function (time) {
		this.shape.move( this.speed.clone().mul( time / 1000 ) );

		this.fitToField();
	},

	collides: function (ball) {
		return ball.shape.intersect(this.shape);
	},

	draw: function() {
		this.libcanvas.ctx.drawImage({
			image: this.libcanvas.getImage('elems').sprite(0,0,20,100),
			draw: this.shape
		});

	}
});