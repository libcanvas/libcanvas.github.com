Dune.Controller = atom.Class({

	images: {
		'silo'   : '/files/img/dune.png [0:0:100:100]',
		'factory': '/files/img/dune.png [0:100:150:100]',
		'harvest': '/files/img/dune.png [0:200:150:100]',
		'radar'  : '/files/img/dune.png [0:300:100:100]',
		'power'  : '/files/img/dune.png [0:400:100:100]',
		'plate'  : '/files/img/dune.png [0:500:50:50]',
		'sand'   : '/files/img/dune.png [0:550:100:100]'
	},

	initialize: function () {
		this.app = new LibCanvas.App('canvas', {
			fps   : 40,
			width : 1000,
			height: 500,
			mouse : true,
			preloadImages: this.images
		}).ready(this.start.bind(this));
	},

	start: function () {
		var scene = this.app.createScene({ intersection: 'manual' });
		scene.libcanvas.size( 4050, 2550 );

		var ctx = scene.libcanvas.ctx;
		ctx.fillAll(ctx.createPattern( scene.resources.getImage('sand'), 'repeat' ));

		var buildings = this.createBuildings(scene);
		new Trace( 'Buildings : ' + buildings.length );

		this.makeMapDraggable( scene );
	},

	createBuildings: function (scene) {
		return Dune.buildingsList.map(function (args, i) {
			var building = new Dune.Bulding( scene, {
				from  : new Point(args[1]*50, args[2]*50),
				x     : args[1],
				y     : args[2],
				image : scene.resources.getImage(args[0]),
				index : i,
				zIndex: i
			});
			if (args[0] == 'plate') return;

			building.clickable( building.redraw );
		});
	},

	makeMapDraggable: function (scene) {
		var drag  = null;

		var stopDrag = function () {
			if (drag) {
				scene.resources.mouse.start();
				scene.addElementsShift(drag);
				scene.start();
			}
			drag = null;
		};

		this.app.libcanvas.mouse.addEvent({
			'down': function () {
				scene.resources.mouse.stop();
				scene.stop();
				drag = new Point(0, 0);
			},
			'up'  : stopDrag,
			'out' : stopDrag,
			'move': function (e) {
				if (!drag) return;
				drag.move( e.deltaOffset );
				scene.addShift( e.deltaOffset );
			}
		});
	}

});