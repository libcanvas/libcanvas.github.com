/** @class Pong.Ball */
atom.declare( 'Pong.Ball', App.Element, {

	configure: function () {
		this.impulse = new Point(
			this.getRandomImpulsePower(),
			this.getRandomImpulsePower()
		);

		this.shape = new Circle(new Point(this.size).mul(0.5), 15);
	},

	get size () {
		return this.settings.get('size');
	},

	get units () {
		return this.settings.get('controller').units;
	},

	getRandomImpulsePower: function () {
		return Number.random(325, 375) * (Math.random() > 0.5 ? 1 : -1);
	},

	collides: function (unit) {
		return unit.shape.intersect(this.shape);
	},

	collidesUnits: function () {
		return this.collides(this.units.left ) ? -1 :
		       this.collides(this.units.right) ?  1 : 0;
	},

	isOut: function () {
		var s = this.shape;
		if (s.center.x < s.radius) {
			this.units.left.increaseScore();
			return -1;
		} else if (s.center.x > this.size.width - s.radius) {
			this.units.right.increaseScore();
			return 1;
		}
		return 0;
	},

	move: function (time) {
		this.shape.center.move(
			this.impulse.clone().mul(time / 1000)
		);
	},

	checkImpulseX: function () {
		var
			coll = this.collidesUnits(),
		    isOut = this.isOut();

		return this.impulse.x > 0 ?
			( coll > 0 || isOut > 0 ) :
			( coll < 0 || isOut < 0 );
	},

	checkImpulseY: function () {
		var
			imp   = this.impulse.y,
			value = this.shape.center.y,
			r     = this.shape.radius;

		return (imp < 0 && value < r) || (imp > 0 && value > this.size.y - r)
	},

	onUpdate: function (time) {
		this.move(time);

		if (this.checkImpulseY()) this.impulse.y *= -1;
		if (this.checkImpulseX()) this.impulse.x *= -1;

		this.redraw();
	},

	renderTo: function (ctx, resources) {
		ctx.drawImage({
			image : resources.get('images').get('ball'),
			center: this.shape.center
		})
	}
});