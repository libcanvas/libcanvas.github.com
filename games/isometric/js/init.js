
LibCanvas.extract();

window.Isometric = {};

atom.dom(function () {
	new Isometric.Controller('canvas');
});