
// Globalizing LibCanvas variables
LibCanvas.extract();

// onDomReady - run our app
atom.dom(function () {
	new Controller('canvas', {
		tile: { width: 64, height: 64 }
	});
});