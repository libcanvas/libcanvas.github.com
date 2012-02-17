
var Spread = {};
LibCanvas.extract();
atom.dom(function () {

	var id = Number(location.search.substring(1) || 1);

	atom.ajax({
		url: 'js/rid-' + id + '.json',
		type: 'json',
		method: 'get',
		onLoad: function (tree) {
			tree.map(function (item) { item.x *= 2; item.y *= 2; });

			var sizes, scenes, app, mouseHandler, last, nodes = {};

			function recountBodyWidth () {
				var minSize = (sizes.size.width + 16);
				if (window.innerWidth < minSize) {
					document.body.style.width = minSize + 'px';
				} else {
					document.body.style.width = 'auto';
				}
			}

			sizes = Spread.Utils.sizes( tree, 50 );

			app = new App({ size: sizes.size, appendTo: '#content' });
			mouseHandler = new App.MouseHandler({ app: app,
				mouse: new LibCanvas.Mouse(app.container.bounds)
			});

			scenes = [ 'edge', 'node', 'face' ].associate(function(name, i) {
				return app.createScene({ name: name, intersection: 'manual', zIndex: i })
			});

			tree.forEach(function (point, i) {
				var node = nodes[point.id] = new Spread.Node(scenes.node, {
					data  : point,
					shift : sizes.center,
					first : i == 0,
					parent: point.parent && nodes[point.parent]
				});

				node.events.add( 'click', function () {
					if (last) last.emphasize(false);
					last = this.emphasize(true);
				});

				mouseHandler.subscribe( node );

				node.createEdge( scenes.edge );
				node.createFace( scenes.face );
			});

			var resizeTimeout = 0;
			window.onresize = recountBodyWidth;
			recountBodyWidth();
	}});
});