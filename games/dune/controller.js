/** @class Dune.Controller */
atom.declare( 'Dune.Controller', {

	initialize: function () {
		var mouse, mouseHandler, factory, fieldSize, realFieldSize, blocks, wait;

		wait = atom.trace('Please, wait');

		blocks = new Size(27, 12);
		fieldSize = new Size(1050, 525);

		this.app = new App({
			size: fieldSize,
			appendTo: 'body'
		});

		this.layer = this.app.createLayer({ intersection: 'manual' });

		mouse = new LibCanvas.Mouse(this.app.container.bounds);

		factory = new Dune.BuildingFactory(this, blocks.clone().mul(8));

		realFieldSize = factory.getRealFieldSize();
		this.layer.dom.size = realFieldSize;
				
		this.createShift(mouse, new Size(
			fieldSize.width  - realFieldSize.width,
			fieldSize.height - realFieldSize.height
		));

		mouseHandler = new App.MouseHandler({
			mouse: mouse, app: this.app,
			search: new Dune.FastSearch(blocks.clone().mul(8), new Size(32,32), this.shift)
		});
		this.app.resources.set({ mouse: mouse, mouseHandler: mouseHandler });

		var countTrace = atom.trace(0);
		
		this.preload(function (images) {
			this.app.resources.set({ images: images });
			factory.produceDefault(blocks, 8,
				function () {
					countTrace.value = ("Buildings: " + factory.buildingsCount);
				},
				function () {
					wait.destroy();
					

					new App.Dragger( mouse )
						.addLayerShift( this.shift )
						.start();
				}.bind(this));
		});
	},

	preload: function (callback) {
		var source = 'dune2.png ';

		atom.ImagePreloader.run({
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

	createShift: function (mouse, size) {
		var padding;

		padding = 64;
		this.shift = new App.LayerShift(this.layer);
		this.shift.setLimitShift({ from: [size.width-padding, size.height-padding], to: [padding, padding] });
	}

});