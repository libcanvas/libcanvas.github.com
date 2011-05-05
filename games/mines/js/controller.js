
Mines.Controller = atom.Class({
	Implements: [ atom.Class.Options ],

	options: {
		 tileSize : { width: 24, height: 24 },
		fieldSize : { width: 30, height: 16 },
		fieldShift: { top: 50, left: 4, right: 4, bottom: 4 },
		mines: 99
	},


	initialize: function (canvas) {
		this.setSizes();

		var libcanvas, options, field, size, translate, flags = atom.dom('#flags').first;

		libcanvas = new LibCanvas(canvas, { backBuffer: 'off' }).listenMouse();

		options = this.options;

		field = new Mines.Field( libcanvas, options );

		size = field.engine.countSize(), shift = options.fieldShift;
		
		libcanvas.size( size.width  + shift.left + shift.right, size.height + shift.top + shift.bottom , true );

		libcanvas.ctx.fillAll( '#666' );

		translate = new Point( -shift.left, -shift.top );

		libcanvas.mouse.addEvent({
			click:function (e) {
				var offset = e.offset.clone().move(translate);

				if (offset.x.between(0, size.width, true) && offset.y.between(0, size.height, true) ) {
					field.click( offset, flags.checked );
				}

				e.preventDefault();
				return false;
			},
			wheel: function (e) {
				flags.checked = !flags.checked;
			}
		});

	},

	setSizes: function () {
		var query = atom.uri().queryKey;

		if (query.mines) {
			var width  = parseInt(query.width ).limit( 5, 40 ),
			    height = parseInt(query.height).limit( 5, 25 ),
			    mines  = parseInt(query.mines ).limit( 5, width*height-4 );
			this.setOptions({
				fieldSize: { width: width, height: height },
				mines    : mines
			});
		}
	}

});