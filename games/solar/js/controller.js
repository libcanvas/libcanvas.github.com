/** @class Solar.Controller */
atom.declare('Solar.Controller', {

	names : 'Selene Mimas Ares Enceladus Tethys Dione Zeus Rhea Titan Janus Hyperion Iapetus'.split(' '),

	initialize: function () {

		this.size = new Size(840, 840);

		this.app = new App({ size: this.size });

		this.orbitLayer = this.app.createLayer({
			name: 'orbit',
			intersection: 'manual',
			zIndex: 1
		});

		this.geoLayer = this.app.createLayer({
			name: 'geo',
			invoke: true,
			intersection: 'all',
			zIndex: 2
		});

		atom.ImagePreloader.run({
			planets: 'im/planets.png',
			sun    : 'im/sun.png'
		}, this.start.bind(this));
	},

	start: function (images) {
		var mouse, mouseHandler;

		mouse = new Mouse(this.app.container.bounds);
		mouseHandler = new App.MouseHandler({ mouse: mouse, app: this.app });

		this.app.resources.set({
			images: images,
			mouse : mouse,
			mouseHandler: mouseHandler
		});

		this.sun = new Solar.Sun(this.geoLayer, {
			shape: new Circle(this.app.rectangle.center, 50)
		});

		for (var i = 12; i--;) {
			var planet = new Solar.Planet(this.geoLayer, {
				sun   : this.sun,
				radius: 90 + i * 26,
				time  : 40 + i * 20,
				image : i,
				zIndex: 0,
				name  : this.names[i]
			});
			planet.createOrbit(this.orbitLayer, i);

			mouseHandler.subscribe( planet );
			mouseHandler.subscribe( planet.orbit );
		}
	}

});