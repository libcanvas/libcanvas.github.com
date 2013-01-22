/** @class Solar.Orbit */
atom.declare('Solar.Orbit', App.Element, {

	configure: function () {
		this.shape = new Circle(this.planet.solarCenter, this.planet.radius);
		new App.Clickable( this, this.redraw ).start();
	},

	get planet () {
		return this.settings.get('planet');
	},

	isTriggerPoint: function (point) {
		var distance = this.planet.solarCenter.distanceTo(point);

		return (this.planet.radius - distance).abs() < 13;
	},

	isHover: function () {
		return this.hover || this.planet.hover;
	},

	clearPrevious: function (ctx) {
		if (this.previousBoundingShape) {
			ctx.save();
			ctx.set({ lineWidth: 4 });
			ctx.clear(this.previousBoundingShape);
			ctx.clear(this.shape, true);
			ctx.restore();
		} else {
			ctx.clear(this.shape, true);
		}
	},

	saveCurrentBoundingShape: function () {
		if (this.isHover()) {
			this.previousBoundingShape = this.planet.shape.clone().grow(6);
		} else {
			this.previousBoundingShape = null;
		}
		return this;
	},

	renderTo: function (ctx, resources) {
		if (this.isHover()) {
			ctx.save();
			ctx.set({ strokeStyle: 'rgb(0,192,255)', lineWidth: 3 });
			ctx.stroke(this.shape);
			ctx.clear(this.planet.shape);
			ctx.stroke(this.planet.shape);
			ctx.restore();
		} else {
			ctx.stroke(this.shape, 'rgba(0,192,255,0.5)');
		}
	}

});