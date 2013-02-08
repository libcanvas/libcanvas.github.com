/** @class IsoMines.View */
atom.declare( 'IsoMines.View', {
	initialize: function (controller, size) {
		this.size = size;
		this.appSize = new Size(1000, 600);

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

		this.mouse.events
			.add('click', Mouse.prevent)
			.add('contextmenu', Mouse.prevent);

		this.initDragger();

		this.mouseHandler = new App.MouseHandler({
			mouse: this.mouse, app: this.app,
			search: new IsoMines.FastSearch(this.shift, this.projection)
		});

		this.app.resources.set({
			mouseHandler: this.mouseHandler,
			mouse : this.mouse,
			images: controller.images
		});

		this.initAnimations();

		this.createCellsElements(size);

		this.shift.addShift( this.shift.limitShift.center, true );

		this.emptyCells = size.width * size.height - controller.mines;
	},

	fullscreen: function (on) {
		this.app.container.size = on ?
			new Size(window.outerWidth-2, window.outerHeight-2) :
			this.appSize;

		this.updateShiftLimit();
	},

	destroy: function () {
		window.location = window.location;
	},

	opened: function (cell) {
		if (--this.emptyCells) return;

		var
			view = this,
			size = view.size,
			left = cell.point.clone(),
			right = cell.point.clone();

		function next () {
			if (left && left.x-- == 0) {
				left.x = size.width - 1;
				if (left.y-- == 0) {
					left = null
				}
			}

			if (right && ++right.x == size.width) {
				right.x = 0;
				if (++right.y == size.height) {
					right = null
				}
			}

			if (left ) view.getCell(left ).close();
			if (right) view.getCell(right).close();

			if (left || right) {
				setTimeout(next, 50);
			} else {
				view.destroy.delay(1000, view);
			}

		}

		cell.close();
		next();
	},

	initAnimations: function () {
		var frames = new Animation.Frames(
			this.controller.images.get('gates-animation'), 180, 104
		);

		this.animationSheets = atom.object.map({
			opening  : atom.array.range( 12, 23),
			closing  : atom.array.range( 23, 12),
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

	getCell: function (point) {
		return this.cellsIndex[point.y][point.x];
	},

	initDragger: function () {
		this.shift = new App.LayerShift(this.layer);

		this.updateShiftLimit();

		new App.Dragger( this.mouse )
			.addLayerShift( this.shift )
			.start(function (e) {
				return e.button == 1 || e.shiftKey;
			});
	},

	updateShiftLimit: function () {
		var padding = new Point(64, 64);

		this.shift.setLimitShift(new Rectangle(
			new Point(this.app.container.size)
				.move(this.layerSize, true)
				.move(padding, true),
			padding
		));
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
				shape : this.createPoly(point),
				controller: this.controller
			});

			if (x == 0) {
				new IsoMines.Wall(this.layer, {
					from: cell.shape.points[0].clone(),
					side: 'left'
				});
			}

			if (y == size.height - 1) {
				new IsoMines.Wall(this.layer, {
					from: cell.shape.center,
					side: 'right'
				});
			}

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