Isometric.Map = atom.declare({
	name: 'Isometric.Map',

	parent: LibCanvas.App.Element,

	prototype: {
		/** @property {LibCanvas.Shapes.Polygon} */
		shape: null,

		/**
		 * @private
		 * @property {LibCanvas.Shapes.Polygon[]}
		 */
		polygons: null,

		/** @property {LibCanvas.Engines.IsometricProjection} */
		projection: null,

		/** @property {LibCanvas.Point3D} */
		size: null,

		/** @property {int} */
		cellSize: 0,

		/** @constructs */
		configure: function () {
			this.bindMethods([ 'toIsometric' ]);

			this.projection = this.settings.get('projection');
			this.size       = this.settings.get('size');
			this.cellSize   = this.settings.get('cellSize');

			this.polygons = [];

			this
				.createPolygons()
				.createShape();
		},

		/**
		 * @private
		 * @returns {Isometric.Map}
		 */
		createPolygons: function () {
			var x, y, points, s = this.size;

			this.polygons.empty();

			for (y = 0; y < s.y; y++) for (x = 0; x < s.x; x++) {
				points = [
					[ (x  ), (y  ) ],
					[ (x+1), (y  ) ],
					[ (x+1), (y+1) ],
					[ (x  ), (y+1) ]
				].map(this.toIsometric);

				this.polygons.push(new Polygon( points ));
			}

			return this;
		},

		/**
		 * @private
		 * @returns {Isometric.Map}
		 */
		createShape: function () {
			var s = this.size;

			this.shape = new Polygon([
				[   0,   0 ],
				[ s.x,   0 ],
				[ s.x, s.y ],
				[   0, s.y ]
			].map( this.toIsometric ));

			return this;
		},

		/**
		 * @param {Isometric.Point3D} coord
		 * @returns {boolean}
		 */
		hasPoint: function (coord) {
			var size = this.size;
			return coord.x.ceil().between(0, size.x, 'L') &&
					 coord.y.ceil().between(0, size.y, 'L') &&
					 coord.z.ceil().between(0, size.z, 'L')
		},

		/**
		 * @param {Isometric.Point3D} point3d
		 * @returns {LibCanvas.Point}
		 */
		toIsometric: function (point3d) {
			return this.projection.toIsometric( point3d ).mul( this.cellSize );
		},

		/**
		 * @param {LibCanvas.Point} coord
		 * @param {number} z = 0
		 * @returns {Isometric.Point3D}|null
		 */
		to3D: function (coord, z) {
			var
				cellSize = this.cellSize,
				result = this.projection
					.to3D( Point( coord ), z * this.cellSize )
					.map(function (c, axis) {
						c /= cellSize;
						return axis == 'z' ? c : Math.floor(c);
					});

			return this.hasPoint(result) ? result : null;
		},

		clearPrevious: function(){},

		/** @returns {Isometric.Map} */
		renderTo: function (ctx) {
			ctx.save();
			ctx.translate(this.settings.get('shift'));
			this.polygons.forEach(function (poly) {
				var color = '#' + Number.random( 240, 255 ).toString( 16 ).repeat( 3 );
				ctx.fill( poly, color );
			});
			ctx.restore();

			return this;
		}
	}
});