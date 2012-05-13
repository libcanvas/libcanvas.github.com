/** @class Ast.Controller */
declare( 'Ast.Controller', {
	settings: {
		showShapes: false,
		 fieldSize: new Size(800, 500),
		boundsSize: new Size( 64,  64)
	},

	initialize: function () {
		this.settings = new Settings(this.settings);

		ImagePreloader.run({
			explosion : 'im/explosion.png',
			ships     : 'im/ships.png',
			shot      : 'im/shot.png',
			stones    : 'im/stones.png'
		}, this.run, this)
	},

	get randomFieldPoint () {
		return this.fieldRectangle.getRandomPoint(50);
	},

	addBullet: function (bullet) {

	},

	run: function (images) {
		this.fieldRectangle = new Rectangle({
			from: new Point(0,0),
			size: this.settings.get('fieldSize')
		});

		this.astBelt        = new Ast.Belt(this, images);
		this.shipSheets     = this.createShipSheets  ( images.get('ships' ) );
		this.explosionSheet = new Animation.Sheet({
			frames: new Animation.Frames( images.get('explosion'), 150, 125 ),
			delay : 30
		});

		this.createScenes( this.settings.get('fieldSize'), images );

		$ship = new Ast.Ship( this.scene, {
			type: 0,
			manipulator: new Ast.Manipulator( Ast.Manipulator.defaultSets[0] ),
			controller: this,
			shape: new Circle(this.randomFieldPoint,25)
		});
		$ship = new Ast.Ship( this.scene, {
			type: 1,
			manipulator: new Ast.Manipulator( Ast.Manipulator.defaultSets[1] ),
			controller: this,
			shape: new Circle(this.randomFieldPoint,25)
		});

		this.astBelt.createAsteroid();
		this.astBelt.createAsteroid();
		this.astBelt.createAsteroid();
		this.astBelt.createAsteroid();
		this.astBelt.createAsteroid();
		this.astBelt.createAsteroid();
	},

	createScenes: function (size, images) {
		var targetNode = atom.dom('div')
			.css(size.toObject())
			.css({ background: 'url(im/stars.jpg)' });

		this.app = new App({ size: size, appendTo: targetNode });
		this.scene = this.app.createScene({
			name: 'main',
			intersection: 'all',
			invoke: true
		});

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