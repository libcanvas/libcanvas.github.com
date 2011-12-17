Hexes.Hex = atom.Class({

	Extends: LibCanvas.Scene.Element,

	Implements: Clickable,

	clicked: false,

	initialize: function (scene, options) {
		this.parent( scene, options );

		var points = this.shape.points;
		this.rectangle = new Rectangle({ from:points[0], to: points[3] });
		
		this.addEvent( 'mousedown', function () {
			this.clicked = !this.clicked;
			this.redraw();
		})
	},

	fastPointsMove: function (points, shift) {
		for (var p, i = points.length; i--;) {
			p = points[i];
			p.x += shift.x;
			p.y += shift.y;
		}
	},

	addShift: function (shift) {
		this.fastPointsMove( this.shape.points, shift );
		this.fastPointsMove( this.previousBoundingShape.points, shift );
		this.fastPointsMove( [this.options.center], shift );
		return this;
	},

	get overlayColor () {
		if (!this.clicked && !this.hover) return null;

		var c = this.hover   ? 64 : 0;
		var a = this.clicked ? '0.8' : '0.6';

		return 'rgba('+c+',0,0,'+a+')';
	},

	renderTo: function (ctx) {
		ctx.drawImage({
			image : this.options.image,
			center: this.options.center
		});
		if (this.overlayColor) {
			ctx.fill( this.shape, this.overlayColor );
			this.drawCoords(ctx);
		}
	},

	/** @private */
	drawCoords: function (ctx) {
		var
			shape = this.rectangle,
			c = this.options.coords,
			r = c[0],
			g = c[1],
			b = c[2];
		var draw = function (text, color) {
			ctx.text({
				text : text,
				color: color,
				to   : shape,
				family: 'monospace'
			});
		};
		var prepareNumber = function (number) {
			return number == 0 ? ' 0' : number > 0 ? '+' + number : String(number);
		};

		draw(     '\n r: ' + prepareNumber(r), '#f63' );
		draw(   '\n\n g: ' + prepareNumber(g), '#0f0' );
		draw( '\n\n\n b: ' + prepareNumber(b), '#09f' );
	}

});