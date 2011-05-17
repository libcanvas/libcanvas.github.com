
Pong.Field = atom.Class({
	Implements: [ Drawable ],

	width : 800,
	height: 500,

	createUnits: function (ball, libcanvas) {

		this.unit = new Pong.Unit()
			.controls('w', 's')
			.appendTo( this, 1  );

		this.enemy = new Pong.Unit()
			.controls('aup', 'adown')
			.appendTo( this, 2 );

		libcanvas
			.addElement( this.unit  )
			.addElement( this.enemy );
	},

	collidesUnits: function (ball) {
		return this.unit .collides(ball) ? -1 :
		       this.enemy.collides(ball) ?  1 : 0;
	},

	isOut: function (shape) {
		if (shape.from.x < 0) {
			this.enemy.score++;
			return -1;
		} else if (shape.to.x > this.width) {
			this.unit.score++;
			return 1;
		}
		return 0;
	},

	drawScore: function (unit, align) {
		this.libcanvas.ctx
			.text({
				text: unit.score,
				size: 32,
				padding: [0, 70],
				color: 'white',
				align: align
			});
		return this;
	},

	draw: function () {
		this.drawScore( this.unit, 'left' ).drawScore( this.enemy, 'right' );
	}
});