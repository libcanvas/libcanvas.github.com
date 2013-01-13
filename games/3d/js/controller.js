/** @class Eye.Controller */
atom.declare( 'Eye.Controller', {

	initialize: function () {
		if (atom.pointerLock.supports) {
			atom.dom.create('p')
				.html('Click on game screen to lock mouse, click on walls to destroy them')
				.appendTo('body');
		}

		atom.ImagePreloader.run({
			textures0: 'textures-0.png',
			textures1: 'textures-1.png',
			textures2: 'textures-2.png',
			textures3: 'textures-3.png',
			textures4: 'textures-4.png',
			textures5: 'textures-5.png',
			player  : 'player.png'
		}, this.start, this);
	},

	player: null,

	start: function (images) {
		this.images = images;
		this.map = new Eye.Map(this);
		this.app = new App({ size: this.map.size });
		this.app.resources.set({ images: images });
		this.map.appendTileEngine();

		this.layer = this.app.createLayer({ name: 'objects', invoke: true });


		this.player = new Eye.Player( this.layer, {
			controller: this,
			position: new Point(10, 5)
		});

		this.ray = new Eye.Ray(this);
		this.ray.cast();

		this.requestPointerLock(this.ray.canvas)
	},

	requestPointerLock: function (element) {
		var player = this.player;

		function onMove (e) {
			player.pointer(new Point(e.movementX, e.movementY));
		}

		atom.dom(element).bind('click', function () {
			atom.pointerLock.request(element, onMove);
		});

		atom.dom().bind('click', function (e) {
			if (atom.pointerLock.locked(element)) {
				player.activate(e);
			}
		}, false);
	}

});