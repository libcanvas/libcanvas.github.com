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
		this.app   = new App({ size: this.size, simple: true });
		this.layer = this.app.createLayer({ invoke: true });
		this.app.resources.set('images', images);

		this.units = {
			left : this.createUnit( 40,  'w' , 's'),
			right: this.createUnit(760, 'aup', 'adown')
		};

		this.ball = new Pong.Ball( this.layer, {
			controller: this,
			size: this.size
		});
	},

	createUnit: function (line, up, down) {
		return new Pong.Unit( this.layer, {
			controller: this,
			line: line,
			size: this.size,
			controls: { up: up, down: down }
		});
	}
});