/** @class Ast.Asteroid */
declare( 'Ast.Asteroid', Ast.Flying, {

	speed: 40,

	configure: function method () {
		method.previous.call(this);
		this.rotateSpeed = Number.random(3, 12).degree();
		this.angle = this.getRandomAngle();
		this.angleShift = this.getRandomAngle();
	},

	die: function () {
		this.destroy();
		this.events.fire('die', [this]);
	},

	renderTo: function method (ctx, resources) {
		method.previous.call(this, ctx, resources);

		ctx.drawImage({
			image: this.settings.get('image'),
			center: this.shape.center,
			angle : this.angle
		});
	}
});