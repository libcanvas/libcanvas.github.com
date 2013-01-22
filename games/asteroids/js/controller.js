/** @class Ast.Controller */
declare( 'Ast.Controller', {
	settings: {
		showShapes: false,
		 fieldSize: new Size(800, 500),
		boundsSize: new Size( 64,  64)
	},

	initialize: function () {
		this.settings = new Settings(this.settings);

		atom.ImagePreloader.run({
			explosion : 'im/explosion.png',
			debris    : 'im/explosion-debris.png',
			ships     : 'im/ships.png',
			shot      : 'im/shot.png',
			stones    : 'im/stones.png'
		}, this.run, this);

		this.fpsMeter();
	},

	fpsMeter: function () {
		var fps = atom.trace(), time = [], last = Date.now();

		atom.frame.add(function () {
			if (time.length > 5) time.shift();

			time.push( Date.now() - last );
			last = Date.now();

			fps.value = Math.ceil(1000 / time.average()) + " FPS";
		});
	},

	get randomFieldPoint () {
		return this.fieldRectangle.getRandomPoint(50);
	},

	run: function (images) {
		this.collisions = new Ast.Collisions(this);

		atom.frame.add( this.collisions.update );

		this.fieldRectangle = new Rectangle({
			from: new Point(0,0),
			size: this.settings.get('fieldSize')
		});

		this.sounds = new Ast.Sounds( '/games/asteroids/sounds/' );

		this.astBelt        = new Ast.Belt(this, images);
		this.shipSheets     = this.createShipSheets  ( images.get('ships' ) );
		this.explosionSheet = new Animation.Sheet({
			frames: new Animation.Frames( images.get('explosion'), 150, 125 ),
			delay : 30
		});

		this.createLayers( this.settings.get('fieldSize'), images );

		this.ships = [
			new Ast.Ship( this.layer, {
				type: Number.random(0, 1),
				manipulator: new Ast.Manipulator( Ast.Manipulator.defaultSets[0] ),
				controller: this,
				shape: new Circle(this.randomFieldPoint,25)
			})
		];

		this.collisions.add(this.ships[0]);

		this.collisions.createAsteroids();
	},

	createLayers: function (size, images) {
		this.app = new App({
			size: size,
			simple: true
		});

		this.layer = this.app.createLayer({
			intersection: 'all',
			invoke: true
		});

		this.layer.dom.element
			.css({ background: 'url(im/stars.jpg)' });

		this.app.resources.set('images', images);
	},

	createShipSheets: function (image) {
		var
			length = 9,
			frames = new Animation.Frames( image, 40, 40 );

		return [0, length].map(function (start) {
			return new Animation.Sheet({
				sequence: Array.range(start, start+length-1),
				frames: frames,
				looped: true,
				delay : 50
			});
		});
	}

});