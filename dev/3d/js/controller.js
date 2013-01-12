/** @class Eye.Controller */
atom.declare( 'Eye.Controller', {

	initialize: function () {
		atom.ImagePreloader.run({
			textures: 'textures.png',
			player  : 'player.png'
		}, this.start, this);
	},

	start: function (images) {
		this.textures = images.get('textures');
		this.map = new Eye.Map(this);
		this.app = new App({ size: this.map.size });
		this.app.resources.set({ images: images });
		this.map.appendTileEngine();

		this.layer = this.app.createLayer({ name: 'objects', invoke: true });

		new Eye.Player( this.layer, {
			controller: this,
			position: new Point(10, 6)
		});
	}

});