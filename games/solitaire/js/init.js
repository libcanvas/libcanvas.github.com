
LibCanvas.extract();

window.Solitaire = {
	config: {
		canvas : { width: 640, height: 400 },
		card   : { width:  59, height:  80 },
		padding: 12,
		imagePadding: 5
	}
};

atom.dom(function () {
	new Solitaire.Controller('canvas');
});