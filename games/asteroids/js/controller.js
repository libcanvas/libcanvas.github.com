/** @class Ast.Controller */
declare( 'Ast.Controller', {
	settings: {
		showShapes: true,
		 fieldSize: new Size(800, 500),
		boundsSize: new Size( 32,  32)
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

	run: function (images) {
		this.shipSheets     = this.createShipSheets  ( images.get('ships' ) );
		this.stonesRegistry = new Ast.Stones.Registry( images.get('stones') );
		this.explosionSheet = new Animation.Sheet({
			frames: new Animation.Frames( images.get('explosion'), 150, 125 ),
			delay : 30
		});

		this.scene = this.createScene( this.settings.get('fieldSize') );

		$ship = new Ast.Ship( this.scene, { controller: this, shape: new Circle(100,100,50) })
	},

	createScene: function (size) {
		var targetNode = atom.dom('div')
			.css(size.toObject())
			.css({ background: 'url(im/stars.jpg)' });

		this.app = new App({ size: size, appendTo: targetNode });
		return this.app.createScene({ name: 'main', intersection: 'all' });
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