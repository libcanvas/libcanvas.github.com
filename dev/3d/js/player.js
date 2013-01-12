/** @class Eye.Player */
atom.declare( 'Eye.Player', App.Element, {

	angle: 0,

	speed: {
		rotate: (90).degree(),
		move  : 1
	},

	configure: function () {
		this.controller = this.settings.get('controller');
		this.position   = this.settings.get('position');

		this.shape = new Circle(0, 0, 8);

		this.updateShape();
	},

	updateShape: function () {
		this.shape.center
			.set(this.position)
			.mul(this.controller.map.cellSize);
	},

	rotate: function (time) {
		this.angle = (this.angle + this.speed.rotate * time / 1000).normalizeAngle();
	},

	move: function (time) {
		var
			map = this.controller.map,
			pos = this.position,
			radius = 0.25,
			factor =  this.speed.move * time / 1000;

		var toX = pos.x + Math.cos(this.angle) * factor;
		var toY = pos.y + Math.sin(this.angle) * factor;

		var blockX = ~~toX;
		var blockY = ~~toY;

		if (map.isBlocked(blockX, blockY)) return;


		var blockTop    = map.isBlocked(blockX,blockY-1);
		var blockBottom = map.isBlocked(blockX,blockY+1);
		var blockLeft   = map.isBlocked(blockX-1,blockY);
		var blockRight  = map.isBlocked(blockX+1,blockY);

		if (blockTop && toY - blockY < radius) {
			toY = pos.y = blockY + radius;
		}
		if (blockBottom && blockY+1 - toY < radius) {
			toY = pos.y = blockY + 1 - radius;
		}
		if (blockLeft && toX - blockX < radius) {
			toX = pos.x = blockX + radius;
		}
		if (blockRight && blockX+1 - toX < radius) {
			toX = pos.x = blockX + 1 - radius;
		}

		function checkCorner (aX, aY) {
			if (!map.isBlocked(blockX+aX, blockY+aY)) return;

			var dX, dY;

			dX = toX - blockX + (aX > 0 ? 1 : 0);
			dY = toY - blockY + (aY > 0 ? 1 : 0);

			dX *= dX;
			dY *= dY;

			if (dX+dY < radius*radius) {
				if (dX > dY)
					toX = blockX + radius;
				else
					toY = blockY + radius;
			}
		}

		if (!(blockLeft  && blockTop)) checkCorner(-1, -1);
		if (!(blockRight && blockTop)) checkCorner(+1, -1);
		if (!(blockLeft  && blockBottom)) checkCorner(-1, +1);
		if (!(blockRight && blockBottom)) checkCorner(+1, +1);

		pos.x = toX;
		pos.y = toY;
	},

	checkAction: function (action, time, keyFor, keyRev) {
		var keyboard = atom.Keyboard();

		if (keyboard.key(keyFor)) {
			this[action](time);
			return true;
		} else if (keyboard.key(keyRev)) {
			this[action](-time);
			return true;
		}
		return false;
	},

	onUpdate: function (time) {
		var
			update = false,
			keyboard = atom.Keyboard();

		update = this.checkAction('rotate', time, 'aright', 'aleft') || update;
		update = this.checkAction('move', time, 'w', 's') || update;

		if (update) {
			this.updateShape();
			this.redraw();
		}
	},

	renderTo: function (ctx, resources) {
		ctx.drawImage({
			image : resources.get('images').get('player'),
			center: this.shape.center,
			angle : this.angle
		})
	}

});