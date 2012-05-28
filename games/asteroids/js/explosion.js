/** @class Ast.Explosion */
declare( 'Ast.Explosion', App.Element, {

	zIndex: 5,
	angle: 0,


	configure: function () {
		this.angle = Number.random(0, 360).degree();
		this.animation = new Animation({
			sheet   : this.settings.get('sheet'),
			onUpdate: this.redraw,
			onStop  : this.destroy
		});
	},

	renderTo: function (ctx) {
		var image = this.animation.get();

		if (image) {
			ctx.drawImage({
				image: image,
				center: this.shape.center,
				angle: this.angle
			});
		}
	}

});