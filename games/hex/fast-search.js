Hexes.FastSearch = atom.declare( App.ElementsMouseSearch, {
	// It is fast hex search. Default variant just move through all elements
	initialize: function (shift, projection) {
		this.projection = projection;
		this.shift = shift;
		this.hexes = {};
	},

	add: function (hex) {
		atom.object.path.set( this.hexes, hex.coords.join('.'), hex );
		return this;
	},

	remove: function (hex) {
		atom.object.path.set( this.hexes, hex.coords.join('.'), null );
		return this;
	},

	findByPoint: function (point) {
		point = point.clone().move(this.shift.getShift(), true);
		var
			path = this.projection.pointToRgb(point).join('.'),
			hex  = atom.object.path.get( this.hexes, path );

		return hex ? [ hex ] : [];
	}
});