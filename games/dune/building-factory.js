/** @class Dune.BuildingFactory */
atom.declare( 'Dune.BuildingFactory', App.Element, {

	cell: new Size(32, 32),

	sizes : {
		block   : new Size(1,1),
		plant   : new Size(3,2),
		refinery: new Size(3,2),
		power   : new Size(2,2),
		factory : new Size(2,2),
		barrack : new Size(2,2)
	},

	initialize: function (controller) {
		this.controller = controller;
	},

	createBuilding: function (type, from) {
		var b, size = this.getSize(type);

		b = new Dune.Building( this.controller.scene, {
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
});