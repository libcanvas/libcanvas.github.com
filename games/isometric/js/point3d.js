Isometric.Point3D = atom.Class(
/** @lends Isometric.Point3D.prototype */
{
	Static: { invoke: LibCanvas.Geometry.invoke },

	x: 0,
	y: 0,
	z: 0,
	/**
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 * @returns {Isometric.Point3D}
	 */
	initialize: LibCanvas.Geometry.prototype.initialize,

	/**
	 * @param {Number} x
	 * @param {Number} y
	 * @param {Number} z
	 * @returns {Isometric.Point3D}
	 */
	set: function (x, y, z) {
		if ( arguments.length === 3 || arguments.length === 2 ) {
			this.x = Number(x) || 0;
			this.y = Number(y) || 0;
			this.z = Number(z) || 0;
		} else if ( x && typeof x.x  === 'number' ) {
			this.set( x.x, x.y, x.z );
		} else if ( x && typeof x[0] === 'number' ) {
			this.set( x[0], x[1], x[2] );
		} else {
			console.log( 'Wrong arguments in Isometric.Point3D', arguments );
			throw new Error( 'Wrong arguments in Isometric.Point3D' );
		}
		return this;
	},

	/**
	 * You can pass callback (function( value, axis, point ){})
	 * @param {function} fn
	 * @param {object} bind
	 * @returns {Isometric.Point3D}
	 */
	map: function (fn, bind) {
		['x', 'y', 'z'].forEach(function (axis, id) {
			this[axis] = fn.call( bind || this, this[axis], axis, this );
		}.bind(this));
		return this;
	},

	/**
	 * @param {Number} factor
	 * @returns {Isometric.Point3D}
	 */
	add: function (factor) {
		return this.map(function (c) { return c+factor });
	},

	/**
	 * @param {Number} factor
	 * @returns {Isometric.Point3D}
	 */
	mul: function (factor) {
		return this.map(function (c) { return c*factor });
	},

	/**
	 * @param {Isometric.Point3D} point3d
	 * @returns {Isometric.Point3D}
	 */
	diff: function (point3d) {
		point3d = Isometric.Point3D( point3d );
		return new this.self(
			point3d.x - this.x,
			point3d.y - this.y,
			point3d.z - this.z
		);
	},

	/**
	 * @param {Isometric.Point3D} point3d
	 * @returns {Isometric.Point3D}
	 */
	move: function (point3d) {
		point3d = Isometric.Point3D( arguments );
		this.x += point3d.x;
		this.y += point3d.y;
		this.z += point3d.z;
		return this;
	},

	/**
	 * @param {Isometric.Point3D}point3d
	 * @param {Number} accuracy
	 * @returns {boolean}
	 */
	equals: function (point3d, accuracy) {
		return point3d.x.equals( this.x, accuracy ) &&
		       point3d.y.equals( this.y, accuracy ) &&
		       point3d.z.equals( this.z, accuracy );
	},

	/** @returns {Isometric.Point3D} */
	clone: function () {
		return new this.self( this );
	},

	/** @returns Array */
	toArray: function () {
		return [this.x, this.y, this.z];
	},

	/** @returns String */
	dump: function () {
		return '[Isometric.Point(' + this.toArray() + ')]';
	}
});