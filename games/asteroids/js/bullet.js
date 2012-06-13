/** @class Ast.Bullet */
declare( 'Ast.Bullet', Ast.Flying, {
	zIndex: 2,
	speed: 300,

	configure: function method () {
		method.previous.call(this);

		this.controller.sounds.play('shot');

		this.angle = this.settings.get('angle');
	},

	checkBounds: function () {
		var
			pos = this.position,
			gSet = this.globalSettings,
			field = gSet.get('fieldSize'),
		    bounds = gSet.get('boundsSize');

		if (
			pos.x > field.width + bounds.x / 2 ||
			pos.x < - bounds.x / 2 ||
			pos.y > field.height + bounds.y / 2 ||
			pos.y < - bounds.y / 2
		) this.die();

		return this;
	},

	hit: function (ast) {
		new Ast.Explosion(this.layer, {
			controller: this.controller,
			shape : new Circle(this.position, 80),
			sheet : this.controller.explosionSheet
		});
		ast.die();
		this.die();
	},

	die: function () {
		this.controller.collisions.remove(this);
		this.destroy();
	},

	renderTo: function method (ctx, resources) {
		method.previous.call(this, ctx, resources);

		ctx.save();

		ctx.clip(this.shape);

		ctx.drawImage({
			image: resources.get('images').get('shot'),
			center: this.shape.center,
			angle : this.angle
		});

		ctx.restore();
	}

});