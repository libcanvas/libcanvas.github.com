
var Tile = atom.Class({
	Implements: [Drawable, Animatable],

	zIndex: 15,

	index: 0,

	initialize: function (index, position) {
		this.index    = index;
		this.position = position;
	},

	draw: function () {
		var shape = this.shape;
		this.libcanvas.ctx.text({
			text : this.index,
			to   : shape,
			size : shape.height / 2,
			weigth : 'bold', /* bold|normal */
			padding : [shape.height/4, shape.width/4]
		});
	},


	// Need for animation, mapping Tile coords
	setCoord: function (coord, value) {
		var shape = this.shape, diff = value - shape.from[coord], point;

		if (diff) {
			point = { x: 0, y : 0 };
			point[coord] = diff;
			shape.move(point);
		}
	},
	set x (value) {
		this.setCoord('x', value);
	},
	set y (value) {
		this.setCoord('y', value);
	},
	get x () {
		return this.shape.from.x;
	},
	get y () {
		return this.shape.from.y;
	}
});