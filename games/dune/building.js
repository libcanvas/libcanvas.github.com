/** @class Dune.Building */
atom.declare( 'Dune.Building', App.Element, {
	hover: false,

	configure: function () {
		new App.Clickable( this, this.redraw ).start();
	},

	addShift: function (shift) {
		this.shape.move( shift );
		this.previousBoundingShape.move( shift );
		return this;
	},

	get from () {
		return this.settings.get('from');
	},

	get size () {
		return this.settings.get('size');
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