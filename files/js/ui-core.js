
new function () {
	var LC   = LibCanvas.extract({}),
		rand = Number.random;

	window.UiCore = {
		libcanvas: null,
		randomPoint: function (padding) {
			if (padding == null) padding = 0;
			return new LC.Point(
				rand(0+padding, this.libcanvas.elem.width -padding),
				rand(0+padding, this.libcanvas.elem.height-padding)
			);
		},
		randomShape: function (shape) {
			switch(shape) {
				case 'circle'   : return new LC.Circle   (this.randomPoint(), rand(10,30)); break;
				case 'rectangle': return new LC.Rectangle(this.randomPoint(), this.randomPoint()).snapToPixel(); break;
				case 'triangle' : return new LC.Polygon ([this.randomPoint(), this.randomPoint(), this.randomPoint()]); break;
			}
			throw new TypeError('Unknown shape: ' + shape);
		},
		createShaper: function (shape, z, layer) {
			return (layer || this.libcanvas)
				.createShaper({
					shape : shape,
					stroke: '#990000',
					fill  : '#330000',
					hover : {
						stroke: '#ff0000',
						fill  : '#990000'
					},
					active : {
						stroke: '#00ff00',
						fill  : '#009900'
					}
				})
				.setZIndex(z || 0);
		}
	};
};