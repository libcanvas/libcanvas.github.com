/** @class Isometric.Controller */
atom.declare( 'Isometric.Controller', {
	/** @property {Isometric.Map} */
	map: null,

	/**
	 * @constructs
	 * @param {string} element - link to dom element
	 */
	initialize: function () {
		// this.projection = new LibCanvas.Engines.Isometric.Projection([ 0.866, 0.5, 1 ]);

		this.app = new LibCanvas.App({
			size: new Size(800, 600),
			appendTo: 'body'
		});

		this.mapLayer = this.app.createLayer({ name: 'map' });
		this.boxLayer = this.app.createLayer({ name: 'box' });

		this.mouse = new LibCanvas.Mouse(this.app.container.bounds);

		this.map = new Isometric.Map( this.mapLayer, {
			projection: new LibCanvas.Engines.Isometric.Projection({
				factor: [ 0.866, 0.5, 1 ],
				start : [ 40, 380 ],
				size  : 32
			}),
			size: new LibCanvas.Point3D( 13, 13, 7 ),
			cellSize: 1
		});

		this.box = this.createBox({
			coordinates: new LibCanvas.Point3D( 6, 6, .13 ),
			colors: [ '#eaa', '#a66', '#733' ],
			zIndex: 2
		});

		this.addMouseControls(this.box);
	},

	/**
	 * @private
	 * @param {Isometric.Box} box
	 * @returns {Isometric.Box}
	 */
	addMouseControls: function (box) {
		var mouse = this.mouse;
		mouse.events.add({
			click: function (e) {
				var newCoord = this.map.to3D( mouse.point );

				if (!newCoord) return;
				newCoord.z = box.coords.z;
				this.removeGhost().createGhost( newCoord );
				box.move(
					box.coords.diff( this.ghost.coords ),
					this.removeGhost.bind(this)
				);
			}.bind(this),
			wheel: function (e) {
				box.move( [0,0,e.delta] );
				this.removeGhost();
				e.preventDefault();
			}.bind(this)
		});

		return box;
	},

	/**
	 * @private
	 * @returns {Isometric.Controller}
	 */
	removeGhost: function () {
		if (this.ghost) {
			this.ghost.destroy();
			delete this.ghost;
		}
		return this;
	},

	/**
	 * @private
	 * @param {LibCanvas.Point3D} coord
	 * @returns {Isometric.Box}
	 */
	createGhost: function (coordinates) {
		var color = 'rgba(200,240,255,0.3)';
		return this.ghost = this.createBox({
			colors: [ color, color, color ],
			coordinates: coordinates
		});
	},

	/**
	 * @private
	 * @param {Object} settings
	 * @returns {Isometric.Box}
	 */
	createBox: function (settings) {
		settings.map = this.map;
		return new Isometric.Box( this.boxLayer, settings );
	}
});