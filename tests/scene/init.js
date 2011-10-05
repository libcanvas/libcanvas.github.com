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
			.draggable()
			.addEvent( 'moveDrag', this.redraw );
	},

	renderTo: function (ctx) {
		ctx.fill( this.shape, this.options.color );
		if (this.shape.from) {
			var pos = this.shape.from.clone().move([ 5, 15 ]);
		} else {
			pos = this.shape.center;
		}

		ctx.fillText( this.options.zIndex, pos );
		return this.parent( ctx );
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

	var elements = [
		factory({
			shape: new Rectangle( 100, 100, 50, 50 ),
			color: 'rgba(255,0,0,0.8)',
			zIndex: 0
		}).redraw(),
		factory({
			shape: new Circle( 400, 100, 50 ),
			color: 'rgba(0,0,255,0.8)',
			zIndex: 1
		}).redraw(),
		factory({
			shape: new Circle( 460, 100, 50 ),
			color: 'rgba(0,255,255,0.8)',
			zIndex: 2
		}).redraw(),
		factory({
			shape: new Circle( 520, 100, 50 ),
			color: 'rgba(255,0,255,0.8)',
			zIndex: 3
		}).redraw(),
		factory({
			shape: new Circle( 580, 100, 50 ),
			color: 'rgba(255,255,0,0.8)',
			zIndex: 4
		}).redraw(),
		factory({
			shape: new Circle( 460, 300, 50 ),
			color: 'rgba(0,255,0,0.8)',
			zIndex: 5
		}).redraw()
	];

	libcanvas.mouse.addEvent( 'wheel', function (e) {
		for (var i = elements.length; i--;) {
			if (elements[i].shape.hasPoint( e.offset )) {
				elements[i].destroy().redraw();
			}
		}
	});
});