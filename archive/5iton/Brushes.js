
Grafiti.Brushes = new Class({
	shift : 0,
	eachCoord : function (line, fn) {
		if (line instanceof LibCanvas.Point) {
			fn.call(this, line);
			return;
		}
		if (line.from.equals(line.to, 2)) {
			fn.call(this, line.from);
			return;
		}
		

		var len = line.getLength();
		var shift = {
			x : (line.to.x - line.from.x) / len * (this.shift || (this.size / 8)),
			y : (line.to.y - line.from.y) / len * (this.shift || (this.size / 8)),
		};

		var min = Math.min;
		var max = Math.max;
		var point = line.from.clone();
		do {
			fn.call(this, point);
			point.move(shift);
		} while (
			point.x.between(min(line.from.x, line.to.x).round(), max(line.from.x, line.to.x), 'LR') &&
			point.y.between(min(line.from.y, line.to.y).round(), max(line.from.y, line.to.y), 'LR')
		);
		return;
	},
	size : 16,
	setSize : function (size) {
		this.size = size;
		return this;
	},
	opacity : 1,
	setOpacity : function (opacity) {
		this.opacity = opacity;
		return this;
	},
	color : '#000000',
	colorize : function (color) {
		this.color = color;
		return this;
	},
	draw : function (ctx, line) {
		throw 'Abstract';
	}
});

Grafiti.Brushes.Standard = new Class({
	Extends : Grafiti.Brushes,
	type : 'standard'
});

Grafiti.Brushes.Mask = new Class({
	Extends : Grafiti.Brushes,
	type : 'mask',
	images  : [],
	colorized : [],
	shift   : 0,
	addImage : function (image) {
		this.colorized = this.images;
		this.images.push(image.getContext ? image : image.sprite());
		return this;
	},
	colorize : function (color) {
		var colorizer = new LibCanvas.Processors.Mask(color);
		var c = this.colorized = [];
		this.images.each(function (image) {
			image = image.getContext('2d-libcanvas').getClone();
			var data = colorizer.processPixels(image.getContext('2d-libcanvas').getImageData());
			image.getContext('2d-libcanvas').putImageData(data, 0, 0);
			c.push(image);
		});
		return this;
	},
	draw : function (ctx, line, example) {
		var r    =  this.size / 2;
		var size = [this.size, this.size];
		ctx.save(); //set('globalAlpha', this.opacity);
		this.eachCoord(line, function (point) {
			var drawTo = new LibCanvas.Shapes.Rectangle({
				from : point.clone().move({x:-r, y:-r}),
				size : size
			});

			ctx.drawImage({
				image : example ?
					this.colorized[0] :
					this.colorized.getRandom(),
				draw  : drawTo
			});
		});
		ctx.restore();
		return this;
	}
});