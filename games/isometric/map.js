/** @class Isometric.Map */
atom.declare( 'Isometric.Map', App.Element, {
	/** @property {Polygon} */
	shape: null,

	/**
	 * @private
	 * @property {Polygon[]}
	 */
	polygons: null,

	/** @property {Engines.Isometric.Projection} */
	projection: null,

	/** @property {Point3D} */
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

		atom.array.empty(this.polygons);

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
		var size = this.size,
			x = Math.ceil(coord.x),
			y = Math.ceil(coord.y),
			z = Math.ceil(coord.z);

		return x >= 0 && x < size.x
		    && y >= 0 && y < size.y
		    && z >= 0 && z < size.z;
	},

	/**
	 * @param {LibCanvas.Point} coord
	 * @param {number} z = 0
	 * @returns {Isometric.Point3D}|null
	 */
	to3D: function (coord, z) {
		var result = this.projection.to3D( Point( coord ), z );

		result.x = Math.floor(result.x);
		result.y = Math.floor(result.y);

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
		return '#' + atom.string.repeat( atom.number.random( 240, 255 ).toString( 16 ), 3 );
	}
});