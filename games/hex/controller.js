Hexes.Controller = atom.declare({

	initialize: function (images, hexes) {

		this.app = new App({
			size: new Size(1200, 800),
			appendTo: 'body'
		});

		this.scene = this.app.createScene({ intersection: 'manual' });

		var projection = new LibCanvas.Engines.HexProjection({
			baseLength : 74,
			chordLength: 37,
			hexHeight  : 98
		});

		var mouse = new LibCanvas.Mouse(this.app.container.bounds);

		var sizes = projection.sizes(8);
		hexes.forEach(function (data) {
			sizes.add(data);
		});
		this.scene.layer.size = sizes.size();
		projection.settings.set({ start: sizes.center() });

		var shift = new App.SceneShift(this.scene);
		shift.setLimitShift({ from: [-252, -606], to: [64, 64] });

		new App.Dragger( mouse )
			.addSceneShift( shift )
			.start();

		var mouseHandler = new App.MouseHandler({
			mouse: mouse, app: this.app,
			search: new Hexes.FastSearch(shift, projection)
		});
		hexes.forEach(function (data) {
			var
				type    = data.pop(),
				center  = projection.rgbToPoint(data),
				polygon = projection.createPolygon(center),
				hex = new Hexes.Hex(this.scene, {
					image : images.get(type),
					center: center,
					shape : polygon,
					coords: data
				});

			mouseHandler.subscribe( hex );

		}.bind(this));
		
		shift.addShift( new Point(-150, -150), true );
	}

});