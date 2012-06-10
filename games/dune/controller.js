/** @class Dune.Controller */
atom.declare( 'Dune.Controller', {

	initialize: function () {
		var mouse, mouseHandler, padding, shift;

		this.app = new App({
			size: new Size(1024, 600),
			appendTo: 'body'
		});

		this.scene = this.app.createScene({ intersection: 'manual' });
		this.scene.layer.size = new Size(2048, 1200);

		mouse = new LibCanvas.Mouse(this.app.container.bounds);

		this.createDragger(mouse);
		mouseHandler = new App.MouseHandler({
			mouse: mouse, app: this.app
			//search: new Dune.FastSearch()
		});

		var factory = new Dune.BuildingFactory(this);

		this.app.resources.set({ mouse: mouse, mouseHandler: mouseHandler });

		this.preload(function (images) {
			this.app.resources.set({ images: images });
			factory.createBuilding('plant'   , new Point(1,1));
			factory.createBuilding('refinery', new Point(4,1));
			factory.createBuilding('factory' , new Point(1,3));
			factory.createBuilding('power'   , new Point(3,3));
			factory.createBuilding('barrack' , new Point(5,3));
		});
	},

	preload: function (callback) {
		var source = '/files/img/dune2.png ';

		ImagePreloader.run({
			'bg'        : source+ '[0:0:32:32]',
			'block'     : source+'[32:32]{2:0}',
			'block-h'   : source+'[32:32]{2:1}',
			'plant'     : source+'[96:64]{0:1}',
			'plant-h'   : source+'[96:64]{1:1}',
			'refinery'  : source+'[96:64]{0:2}',
			'refinery-h': source+'[96:64]{1:2}',
			'power'     : source+'[64:64]{0:3}',
			'power-h'   : source+'[64:64]{1:3}',
			'factory'   : source+'[64:64]{0:4}',
			'factory-h' : source+'[64:64]{1:4}',
			'barrack'   : source+'[64:64]{2:3}',
			'barrack-h' : source+'[64:64]{2:4}'
		}, callback, this);
	},

	createDragger: function (mouse) {
		var padding, shift;

		padding = 64;
		shift = new App.SceneShift(this.scene);
		shift.setLimitShift({ from: [-1024-padding, -600-padding], to: [padding, padding] });

		new App.Dragger( mouse )
			.addSceneShift( shift )
			.start();
	}

});