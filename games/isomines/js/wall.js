/** @class IsoMines.Wall */
atom.declare( 'IsoMines.Wall', App.Element, {

	from: null,
	side: 'empty',

	configure: function () {
		this.settings.properties(this, 'from side');

		this.suffix = Math.random() > 0.7 ? 'arrow' : 'empty';
		this.shape  = new Rectangle(this.from, new Size(90, 104));
	},

	clearPrevious: function () {},

	renderTo: function (ctx, resources) {
		ctx.drawImage(
			resources.get('images').get('walls-' + this.side + '-' + this.suffix),
			this.from
		);
	}

});