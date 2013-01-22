/** @class Filler.Graphic.Tile.Engine */
atom.declare('Filler.Graphic.Tile.Engine', TileEngine, {

    offset: new Point(0, 0),

    initialize: function method (matrix, settings){

	    method.previous.call(this, settings);

        this.matrix = matrix;
        this.points = this.cells.map(function(cell){ return cell.point; });
        this.offset = this.settings.get('offset');
        this.methods = this.settings.get('methods');

        matrix.events.add('update', this.redrawByPoints.bind(this));
    },

	createMatrix : function () {
		var x, y, cell, point, shape,
			settings   = this.settings,
			size       = settings.get('size'),
			value      = settings.get('defaultValue'),
			cellSize   = settings.get('cellSize'),
			cellMargin = settings.get('cellMargin');

		for (y = 0; y < size.height; y++) for (x = 0; x < size.width; x++) {
			point = new Point(x, y);
			shape = this.createCellRectangle(point, cellSize, cellMargin);
			cell  = new Filler.Graphic.Tile.Cell( this, point, shape, value );

			this.cells.push( cell );
		}
		return this;
	},

    redrawByPoints: function(ps){
        var points = ps || this.points;

        points.forEach(function(point){
            this.updateCell(this.getCellByIndex(point));
        }.bind(this));
    }
});
