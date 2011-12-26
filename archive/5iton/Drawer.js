Grafiti.Drawer = new Class({
	actionsTo : function (actions, ctx) {
		ctx.fillAll('white');
		actions.each(function (action) {
			if (action.type == 'line') {
				this.lineTo(action.data, ctx);
			} else if (action.type == 'process') {
				this.process(action.data, ctx);
			}
		}.bind(this));
		return ctx;
	},
	fillImage : function (image, ctx) {
		return ctx.drawImage(image, 0, 0);
	},
	lineTo : function (line, ctx) {
		if (line.brush.type == 'mask') {
			return this.brush(line, ctx);
		}
		ctx.save().set('globalAlpha', line.opacity);

		if (line.length == 1 || (line.length == 2 && line[0].equals(line[1]))) {
			ctx.fill(new LibCanvas.Shapes.Circle(line[0], line.width / 2), line.color);
		} else {
			ctx.beginPath(line[0])
				.set('lineWidth', line.width)
				.set('lineCap' , 'round')
				.set('lineJoin', 'round');

			for (var i = 1; i < line.length; i++) {
				ctx.lineTo(line[i]);
			}
			ctx.stroke(line.color).closePath();
		}


		return ctx.restore();
	},
	process : function (proc, ctx) {
		var data = proc.split('.');
		return this.manProcess(new LibCanvas.Processors[data[0]](data[1]), ctx);
	},
	manProcess : function (proc, ctx) {
		return ctx.putImageData(proc
			.processPixels(
				ctx.getImageData()
			), 0 , 0);
	},
	brush : function (line, ctx) {
		if (!$chk(line.length)) {
			line.brush.draw(ctx, line);
		} else if (line.length == 0) {
			line.brush.draw(ctx, line[0]);
		} else {
			for (var i = 1; i < line.length; i++) {
				line.brush.draw(ctx, new LibCanvas.Shapes.Line(line[i-1], line[i]));
			}
		}
		return ctx;
	}
});