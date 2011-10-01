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

	factory({
		shape: new Rectangle( 100, 100, 50, 50 ),
		color: 'rgba(255,0,0,0.3)'
	}).redraw();

	factory({
		shape: new Circle( 400, 100, 50 ),
		color: 'rgba(0,0,255,0.3)'
	}).redraw();
	factory({
		shape: new Circle( 460, 100, 50 ),
		color: 'rgba(0,255,0,0.3)'
	}).redraw();
	factory({
		shape: new Circle( 520, 100, 50 ),
		color: 'rgba(0,0,255,0.3)'
	}).redraw();
	factory({
		shape: new Circle( 580, 100, 50 ),
		color: 'rgba(0,255,0,0.3)'
	}).redraw();


	factory({
		shape: new Circle( 460, 300, 50 ),
		color: 'rgba(0,255,0,0.3)'
	}).redraw();
});