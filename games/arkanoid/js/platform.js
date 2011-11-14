Arkanoid.Platform = atom.Class(
/**
 * @lends Arkanoid.Platform#
 * @augments LibCanvas.Scene.Element#
 */
{
	Extends: LibCanvas.Scene.Element,

	options: {
		speed: 200 // px per second
	},

	colors: {
		3: {
			'0.0': '#f66',
			'1.0': '#900'
		},
		2: {
			'0.0': '#ff6',
			'1.0': '#f60'
		},
		1: {
			'0.0': '#6f6',
			'1.0': '#090'
		}
	},

	/** @constructs */
	initialize: function (scene, options) {
		this.parent( scene, options );
		this.addEvent( 'moveDrag', this.redraw );
	},

	get strokeRectangle () {
		var shape = this.shape.clone();
		var shift = new Point(.5, .5);
		shape.from.move(shift);
		shape.to.move(shift, true);
		return shape;
	},

	getCollisionRectangle: function (radius) {
		if (!this.collisionRectangle) {
			this.collisionRectangle = this.shape.clone().grow(radius*2);
		}
		return this.collisionRectangle;
	},

	move: function (shift) {
		// block if is near left wall
		if (shift < 0 && shift + this.shape.from.x < 0) {
			shift = -this.shape.from.x;
		// block if is near right wall
		} else if (shift > 0 && shift + this.shape.to.x > this.scene.resources.rectangle.to.x) {
			shift = this.scene.resources.rectangle.to.x - this.shape.to.x;
		}

		if (shift !== 0) {
			this.collisionRectangle = null;
			this.shape.move(new Point( shift, 0 ));
			this.redraw();
		}
		return this;
	},

	isAction: function (action) {
		var resources = this.scene.resources;
		switch (action) {
			case 'moveLeft' : return resources.keyboard.keyState( 'aleft' );
			case 'moveRight': return resources.keyboard.keyState( 'aright' );
		}
		return false;
	},

	lives: 3,

	hit: function () {
		if (--this.lives < 1) this.lives = 3;
		this.redraw();
		return this;
	},

	onUpdate: function (time) {
		var moveSpeed = (this.options.speed * time).toSeconds().round();
		if (this.isAction('moveLeft')) {
			this.move( -moveSpeed );
		} else if (this.isAction('moveRight')) {
			this.move(  moveSpeed );
		}
	},

	renderTo: function (ctx) {
		ctx.fill( this.shape, ctx.createRectangleGradient( this.shape, this.colors[this.lives] ));

		ctx.stroke( this.strokeRectangle, 'rgba(0,0,0,0.2)' );

		return this.parent();
	}
});