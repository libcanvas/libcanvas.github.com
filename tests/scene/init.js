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
			.listenMouse()
			.clickable(this.redraw)
			.draggable(this.redraw)
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
	var app = new LibCanvas.App( 'canvas', {
		mouse   : true,
		fpsMeter: true,
		width   : 800,
		height  : 400
	});

	var scene = app.createScene( 'objects' );

	scene.libcanvas.ctx.fillAll( '#999' );

	for (var i = 0; i < 5; i++) {
		var y = 50 + i * 100;
		new Element( scene, {
			shape: new Rectangle( 50, y-25, 50, 50 ),
			color: 'rgba(255,0,0,0.8)',
			zIndex: 0
		}),
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
			new Element( scene, {
				shape: new Circle( 200+i*60, y, 40 ),
				color: color,
				zIndex: i+1
			})
		});
	}
});