
var Controller = atom.Class({
	/**
	 * @param {String} canvas - element selector
	 */
	initialize: function (canvas, options) {
		var field     = new Field(options),
		    libcanvas = new LibCanvas(canvas, { fps: 60 });
		libcanvas
			.listenMouse()
			.fpsMeter()
			.size(field.size, true)
			.addElement(field)
			.start();
	}

});