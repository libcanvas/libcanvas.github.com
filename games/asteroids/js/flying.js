/** @class Ast.Flying */
declare( 'Ast.Flying', App.Element, {
	angle : 0,
	speed : 30,
	color : 'red',

	hidden: false,

	configure: function () {
		this.position = this.shape.center;
	},

	get globalSettings () {
		return this.settings.get('controller').settings;
	},

	rotate : function (change, reverse) {
		if (reverse) change *= -1;
		this.angle = (this.angle + change).normalizeAngle();
		return this;
	},

	impulse : function (pos, reverse) {
		this.position.move(pos, reverse);
		return this;
	},

	getVelocity : function () {
		return new Point(
			Math.cos(this.angle) * this.speed,
			Math.sin(this.angle) * this.speed
		);
	},

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
		this.impulse(impulse);
		return this;
	},

	get currentBoundingShape () {
		return this.shape.getBoundingRectangle().grow(8).fillToPixel();
	},

	stop : function () {
		this.velocity.set(0, 0);
		return this;
	},

	renderTo : function (ctx) {
		if (this.hidden || !this.globalSettings.get('showShapes')) return;

		ctx
			.stroke(this.shape, this.color)
			.stroke(
				new Line(
					this.position,
					this.position.clone().move(this.getVelocity())
				), this.color
			);
	}
});