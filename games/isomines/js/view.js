/** @class IsoMines.View */
atom.declare( 'IsoMines.View', {
	initialize: function (controller, size) {
		var appSize = new Size(1200, 600);

		this.controller = controller;

		var p = this.projection = new IsometricEngine.Projection({
		    factor: new Point3D(90, 52, 54)
		});

		var layerSize = new Size(
			p.toIsometric(new Point3D(size.x, size.y, 0)).x,
			p.toIsometric(new Point3D(0, size.y, -1)).y * 2
		);

		this.app = new App({ size: appSize });

		this.layer = this.app.createLayer({
			name: 'tiles',
			intersection: 'manual',
			size: layerSize
		});

		this.projection.start = new Point(0, layerSize.height/2-20);


		var mouse = new LibCanvas.Mouse(this.app.container.bounds);
		var padding = new Point(64, 64);

		var shift = new App.LayerShift(this.layer);
		var shiftLimit = new Rectangle(
			new Point(appSize)
				.move(layerSize, true)
				.move(padding, true),
			padding
		);
		shift.setLimitShift(shiftLimit);

		new App.Dragger( mouse )
			.addLayerShift( shift )
			.start();

		var mouseHandler = new App.MouseHandler({
			mouse: mouse, app: this.app
		});

		this.app.resources.set({ images: controller.images });

		for (var x = size.width; x--;) for (var y = size.height; y--;) {
			var point = new Point(x, y);

			var cell = new IsoMines.Cell(this.layer, {
				point: point,
				shape: this.createPoly(point)
			});

			mouseHandler.subscribe(cell);
		}

		shift.addShift( shiftLimit.center, true );
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