Isometric.Map = atom.Class(
/** @lends Isometric.Map.prototype */
{
	Extends: Drawable,

	/** @property {LibCanvas.Shapes.Polygon} */
	shape: null,

	/**
	 * @private
	 * @property {LibCanvas.Shapes.Polygon[]}
	 */
	polygons: null,

	/** @property {Isometric.Projection} */
	projection: null,

	/**
	 * @private
	 * @property {LibCanvas.Point}
	 */
	currentShift: null,

	/** @property {Isometric.Point3D} */
	size: null,

	/** @property {Number} */
	cellSize: 0,

	/** @constructs */
	initialize: function (projection, mapSize, cellSize) {
		atom.Class.bindAll( this, 'toIsometric' );

		this.projection = projection;
		this.size       = Isometric.Point3D( mapSize );
		this.cellSize   = cellSize;

		this.polygons = [];
		this.elements = [];

		this.currentShift = new Point(0, 0);

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
	 * @param {Isometric.Point3D} coords
	 * @returns {Isometric.Box}
	 */
	box: function (coords) {
		var box = new Isometric.Box( coords, this );
		this.elements.push( box );
		return box.shift( this.currentShift );
	},

	/**
	 * @param {Isometric.Box} elem
	 * @returns {Isometric.Map}
	 */
	erase: function (elem) {
		this.elements.erase( elem );
		return this;
	},

	/**
	 * @param {Isometric.Point3D} coord
	 * @returns {boolean}
	 */
	hasPoint: function (coord) {
		return coord.x.ceil().between(0, this.size.x, 'L') &&
		       coord.y.ceil().between(0, this.size.y, 'L') &&
		       coord.z.ceil().between(0, this.size.z, 'L')
	},

	/**
	 *
	 * @param {LibCanvas.Point} point
	 * @returns {Isometric.Map}
	 */
	shift: function (point) {
		point = Point(arguments);
		this.currentShift.move( point );
		this.polygons.invoke( 'move', point );
		this.elements.invoke( 'shift', point );
		return this;
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
		var result = this.projection.to3D(
			Point( coord )
				.clone()
				.move( this.currentShift, true ),
			z * this.cellSize
		).map(function (c, a) {
			c = (c / this.cellSize);
			if (a != 'z') c = c.floor();
			return c;
		}.bind(this));

		return this.hasPoint(result) ? result : null;
	},

	/** @returns {Isometric.Map} */
	draw: function () {
		var ctx = this.libcanvas.ctx;

		this.polygons.forEach(function (poly) {
			var color = Number.random( 245, 255 ).toString( 16 ).repeat( 3 );
			ctx.fill( poly, '#' + color );
		});

		return this;
	}
});