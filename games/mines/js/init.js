
LibCanvas.extract();

window.Mines = {};

atom.dom(function () {

	var options = new function () {
		var uri = atom.uri().queryKey;

		if (uri.width && uri.height && uri.mines)  {
			this.fieldSize = {
				width : uri.width,
				height: uri.height
			};
			this.mines = uri.mines;
		}
	};

	new Mines.Controller('canvas', options);
});