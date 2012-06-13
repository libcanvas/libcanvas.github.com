/** @class Filler.Graphic.Tile.Cell */
atom.declare('Filler.Graphic.Tile.Cell', TileEngine.Cell, {

    canMove: function(){
        if (this.engine.matrix.values.indexOf(this.value) < 0 || this.point.player) {
            return false;
        }
        return true;
    },

	get value () {
		return this.point.value;
	},

	set value (value) {
        this._value = this.point.value = Number(value);
		this.engine.updateCell(this);
	},

    get active() {
		return this._active;
    },

    set active(value) {
		this._active = value;
		this.engine.updateCell(this);
    },

	renderTo: function (ctx) {

		var size,
            value = this.value,
            method = this.engine.methods[ value ],
            rectangle = this.rectangle;

        
        ctx.fill(rectangle, ctx.createGradient(rectangle, method()));

        if (this.active){
            ctx.stroke(rectangle.clone().snapToPixel(), '#000');
        }

        if (this.point.player) {
            size = rectangle.height * 0.75;
            ctx.text({
                text  : this.point.player.number + 1,
                color : '#000',
                size  : size,
                lineHeight: size,
                weight: 'bold',
                align : 'center',
                to    : rectangle
            });
        }
		return this;
	}
});
