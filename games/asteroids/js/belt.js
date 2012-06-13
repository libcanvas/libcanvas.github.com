/** @class Ast.Belt */
declare( 'Ast.Belt', {

	count: 0,

	initialize: function (controller, images) {
		this.bindMethods( 'asteroidDie' );

		this.stonesRegistry = new Ast.Stones.Registry( images.get('stones') )
			.defaultMarkup();
		this.controller = controller;
	},

	asteroidDie: function (ast) {
		var
			children = 3,
			set  = ast.settings.get('set'),
			size = ast.settings.get('size');

		if (size < 2) while (children--) {
			this.createAsteroid(
				ast.position.clone(),
				size+1, set
			)
		}

		ast.events.remove( 'die', this.asteroidDie );
		this.controller.collisions.remove( ast );
	},

	createAsteroid: function (point, size, set) {
		if (!set ) set  = this.stonesRegistry.getRandomSet();
		if (!size) size = 0;

		var ast = new Ast.Asteroid( this.controller.layer, {
			zIndex: 1 + this.count++ / 10000000,
			controller: this.controller,
			shape: new Circle( point || this.controller.randomFieldPoint, [40, 26, 15][size] ),
			size : size,
			set  : set,
			image: set.getImage(size)
		});

		this.controller.collisions.add( ast );

		ast.events.add( 'die', this.asteroidDie );

		return ast;
	}

});