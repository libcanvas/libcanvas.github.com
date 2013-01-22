atom.declare( 'Arkanoid.Item', App.Element, {
	colors: {
		3: { 0: '#f66', 1: '#900' },
		2: { 0: '#ff6', 1: '#f60' },
		1: { 0: '#6f6', 1: '#090' }
	},

	get strokeRectangle () {
		return this.shape.clone().snapToPixel();
	},

	getCollisionRectangle: function (radius) {
		var rect = this.collisionRectangle;
		if (!rect) {
			rect = this.collisionRectangle = this.shape.clone().grow(radius*2);
		}
		return rect;
	},

	lives: 3,

	hit: function () {
		this.redraw();
		if (--this.lives < 1) this.destroy();
		return this;
	}
});