
/** @class Ast.Collisions */
declare( 'Ast.Collisions', {

	initialize: function (controller) {
		this.bindMethods('update');

		this.controller= controller;
		this.ships     = [];
		this.bullets   = [];
		this.asteroids = [];
	},

	/** @private */
	getArray: function (item) {
		var a = item instanceof Ast.Asteroid ? this.asteroids :
		        item instanceof Ast.Bullet   ? this.bullets   :
		        item instanceof Ast.Ship     ? this.ships     : null;

		if (a == null) throw new TypeError( 'unknown type of ' + item );

		return a;
	},

	add: function (item) {
		this.getArray(item).push(item);
		return this;
	},

	remove: function (item) {
		this.getArray(item).erase(item);
		return this;
	},

	update: function () {
		this.shipsAsteroids();
		this.bulletsAsteroids();
	},
	shipsAsteroids: function () {
		var s, a, ship, ast = this.asteroids;

		for (s = this.ships.length; s--;) {
			ship = this.ships[s];

			if (!ship.invulnerable) for (a = ast.length; a--;) {
				if (ship.shape.intersect( ast[a].shape )) {
					ship.explode();
					break;
				}
			}
		}
	},
	createAsteroids: function () {
		[0,1,2,3].map(function () {
			return this.controller.astBelt.createAsteroid()
		}.bind(this));
	},
	bulletsAsteroids: function () {

		var b, a, bullet, ast = this.asteroids;


		for (b = this.bullets.length; b--;) {
			bullet = this.bullets[b];

			for (a = ast.length; a--;) {
				if (ast[a].shape.hasPoint(bullet.position)) {
					bullet.hit(ast[a]);
					break;
				}
			}
		}

		if (this.asteroids.length < 3) {
			this.ships.invoke('makeInvulnerable');
			this.createAsteroids();
		}
		return this;
	}
});