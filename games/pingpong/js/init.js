
LibCanvas.extract();

window.Pong = {};

atom.dom(function () {

	new Pong.Controller('canvas');
});