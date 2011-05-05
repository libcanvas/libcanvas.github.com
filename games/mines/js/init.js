
LibCanvas.extract();

window.Mines = {};

atom.dom(function () {

	new Mines.Controller('canvas');

	atom.dom(document, {
		touchstart: function (e) {
			trace(e);
		}
	});
});