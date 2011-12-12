LibCanvas.extract();

var Element = atom.Class({
	Extends: LibCanvas.Scene.Element,

	Implements: [
		LibCanvas.Behaviors.Clickable,
		LibCanvas.Behaviors.Draggable
	],

	initialize: function () {
		this.parent.apply( this, arguments );
		this
			.clickable()
			.draggable()
			.addEvent( 'moveDrag', this.redraw())
			.addEvent( 'statusChanged', this.redraw )
			.addEvent( 'contextmenu', function (event) {
				event.fall();
				event.prevent();
				this.destroy().redraw();
			});
	},

	renderTo: function (ctx) {
		ctx.fill( this.shape, this.options.color );
		if (this.shape.from) {
			var pos = this.shape.from.clone().move([ 5, 15 ]);
		} else {
			pos = this.shape.center;
		}

		ctx.save();
		if (this.hover) ctx.set({ font: 'bold 16px sans-serif', fillStyle: 'red' });
		ctx.fillText( this.options.zIndex, pos );
		return this.parent( ctx.restore() );
	}
});

atom.dom(function (atom, $) {
	var libcanvas = new LibCanvas( 'canvas', {
		invoke: true,
		fps: 60,
		clear: false
	})
	.listenMouse()
	.fpsMeter()
	.start();

	var scene = new LibCanvas.Scene.Standard( libcanvas );

	scene.libcanvas.ctx.fillAll( '#999' );

	var factory = scene.createFactory( Element );

	for (var i = 0; i < 5; i++) {
		var y = 50 + i * 100;
		factory({
			shape: new Rectangle( 50, y-25, 50, 50 ),
			color: 'rgba(255,0,0,0.8)',
			zIndex: 0
		}).redraw(),
		[ 'rgba(0,0,255,0.8)'
		, 'rgba(0,255,255,0.8)'
		, 'rgba(255,0,255,0.8)'
		, 'rgba(255,255,0,0.8)'
		, 'rgba(0,0,255,0.8)'
		, 'rgba(0,255,255,0.8)'
		, 'rgba(255,0,255,0.8)'
		, 'rgba(255,255,0,0.8)'
		, 'rgba(0,0,255,0.8)'
		].forEach(function (color, i) {
			factory({
				shape: new Circle( 200+i*60, y, 40 ),
				color: color,
				zIndex: i+1
			}).redraw()
		});
	}
});