
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

		if (isTouch()) {
			this.tileSize = { width: 48, height: 48 };
			this.switcher = true;
		}
	};

	function isTouch() {
		try {
			document.createEvent("TouchEvent");
			return true;
		} catch (e) {
			return false;
		}
	}

	new Mines.Controller('canvas', options);
});