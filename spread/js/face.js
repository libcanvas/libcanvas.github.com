Spread.Face = atom.declare({
	name  : 'Spread.Face',
	parent: App.Element,
	prototype: {
		configure: function () {
			this.settings.set({ hidden: true });
			this.shape = new Rectangle(
				this.node.shape.center,
				new Size(50, 50)
			);
			this.image = new Image();
			this.image.src = "https://graph.facebook.com/" + this.node.id + "/picture";
			this.image.onload = function () {
				this.loaded = true;
				if (this.isVisible()) this.redraw();
			}.bind(this)
		},

		hide: function () {
			this.settings.set({ hidden: true });
			return this.redraw();
		},

		show: function () {
			this.settings.set({ hidden: false });
			return this.redraw();
		},

		get node () {
			return this.settings.get('node');
		},

		renderTo: function (ctx) {
			if (!this.loaded) return;
			ctx.drawImage( this.image, this.shape );
		}
	}
});