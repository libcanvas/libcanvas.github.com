
var Controller = atom.Class({
	/**
	 * @param {String} canvas - element selector
	 */
	initialize: function (canvas, options) {
		var field     = new Field(options),
		    libcanvas = new LibCanvas(canvas);
		libcanvas.size(field.size, true);
		libcanvas.addElement(field);
		libcanvas.start();
	}

});