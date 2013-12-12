atom.declare( 'Fifteen.Tile', App.Element, {
	configure: function () {
		this.animate = new atom.Animatable(this).animate;

		this.sprites = {
			'standard': this.renderSprite( 'standard' ),
			'playable': this.renderSprite( 'playable' ),
			'hover'   : this.renderSprite( 'hover' )
		};

		new App.Clickable( this, this.redraw ).start();
	},

	get position () {
		return this.settings.get('position');
	},

	moveTo: function (destination, onFinish, fast) {
		var props = {}, current = this.shape.from;

		if ( !atom.number.equals(destination.x, current.x, 1 ) ) {
			props.x = destination.x;
		} else if ( !atom.number.equals(destination.y, current.y, 1 ) ) {
			props.y = destination.y;
		} else {
			throw new TypeError( 'Wrong destination' );
		}

		this.animate({
			time : fast ? 70 : 250,
			fn   : fast ? 'linear' : 'sine-out',
			props: props,
			onTick: this.redraw,
			onComplete: function () {
				this.redraw();
				onFinish && onFinish.call( this );
			}.bind(this)
		});
		return this;
	},

	get x () { return this.shape.from.x },
	get y () { return this.shape.from.y },

	set x (value) {
		return this.shape.move(new Point( value - this.x, 0 ));
	},
	set y (value) {
		return this.shape.move(new Point( 0, value - this.y ));
	},

	renderSprite: function ( status ) {
		var
			buffer = LibCanvas.buffer(this.shape.size, true),
			shape  = buffer.ctx.rectangle,
			stroke = shape.clone().snapToPixel();

		var colors = {
			'standard' : [ '#444', '#111' ],
			'playable' : [ '#464', '#131' ],
			'hover'    : [ '#696', '#353' ]
		}[status];

		buffer.ctx
			.fill(shape, buffer.ctx.createGradient( shape, {
				0: colors[0],
				1: colors[1]
			}))
			.text({
				text: this.settings.get('index'),
				to  : shape,
				size: shape.height / 2,
				color  : 'white',
				weight : 'bold',
				align  : 'center',
				padding: [Math.round(shape.height/8), Math.round(shape.width/4)]
			})
			.set({ globalAlpha: 0.6, lineWidth: 1 })
			.stroke(stroke, '#999');

		return buffer;
	},

	renderTo: function (ctx) {
		var status = 'standard';
		if (this.activated) {
			status = this.hover ? 'hover' : 'playable';
		}

		ctx.drawImage({
			image: this.sprites[ status ],
			draw : this.shape,
			optimize: true
		});
	}
});