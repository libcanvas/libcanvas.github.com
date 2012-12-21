/** @class Ast.Flying */
declare( 'Ast.Flying', App.Element, {
	angle : 0,
	angleShift: 0,
	rotateSpeed: 0,
	speed : 0,
	color : 'red',

	hidden: false,

	configure: function () {
		this.position = this.shape.center;
	},

	get globalSettings () {
		return this.controller.settings;
	},

	get controller () {
		return this.settings.get('controller');
	},

	rotate : function (change, reverse) {
		if (!change) return this;

		if (reverse) change *= -1;
		this.angle = (this.angle + change).normalizeAngle();
		this.redraw();
		return this;
	},

	impulse : function (pos, reverse) {
		this.redraw();
		this.position.move(pos, reverse);
		this.checkBounds();
		return this;
	},

	getVelocity : function (withoutShift) {
		var angle = this.angle;
		if (!withoutShift) angle += this.angleShift;
		return new Point(
			Math.cos(angle) * this.speed,
			Math.sin(angle) * this.speed
		);
	},

	getRandomAngle: function () {
		return Number.random(0, 360).degree();
	},

	/** @private */
	checkBounds : function () {
		var
			pos = this.position,
			gSet = this.globalSettings,
			field = gSet.get('fieldSize'),
		    bounds = gSet.get('boundsSize'),
			impulse = new Point(0, 0);

		if (pos.x > field.width + bounds.x / 2) {
			impulse.x = -(field.width + bounds.x);
		} else if (pos.x < - bounds.x / 2) {
			impulse.x =  (field.width + bounds.x);
		}
		if (pos.y > field.height + bounds.y / 2) {
			impulse.y = -(field.height + bounds.y);
		} else if (pos.y < - bounds.y / 2) {
			impulse.y =  (field.height + bounds.y);
		}
		this.position.move(impulse);
		return this;
	},

	get currentBoundingShape () {
		return this.shape.getBoundingRectangle().grow(8).fillToPixel();
	},

	stop : function () {
		this.velocity.set(0, 0);
		return this;
	},

	onUpdate: function (time) {
		time /= 1000;

		this.rotate( this.rotateSpeed * time );
		this.impulse( this.getVelocity().mul(time) );
	},

	renderTo : function (ctx) {
		if (this.hidden || !this.globalSettings.get('showShapes')) return;

		ctx
			.save()
			.clip(this.currentBoundingShape)
			.stroke(this.shape, this.color)
			.stroke(
				new Line(
					this.position,
					this.position.clone().move(this.getVelocity(true))
				), this.color
			)
			.restore();
	}
});