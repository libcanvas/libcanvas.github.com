Hexes.Hex = atom.declare(App.Element, {
	clicked: false,

	configure: function () {
		new App.Clickable( this, this.redraw ).start();

		this.rectangle = new Rectangle(
			this.shape.points[0],
			this.shape.points[3]
		);

		this.events.add( 'mousedown', function () {
			this.clicked = !this.clicked;
			this.redraw();
		})
	},

	addShift: function (shift) {
		this.shape.move( shift );
		this.settings.get('center').move( shift );
		this.previousBoundingShape.move( shift );
		return this;
	},

	get coords () { return this.settings.get('coords') },
	get r      () { return this.coords[0] },
	get g      () { return this.coords[1] },
	get b      () { return this.coords[2] },

	get currentBoundingShape () {
		return this.shape;
	},

	get overlayColor () {
		if (!this.clicked && !this.hover) return null;

		var
			r = this.hover   ? 64 : 0,
			a = this.clicked ? '0.8' : '0.6';

		return 'rgba('+r+',0,0,'+a+')';
	},

	renderTo: function (ctx) {
		ctx.drawImage({
			image : this.settings.get('image'),
			center: this.settings.get('center')
		});
		if (this.overlayColor) {
			ctx.fill( this.shape, this.overlayColor );
			this.drawCoords(ctx);
		}
	},

	/** @private */
	drawCoords: function (ctx) {
		function draw (text, color) {
			ctx.text({
				text : text,
				color: color,
				to   : shape,
				family: 'monospace'
			});
		}
		function prepareNumber (number) {
			return number == 0 ? ' 0' : number > 0 ? '+' + number : String(number);
		}

		var
			shape = this.rectangle,
			c = this.settings.get('coords');

		draw(     '\n r: ' + prepareNumber(c[0]), '#f63' );
		draw(   '\n\n g: ' + prepareNumber(c[1]), '#0f0' );
		draw( '\n\n\n b: ' + prepareNumber(c[2]), '#09f' );
	}
});