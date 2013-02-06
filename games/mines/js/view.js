/** @class Mines.View */
atom.declare( 'Mines.View', {
	initialize: function (controller, fieldSize) {
		this.images = controller.images;

		this.engine = new TileEngine({
			size: fieldSize,
			cellSize: new Size(24, 24),
			cellMargin: new Size(0, 0),
			defaultValue: 'closed'
		})
		.setMethod( this.createMethods() );

		this.app = new App({
			size  : this.engine.countSize(),
			simple: true
		});

		this.element = TileEngine.Element.app( this.app, this.engine );
	},

	createMethods: function () {
		return {
			1: this.number.bind(this, 1),
			2: this.number.bind(this, 2),
			3: this.number.bind(this, 3),
			4: this.number.bind(this, 4),
			5: this.number.bind(this, 5),
			6: this.number.bind(this, 6),
			7: this.number.bind(this, 7),
			8: this.number.bind(this, 8),
			explode : this.explode.bind(this),
			closed  : this.closed .bind(this),
			mine    : this.mine   .bind(this),
			flag    : this.flag   .bind(this),
			empty   : this.empty  .bind(this),
			wrong   : this.wrong  .bind(this)
		};
	},

	color: function (ctx, cell, fillStyle, strokeStyle) {
		var strokeRect = cell.rectangle.clone().snapToPixel();

		return ctx
			.fill( cell.rectangle, fillStyle)
			.stroke( strokeRect, strokeStyle );
	},

	empty: function (ctx, cell) {
		return this.color(ctx, cell, '#999', '#aaa');
	},

	mine: function (ctx, cell) {
		return this
			.empty(ctx, cell)
			.drawImage( this.images.get('mine'), cell.rectangle );
	},

	flag: function (ctx, cell) {
		return this
			.empty(ctx, cell)
			.drawImage( this.images.get('flag'), cell.rectangle );
	},

	explode: function (ctx, cell) {
		return this
			.color(ctx, cell, '#c00', '#aaa')
			.drawImage( this.images.get('mine'), cell.rectangle );
	},

	closed: function (ctx, cell) {
		return ctx.fill( cell.rectangle,
			ctx.createGradient(cell.rectangle, {
				0: '#eee', 1: '#aaa'
			})
		);
	},

	wrong: function (ctx, cell) {
		var r = cell.rectangle;

		return this.empty(ctx, cell)
			.save()
			.clip( r )
			.set({ lineWidth: Math.round(cell.rectangle.width / 8) })
			.stroke( new Line( r.from      , r.to       ), '#900' )
			.stroke( new Line( r.bottomLeft, r.topRight ), '#900' )
			.restore();
	},

	numberColors: [null, '#009', '#060', '#550', '#808', '#900', '#555', '#055', '#000' ],

	number: function (number, ctx, cell) {
		var size = Math.round(cell.rectangle.height * 0.8);

		return this.empty(ctx, cell)
			.text({
				text  : number,
				color : this.numberColors[number],
				size  : size,
				lineHeight: size,
				weight: 'bold',
				align : 'center',
				to    : cell.rectangle
			});
	}
});