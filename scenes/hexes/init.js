

var Hexes = {};
LibCanvas.extract();

new function () {

atom.dom(function () {
	var app = new LibCanvas.App( 'canvas', {
		width : 1200,
		height: 800,
		mouse : true,
		preloadImages: {
			ruins1   : '/files/img/hexes.png [150:100]{0:0}',
			ruins2   : '/files/img/hexes.png [150:100]{1:0}',
			village1 : '/files/img/hexes.png [150:100]{2:0}',
			village2 : '/files/img/hexes.png [150:100]{3:0}',
			city1    : '/files/img/hexes.png [150:100]{4:0}',
			city2    : '/files/img/hexes.png [150:100]{5:0}'
		}
	});

	app.ready(function () {
		var scene = app.createScene({ intersection: 'manual' });

		var projection = new LibCanvas.Engines.HexProjection({
			baseLength : 74,
			chordLength: 37,
			hexHeight  : 98
		});

		var sizes = projection.sizes(8);
		hexes.forEach(function (data) {
			sizes.add(data);
		});
		scene.libcanvas.size( sizes.size() );
		projection.setOptions({ start: sizes.center() });

		hexes.forEach(function (data) {
			var
				type    = data.pop(),
				center  = projection.rgbToPoint(data),
				polygon = projection.createPolygon(center),
				hex     = new Hexes.Hex(scene, {
					image : scene.resources.getImage(type),
					center: center,
					shape : polygon,
					coords: data
				});

			hex.listenMouse().clickable( hex.redraw );
		});

		scene.setLimitShift({ from: [-252, -606], to: [64, 64] });
		scene.addShift( new Point(-200, -200), true );

		var shift = new Trace();
		new LibCanvas.Scene.Dragger( app.libcanvas.mouse )
			.addScene( scene )
			.start()
			.addEvent( 'stop', function () {
				shift.value = scene.getShift();
			});

		var coordTr = new Trace();
		scene.libcanvas.mouse.addEvent('move', function (e) {
			var realCoord = e.offset.clone().move(scene.getShift(), true);
			coordTr.value = projection.pointToRgb(realCoord).join(' ');
		});
	});


});

var hexes = [
	[ 0,  0,  0, 'city1'    ],
	[ 0,  1, -1, 'city2'    ],
	[ 1,  0, -1, 'ruins2'   ],
	[ 0, -1,  1, 'city2'   ],
	[ 1, -1,  0, 'ruins1'   ],
	[-1,  0,  1, 'village2' ],
	[-1,  1,  0, 'village1' ],
	[ 1,  1, -2, 'city2'    ],
	[ 0,  2, -2, 'village1' ],
	[-1,  2, -1, 'village2' ],
	[-2,  2,  0, 'village1' ],
	[-2,  1,  1, 'city1'    ],
	[-2,  0,  2, 'village2' ],
	[-1, -1,  2, 'village1' ],
	[ 0, -2,  2, 'village2' ],
	[ 1, -2,  1, 'village1' ],
	[ 2, -2,  0, 'city1'    ],
	[ 2, -1, -1, 'village2' ],
	[ 2,  0, -2, 'village1' ],
	[-5,  0,  5, 'village1' ],
	[-5, -1,  6, 'city1'    ],
	[-5, -2,  7, 'village2' ],
	[-5, -3,  8, 'city2'    ],
	[-4,  3,  1, 'village1' ],
	[-4,  2,  2, 'city1'    ],
	[-4,  1,  3, 'city2'    ],
	[-4,  0,  4, 'village2' ],
	[-4, -1,  5, 'village1' ],
	[-4, -2,  6, 'village2' ],
	[-4, -3,  7, 'village1' ],
	[-4, -4,  8, 'city1'    ],
	[-3,  5, -2, 'village1' ],
	[-3,  4, -1, 'city2'    ],
	[-3,  3,  0, 'village2' ],
	[-3,  2,  1, 'village1' ],
	[-3,  1,  2, 'village2' ],
	[-3,  0,  3, 'village2' ],
	[-3, -1,  4, 'village1' ],
	[-3, -2,  5, 'city1'    ],
	[-3, -3,  6, 'city2'    ],
	[-3, -4,  7, 'village1' ],
	[-2,  5, -3, 'city1'    ],
	[-2,  4, -2, 'village1' ],
	[-2,  3, -1, 'village2' ],
	[-2, -1,  3, 'city1'    ],
	[-2, -2,  4, 'city2'    ],
	[-2, -3,  5, 'village1' ],
	[-2, -4,  6, 'ruins1'   ],
	[-1,  5, -4, 'city2'    ],
	[-1,  4, -3, 'village2' ],
	[-1,  3, -2, 'city1'    ],
	[-1, -2,  3, 'village1' ],
	[-1, -3,  4, 'ruins2'   ],
	[-1, -4,  5, 'village1' ],
	[-1, -5,  6, 'village1' ],
	[ 0,  4, -4, 'city1'    ],
	[ 0,  3, -3, 'village1' ],
	[ 0, -3,  3, 'village1' ],
	[ 0, -4,  4, 'village2' ],
	[ 0, -5,  5, 'village2' ],
	[ 1,  5, -6, 'village1' ],
	[ 1,  4, -5, 'village2' ],
	[ 1,  3, -4, 'village1' ],
	[ 1,  2, -3, 'village1' ],
	[ 1, -3,  2, 'city1'    ],
	[ 1, -4,  3, 'village2' ],
	[ 1, -5,  4, 'village1' ],
	[ 2,  5, -7, 'city2'    ],
	[ 2,  4, -6, 'village1' ],
	[ 2,  3, -5, 'village2' ],
	[ 2,  2, -4, 'city2'    ],
	[ 2,  1, -3, 'village1' ],
	[ 2, -3,  1, 'village2' ],
	[ 2, -4,  2, 'village1' ],
	[ 2, -5,  3, 'village2' ],
	[ 3,  5, -8, 'city1'    ],
	[ 3,  4, -7, 'village1' ],
	[ 3,  3, -6, 'city1'    ],
	[ 3,  2, -5, 'city2'    ],
	[ 3,  1, -4, 'city1'    ],
	[ 3,  0, -3, 'village2' ],
	[ 3, -1, -2, 'village1' ],
	[ 3, -2, -1, 'village2' ],
	[ 3, -3,  0, 'village1' ],
	[ 3, -4,  1, 'village2' ],
	[ 3, -5,  2, 'city2'    ],
	[ 4,  4, -8, 'village1' ],
	[ 4,  3, -7, 'village2' ],
	[ 4,  2, -6, 'city1'    ],
	[ 4,  1, -5, 'ruins1'   ],
	[ 4,  0, -4, 'city1'    ],
	[ 4, -1, -3, 'village1' ],
	[ 4, -2, -2, 'city2'    ],
	[ 4, -3, -1, 'village2' ],
	[ 4, -4,  0, 'city1'    ],
	[ 4, -5,  1, 'village1' ],
	[ 5,  4, -9, 'city2'    ],
	[ 5,  3, -8, 'village2' ],
	[ 5,  2, -7, 'village2' ],
	[ 5,  1, -6, 'city1'    ],
	[ 5,  0, -5, 'city1'    ],
	[ 5, -1, -4, 'village2' ],
	[ 5, -2, -3, 'city2'    ],
	[ 6,  3, -9, 'village1' ],
	[ 6,  2, -8, 'village2' ],
	[ 6,  1, -7, 'village1' ],
	[ 6,  0, -6, 'city1'    ],
	[ 1, -6,  5, 'village1' ],
	[ 2, -6,  4, 'village1' ],
	[ 3, -6,  3, 'village2' ],
	[ 4, -6,  2, 'village1' ],
	[ 0,  5, -5, 'village1' ],
	[-1,  6, -5, 'village1' ],
	[-2,  6, -4, 'village1' ],
	[-4,  4,  0, 'village2' ],
	[-4,  5, -1, 'village1' ]
];

};