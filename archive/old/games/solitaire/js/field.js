(function (cfg) {

Solitaire.Field = atom.Class({

	Implements: [ Drawable ],

	zIndex: 2,

	initialize: function (index, fields) {
		this.index  = index;
		this.cards  = [];
		this.fields = fields;

		this.shape = this.rectangle(null);
	},

	addCard: function (card) {
		var field = this,
			i     = this.cards.length,
			rect  = this.rectangle(i);
		if (card.shape) {
			card.shape.moveTo( rect );
		} else {
			card.shape = rect;
		}

		card.addEvent('startDrag', function () {
			field.removeCard(this).draw();
			this.draw();
			return 'removeEvent';
		}).addEvent('stopDrag', function () {
			var active = field;
			for (var i = field.fields.length; i--;) {
				if (field.fields[i].shape.hasPoint( this.libcanvas.mouse.point )) {
					active = field.fields[i];
					break;
				}
			}
			if (!active.canDrop(this)) active = field;
			if (active != field) {
				if (field.cards.length) {
					var last = field.cards.last;
					last.isClosed = false;
				}
				field.draw();
			}
			this.moveTo( active.rectangle(active.cards.length), function (card) {
				active.addCard( card ).draw();
				if (last) last.draggable();
			});
		});

		card.zIndex = i;
		this.cards.invoke('draggable', true);
		this.cards.include( card.draggable() );
		return this;
	},

	removeCard: function (card) {
		this.cards.erase( card );
		return this;
	},

	canDrop: function (card) {
		var last = this.cards.last;
		if (!last) {
			return card.power === 0;
		} else {
			return last.canDrop(card);
		}
	},

	rectangle: function (i) {
		return new Rectangle({
			from: [
				cfg.padding + (cfg.card.width + cfg.padding) * this.index,
				cfg.card.height + cfg.padding * ((i || 0) + 3)
			],
			size: i != null ? cfg.card : [ cfg.card.width, cfg.card.height + cfg.padding * 16 ]
		});
	},

	draw: function () {
		var cards = this.cards, l = cards.length, i = 0;
		this.libcanvas.ctx.clearRect( this.shape );
		for( ; i < l; i++ ) {
			cards[i].drawTo( this.libcanvas.ctx, this.rectangle(i) );
		}
	}
});

})(Solitaire.config);