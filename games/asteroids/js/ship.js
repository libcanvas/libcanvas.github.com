/** @class Ast.Ship */
declare( 'Ast.Ship', Ast.Flying, {
	configure: function method () {
		method.previous.call(this);

		this.animation = new Animation({
			sheet   : this.settings.get('controller').shipSheets[0],
			onUpdate: this.redraw
		});
	},

	renderTo: function method(ctx) {
		method.previous.call(this, ctx);

		ctx.drawImage({
			image: this.animation.get(),
			center: this.shape.center
		});
	}
});