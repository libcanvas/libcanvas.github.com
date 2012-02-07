
Solitaire.Table = atom.Class({
	Implements: [ Drawable ],

	Generators: {
		clothPattern: function () {
			return this.libcanvas.ctx.createPattern(
				this.libcanvas.getImage('cloth'), 'repeat' );
		}
	},

	initialize: function () {
		this.addEvent('libcanvasReady', function () {
			this.libcanvas.update();
		});
	},

	draw: function () {
		this.libcanvas.ctx.fillAll( this.clothPattern );
	}
});