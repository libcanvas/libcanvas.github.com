/** @class Ast.Ship */
declare( 'Ast.Ship', Ast.Flying, {
	zIndex: 3,
	acceleration: 0,
	friction: 0.99,
	rateOfFire: 0.7,
	isShoot: false,

	configure: function method () {
		method.previous.call(this);

		this.angle = this.getRandomAngle();

		this.animation = new Animation({
			sheet   : this.controller.shipSheets[ this.settings.get('type') ],
			onUpdate: this.redraw
		});

		this.settings.get('manipulator')
			.setOwner(this)
			.setStates(this.states);
	},

	states: {
		forward: [
			function () { this.acceleration += 3 },
			function () { this.acceleration -= 3 }
		],
		backward: [
			function () { this.acceleration -= 2 },
			function () { this.acceleration += 2 }
		],
		left: [
			function () { this.rotateSpeed -= (90).degree() },
			function () { this.rotateSpeed += (90).degree() }
		],
		right: [
			function () { this.rotateSpeed += (90).degree() },
			function () { this.rotateSpeed -= (90).degree() }
		],
		shoot: [
			function () { this.isShoot = true  },
			function () { this.isShoot = false }
		]
	},

	lastShot: 0,

	onUpdate: function method (ctx) {
		this.updateSpeed();

		method.previous.call(this, ctx);

		if (this.isShoot) this.shoot();
	},

	shoot: function () {
		var now = Date.now();
		if (now > this.lastShot + this.rateOfFire * 1000 ) {
			this.lastShot = now;

			this.controller.addBullet(new Ast.Bullet(this.controller.scene, {
				controller: this.controller,
				shape: new Circle(this.position.clone(), 75),
				angle: this.angle
			}));
		}
	},

	updateSpeed: function () {
		if (this.acceleration) {
			this.speed = (this.speed + this.acceleration).limit(-70, 100);
		} else {
			this.speed *= this.friction;
			if (this.speed > 5) {
				this.speed = this.speed.floor();
			} else if (this.speed < -5) {
				this.speed = this.speed.ceil();
			} else {
				this.speed = 0;
			}
		}
	},

	renderTo: function method(ctx) {
		method.previous.call(this, ctx);

		ctx.drawImage({
			image: this.animation.get(),
			center: this.shape.center,
			angle : this.angle
		});
	}
});