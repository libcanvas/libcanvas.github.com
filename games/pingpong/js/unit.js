/** @class Pong.Unit */
atom.declare( 'Pong.Unit', App.Element, {

	speed: new Point( 0, 300 ),

	configure: function () {
		var
			line      = this.settings.get('line'),
			fieldSize = this.settings.get('size'),
			scoreX    = (fieldSize.x/2 + line) / 2,
			size      = new Size(20, 100);

		this.shape = new Rectangle(
			line - (size.x / 2),
			(fieldSize.y - size.y) / 2,
			size.x,
			size.y
		);

		this.score = new App.Light.Text(this.layer, {
			shape: new Rectangle(scoreX - 30, 12, 60, 40),
			style: {
				text  : 0,
				size  : 32,
				color : 'white',
				align : 'center'
			}
		});
	},

	increaseScore: function () {
		this.score.content++;
	},

	fitToField: function () {
		var
			shape  = this.shape,
			top    = shape.from.y,
			bottom = shape.to.y - this.settings.get('size').height;

		if (top    < 0) shape.move(new Point(0, -top));
		if (bottom > 0) shape.move(new Point(0, -bottom));
	},

	move: function (time) {
		this.shape.move( this.speed.clone().mul( time / 1000 ) );

		this.fitToField();
	},

	onUpdate: function (time) {
		var
			keyboard = atom.Keyboard(),
			controls = this.settings.get('controls'),
			isDown   = keyboard.key(controls.down);

		if (isDown || keyboard.key(controls.up)) {
			this.move(isDown ? time : -time);
			this.redraw();
		}
	},

	renderTo: function (ctx, resources) {
		ctx.drawImage({
			image: resources.get('images').get('platform'),
			draw : this.shape,
			optimize: true
		})
	}

});