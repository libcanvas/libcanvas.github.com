
Pong.Controller = atom.Class({

	initialize: function (canvas) {

		this.libcanvas = new LibCanvas(canvas, {
				preloadImages: { elems : 'im/elems.png' }
			})
			.listenKeyboard([ 'aup', 'adown' ])
			.addEvent('ready', this.start.bind(this))
			.start();
	},

	start: function () {
		var libcanvas = this.libcanvas,
		    field = new Pong.Field(),
		    ball  = new Pong.Ball();
		
		libcanvas
			.addElement( field )
			.addElement( ball.appendTo( field ) )
			.size(field, true)
			.addFunc(function (time) {
				ball.update( time );
				libcanvas.update();
			}.bind(this));

		field.createUnits( ball, libcanvas );
	}
});