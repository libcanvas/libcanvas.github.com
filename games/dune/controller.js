/** @class Dune.Controller */
atom.declare( 'Dune.Controller', {

	initialize: function () {
		var mouse, mouseHandler, factory, fieldSize, realFieldSize;

		fieldSize = new Size(1024, 512);

		this.app = new App({
			size: fieldSize,
			appendTo: 'body'
		});

		this.scene = this.app.createScene({ intersection: 'manual' });

		mouse = new LibCanvas.Mouse(this.app.container.bounds);

		mouseHandler = new App.MouseHandler({
			mouse: mouse, app: this.app,
			//search: new Dune.FastSearch()
		});

		factory = new Dune.BuildingFactory(this);

		realFieldSize = factory.getRealFieldSize();
		this.scene.layer.size = realFieldSize;
		this.createDragger(mouse, new Size(
			fieldSize.width  - realFieldSize.width,
			fieldSize.height - realFieldSize.height
		));
		this.app.resources.set({ mouse: mouse, mouseHandler: mouseHandler });

		this.preload(function (images) {
			this.app.resources.set({ images: images });
			factory.produceDefault(new Size(16, 10), 8);

			atom.trace("Buildings: " + factory.buildingsCount);
		});
	},

	preload: function (callback) {
		var source = '/files/img/dune2.png ';

		ImagePreloader.run({
			'bg'        : source+ '[0:0:32:32]',
			'plate'     : source+'[32:32]{2:0}',
			'plate-h'   : source+'[32:32]{2:1}',
			'plant'     : source+'[96:64]{0:1}',
			'plant-h'   : source+'[96:64]{1:1}',
			'harvest'   : source+'[96:64]{0:2}',
			'harvest-h' : source+'[96:64]{1:2}',
			'power'     : source+'[64:64]{0:3}',
			'power-h'   : source+'[64:64]{1:3}',
			'factory'   : source+'[64:64]{0:4}',
			'factory-h' : source+'[64:64]{1:4}',
			'barrack'   : source+'[64:64]{2:3}',
			'barrack-h' : source+'[64:64]{2:4}'
		}, callback, this);
	},

	createDragger: function (mouse, size) {
		var padding, shift;

		padding = 64;
		shift = new App.SceneShift(this.scene);
		shift.setLimitShift({ from: [size.width-padding, size.height-padding], to: [padding, padding] });

		new App.Dragger( mouse )
			.addSceneShift( shift )
			.start();
	}

});