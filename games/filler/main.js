LibCanvas.extract();
atom.patching(window);

atom.dom(function(){
	new Filler.Game({
		appendTo: '.filler'
	}).start();
});
