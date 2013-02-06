/** @class IsoMines.View */
atom.declare( 'IsoMines.View', {
	initialize: function (controller, size) {
		this.appSize = new Size(800, 500);

		this.controller = controller;

		this.projection = new IsometricEngine.Projection({
		    factor: new Point3D(90, 52, 54)
		});

		this.layerSize = new Size(
			this.projection.toIsometric(new Point3D(size.x, size.y, 0)).x,
			this.projection.toIsometric(new Point3D(0, size.y, -1)).y * 2
		);

		this.app = new App({ size: this.appSize });

		this.layer = this.app.createLayer({
			name: 'tiles',
			intersection: 'manual',
			size: this.layerSize
		});

		this.projection.start = new Point(0, this.layerSize.height/2-20);

		this.mouse = new LibCanvas.Mouse(this.app.container.bounds);

		this.mouse.events.add('contextmenu', Mouse.prevent);

		this.mouseHandler = new App.MouseHandler({
			mouse: this.mouse, app: this.app
		});

		this.app.resources.set({
			mouseHandler: this.mouseHandler,
			mouse : this.mouse,
			images: controller.images
		});

		this.initDragger();

		this.initAnimations();

		this.createCellsElements(size);

		this.shift.addShift( this.shift.limitShift.center, true );
	},

	initAnimations: function () {
		var frames = new Animation.Frames(
			this.controller.images.get('gates-animation'), 180, 104
		);

		this.animationSheets = atom.object.map({
			opening  : atom.array.range( 12, 23),
			locking  : atom.array.range(  0, 11),
			unlocking: atom.array.range( 11,  0)
		}, function (sequence) {
			return new Animation.Sheet({
			    frames: frames,
			    delay : 40,
			    sequence: sequence
			});
		});
	},

	initDragger: function () {
		var padding = new Point(64, 64);

		this.shift = new App.LayerShift(this.layer);

		this.shift.setLimitShift(new Rectangle(
			new Point(this.appSize)
				.move(this.layerSize, true)
				.move(padding, true),
			padding
		));

		new App.Dragger( this.mouse )
			.addLayerShift( this.shift )
			.start(function (e) {
				return e.button == 1;
			});
	},

	createCellsElements: function (size) {
		var x, y, point, cell;

		this.cells = [];

		this.cellsIndex = atom.array.fillMatrix(size.width, size.height, 0);

		for (x = size.width; x--;) for (y = size.height; y--;) {
			point = new Point(x, y);

			cell = new IsoMines.Cell(this.layer, {
				point : point,
				sheets: this.animationSheets,
				shape : this.createPoly(point)
			});

			this.mouseHandler.subscribe(cell);

			this.cells.push(cell);

			this.cellsIndex[point.y][point.x] = cell;
		}
	},

	createPoly: function (point) {
		var p = this.projection;

		return new Polygon(
			p.toIsometric(new Point3D(point.x  , point.y  , 0)),
			p.toIsometric(new Point3D(point.x+1, point.y  , 0)),
			p.toIsometric(new Point3D(point.x+1, point.y+1, 0)),
			p.toIsometric(new Point3D(point.x  , point.y+1, 0))
		);
	}


});