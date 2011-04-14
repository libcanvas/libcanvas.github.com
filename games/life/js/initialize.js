
new LibCanvas('canvas', { backBuffer: 'off', clear: '#333' })
	.listenMouse()
	.size(config.canvasSize, true)
	.addEvent('ready', function () {
		var engine = new LibCanvas.Engines.Tile(this.elem)
			.addTiles({
				1: '#999',
				0: '#000'
			})
			.setSize(config.cell.width, config.cell.height, config.cell.margin)
			.createMatrix(config.field.width, config.field.height, 0)
			.update();

		bindEvents(this.mouse, engine);
	});