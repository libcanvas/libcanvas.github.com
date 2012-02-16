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

		/** @constructs */
		configure: function () {
			this.projection = this.settings.get('projection');
			this.size       = this.settings.get('size');

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
			var x, y, s = this.size;

			this.polygons.empty();

			for (y = 0; y < s.y; y++) for (x = 0; x < s.x; x++) {
				this.polygons.push( this.createPolygon(x, x+1, y, y+1) );
			}

			return this;
		},

		/**
		 * @private
		 * @returns {Isometric.Map}
		 */
		createShape: function () {
			var s = this.size;

			this.shape = this.createPolygon(0, s.x, 0, s.y);

			return this;
		},

		createPolygon: function (x1, x2, y1, y2) {
			return new Polygon([
				[ x1, y1 ],
				[ x2, y1 ],
				[ x2, y2 ],
				[ x1, y2 ]
			].map(this.projection.toIsometric));
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
		 * @param {LibCanvas.Point} coord
		 * @param {number} z = 0
		 * @returns {Isometric.Point3D}|null
		 */
		to3D: function (coord, z) {
			var result = this.projection.to3D( Point( coord ), z );

			result.x = result.x.floor();
			result.y = result.y.floor();

			return this.hasPoint(result) ? result : null;
		},

		clearPrevious: function(){},

		renderTo: function (ctx) {
			this.polygons.forEach(function (poly) {
				ctx.fill( poly, this.randomPolygonColor );
			}.bind(this));
		},

		/** @private */
		get randomPolygonColor () {
			return '#' + Number.random( 240, 255 ).toString( 16 ).repeat( 3 );
		}
	}
});