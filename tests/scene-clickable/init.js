LibCanvas.extract();

var Element = atom.Class({
	Extends: LibCanvas.Scene.Element,

	Implements: LibCanvas.Behaviors.Clickable,

	initialize: function () {
		this.parent.apply( this, arguments );
		this
			.clickable()
			.addEvent( 'statusChanged', this.redraw );
	},

	renderTo: function (ctx) {
		var color;

		if (this.hover) {
			color = this.active ? '#f00' : '#600';
		} else {
			color = this.active ? '#0f0' : '#060';
		}

		ctx.fill( this.shape, color );
		ctx.text({
			text: this.options.name,
			to  : this.shape,
			align: 'center',
			weight: 'bold'
		})
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

	var scene1 = new LibCanvas.Scene.Standard( libcanvas );

	new Element( scene1, {
		name  : '1/first',
		shape : new Rectangle( 100, 100, 100, 100 )
	});
	new Element( scene1, {
		name  : '1/second',
		shape : new Rectangle( 250, 100, 100, 100 )
	});


	var scene2 = new LibCanvas.Scene.Standard( libcanvas.createLayer('second') );

	new Element( scene2, {
		name  : '2/third',
		shape : new Rectangle( 100, 250, 100, 100 )
	});
	new Element( scene2, {
		name  : '2/forth',
		shape : new Rectangle( 250, 250, 100, 100 )
	});
});