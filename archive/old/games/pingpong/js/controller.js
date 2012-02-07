
Pong.Controller = atom.Class({

	initialize: function (canvas) {

		this.libcanvas = new LibCanvas(canvas, {
				fps: 60,
				clear: 'rgba(20, 20, 20, 0.6)',
				preloadImages: { elems : 'im/elems.png' }
			})
			.listenKeyboard([ 'aup', 'adown', 'w', 's' ])
			.addEvent('ready', this.start.bind(this))
			.start()
			.fpsMeter();
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
			});

		field.createUnits( libcanvas );
	}
});