
Fifteen.Tile = atom.Class({
	Extends: LibCanvas.Scene.Element,

	Implements: [ Animatable, Clickable ],

	initialize: function (scene, options) {
		this.parent.apply( this, arguments );

		this.sprites = {
			'standard': this.renderSprite( 'standard' ),
			'playable': this.renderSprite( 'playable' ),
			'hover'   : this.renderSprite( 'hover' )
		};

		this.clickable().addEvent( 'statusChanged', this.redraw );
	},

	moveTo: function (destination, onFinish, fast) {
		var props = {}, current = this.shape.from;

		if ( !destination.x.equals( current.x, 1 ) ) {
			props.x = destination.x;
		} else if ( !destination.y.equals( current.y, 1 ) ) {
			props.y = destination.y;
		} else {
			throw new TypeError( 'Wrong destination' );
		}

		this.animate({
			time : fast ? 70 : 250,
			fn   : fast ? 'linear' : 'sine-out',
			props: props,
			onProcess: this.redraw,
			onFinish : function () {
				this.redraw();
				onFinish && onFinish.call( this );
			}
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
			buffer = new LibCanvas.Buffer(this.shape.width, this.shape.height, true),
			shape  = buffer.ctx.rectangle,
			stroke = new Rectangle(0.5, 0.5, shape.width-1, shape.height - 1);

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
				text: this.options.index,
				to  : shape,
				size: shape.height / 2,
				color  : 'white',
				weight : 'bold',
				align  : 'center',
				padding: [(shape.height/8).round(), (shape.width/4).round()]
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
			draw : this.options.shape,
			optimize: true
		});
		return this.parent( ctx );
	}
});