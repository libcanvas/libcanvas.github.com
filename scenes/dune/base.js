Dune.Base = atom.Class({
	Extends: LibCanvas.Scene.Element,

	Implements: LibCanvas.Behaviors.MouseListener,

	initialize: function (scene, options) {
		this.parent( scene, options );
		var from = this.shape.from;

		this.setChildrenFactory(Dune.Bulding);
		this.options.buildings.forEach(function (args, i) {
			var building = this.createChild({
				from  : new Point(args[1]*50+25, args[2]*50+25).move(from),
				type  : args[0],
				x     : args[1],
				y     : args[2],
				image : scene.resources.getImage(args[0]),
				index : i,
				zIndex: i
			});
			building.clickable( building.redraw );
		}.bind(this));
		this.listenMouse();
	},

	clearPrevious: function () {},

	renderTo: function (ctx) {
		ctx.stroke( this.shape.clone().snapToPixel(), 'red' );
	}
});