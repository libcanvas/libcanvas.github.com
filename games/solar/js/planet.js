/** @class Solar.Planet */
atom.declare('Solar.Planet', App.Element, {

	angle: 0,

	configure: function () {
		this.size = new Size(26, 26);

		this.center = this.solarCenter.clone();
		this.center.move([ this.radius, 0 ]);

		this.shape = new Circle(this.center, this.size.width/2);

		this.image  = this.getImagePart();

		this.mousePoint = this.layer.app.resources.get('mouse').point;

		new App.Clickable( this, this.redraw ).start();

		this.rotate();

		this.info = new Solar.Info(this.layer, { planet: this, zIndex: 1 });
	},

	createOrbit: function (layer, z) {
		return this.orbit = new Solar.Orbit(layer, { planet: this, zIndex: z });
	},

	getImagePart: function () {
		var x = this.settings.get('image');

		return this.layer.app.resources.get('images')
			.get('planets')
			.sprite(new Rectangle([x*this.size.width,0],this.size));
	},

	get radius () {
		return this.settings.get('radius');
	},

	get solarCenter () {
		return this.settings.get('sun').shape.center;
	},

	rotate: function (angle) {
		if (angle == null) angle = Number.random(0, 360).degree();

		this.angle = (this.angle + angle).normalizeAngle();
		this.center.rotate(angle, this.solarCenter);

		return this;
	},

	checkStatus: function (visible) {
		if (this.info.isVisible() != visible) {
			this.info[visible ? 'show' : 'hide']();
			this.layer.dom.element.css('cursor', visible ? 'pointer' : 'default');
		}
	},

	onUpdate: function (time) {
		this.rotate(time * (360).degree() / 1000 / this.settings.get('time'));
		this.redraw();

		if (this.orbit.isHover()) this.orbit.redraw();

		this.checkStatus(this.isTriggerPoint(this.mousePoint));
		if (this.info.isVisible()) this.info.updateShape(this.shape.center);
	},

	renderTo: function (ctx) {
		ctx.drawImage({
			image : this.image,
			center: this.center,
			angle : this.angle
		});
	}

});
