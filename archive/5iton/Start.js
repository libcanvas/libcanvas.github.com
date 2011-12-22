Grafiti.Start = function (libcanvas) {

	var Point = LibCanvas.Point;

	var init = new Grafiti.Init(libcanvas);

	var actions = new Grafiti.Actions();

	var line  = null;

	var canvas = init.canvas();
	canvas.grip.bind('mousedown', function (eName, e) {
		line = [canvas.getOffset(e)];
		line.width   = lineWidth.getWidth();
		line.opacity = opacity.getValue();
		line.color   = color.activeColor;
		line.brush   = activeBrush;
		libcanvas.update();

		if (line.brush.type == 'mask') {
			line[0].brush = line.brush;
			drawer.brush(line[0], brushCache.ctx);
		}
	});

	var colorBuffer = libcanvas.createBuffer(36*9, 6*12);
	var color = new Grafiti
		.Color(colorBuffer)
		.setShape(new LibCanvas.Shapes.Rectangle({
			from : [canvas.from.x, canvas.to.y + 12],
			size : [colorBuffer.width, colorBuffer.height]
		}))
		.createColorMatrix()
		.setSize(9, 12, 0)
		.update()
		.listenMouse()
		.bind('click', function (eName, e) {
			var cell = this.getCell(
				libcanvas.mouse
					.getOffset(e)
					.clone()
					.move(this.getShape().from, true)
			);
			if (cell) {
				color.activeColor = cell.t;
				activeBrush.colorize(color.activeColor.hexToRgb(1));
				example.update();
			}
		});
	color.activeColor = '#000000';

	var cache = libcanvas.createBuffer(
		canvas.getWidth(), canvas.getHeight()
	);
	cache.ctx = cache
		.getContext('2d-libcanvas')
		.fillAll('white');

	actions.dump(cache);
	var closeLine = function (e) {
		if (line) {
			e && line.push(canvas.getOffset(e));
			if (line.brush.type == 'standard') {
				drawer.lineTo(line, cache.ctx);
			} else {
				cache.ctx
					.save()
					.set('globalAlpha', line.opacity)
					.drawImage(brushCache, 0, 0)
					.restore();
				brushCache.ctx.clearAll();
			}
			actions.dump(cache);
			line = null;
			checkButtons();
			init.uiBuffer.update();
			libcanvas.update();
		}
	}

	libcanvas.origElem.addEvents({
		mousemove : function (e) {
			if (line) {
				line.push(canvas.getOffset(e));
				libcanvas.update();

				if (line.brush.type == 'mask') {
					var lastLine = [line[line.length-2] || line.getLast(), line.getLast()];
					lastLine.brush = line.brush;
					drawer.lineTo(lastLine, brushCache.ctx);
				}
			}
		},
		mouseup  : function (e) {
			closeLine(e);
		}
	});
	
	window.addEvents({
		mouseup  : function () {
			closeLine();
		}
	});

	init.uiBuffer.addElement(color);

	['undo', 'redo'].each(function (action) {
		init.buttonsList[action].click(function () {
			drawer.fillImage( actions[action](), cache.ctx );
			init.uiBuffer.update();
			libcanvas.update();
		});
	});

	/*init.buttonsList['save'].click(function () {
		// alert( typeof  );
		var req = new Request({
			url  : 'save.php',
			data : { image : cache.toDataURL() },
			onComplete : function (url) {
				if (confirm('Image saved, url is : \n' + url + '\nDo you want to open it?')) {
					location.href = url;
				}
			}
		});
		req.send();
	});*/

	init.buttonsList['clear'].click(function () {
		if (confirm('Do you really wants to clear all?')) {
			cache.ctx.fillAll('white');
			actions.clear();
			recheck();
		}
	});

	var lineWidth = new Grafiti.Slider(
		new LibCanvas.Shapes.Line({
			from : new Point(canvas.to.x - 200, color.getShape().from.y + 12 ),
			to   : new Point(canvas.to.x      , color.getShape().from.y + 12 ),
		}), 'Width:', 0.1
	).draggable().clickable().bind('change', function () {
		activeBrush.setSize(this.getWidth());
		example.update();
	});
	init.uiBuffer.addElement(lineWidth);
	lineWidth.getWidth = function () {
		return 1 + (this.getValue() * 63);
	};

	var opacity = new Grafiti.Slider(
		lineWidth.line.clone().move({x:0, y:26}), 'Opacity:', 1.0
	).draggable().clickable().bind('change', function () {
		activeBrush.setOpacity(opacity.getValue())
		example.update();
	});
	init.uiBuffer.addElement(opacity);

	var sharpness = new Grafiti.Slider(
		opacity.line.clone().move({x:0, y:26}), '', 1.0
	);
	sharpness.disabled = true;
	init.uiBuffer.addElement(sharpness);

	$$('#grafiti-actions [processor]').addEvent('click', function (e) {
		var proc = e.target.get('processor');
		drawer.process( proc, cache.ctx );
		recheck();
	});

	$$('#grafiti-actions [manProcessor=HSB] [action]').addEvent('click', function (e) {
		var input = e.target.getParent().getChildren('input')[0];
		var value = input.get('value');
		if (!isNaN(value) && value) {
			var k = e.target.get('action') == 'decrease' ? -1 : 1;
			var proc = new LibCanvas.Processors.HsbShift(value * k, input.get('rel'));
			drawer.manProcess( proc, cache.ctx );
			recheck();
		}
	});

	$$('#grafiti-actions .loadUrl a').addEvent('click', function (e) {
		var par = e.target.getParent('.loadUrl');
		var inp = par.getElementsByTagName('input')[0];
		var src = inp.get('value');

		if (src) {
			var show = function () {
				par.getChildren('.field'  )[0].setStyle('display', 'block');
				par.getChildren('.loading')[0].setStyle('display', 'none');
			};
			par.getChildren('.field'  )[0].setStyle('display', 'none');
			par.getChildren('.loading')[0].setStyle('display', 'block');
			
			var img = new Image;
			img.src = src;
			img.onload = function () {
				show();
				inp.set('value', '');
				drawer.fillImage( img, cache.ctx );
				recheck();
			};
			img.onerror = function () {
				show();
				alert ('failed while loading image');
			}
		}
	});

	var recheck = function () {
		actions.dump(cache);
		checkButtons();
		init.uiBuffer.update();
		libcanvas.update();
	};

	var drawer = new Grafiti.Drawer();

	var colorShape = color.getShape();
	var example = new Grafiti.Example( colorShape.getHeight() + 2,
		colorShape.getCenter()
			.move({
				x : (colorShape.getWidth() + colorShape.getHeight())/2 + 12,
				y : 0
			})
	);
	init.uiBuffer.addElement(example);

	var activeBrush = init.brushes['standard'];
	$$('#grafiti-actions [brush]').addEvent('click', function (e) {
		activeBrush = init.brushes[e.target.get('brush')]
			.colorize(color.activeColor.hexToRgb(1))
			.setSize(lineWidth.getWidth())
			.setOpacity(opacity.getValue());
		example.update();
		init.uiBuffer.update();
		libcanvas.update();
	});


	example.update = function () {
		example.run(drawer, {
			brush   : activeBrush,
			width   : lineWidth.getWidth(),
			opacity : opacity.getValue(),
			color   : color.activeColor
		});
	};
	example.update();


	var checkButtons = function () {
		['undo', 'redo', 'clear'].each(function (but) {
			init.buttonsList[but].disabled = !actions['can' + but.ucfirst()]();
		});
	};
	checkButtons();

	var brushCache = libcanvas.createBuffer(
		canvas.getWidth(), canvas.getHeight()
	);
	brushCache.ctx = brushCache.getContext('2d-libcanvas');

	libcanvas.start(function () {
		checkButtons();
		example.update();

		this.ctx
			.save()
			.drawImage(init.uiBuffer.elem, 0, 0)
			.clip(canvas)
			.translate(canvas.from)
			.drawImage(cache, 0, 0);
		if (line) {
			if (line.brush.type == 'standard') {
				drawer.lineTo(line, this.ctx);
			} else {
				this.ctx
					.save()
					.set('globalAlpha', line.opacity)
					.drawImage(brushCache, 0, 0)
					.restore();
			}
		}
		this.ctx.restore();
	});
};