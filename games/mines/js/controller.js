
Mines.Controller = atom.Class({
	Implements: [ atom.Class.Options ],

	options: {
		 tileSize : { width: 24, height: 24 },
		fieldSize : { width: 30, height: 16 },
		fieldShift: { top: 72, left: 4, right: 4, bottom: 4 },
		mines: 99
	},

	useFlags: false,

	initialize: function (canvas) {
		this.setSizes();

		var libcanvas = this.libcanvas =
			new LibCanvas(canvas, {
					backBuffer: 'off',
					preloadImages: {
						field : 'im/flag-mine.png',
						tools : 'im/flag-shovel.png'
					}
				})
				.listenMouse();

		libcanvas.addEvent('ready', function () {

			var options   = this.options,
				field     = new Mines.Field( libcanvas, options ),
				size      = field.engine.countSize(),
				shift     = options.fieldShift,
				fieldRect = new Rectangle( shift.left, shift.top, size.width, size.height ),
				fullSize  = this.getFullSize( size );

			libcanvas.size( fullSize , true ).ctx.fillAll( '#666' );

			libcanvas.mouse.addEvent({
				click: function (e) {
					var offset = e.offset;
					if (this.switchRect.hasPoint( offset )) {
						this.switchFlag()
					} else if ( fieldRect.hasPoint( offset ) ) {
						field.click( offset.clone().move(fieldRect.from, true) , this.useFlags );
						this.drawTime( field.time );
						this.drawMinesLeft( field.minesLeft );
					}
				}.bind(this),
				wheel: function (e) {
					this.switchFlag();
					e.preventDefault();
				}.bind(this),
				contextmenu: function (e) {
					var offset = e.offset;
					if ( fieldRect.hasPoint( offset ) ) {
						field.click( offset.clone().move(fieldRect.from, true) , true );
						e.preventDefault();
					}
					this.drawMinesLeft( field.minesLeft );
				}.bind(this)
			});

			this.field = field;
			this.switchRect = new Rectangle( 4, 4, 64, 64 );
			this.timeRect   = new Rectangle( fullSize.width - 4 - 128, 4, 128, 32);
			this.minesRect  = this.timeRect.clone().move(new Point(0, 32));

			this.drawSwitch().drawMinesLeft( field.minesLeft );

			(function () {
				this.drawTime( field.time );
			}.periodical(100, this));

		}.bind(this));
	},

	rightText: function (text, to) {
		return {
			text: text,
			to: to,
			family: 'monospace',
			size: 24,
			align: 'right'
		};
	},

	getFullSize: function ( fieldSize ) {
		var shift = this.options.fieldShift;
		return {
			width : fieldSize.width  + shift.left + shift.right,
			height: fieldSize.height + shift.top  + shift.bottom
		};
	},

	setSizes: function () {
		var query = atom.uri().queryKey;

		if (query.mines) {
			var width  = parseInt(query.width ).limit( 9, 40 ),
			    height = parseInt(query.height).limit( 6, 25 ),
			    mines  = parseInt(query.mines ).limit( 5, width*height-4 );
			this.setOptions({
				fieldSize: { width: width, height: height },
				mines    : mines
			});
		}
	},

	switchFlag: function () {
		this.useFlags = !this.useFlags;
		this.drawSwitch();
	},

	drawSwitch: function() {
		var lc = this.libcanvas,
		    image = lc.getImage('tools').sprite( 64 * (this.useFlags ? 0 : 1), 0, 64, 64 );
		lc.ctx
			.fill( this.switchRect, '#666' )
			.drawImage({ image: image, draw: this.switchRect });

		return this;
	},

	lastTime: null,

	drawTime: function (time) {
		if (time && time != this.lastTime) {
			this.libcanvas.ctx
				.fill(this.timeRect, '#666' )
				.text(this.rightText(time, this.timeRect));
			this.lastTime = time;
		}
		return this;
	},

	lastMines: null,
	drawMinesLeft: function (mines) {
		if (mines != this.lastMines) {
			this.libcanvas.ctx
				.fill(this.minesRect, '#666' )
				.text(this.rightText('Mines: ' + mines, this.minesRect));
			this.lastTime = mines;
		}
		return this;
	}

});