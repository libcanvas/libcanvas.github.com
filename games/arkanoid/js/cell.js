atom.declare( 'Arkanoid.Cell', Arkanoid.Item, {
	zIndex: 1,

	get x () {
		return this.settings.get('xIndex');
	},

	get y () {
		return this.settings.get('yIndex');
	},

	renderTo: function (ctx) {
		if (this.lives <= 0) return;

		ctx.fill( this.shape, ctx.createRectangleGradient( this.shape, this.colors[this.lives]));
		ctx.stroke( this.strokeRectangle, 'rgba(0,0,0,0.2)' );
	}
});