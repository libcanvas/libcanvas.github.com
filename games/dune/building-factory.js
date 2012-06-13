/** @class Dune.BuildingFactory */
atom.declare( 'Dune.BuildingFactory', App.Element, {

	cell : new Size(32, 32),

	sizes : {
		plate   : new Size(1,1),
		plant   : new Size(3,2),
		harvest : new Size(3,2),
		power   : new Size(2,2),
		factory : new Size(2,2),
		barrack : new Size(2,2)
	},

	initialize: function (controller, field) {
		this.controller = controller;
		this.field = field;
		this.buildingsCount  = 0;
	},

	produceDefault: function (count, mul, onTick, onComplete) {
		var i = 0, x, y, maps = this.constructor.maps;

		for (y = 0; y < count.y; y++) for (x = 0; x < count.x; x++) {
			setTimeout(function (x, y) {
				this.produceMap(new Point(x*mul, y*mul), maps.random);
				onTick.call(this);
			}.bind(this, x, y), 10*i++);
		}
		
		setTimeout(onComplete, 10*(i+5));
	},

	produceMap: function (from, map) {
		for (var i = map.length; i--;) {
			this.createBuilding(
				map[i][0],
				new Point(
					map[i][1],
					map[i][2]
				).move(from)
			);
		}
	},

	getRealFieldSize: function () {
		return this.cell.clone().mul(this.field);
	},

	createBuilding: function (type, from) {
		var b, size = this.getSize(type);

		this.buildingsCount++;
		b = new Dune.Building( this.controller.layer, {
			type: type,
			from: from,
			size: size,
			shape: this.createShape(from, size)
		});
		this.controller.app.resources.get('mouseHandler').subscribe(b);

		return b;
	},

	getSize: function (type) {
		return this.sizes[type];
	},

	createShape: function (from, size) {
		return new Rectangle(
			from.clone().mul(this.cell),
			size.clone().mul(this.cell)
		);
	}
}).own({
	maps: [
		[
			[ 'barrack',   0,   0 ],
			[ 'plate'  ,   2,   0 ],
			[ 'plate'  ,   3,   0 ],
			[ 'plate'  ,   4,   0 ],
			[ 'plate'  ,   5,   0 ],
			[ 'plate'  ,   6,   0 ],
			[ 'plate'  ,   7,   0 ],
			[ 'plate'  ,   2,   1 ],
			[ 'plate'  ,   0,   2 ],
			[ 'plate'  ,   1,   2 ],
			[ 'plate'  ,   2,   2 ],
			[ 'plant'  ,   3,   1 ],
			[ 'plate'  ,   2,   3 ],
			[ 'factory',   0,   3 ],
			[ 'plate'  ,   3,   3 ],
			[ 'plate'  ,   4,   3 ],
			[ 'plate'  ,   5,   3 ],
			[ 'plate'  ,   6,   3 ],
			[ 'plate'  ,   7,   3 ],
			[ 'power'  ,   2,   4 ],
			[ 'harvest',   4,   4 ],
			[ 'power'  ,   6,   1 ],
			[ 'barrack',   0,   5 ],
			[ 'plate'  ,   0,   7 ],
			[ 'plate'  ,   7,   4 ],
			[ 'plate'  ,   7,   5 ],
			[ 'barrack',   2,   6 ],
			[ 'plate'  ,   7,   6 ],
			[ 'plate'  ,   1,   7 ],
			[ 'plate'  ,   7,   7 ],
			[ 'harvest',   4,   6 ]
		], [
			[ 'factory',   0,   0 ],
			[ 'plate'  ,   2,   0 ],
			[ 'plate'  ,   3,   0 ],
			[ 'plate'  ,   4,   0 ],
			[ 'plate'  ,   5,   0 ],
			[ 'plate'  ,   6,   0 ],
			[ 'plate'  ,   7,   0 ],
			[ 'plate'  ,   2,   1 ],
			[ 'plate'  ,   0,   2 ],
			[ 'plate'  ,   1,   2 ],
			[ 'plate'  ,   2,   2 ],
			[ 'plate'  ,   2,   3 ],
			[ 'plate'  ,   2,   4 ],
			[ 'plate'  ,   3,   3 ],
			[ 'plate'  ,   4,   3 ],
			[ 'plate'  ,   5,   3 ],
			[ 'plate'  ,   6,   3 ],
			[ 'plate'  ,   7,   3 ],
			[ 'barrack',   6,   4 ],
			[ 'harvest',   3,   4 ],
			[ 'plant'  ,   3,   6 ],
			[ 'barrack',   3,   1 ],
			[ 'harvest',   5,   1 ],
			[ 'power'  ,   0,   5 ],
			[ 'power'  ,   0,   3 ],
			[ 'plate'  ,   0,   7 ],
			[ 'plate'  ,   1,   7 ],
			[ 'plate'  ,   2,   5 ],
			[ 'plate'  ,   2,   6 ],
			[ 'plate'  ,   2,   7 ],
			[ 'barrack',   6,   6 ]
		], [
			[ 'power'  ,   0,   0 ],
			[ 'plate'  ,   2,   0 ],
			[ 'plate'  ,   3,   0 ],
			[ 'plate'  ,   4,   0 ],
			[ 'plate'  ,   5,   0 ],
			[ 'plate'  ,   6,   0 ],
			[ 'plate'  ,   7,   0 ],
			[ 'plate'  ,   2,   1 ],
			[ 'plate'  ,   0,   2 ],
			[ 'plate'  ,   1,   2 ],
			[ 'plate'  ,   2,   2 ],
			[ 'plate'  ,   2,   3 ],
			[ 'plate'  ,   2,   4 ],
			[ 'plate'  ,   3,   3 ],
			[ 'plate'  ,   4,   3 ],
			[ 'plate'  ,   5,   3 ],
			[ 'plate'  ,   6,   3 ],
			[ 'plate'  ,   7,   3 ],
			[ 'barrack',   6,   1 ],
			[ 'harvest',   3,   1 ],
			[ 'harvest',   3,   4 ],
			[ 'harvest',   3,   6 ],
			[ 'barrack',   6,   6 ],
			[ 'barrack',   6,   4 ],
			[ 'barrack',   0,   5 ],
			[ 'barrack',   0,   3 ],
			[ 'plate'  ,   0,   7 ],
			[ 'plate'  ,   1,   7 ],
			[ 'plate'  ,   2,   7 ],
			[ 'plate'  ,   2,   5 ],
			[ 'plate'  ,   2,   6 ]
		], [
			[ 'plate'  ,   2,   2 ],
			[ 'plate'  ,   7,   7 ],

			[ 'plate'  ,   3,   2 ],
			[ 'plate'  ,   4,   2 ],
			[ 'plate'  ,   5,   2 ],
			[ 'plate'  ,   6,   2 ],
			[ 'plate'  ,   7,   2 ],

			[ 'plate'  ,   2,   3 ],
			[ 'plate'  ,   2,   4 ],
			[ 'plate'  ,   2,   5 ],
			[ 'plate'  ,   2,   6 ],
			[ 'plate'  ,   2,   7 ],

			[ 'plate'  ,   3,   7 ],
			[ 'plate'  ,   4,   7 ],
			[ 'plate'  ,   5,   7 ],
			[ 'plate'  ,   6,   7 ],

			[ 'plate'  ,   7,   3 ],
			[ 'plate'  ,   7,   4 ],
			[ 'plate'  ,   7,   5 ],
			[ 'plate'  ,   7,   6 ],

			[ 'power'  ,   0,   0 ],
			[ 'power'  ,   0,   2 ],
			[ 'power'  ,   0,   4 ],
			[ 'power'  ,   0,   6 ],

			[ 'power'  ,   2,   0 ],
			[ 'power'  ,   4,   0 ],
			[ 'power'  ,   6,   0 ],

			[ 'power'  ,   5,   5 ],
			[ 'power'  ,   3,   3 ],
			[ 'power'  ,   5,   3 ],
			[ 'power'  ,   3,   5 ],
		]
	]
});