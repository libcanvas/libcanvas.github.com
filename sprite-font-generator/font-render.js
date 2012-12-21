/** @name FontRender */
atom.declare( 'FontRender', {
	initialize: function (family, bold, size, chars) {
		this.widthMap = [];
		this.width = 0;
		this.size  = size;
		this.font  = this.generateFont( family, bold, size );
		this.chars = chars;
	},

	generateFont: function (family, bold, size) {
		return ( bold ? 'bold ' : '') + size + 'px ' + family;
	},

	countWidth: function (ctx) {
		var i, width, chars = this.chars;

		this.setFont(ctx);

		for (i = 0; i < chars.length; i++) {
			width = parseInt(ctx.measureText(chars[i]).width.limit(1)) + 1;
			this.width += width;
			this.widthMap.push(width);
		}
	},

	isEmptyLine: function (data, width, y) {
		for( var x = width; x--; ) {
			if( data[y * width * 4 + x * 4 + 3] ) {
				return false;
			}
		}
		return true;
	},

	findLimits: function ( buffer ) {
		var data, y, limits = {};
		data = buffer.ctx.getImageData().data;

		for( y = 0; y < buffer.height; y++ ) {
			if (!this.isEmptyLine(data, buffer.width, y)) {
				limits.y = y;
				break;
			}
		}

		for( y = buffer.height; y--; ) {
			if (!this.isEmptyLine(data, buffer.width, y)) {
				limits.height = y - limits.y + 1;
				break;
			}
		}

		return limits;
	},

	countLimits: function (buffer) {
		buffer.width  = this.widthMap.max();
		buffer.height = this.size * 2;

		this.setFont(buffer.ctx);

		for( var i = 0; i < this.chars.length; i++ ) {
			buffer.ctx.fillText( this.chars[i], 0, 0 );
		}

		return this.findLimits( buffer );
	},

	setFont: function (ctx) {
		ctx.set({ fillStyle: 'black', font: this.font, textBaseline: 'top' });
	},

	drawTo: function (canvas, onlyBg) {
		var buffer, ctx, i, x, limits;

		buffer = LibCanvas.buffer(0,0,true);
		ctx = buffer.ctx;

		ctx.save();

		this.countWidth( ctx );
		limits = this.countLimits( buffer );

		canvas.width  = this.width;
		canvas.height = limits.height;

		this.setFont(canvas.ctx);

		for( i = 0, x = 0; i < this.chars.length; i++ ) {
			if (onlyBg) {
				canvas.ctx.fill(
					new LibCanvas.Shapes.Rectangle(x, 0, this.widthMap[i], canvas.height),
					i & 1 ? '#fbb' : '#bfb'
				);
			} else {
				canvas.ctx.fillText( this.chars[i], x, -limits.y );
			}
			x += this.widthMap[i];
		}

		ctx.restore();

		return this;
	}
});
/** @name FontForm */
atom.declare( 'FontForm', {
	initialize: function () {
		this.initFields();

		this.canvas = LibCanvas.buffer(0, 0, true);
		this.size.attr({value: 16 });
		this.setChars( ' !";#$%&\'()*+,-./:;<>=?@[\\]^_`{|}~0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz’АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯҐІЇЄЎабвгдеёжзийклмнопрстуфхцчшщъыьэюяґіїєў' );

		this.initForm();
	},

	initForm: function () {
		var form = this.create('div').appendTo('body');

		[ this.label('family')
		, this.font
		, this.label('bold')
		, this.bold
		, this.label('bg')
		, this.bg
		, this.label('size')
		, this.size
		, this.button( 'Render', function () {
			var font = new FontRender(
				String (this.font .first.value),
				Boolean(this.bold .first.checked),
				Number (this.size .first.value),
				String (this.chars.first.value).split('')
			).drawTo(this.canvas, Boolean(this.bg.first.checked));

			this.width.first.value = '[' + font.widthMap.join(',') + ']';
		})
		, this.button( 'Save'  , function () {
			if (this.canvas) {
				window.open( this.canvas.toDataURL("image/png"), '_blank' );
			}
		})
		, this.label('chars')
		, this.chars
		, this.label('width')
		, this.width
		, atom.dom( this.canvas )
		].invoke('appendTo', form);
	},

	initFields: function () {
		this.font  = this.create('select', { id: 'family' });
		this.bold  = this.create('input',  { id: 'bold' , type: 'checkbox'});
		this.bg    = this.create('input',  { id: 'bg'   , type: 'checkbox'});
		this.size  = this.create('input',  { id: 'size' , type: 'number'  });
		this.chars = this.create('input',  { id: 'chars', type: 'text'    });
		this.width = this.create('input',  { id: 'width', type: 'text'    });
	},

	setChars: function (value) {
		this.chars.attr( 'value', value );
	},

	setFonts: function (fonts) {
		var i, option;

		for( i = 0; i < fonts.length; i++ ) {
			option = this.create( 'option', { value: fonts[i] })
				.html( fonts[i] )
				.appendTo( this.font );

			if (!i) option.attr({ selected: 'selected' });
		}
	},

	button: function (value, action) {
		return this.create('input', { type: 'button', value: value })
			.bind( 'click', action.bind(this) );
	},

	label: function (id) {
		return this.create('label', { 'for': id })
			.html(id.ucfirst() + ':');
	},

	create: function (tag, props) {
		return atom.dom.create(tag, props);
	}
});

new function () {
	var fontForm;

	atom.dom(function (atom, $) {
		fontForm = new FontForm();
	});

	// Called from the get-fonts.swf
	// (c) by Pepa <http://www.unpljugged.com/>
	window.getFontList = function (userFonts) {
		atom.dom(function () {
			fontForm.setFonts(userFonts.split(','));
		});
	};
};