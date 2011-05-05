
LibCanvas.extract();

window.Mines = {};

atom.dom(function () {

	new Mines.Controller('canvas');
});