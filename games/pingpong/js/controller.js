/** @class Pong.Controller */
atom.declare( 'Pong.Controller', {
	ball: null,

	initialize: function () {
		atom.ImagePreloader.run({
			'ball'    : 'elems.png [20:0:26:26]',
			'platform': 'elems.png [0:0:20:100]'
		}, this.start.bind(this));
	},

	start: function (images) {
		this.size  = new Size(800, 500);
		this.app   = new App({ size: this.size });
		this.layer = this.app.createLayer({ invoke: true });
		this.app.resources.set('images', images);

		this.units = {
			left: new Pong.Unit( this.layer, {
				controller: this,
				line: 40,
				size: this.size,
				controls: { up: 'w', down: 's' }
			}),
			right: new Pong.Unit( this.layer, {
				controller: this,
				line: 760,
				size: this.size,
				controls: { up: 'aup', down: 'adown' }
			})
		};

		this.ball = new Pong.Ball( this.layer, {
			controller: this,
			size: this.size
		});
	}
});