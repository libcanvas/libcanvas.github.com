Dune.Bulding = atom.Class({
	Extends: LibCanvas.Scene.Element,

	Implements: Clickable,

	initialize: function (scene, options) {
		this.shape = new Rectangle({ from: options.from, size: options.image });
		this.parent( scene, options );
	},

	get type () {
		return this.options.type;
	},

	/** @private */
	fastMoveRect: function (rect, shift) {
		rect.from.x += shift.x;
		rect.from.y += shift.y;
		rect.to.x += shift.x;
		rect.to.y += shift.y;
	},

	addShift: function (shift) {
		this.fastMoveRect( this.shape, shift );
		this.fastMoveRect( this.previousBoundingShape, shift );
		return this;
	},

	renderTo: function (ctx) {
		var o = this.options;
		ctx.drawImage({
			image: o.image,
			draw : this.shape,
			optimize: true
		});
		if (this.hover) {
			ctx.fill( this.shape, 'rgba(255,255,0,0.1)' );
			ctx.text({
				color: 'white',
				text : o.index + ':' + o.x + '*' + o.y,
				overflow: 'hidden',
				to   : this.shape,
				shadow : '0 0 1 black',
				size   : 10,
				padding: 2
			});
		}
	}
});