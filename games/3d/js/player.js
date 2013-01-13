/** @class Eye.Player */
atom.declare( 'Eye.Player', App.Element, {

	angle: (45).degree(),

	vShift: 0,
	height: 0,
	origHeight: 0.4,

	speed: {
		rotate: (90).degree(),
		vert: 0.001,
		move: 3
	},

	configure: function () {
		this.height = this.origHeight;
		this.controller = this.settings.get('controller');
		this.position   = this.settings.get('position');
		this.animatable = new atom.Animatable(this);

		this.shape = new Circle(0, 0, 8);

		atom.Keyboard().events.add({
			'space'   : this.jump   .bind(this),
			'shift'   : this.sitDown.bind(this),
			'shift:up': this.sitUp  .bind(this)
		});


		atom.Keyboard().events.add(
			['aup', 'adown', 'aright', 'aleft', 'w', 's', 'd', 'a', 'space', 'shift'],
			Mouse.prevent
		);

		this.updateShape();
	},

	activate: function () {
		var target = this.controller.ray.castSingleRay();
		if (target.dist < 12 && target.wallType != '1') {
			this.controller.map.change(target.x, target.y, ' ');
			this.redraw();
		}
	},

	jumping: false,
	jump: function (e) {
		if (!this.jumping && !this.sitting) {
			this.jumping = true;
			this.animateHeight((this.origHeight*2).limit(0,0.99), function () {
				this.animateHeight(this.origHeight, function () {
					this.jumping = false;
				});
			})
		}
	},

	sitting: false,
	sitDown: function (e) {
		if (!this.jumping && !this.sitting) {
			this.sitting = true;
			this.animateHeight(this.origHeight/2, function (){});
		}
	},

	sitUp: function (e) {
		if (this.sitting) {
			this.animateHeight(this.origHeight, function () {
				this.sitting = false;
			});
		}
	},

	animateHeight: function (target, onComplete) {
		this.animatable.animate({
			fn: target > this.height ? 'sine-out' : 'sine-in',
			time: (target - this.height).abs() * 1000,
			props: { height: target },
			onTick: this.redraw,
			onComplete: onComplete.bind(this)
		});
	},

	updateShape: function () {
		this.shape.center
			.set(this.position)
			.mul(this.controller.map.cellSize);
	},

	rotate: function (time) {
		this.angle = (this.angle + this.speed.rotate * time / 1000).normalizeAngle();
	},

	strafe: function (time) {
		this.shiftPosition(time, (90).degree());
	},

	move: function (time) {
		this.shiftPosition(time, 0);
	},

	vert: function (time) {
		this.vShift = (this.vShift + (this.speed.vert * time)).limit(-1, 1);
	},

	shiftPosition: function (time, angleAdd) {
		var
			map = this.controller.map,
			pos = this.position,
			radius = 0.25,
			factor =  this.speed.move * time / 1000 / (this.sitting ? 2 : 1);

		var toX = pos.x + Math.cos(this.angle + angleAdd) * factor;
		var toY = pos.y + Math.sin(this.angle + angleAdd) * factor;

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

	actionExists: function (time, keyFor, keyRev) {
		var keyboard = atom.Keyboard();

		if (keyboard.key(keyFor)) {
			return time;
		} else if (keyboard.key(keyRev)) {
			return -time;
		}
		return 0;
	},

	checkAction: function (action, time, keyFor, keyRev) {
		time = this.actionExists(time, keyFor, keyRev);

		if (time) {
			this[action](time);
			return true;
		}
		return false;
	},

	pointer: function (delta) {
		if (delta.y) {
			this.vert(-delta.y*4);
			this.redraw();
		}
		if (delta.x) {
			this.rotate(delta.x*2);
			this.redraw();
		}
	},

	onUpdate: function (time) {
		var update = false, moveTime, strafeTime;

		update = this.checkAction('vert'  , time, 'aup'   , 'adown') || update;
		update = this.checkAction('rotate', time, 'aright', 'aleft') || update;

		moveTime   = this.actionExists(time, 'w', 's');
		strafeTime = this.actionExists(time, 'd', 'a');

		if (moveTime || strafeTime) update = true;
		if (moveTime && strafeTime) {
			moveTime   /= Math.SQRT2;
			strafeTime /= Math.SQRT2;
		}

		if (  moveTime) this.move  (moveTime);
		if (strafeTime) this.strafe(strafeTime);

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
		});

		this.controller.ray.cast();
	}

});