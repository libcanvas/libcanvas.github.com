/** @class Ast.Ship */
declare( 'Ast.Ship', Ast.Flying, {
	zIndex: 3,
	acceleration: 0,
	friction: 0.99,
	rateOfFire: 0.4,
	isShoot: false,
	invulnerable: 0,

	gradColors: [
		{
			'0.0' : 'rgba(0,0,0,0.0)',
			'0.4' : 'rgba(255,255,0,0.0)',
			'0.8' : 'rgba(255,0,0,0.5)',
			'1.0' : 'rgba(255,0,0,0.0)'
		},{
			'0.0' : 'rgba(0,0,0,0.0)',
			'0.4' : 'rgba(0,255,255,0.0)',
			'0.8' : 'rgba(0,0,255,0.5)',
			'1.0' : 'rgba(0,0,255,0.0)'
		},
	],

	configure: function method () {
		method.previous.call(this);

		this.angle = this.getRandomAngle();
		this.inner = new Circle(this.shape.center, 5);

		this.animatable = new atom.Animatable(this);

		this.animation = new Animation({
			sheet   : this.controller.shipSheets[ this.settings.get('type') ],
			onUpdate: this.redraw
		});

		this.settings.get('manipulator')
			.setOwner(this)
			.setStates(this.states);

		this.makeInvulnerable();
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

	explode: function () {
		new Ast.Explosion(this.layer, {
			controller: this.controller,
			shape : new Circle(this.shape.center.clone(), 80),
			sheet : this.controller.explosionSheet
		});
		this.shape.center.set(this.controller.randomFieldPoint);
		this.makeInvulnerable();
	},

	makeInvulnerable: function () {
		this.animatable.stop(true);
		this.invulnerable = 1;
		this.animatable.animate({
			fn: 'expo-in',
			time : 3000,
			props: { invulnerable: 0 },
			onTick: this.redraw
		});
	},

	shoot: function () {
		var now = +Date.now();
		if (now > this.lastShot + this.rateOfFire * 1000 ) {
			this.lastShot = now;

			this.controller.collisions.add(new Ast.Bullet(this.controller.layer, {
				controller: this.controller,
				shape: new Circle(this.position.clone(), 75),
				angle: this.angle
			}));
		}
	},

	updateSpeed: function () {
		var speed = this.speed;
		if (this.acceleration) {
			speed = (speed + this.acceleration).limit(-70, 100);
		} else {
			speed *= this.friction;
			if (speed > 5) {
				speed = Math.floor(speed);
			} else if (speed < -5) {
				speed = Math.ceil(speed);
			} else {
				speed = 0;
			}
		}
		this.speed = speed;
	},

	renderTo: function method(ctx) {
		method.previous.call(this, ctx);

		ctx.drawImage({
			image : this.animation.get(),
			center: this.shape.center,
			angle : this.angle
		});

		if (this.invulnerable) {
			ctx.save();
			ctx.set({ globalAlpha: this.invulnerable });

			var gradient = ctx.createRadialGradient( this.inner, this.shape )
				.addColorStop( this.gradColors[this.settings.get('type')] );

			ctx.fill( this.shape, gradient );

			ctx.restore();
		}
	}
});