Isometric.Box = atom.Class(
/** @lends Isometric.Box# */
{
	Implements: [Drawable, Animatable],

	/** @property {LibCanvas.Point3D} */
	coords: null,

	/** @property {Isometric.Map} */
	map: null,

	/** @property {LibCanvas.Shapes.Polygon[]} */
	shapes: null,

	/** @property {Array} */
	colors: ['white', 'white', 'white'],

	/** @property {number} */
	speed: 200,

	/**
	 * @constructs
	 * @param {LibCanvas.Point3D} coordinates
	 * @param map
	 */
	initialize: function (coordinates, map) {
		this.coords = LibCanvas.Point3D( coordinates );
		this.map    = map;
		this.currentShift = new Point(0, 0);
		this.createShapes();
	},

	/**
	 * @private
	 * @returns {Isometric.Box}
	 */
	createShapes: function () {
		var c = this.coords, s = {
			left: [
				[c.x, c.y  , c.z  ],
				[c.x, c.y  , c.z+1],
				[c.x, c.y+1, c.z+1],
				[c.x, c.y+1, c.z  ]
			],
			right: [
				[c.x  , c.y+1, c.z+1],
				[c.x  , c.y+1, c.z  ],
				[c.x+1, c.y+1, c.z  ],
				[c.x+1, c.y+1, c.z+1]
			],
			top: [
				[c.x  , c.y  , c.z+1],
				[c.x  , c.y+1, c.z+1],
				[c.x+1, c.y+1, c.z+1],
				[c.x+1, c.y  , c.z+1]
			]
		};

		this.shapes = Object.map( s, function (coords) {
			return new Polygon(
				coords.map( this.map.toIsometric )
			).move( this.currentShift );
		}.bind(this));
		return this;
	},

	/**
	 * @param {LibCanvas.Point} shift
	 * @returns {Isometric.Box}
	 */
	shift: function (shift) {
		for (var i in this.shapes) {
			this.shapes[i].move( shift );
		}
		this.currentShift.move( shift );
		return this;
	},

	/**
	 * @param {LibCanvas.Point3D} shift
	 * @returns {Isometric.Box}
	 */
	move: function (shift, onProcess, onFinish) {
		shift = LibCanvas.Point3D( shift );
		var newCoords = this.coords.clone().move( shift );
		if (newCoords.z < 0.02) newCoords.z = 0.02;

		if ( this.map.hasPoint( newCoords )) {
			var time = this.getTime( shift );
			if (!time) {
				if (onProcess) onProcess.apply( this, arguments );
				if (onFinish ) onFinish.apply( this, arguments );
				return this;
			}

			this.animate({
				fn   : 'linear',
				time : time,
				props: {
					'coords.x': newCoords.x,
					'coords.y': newCoords.y,
					'coords.z': newCoords.z
				},
				onProcess: function () {
					this.createShapes();
					if (onProcess) onProcess.apply( this, arguments );
				},
				onFinish: onFinish
			});
		}
		return this;
	},

	/**
	 * @private
	 * @param {LibCanvas.Point3D} distance
	 * @returns {number}
	 */
	getTime: function (distance) {
		var time = this.speed * Math.sqrt(
			distance.x.pow(2) +
			distance.y.pow(2) +
			distance.z.pow(2)
		);
		return Math.max( time, this.speed );
	},

	/** @returns {Isometric.Box} */
	draw: function () {
		var
			z  = this.coords.z + 1,
			zP = this.map.toIsometric([0,0,z]).y,
			s  = this.shapes,
			stroke = 'rgba(0,32,0,0.5)';

		this.libcanvas.ctx
			.save()
			.set({
				shadowColor  : 'black',
				shadowOffsetY: -zP,
				shadowOffsetX: 0,
				shadowBlur   : z * 3
			})
			.fill( s.top  , this.colors[0] )
			.restore()
			.fill( s.left , this.colors[1] )
			.fill( s.right, this.colors[2] )
			.stroke( s.top  , stroke )
			.stroke( s.left , stroke )
			.stroke( s.right, stroke );
		return this;
	}
});