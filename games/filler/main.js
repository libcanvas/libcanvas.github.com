LibCanvas.extract();

atom.dom(function(){
	new Filler.Game({
		appendTo: '.filler'
	}).start();
});
