atom.declare( 'Arkanoid.Ball', App.Element, {
	zIndex: 2,

	/** @constructs */
	configure: function () {
		this.startPosition = this.shape.center.clone();
		this.controller = this.settings.get('controller');
		this.container  = this.getContainer();
		this.speed      = new Point( 300, -150 );
		this.startSpeed = this.speed.clone();
	},

	getContainer: function () {
		return new Rectangle(
				new Point(0,0),
				this.controller.fieldSize
			).grow( -this.shape.radius*2 );
	},

	get currentBoundingShape () {
		return this.shape.getBoundingRectangle().fillToPixel().grow(2);
	},

	getMovementVector: function (time, factor) {
		return this.speed.clone().mul( time / 1000 * factor );
	},

	onUpdate: function (time) {
		this.partedStep( time );
		this.redraw();
	},

	renderTo: function (ctx) {
		ctx
			.fill  ( this.shape, '#99f' )
			.stroke( this.shape, '#00f' );
	},

	hitCell: function (cell) {
		cell.hit();
		if (cell.lives < 1) this.controller.cells.erase( cell );
	},

	die: function () {
		this.controller.platform.hit();
		this.shape.center.moveTo( this.startPosition );
		this.speed.moveTo( this.startSpeed );

		this.shape.center.x = this.controller.platform.shape.center.x;
	},

	// Поиск пересечений (начало)
	partedStep: function (time) {
		// если шаг слишком большой (например, из-за лага) - бьём его на
		// маленькие куски и обрабатываем словно произошло несколько шагов
		// предположим, что менее 5 fps - недопустимо для нашей игры
		time = time.limit(0, 200);

		var length = new Line( [0,0], this.getMovementVector( time, 1 ) ).length;

		var step = time / length;
		while (length > 5) {
			this.moveStep( step * 5, 1 );
			length -= 5;
		}
		this.moveStep( step * length, 1 );
	},

	getCollidesObject: function (point) {
		if (this.controller.platform.getCollisionRectangle(this.shape.radius).hasPoint(point)) {
			return this.controller.platform;
		}
		return this.controller.cells.find( point, this.shape.radius );
	},

	moveStep: function (time, path) {
		// смещение за текущее время
		var diff = this.getMovementVector( time, path );
		// новое месторасположение если бы не было столкновений
		var next = this.shape.center.clone().move( diff );

		var
			xItemDelta, yItemDelta,
			// расстояние к ближайшей стене, если пересекается
			xDelta = this.getDelta( 'x', next, diff ),
			yDelta = this.getDelta( 'y', next, diff );

		var object = this.getCollidesObject(next);

		if (object) {
			// мы ударились в ячейку
			if (object != this.controller.platform) {
				this.hitCell( object );
			}

			// расстояние к ближайшему объекту, если пересекается
			var objectRectangle = object.getCollisionRectangle(this.shape.radius) ;
			xItemDelta = this.getItemDelta( 'x', next, diff, objectRectangle );
			yItemDelta = this.getItemDelta( 'y', next, diff, objectRectangle );
			if (xDelta == null || (xItemDelta != null && xItemDelta < xDelta)) xDelta = xItemDelta;
			if (yDelta == null || (yItemDelta != null && yItemDelta < yDelta)) yDelta = yItemDelta;
		}

		// xDelta и yDelta - значение от 0 до 1, означающее процент
		// пройденного пути из длины всего шага до столкновения
		if (xDelta != null) xDelta *= path;
		if (yDelta != null) yDelta *= path;

		var delta = path, change = null;

		// в текущий шаг столновение происходит по обоим осям
		if (xDelta != null && yDelta != null) {
			// если удар произошёл в угол
			if (xDelta == yDelta) {
				change = 'both';
				delta = xDelta;
			// удар в вертикальную линию
			} else if (xDelta > yDelta) {
				change = 'y';
				delta = yDelta;
			// удар в горизонтальную линию
			} else {
				change = 'x';
				delta = xDelta;
			}
			// в текущий шаг столкновение только по оси Х
		} else if (xDelta != null) {
			delta  = xDelta;
			change = 'x';
			// в текущий шаг столкновение только по оси Н
		} else if (yDelta != null) {
			delta  = yDelta;
			change = 'y';
		}

		// смещаем фигуру на место столкновения
		if (delta) this.shape.move( this.getMovementVector( time, delta ) );

		if (this.shape.center.y > this.controller.platform.shape.to.y) {
			this.die();
			return;
		}

		// если направление поменялось - меняем скорость
		if (change) {
			if (change == 'both') {
				this.speed.mul(-1);
			} else {
				this.speed[change] *= -1;
			}
		}

		if (!path.equals( delta )) {
			// анализируем остальную часть шага (что произошло после столкновения)
			if (path - delta) this.moveStep( time, path - delta );
		}
	},

	getDelta: function (axis, next, diff) {
		var current = this.shape.center;
		var shape   = this.container;

		if (shape.to[axis] < next[axis]) {
			return (shape.to  [axis] - current[axis])/diff[axis];
		} else if (shape.from[axis] > next[axis]) {
			return (shape.from[axis] - current[axis])/diff[axis];
		}
		return null;
	},

	getItemDelta: function (axis, next, diff, shape) {
		var current, vector, distance, line, intersection;

		current  = this.shape.center;
		vector   = new Line( current, next );
		distance = vector.length;

		if (axis == 'y') {
			line = diff.y > 0 ?
				new Line(shape.from, shape.topRight ) :
				new Line(shape.bottomLeft, shape.to );
		} else if (axis == 'x') {
			line = diff.x > 0 ?
				new Line(shape.from, shape.bottomLeft ) :
				new Line(shape.topRight, shape.to );
		}

		if (intersection = line.intersect( vector, true )) {
			return new Line( current, intersection ).length / distance;
		}

		return null;
	}
	// Поиск пересечений (конец)
});