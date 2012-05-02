/** @class Ast.Controller */
declare( 'Ast.Controller', {
	initialize: function () {
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
	},

	createShipSheets: function (image) {
		var
			length = 9,
			frames = new Animation.Frames( image, 40, 40 );

		return [0, length].map(function (start) {
			return new Animation.Sheet({
				sequence: Array.range(start, start+length),
				frames: frames,
				delay : 30
			});
		});
	}

});