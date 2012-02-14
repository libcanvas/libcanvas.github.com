
Isometric.Controller = atom.declare({
	name: 'Isometric.Controller',

	own: {
		box: {
			coords: new LibCanvas.Point3D( 6, 1, 0.12 ),
			colors: [ '#eaa', '#a66', '#733' ]
		}
	},

	prototype: {
		/** @property {Isometric.Map} */
		map: null,

		/**
		 * @constructs
		 * @param {string} element - link to dom element
		 */
		initialize: function () {
			this.projection = new LibCanvas.Engines.IsometricProjection([ 0.866, 0.5, 1 ]);

			this.app = new LibCanvas.App({
				size: new Size(800, 600),
				appendTo: 'body'
			});

			this.mapScene = this.app.createScene({ name: 'map' });
			this.boxScene = this.app.createScene({ name: 'box' });

			this.mouse = new LibCanvas.Mouse(this.app.container.bounds);
			
			this.map = new Isometric.Map( this.mapScene, {
				projection: new LibCanvas.Engines.IsometricProjection([ 0.866, 0.5, 1 ]),
				size      : new LibCanvas.Point3D( 13, 13, 7 ),
				shift     : new Point( 40 , 380 ),
				cellSize  : 32
			});
		},

		/**
		 * @private
		 * @param {LibCanvas.Point3D} coord
		 * @returns {Isometric.Box}
		 */
		createGhost: function (coord) {
			var
				color = 'rgba(200,240,255,0.3)',
				box   = this.map.box( coord );
			box.colors = [color, color, color];
			this.libcanvas.addElement( box ).update();
			return this.ghost = box;
		},

		/**
		 * @private
		 * @returns {Isometric.Controller}
		 */
		removeGhost: function () {
			if (this.ghost) {
				this.libcanvas.rmElement( this.ghost ).update();
				delete this.ghost;
			}
			return this;
		},

		/**
		 * @private
		 * @param {Isometric.Box} elem
		 * @returns {Isometric.Box}
		 */
		addMouseControls: function (elem) {
			this.libcanvas.mouse.addEvent({
				click: function (e) {
					var newCoord = this.map.to3D( e.offset );

					if (!newCoord) return;
					newCoord.z = elem.coords.z;
					this.removeGhost().createGhost( newCoord );
					elem.move(
						elem.coords.diff( this.ghost.coords ),
						elem.libcanvas.update,
						this.removeGhost.bind(this)
					);
				}.bind(this),
				wheel: function (e) {
					elem.move( [0,0,e.delta], this.libcanvas.update );
					this.removeGhost();
					e.preventDefault();
				}.bind(this)
			});

			return elem;
		},

		/**
		 * @private
		 * @param {Object} boxCfg
		 * @returns {Isometric.Box}
		 */
		createBox: function (boxCfg) {
			var box  = this.map.box( boxCfg.coords ).setZIndex( 3 );
			if (boxCfg.colors) box.colors = boxCfg.colors;
			return box;
		},

		/**
		 * @private
		 * @returns {Isometric.Map}
		 */
		createMap: function (mapCfg) {
			return new Isometric.Map( mapCfg.proj, mapCfg.size, mapCfg.cell );
		}
	}
});