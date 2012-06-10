/** @class Dune.Building */
atom.declare( 'Dune.Building', App.Element, {
	hover: false,

	configure: function () {
		this.behaviors = new LibCanvas.Behaviors(this);
		this.behaviors.add('Clickable').start(this.redraw);
	},

	addShift: function (shift) {
		this.shape.move( shift );
		this.previousBoundingShape.move( shift );
		return this;
	},

	get currentBoundingShape () {
		return this.shape;
	},

	get imageName () {
		return this.settings.get('type') + ( this.hover ? '-h' : '' );
	},

	renderTo: function (ctx, resources) {
		ctx.drawImage( resources.get('images').get(this.imageName), this.shape );
	}
});