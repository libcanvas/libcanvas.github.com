/** @class Eye.Controller */
atom.declare( 'Eye.Controller', {

	initialize: function () {
		atom.ImagePreloader.run({ textures: 'textures.png' }, this.start, this);
	},

	start: function (images) {
		this.textures = images.get('textures');
		this.map = new Eye.Map(this);
		this.app = new App({ size: this.map.size });
		this.map.appendTileEngine();
	}

});