Mines.Draw = atom.Class({
	initialize: function (engine) {
		engine.addTiles({
			1: this.drawNumber.bind(this, 1),
			2: this.drawNumber.bind(this, 2),
			3: this.drawNumber.bind(this, 3),
			4: this.drawNumber.bind(this, 4),
			5: this.drawNumber.bind(this, 5),
			6: this.drawNumber.bind(this, 6),
			7: this.drawNumber.bind(this, 7),
			8: this.drawNumber.bind(this, 8),
			explode : this.drawExplode.bind(this),
			closed  : this.drawClosed .bind(this),
			mine    : this.drawMine   .bind(this),
			flag    : this.drawFlag   .bind(this),
			empty   : this.drawEmpty  .bind(this),
			wrong   : this.drawWrong  .bind(this)
		});
	},
	
	numbers: {
		1: '#009',
		2: '#060',
		3: '#550',
		4: '#808',
		5: '#900',
		6: '#555',
		7: '#055',
		8: '#000'
	},

	gradient: function (ctx, rect, from, to) {
		var gradient = ctx.createLinearGradient(rect);
		gradient.addColorStop(0.0, from);
		gradient.addColorStop(1.0, to);
		return gradient;
	},

	drawNumber: function (number, ctx, rectangle) {
		ctx
			.fill  ( rectangle, '#999' )
			.stroke( rectangle, '#ccc' )
			.text({
				text  : number,
				color : this.numbers[number] || 'black',
				size  : 18,
				lineHeight: 18,
				weight: 'bold',
				align : 'center',
				to    : rectangle
			});
	},

	drawClosed: function (ctx, rectangle) {
		ctx.fill( rectangle, this.gradient(ctx, rectangle, '#eee', '#aaa') );
	},

	drawEmpty: function (ctx, rectangle) {
		ctx.fill( rectangle, '#999' ).stroke( rectangle, '#ccc' );
	},

	drawMine: function (ctx, rectangle) {
		ctx.fill( rectangle, '#999' )
			.fill( new Circle( rectangle.getCenter(), rectangle.height / 4 ), '#000' );
	},

	drawExplode: function (ctx, rectangle) {
		ctx.fill( rectangle, '#900' )
			.fill( new Circle( rectangle.getCenter(), rectangle.height / 4 ), '#000' );
	},

	drawFlag: function (ctx, rectangle) {
		ctx.fill( rectangle, '#999' )
			.fill( new Circle( rectangle.getCenter(), rectangle.height / 4 ), '#900' );
	},

	drawWrong: function (ctx, rectangle) {
		ctx.save()
			.fill( rectangle, '#999' )
			.set({ lineWidth: 3 })
			.stroke( new Line( rectangle.from      , rectangle.to       ), '#900' )
			.stroke( new Line( rectangle.bottomLeft, rectangle.topRight ), '#900' )
			.restore();
	}
});