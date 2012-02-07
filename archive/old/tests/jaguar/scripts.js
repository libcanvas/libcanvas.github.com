LibCanvas.extract();

var PartedCircle = atom.Class({
	Implements: [ Drawable, Animatable ],
	initialize: function (libcanvas, shape, color, acw, onCreated) {
		libcanvas.addElement( this );
		this.shape = shape;
		this.acw   = acw;
		this.angle = 0;
		this.color = color;


		this.animate({
			props: { angle: (360).degree() },
			time : 15 * this.shape.radius,
			onProcess: libcanvas.update,
			onFinish : onCreated
		});
	},

	draw: function () {
		this.libcanvas.ctx
			.save()
			.beginPath()
			.arc({
				circle: this.shape,
				angle : [0, this.acw ? -this.angle : this.angle],
				acw   : this.acw
			})
			.set({ lineWidth: 11 })
			.stroke(this.color)
			.closePath()
			.restore();
	}
});

var FadeCircle = atom.Class({
	Implements: [ Drawable, Animatable ],
	initialize: function (lc, circle, onCreated) {
		lc.addElement( this );
		this.circle = circle;
		this.alpha = 0;

		this.animate({
			props: {alpha: 1},
			onProcess: lc.update,
			onFinish: onCreated
		});
	},
	draw: function () {
		this.libcanvas.ctx
			.save()
			.set({ globalAlpha: this.alpha })
			.fill( this.circle, 'rgba(255,165,0,0.9)' )
			// use "to" here instead of "padding"
			.text({ text: 'Loaded', padding: [115,250] })
			.restore();
	}
});

	var circle = function (radius) {
		return new Circle(275, 125, radius);
	};

var MenuItem = atom.Class({
	Implements: [ Drawable, Clickable ],
	initialize: function (lc, ty, text, click) {
		lc.addElement( this );

		this.ty = ty;
		this.buff = 0;
		this.addEvent({ click: click });
		this.text = text;
		this.shape = new RoundedRectangle(-5,this.ty,220,40).setRadius(5);
	},

	activate: function () {
		var update = this.libcanvas.update;
		update();
		this.listenMouse().clickable( update );
	},

	draw: function () {
		this.grad = this.libcanvas.ctx
			.createGradient( new Rectangle(0,this.ty,0,this.ty+40), {
				0: this.hover ? '#ff0000' : '#ff9218',
				1: this.hover ? '#cd0000' : '#cd5700'
			});
		
		this.libcanvas.ctx
			.save()
			.set({
				shadowBlur : "3",
				shadowColor: "black"
			})
			.fill(this.shape, this.grad)
			.restore()
			.text({
				text: this.text,
				to  : this.shape,
				padding: [8,5],
				size: 20
			});


	}
});