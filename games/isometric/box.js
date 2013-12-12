/** @class Isometric.Box */
atom.declare('Isometric.Box', App.Element, {
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

	configure: function () {
		this.animatable = new atom.Animatable(this);
		this.coords  = LibCanvas.Point3D( this.settings.get('coordinates') );
		this.colors  = this.settings.get('colors') || this.colors;
		this.map     = this.settings.get('map');
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
			],
			shadow: [
				[c.x  , c.y  , 0],
				[c.x  , c.y+1, 0],
				[c.x+1, c.y+1, 0],
				[c.x+1, c.y  , 0]
			]
		};

		s = this.shapes = atom.object.map( s, function (coords) {
			return new Polygon(coords.map( this.map.projection.toIsometric ));
		}.bind(this));
		// this shape includes blured shadow & stroked rects
		this.shape = new Polygon(
			s.top   .points[0].clone().move([ -5,-1]),
			s.top   .points[3].clone().move([  0,-5]),
			s.top   .points[2].clone().move([  5,-1]),
			s.shadow.points[2].clone().move([ 30,13]),
			s.shadow.points[1].clone().move([  0,30]),
			s.shadow.points[0].clone().move([-30,13])
		);
		return this;
	},

	get zIndex () {
		return this.shape.points[0].y || 0;
	},

	/**
	 * @param {LibCanvas.Point3D} shift
	 * @returns {Isometric.Box}
	 */
	move: function (shift, onComplete) {
		shift = LibCanvas.Point3D( shift );
		var newCoords = this.coords.clone().move( shift );
		if (newCoords.z < 0.02) newCoords.z = 0.02;

		if ( this.map.hasPoint( newCoords )) {
			var time = this.getTime( shift );
			if (!time) {
				if (onComplete) onComplete.apply( this, arguments );
				return this;
			}

			this.animatable.stop();
			this.animatable.animate({
				fn   : 'sine-out',
				time : time,
				props: {
					'coords.x': newCoords.x,
					'coords.y': newCoords.y,
					'coords.z': newCoords.z
				},
				onTick: function () {
					this.createShapes();
					this.redraw();
				}.bind(this),
				onComplete: onComplete
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
		return this.speed * atom.number.limit(Math.sqrt(
			distance.x * distance.x +
			distance.y * distance.y +
			distance.z * distance.z
		), 0, this.speed );
	},

	/** @returns {Isometric.Box} */
	renderTo: function (ctx) {
		var
			z  = this.coords.z + 1,
			zDelta =
				this.map.projection.toIsometric([this.coords.x,this.coords.y,-1]).y -
				this.map.projection.toIsometric(this.coords).y,
			s  = this.shapes,
			stroke = 'rgba(0,32,0,0.5)';

		ctx
			.save()
			.set({
				shadowColor  : 'black',
				shadowOffsetY: zDelta,
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