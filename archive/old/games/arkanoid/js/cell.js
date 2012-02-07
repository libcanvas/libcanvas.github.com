Arkanoid.Cell = atom.Class(
/**
 * @lends Arkanoid.Cell#
 * @augments LibCanvas.Scene.Element#
 */
{
	Extends: LibCanvas.Scene.Element,

	Implements: Draggable,
	
	zIndex: 1,

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

	getCollisionRectangle: function (radius) {
		var rect = this.collisionRectangle;
		if (!rect) {
			rect = this.collisionRectangle = this.shape.clone().grow(radius*2);
		}
		return rect;
	},

	get strokeRectangle () {
		var shape = this.shape.clone();
		var shift = new Point(.5, .5);
		shape.from.move(shift);
		shape.to.move(shift, true);
		return shape;
	},

	lives: 3,

	hit: function () {
		if (--this.lives < 1) this.destroy();
		this.redraw();
		return this;
	},

	renderTo: function (ctx) {
		if (this.lives > 0) {
			ctx.fill( this.shape, ctx.createRectangleGradient( this.shape, this.colors[this.lives]));
			ctx.stroke( this.strokeRectangle, 'rgba(0,0,0,0.2)' );
		}

		return this.parent();
	}
});