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
			.addEvent({
				'statusChanged': this.redraw,
				'moveDrag'     : this.redraw,
				'click'        : function (e) {
					new Trace( 'Click: ' + this.options.name );
				}
			});

		if (this.options.fall) {
			var fall = function (e) { e.fall() };
			this.addEvent({
				'mousedown': fall,
				'mouseup'  : fall,
				'mousemove': fall
			});
		}
	},

	renderTo: function (ctx) {
		var color;

		if (this.hover) {
			color = this.active ? '#f00' : '#600';
		} else {
			color = this.active ? '#0f0' : '#060';
		}

		var stroke = this.shape.clone();
		stroke.from.move([0.5, 0.5]);
		stroke.to.move([-0.5, -0.5]);

		ctx.save();
		if (this.options.fall) ctx.set( 'globalAlpha', 0.5 );
		ctx.fill( this.shape, color ).stroke( stroke, 'black' );
		ctx.text({
			text: this.options.name,
			to  : this.shape,
			align: 'center',
			weight: 'bold'
		});
		ctx.restore();

		return this.parent( ctx );
	}
});

atom.dom(function (atom, $) {

	var app = new LibCanvas.App( 'canvas', {
		fpsMeter: true,
		mouse   : true,
		width   : 800,
		height  : 400
	});

	var scene1 = app.createScene('first');

	new Element( scene1, {
		name  : '1/first',
		zIndex: 1,
		shape : new Rectangle( 100, 100, 100, 100 )
	});
	new Element( scene1, {
		name  : '1/second',
		zIndex: 2,
		shape : new Rectangle( 250, 100, 100, 100 )
	});


	var scene2 = app.createScene('second');

	new Element( scene2, {
		name  : '2/third',
		zIndex: 3,
		fall  : true,
		shape : new Rectangle( 100, 250, 100, 100 )
	});
	new Element( scene2, {
		name  : '2/forth',
		zIndex: 4,
		shape : new Rectangle( 300, 150, 100, 100 )
	});
});