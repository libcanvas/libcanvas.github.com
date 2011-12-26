Grafiti.Init = new Class({
	libcanvas : null,
	update    : null,

	initialize : function (libcanvas) {
		this.libcanvas = libcanvas;
		this.update    = libcanvas.update.bind(libcanvas);
		this.app().buttons();
	},

	app : function () {
		var lc = this.libcanvas;
		lc.fps = 60;
		// lc.fpsMeter(30);
		lc.progressBarStyle = {
			width  : 400,
			height :  20,

			bgColor     : '#ffffff',
			borderColor : '#006699',
			barColor    : '#006699',
			barBgColor  : '#99ccff',

			blend        : false,
			blendColor   : '#ffffff',
			blendHeight  : 14,
			blendVAlign  : 2,
			blendOpacity : 0.2
		};

		lc.preloadImages = {
			icons : 'images/grafiti-icons.png',
			brushSoft   : 'images/brush-soft.png',
			brushSofter : 'images/brush-softer.png',
			brushCall   : 'images/brush-calligraphic.png',
			brushSparks : 'images/brush-sparks.png'
		};
		lc.autoUpdate = 'onRequest';
		lc.addProcessor('pre', new LibCanvas.Processors.Clearer('white'));
		lc.listenMouse();

		var uib = this.uiBuffer = new LibCanvas.Canvas2D(
			lc.createBuffer(), { backBuffer : 'off' }
		);

		uib.addProcessor('pre', new LibCanvas.Processors.Clearer('white'));
		uib.autoUpdate = 'force';
		uib.mouse = lc.mouse;
		this.updateUi = function () {
			uib.update();
		};

		lc.bind('ready', function () {
			uib.images = lc.images;
			uib.fn = lc.update.bind(lc);
			uib.update();
			this.createBrushes();
		}.bind(this));
		this.brushes.standard = new Grafiti.Brushes.Standard;

		return this;
	},

	brushes : {},
	createBrushes : function () {
		var lc   = this.libcanvas;
		var MaskBr = Grafiti.Brushes.Mask;
		this.brushes.soft = new MaskBr()
			.addImage(lc.getImage('brushSoft'));

		this.brushes.softer = new MaskBr()
			.addImage(lc.getImage('brushSofter'));

		this.brushes.calligraphic = new MaskBr()
			.addImage(lc.getImage('brushCall'));

		var sparksImg = this.libcanvas.getImage('brushSparks');
		this.brushes.sparks = new MaskBr();
		for (var i = 0; i < 8; i++) {
			this.brushes.sparks.addImage(sparksImg.sprite(i*64, 0, 64, 64));
		}
		return this;
	},

	buttonsList : {},
	buttons : function () {
		var buttons = {
			/*save : 0, */clear : 1, redo : 2, undo : 3
		};

		for (var i in buttons) {
			var but = new Grafiti.Button(buttons[i]);
			this.uiBuffer.addElement(
				but.setShape(new LibCanvas.Shapes.Rectangle(
					32 + (64 + 32) * {
						clear : 0,
						undo  : 1,
						redo  : 2,
						save  : 3
					}[i], 12, 64, 64
				))
			);
			this.buttonsList[i] = but
				.clickable()
				.bind('statusChanged', this.updateUi);
		}
		return this;
	},

	canvas : function () {
		var libcanvas = this.libcanvas;
		
		var canvas = new LibCanvas.Shapes.Rectangle({
			from : [ 27,  90],
			size : [720, 450] // delta 134 157
		});

		canvas.grip = libcanvas.createGrip({
			shape  : canvas,
			stroke : '#069'
		})
		.listenMouse();

		canvas.getOffset = function (e) {
			return libcanvas.mouse
				.getOffset(e)
				.clone()
				.move(this.from, true);
		};

		return canvas;
	}
});