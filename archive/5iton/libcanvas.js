/*
---
description: LibCanvas initialization

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>
- Anna Shurubey aka Nutochka <nutochka1@i.ua>
- Nikita Baksalyar <nikita@baksalyar.ru>

provides: [LibCanvas]
*/

window.LibCanvas = {
	Inner : {
		Canvas2D : {}
	},
	Ui : {},
	Shapes  : {},
	Utils   : {},
	Engines : {
		TopDown : {}
	},
	Processors : {},
	Behaviors : {}
};


(function () {
	// Changing HTMLCanvasElement.prototype.getContext, so we
	// can create our own contexts by LibCanvas.addCanvasContext(name, ctx);
	var newCtxs = {};
	
	HTMLCanvasElement.prototype.getOriginalContext = HTMLCanvasElement.prototype.getContext;

	HTMLCanvasElement.prototype.getContext = function (type) {
		var ctx;
		if (!this.contextsList) {
			this.contextsList = {};
		}

		if (!(type in this.contextsList)) {
			if (type in newCtxs) {
				ctx = new newCtxs[type](this);
			} else {
				try {
					ctx = this.getOriginalContext.apply(this, arguments);
				} catch (e) {
					throw (!e.toString().test(/NS_ERROR_ILLEGAL_VALUE/)) ? e :
						'Wrong Context Type : "' + type + '"';
				}
			}
			this.contextsList[type] = ctx;
		}
		return this.contextsList[type];
	};


	LibCanvas.addCanvasContext = function (name, ctx) {
		newCtxs[name] = ctx;
		return this;
	};
})();

/*
---
description: Extends native prototypes with several useful functions

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides:
- Number.degree
- Number.getDegree
- Number.normalizeAngle
- Number.between
- String.repeat
- String.safeHTML
- String.nl2br
- String.replaceAll
- String.begins
- Array.getLast
- Array.remove
- Array.sum
- Array.remove
- Array.average
- Array.firstReal
- Array.shuffle
- Array.sortBy
- $log
- $equals
- Math.hypotenuse
- Math.cathetus
- parseUri
*/

// Number
(function () {


var degreesCache = {};

Number.implement({
	/**
	 * Cast degrees to radians
	 * (90).degree() == Math.PI/2
	 */
	degree: function () {
		return this in degreesCache ? degreesCache[this] :
			this * Math.PI / 180;
	},
	/**
	 * Cast radians to degrees
	 * (Math.PI/2).getDegree() == 90
	 */
	getDegree: function (round) {
		return arguments.length == 0 ?
			this / Math.PI * 180 :
			this.getDegree().round(round);
	},
	normalizeAngle : function () {
		var num  = this;
		var d360 = (360).degree();
		num %= d360;
		(num < 0) && (num += d360);
		return num;
	},
	normalizeDegree : function (base) {
		return this
			.getDegree()
			.round(base || 0)
			.degree()
			.normalizeAngle();
	},
	between: function (n1, n2, equals) {
		return (n1 <= n2) && (
			(equals == 'L'   && this == n1) ||
			(equals == 'R'   && this == n2) ||
			(  this  > n1    && this  < n2) ||
			([true, 'LR', 'RL'].contains(equals) && (n1 == this || n2 == this))
		);
	},
	equals : function (to, accuracy) {
		$chk(accuracy) || (accuracy = 8);
		return this.toFixed(accuracy) == to.toFixed(accuracy);
	}
});

[0, 45, 90, 135, 180, 225, 270, 315, 360].each(function (degree) {
	degreesCache[degree] = degree.degree();
});

})();

// String
String.implement({
	repeat: function (times) {
		var s = this;
		new Number(times).times(function (t) {
			s += this;
		}, this);
		return s;
	},
	safeHTML: function () {
		return this.replace(/[<'&">]/g, function (symb) {
			return {
				'&'  : '&amp;',
				'\'' : '&#039;',
				'\"' : '&quot;',
				'<'  : '&lt;',
				'>'  : '&gt;'
			}[symb];
		});
	},
	nl2br: function () {
		return this.replaceAll('\n', '<br />\n');
	},
	replaceAll: function (find, replace) {
		return this.split(find).join(replace);
	},
	begins: function (w, caseInsensitive) {
		return (caseInsensitive) ? w == this.substr(0, w.length) :
			w.toLowerCase() == this.substr(0, w.length).toLowerCase();
	},
	ucfirst : function () {
		return this.charAt(0).toUpperCase() + this.substr(1);
	}
});

// Array
Array.implement({
	getLast : function () {
		return this[this.length - 1];
	},
	remove: function (index) {
		this.splice(index, 1);
		return this;
	},
	sum: function () {
		var s = 0;
		this.each(function (elem) {
			s += elem;
		});
		return s;
	},
	average: function () {
		return this.sum() / this.length;
	},
	firstReal: function () {
		for (var i = 0; i < this.length; i++) {
			if ($chk(this[i])) {
				return this[i];
			}
		}
		return null;
	},
	shuffle : function () {
		for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
		return this;
	},
	sortBy : function (method, reverse) {
		var get = function (elem) {
			return elem[method] ? elem[method]() : 0;
		}
		return this.sort(function ($0, $1) {
			var result = get($1) - get($0) >= 0 ? 1 : -1;
			return reverse ? -result : result;
		});
	},
	clone : function () {
		return $extend([], this);
	}
});

Array.range = function (from, to, shift) {
	var result = [];
	shift = shift || 1;
	do {
		result.push(from);
		from += shift;
	} while (from < to);
	return result;
};

// <image> tag
$extend(HTMLImageElement.prototype, {
	sprite : function () {
		if (!this.isLoaded()) {
			$log('Not loaded in Image.sprite: ', this);
			throw 'Not loaded in Image.sprite, logged';
		}
		var buf;
		this.spriteCache = this.spriteCache || {};
		if (arguments.length) {
			var rect = new LibCanvas.Shapes.Rectangle;
			rect.set.apply(rect, arguments);
			var index = [rect.from.x,rect.from.y,rect.getWidth(),rect.getHeight()].join('.');
			buf = this.spriteCache[index]
			if (!buf) {
				buf = LibCanvas.Buffer(rect.getWidth(), rect.getHeight());
				var bigBuf = LibCanvas.Buffer(this.width*2, this.height*2);
				for (var y = 0; y < 2; y++) {
					for (var x = 0; x < 2; x++) {
						bigBuf.getContext('2d-libcanvas').drawImage({
							image : this,
							from : [this.width*x,this.height*y]
						});
					}
				}
				buf.getContext('2d-libcanvas').drawImage({
					image : bigBuf,
					crop  : rect,
					draw  : [0,0,rect.getWidth(),rect.getHeight()]
				});
				bigBuf.getContext('2d-libcanvas').clearAll();
				this.spriteCache[index] = buf;
			}

		} else {
			buf = this.spriteCache[0];
			if (!buf) {
				this.spriteCache[0] = buf = LibCanvas.Buffer(this.width, this.height);
				buf.getContext('2d-libcanvas').drawImage(this, 0, 0);
			}
		}
		return buf;
	},
	isLoaded : function () {
		if (!this.complete) {
			return false;
		}
		return !$defined(this.naturalWidth) || this.naturalWidth; // browsers
	}
});

// else
var $log = function () {
	try {
		console.log.apply(console, arguments);
	} catch (e) {}
};

var $equals = function (obj1, obj2) {
	var plain = function (obj) {
		return typeof obj != 'object' ||
			[false, 'element', 'textnode', 'whitespace']
				.contains($type(obj));
	}
	if (obj1 == obj2) {
		return true;
	} else if (plain(obj1) || plain(obj2)) {
		return obj1 == obj2;
	} else {
		for (var i in obj1) {
			if (!(i in obj2) || !$equals(obj1[i], obj2[i])) {
				return false;
			}
		}
	}
	return true;
};

Math.hypotenuse = function (cathetus1, cathetus2)  {
    return (cathetus1*cathetus1 + cathetus2*cathetus2).sqrt();
};


Math.cathetus = function (hypotenuse, cathetus2)  {
    return (hypotenuse*hypotenuse - cathetus2*cathetus2).sqrt();
};

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str || window.location.href),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
}

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};


/*
---
description: Basic abstract class for animatable objects.

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Animatable]
*/

LibCanvas.Behaviors.Animatable = new Class({
	animate : function (args) {
		var step  = {};
		var frames = args.frames || 10;
		for (var i in args.props) {
			var type = $type(this[i]);
			if (type == 'number' || type == 'function') {
				step[i] = (args.props[i] - (type == 'function' ? this[i]() : this[i])) / frames;
			}
		}
		var frame = 0;
		var interval = function () {
			for (var i in step) {
				if ($type(this[i]) == 'function') {
					this[i](this[i]() + step[i]);
				} else {
					this[i] += step[i];
				}
			}
			args.onProccess && args.onProccess.call(this);

			if (++frame >= frames) {
				$clear(interval);
				args.onFinish && args.onFinish.call(this);
			}
		}.bind(this).periodical(args.delay || 25);
		return this;
	}
});

/*
---
description: Provides interface for binding events to objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Bindable]
*/ 

LibCanvas.Behaviors.Bindable = new Class({
	binds : {},
	autoBinds : {},
	autoBind : function (event, args) {
		if ($type(event) == 'array') {
			event.each(function (e) {
				this.autoBind(e, args);
			}.bind(this));
			return this;
		}
		if ($type(args) != 'function') {
			if (!this.autoBinds[event]) {
				this.autoBinds[event] = [];
			}
			this.autoBinds[event].push(args);
			this.bind(event, args);
		}
		return this;
	},
	callBind : function (event, fn, args) {
		var result = fn.apply(this, args);
		if (typeof result == 'string') {
			result = result.toLowerCase();
			if (result == 'unbind') {
				this.unbind(event, fn);
			}
		}
	},
	bind : function (event, fn) {
		if ($type(event) == 'array') {
			event.each(function (e) {
				this.bind(e, fn);
			}.bind(this));
			return this;
		}
		if ($type(fn) == 'function') {
			if (!(event in this.binds)) {
				this.binds[event] = [];
			}
			this.binds[event]
				.include(fn);
			if (event in this.autoBinds) {
				var ab = this.autoBinds[event];
				for (var i = 0, l = ab.length; i < l; i++) {
					this.callBind(event, fn, ab[i]);
				}
				// opera bug
				//this.autoBinds[event].each(function (args) {
				//	this.callBind(event, fn, args);
				//}.bind(this));
			}
		} else if (event in this.binds) {
			var args = fn;
			this.binds[event].each(function (fn) {
				this.callBind(event, fn, args);
			}.bind(this));
		}
		return this;
	},
	unbind : function (event, fn) {
		if ($type(event) == 'array') {
			event.each(function (e) {
				this.unbind(e, fn);
			}.bind(this));
			return this;
		}

		if (!fn) {
			this.binds[event] = [];
		} else if (event in this.binds) {
			this.binds[event].erase(fn);
		}
		return this;
	}
});

/*
---
description: Provides interface for clickable canvas objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Clickable]
*/ 

(function () {

var setValFn = function (name, val) {
	return function () {
		this[name] = val;
		this.bind('statusChanged');
	}.bind(this);
};

// Should extends drawable, implements mouseListener
LibCanvas.Behaviors.Clickable = new Class({
	clickable : function () {
		this.listenMouse();

		var fn = setValFn.bind(this);

		this.hover  = false;
		this.active = false;

		this.bind('mouseover', fn('hover', true));
		this.bind('mouseout' , fn('hover', false));
		this.bind('mousedown', fn('active', true));
		this.bind(['mouseup', 'away:mouseout', 'away:mouseup'],
			fn('active', false));
		return this;
	}
});
})();

/*
---
description: When object implements LibCanvas.Behaviors.Draggable interface dragging made possible

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Draggable]
*/ 

(function () {

LibCanvas.Behaviors.Draggable = new Class({
	isDraggable : null,
	dragStart : null,
	returnToStart : function (speed) {
		return !this.dragStart ? this :
			this.moveTo(this.dragStart, speed);
	},
	draggable : function (stopDrag) {
		if (this.isDraggable === null) {
			this.bind('libcanvasSet', initDraggable.bind(this));
		}
		this.isDraggable = !stopDrag;
		return this;
	}
});

var moveListener = function () {
	if (this.isDraggable && this.prevMouseCoord) {
		var mouse = this.libcanvas.mouse;
			var move  = this.prevMouseCoord.diff(mouse.point);
		this.shape.move(move);
		this.bind('moveDrag', [move]);
		this.prevMouseCoord.set(mouse.point)
	}
};

var initDraggable = function () {
	var dragFn = function () {
		moveListener.call(this);
	}.bind(this);

	this.listenMouse();

	var startDrag = ['mousedown'];
	var dragging  = ['mousemove', 'away:mousemove'];
	var stopDrag  = ['mouseup', 'away:mouseup', 'away:mouseout'];

	return this
		.bind(startDrag, function () {
			if (this.isDraggable) {
				this.bind('startDrag');
				if (this.getCoords) {
					this.dragStart = new LibCanvas.Point(
						this.getCoords()
					);
				}
				this.prevMouseCoord = new LibCanvas.Point(
					this.libcanvas.mouse.point
				);
				this.bind(dragging, dragFn);
			}
		})
		.bind(stopDrag, function () {
			if (this.isDraggable && this.prevMouseCoord) {
				this
					.bind('stopDrag')
					.unbind(dragging, dragFn);
				delete this.prevMouseCoord;
			}
		});
};

})();

/*
---
description: Abstract class for drawable canvas objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Drawable]
*/ 

LibCanvas.Behaviors.Drawable = new Class({
	Implements : LibCanvas.Behaviors.Bindable,
	setLibcanvas : function (libcanvas) {
		this.libcanvas = libcanvas;
		this.autoBind('libcanvasSet');
		this.libcanvas.bind('ready', function () {
			this.autoBind('libcanvasReady');
		}.bind(this));
		return this;
	},
	getCoords : function () {
		return this.shape.getCoords();
	},
	getShape : function () {
		return this.shape;
	},
	setShape : function (shape) {
		this.shape = shape;
		return this;
	},
	getZIndex : function () {
		return this.zIndex || 0;
	},
	setZIndex : function (zIndex) {
		this.zIndex = zIndex;
		return this;
	},
	draw : function () {
		throw 'Abstract method "draw"';
	}
});

/*
---
description: Abstract class for droppable canvas objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Droppable]
*/ 

LibCanvas.Behaviors.Droppable = new Class({
	drops : null,
	drop : function (obj) {
		if (this.drops === null) {
			this.drops = [];
			this.bind('stopDrag', function () {
				var dropped = false;
				var mouse = this.libcanvas.mouse;
				if (mouse.inCanvas) {
					this.drops.each(function (obj) {
						if(obj.getShape().hasPoint(mouse.point)) {
							dropped = true;
							this.bind('dropped', [obj]);
						}
					}.bind(this));
				}
				if (!dropped) {
					this.bind('dropped', [null]);
				}
			}.bind(this));
		}
		this.drops.push(obj);
		return this;
	},
	undrop : function (obj) {
		if (this.drops !== null) {
			this.drops.erase(obj);
		}
		return this;
	}
});

/*
---
description: Made possible link between two canvas objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Linkable]
*/ 

LibCanvas.Behaviors.Linkable = new Class({
	links : null,
	moveLinks : function (move) {
		(this.links || []).each(function (elem) {
			elem
				.getShape()
				.move(move);
		});
		return this;
	},
	// todo : fix recursion while linkin 2 elements between each other
	link : function (obj) {
		if (this.links === null) {
			this.links = [];
			this.getShape().bind('move', function (move) {
				this.moveLinks(move);
			}.bind(this));
		}
		this.links.include(obj);
		return this;
	},
	unlink : function (obj) {
		if (this.links !== null) {
			if (obj) {
				this.links.erase(obj);
			} else {
				this.links = [];
			}
		}
		return this;
	}
});

/*
---
description: Canvas mouse listener

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.MouseListener]
*/ 

/**
 * events :
 *
 * click
 *
 * mouseover
 * mousemove
 * mouseout
 * mouseup
 * mousedown
 *
 * away:mouseover
 * away:mousemove
 * away:mouseout
 * away:mouseup
 * away:mousedown
 */

// Should extends LibCanvas.Behaviors.Drawable
LibCanvas.Behaviors.MouseListener = new Class({
	listenMouse : function (stopListen) {
		return this.bind('libcanvasSet', function () {
			this.libcanvas.mouse[
				stopListen ? "unsubscribe" : "subscribe"
			](this);
		}.bind(this));
	}
});

/*
---
description: Provides interface for moveable objects

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Behaviors.Moveable]
*/

LibCanvas.Behaviors.Moveable = new Class({
	moving : {
		interval : null,
		speed : 0, // pixels per sec
		to : null
	},
	stopMoving : function () {
		$clear(this.moving.interval);
		return this;
	},
	getCoords : function () {
		return this.shape.getCoords();
	},
	moveTo    : function (point, speed) {
		this.stopMoving();
		this.moving.speed = speed = (speed || this.moving.speed);
		if (!speed) {
			this.getShape().move(
				this.getCoords().diff(point)
			);
			return this;
		}
		this.moving.interval = function () {
			var move = {}, pixelsPerFn = speed / 20;
			var diff = this.getCoords().diff(point);
			var distance = Math.hypotenuse(diff.x, diff.y);
			if (distance > pixelsPerFn) {
				move.x = diff.x * (pixelsPerFn / distance);
				move.y = diff.y * (pixelsPerFn / distance);
				this.getShape().move(move);
			} else {
				move.x = diff.x;
				move.y = diff.y;
				// @todo change move to diff
				this.getShape().move(move);
				this.stopMoving();
				this.bind('stopMove');
			}
		}.bind(this).periodical(20);
		return this;
	}
});

/*
---
description: Counting assets downloading progress

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Inner.Canvas2D.DownloadingProgress]
*/

LibCanvas.Inner.Canvas2D.DownloadingProgress = new Class({
	preloadImages : null,
	progressBarStyle : null,
	getImage : function (name) {
		if (this.images && this.images[name]) {
			return this.images[name];
		} else {
			throw 'No image "' + name + '"';
		}
	},
	renderProgress : function () {
		if (!this.imagePreloader) {
			this.imagePreloader = new LibCanvas.Utils.ImagePreloader(this.preloadImages)
				.ready(function (preloader) {
					this.images = preloader.images;
					$log(preloader.getInfo());
					this.autoBind('ready');
					this.update();
				}.bind(this));
		}
		if (this.progressBarStyle && !this.progressBar) {
			this.progressBar = new LibCanvas.Utils.ProgressBar()
				.setStyle(this.progressBarStyle);
		}
		if (this.progressBar) {
			this.progressBar
				.setLibcanvas(this)
				.setProgress(this.imagePreloader.getProgress())
				.draw();
		}
	},
	isReady : function () {
		return !this.preloadImages || (this.imagePreloader && this.imagePreloader.isReady());
	}
});

/*
---
description: Constantly calculates frames per seconds rate

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Inner.Canvas2D.FpsMeter]
*/

LibCanvas.Inner.Canvas2D.FpsMeter = new Class({
	fpsMeter : function (frames) {
		var fpsMeter = new LibCanvas.Utils.FpsMeter(frames || (this.fps ? this.fps / 2 : 10));
		return this.bind('frameRenderStarted', function () {
			fpsMeter.frame();
		});
	}
});

/*
---
description: Private class for inner usage in LibCanvas.Canvas2D

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Inner.Canvas2D.FrameRenderer]
*/

LibCanvas.Inner.Canvas2D.FrameRenderer = new Class({
	checkAutoDraw : function () {
		if (this.autoUpdate == 'onRequest') {
			if (this.updateFrame) {
				this.updateFrame = false;
				return true;
			}
		} else if (this.autoUpdate) {
			return true;
		}
		return false;
	},
	callFrameFn : function () {
		if (this.fn) {
			this.fn.call(this);
		}
		return this;
	},
	show : function () {
		this.origCtx.clearAll().drawImage(this.elem, 0, 0);
		return this;
	},
	drawAll : function () {
		this.elems
			.sortBy('getZIndex', true)
			.each(function (elem) {
				elem.draw();
			});
		return this;
	},
	processing : function (type) {
		this.processors[type].each(function (processor) {
			if ('process' in processor) {
				processor.process(this);
			} else if ('processCanvas' in processor) {
				processor.processCanvas(this.elem);
			} else if ('processPixels' in processor) {
				this.ctx.putImageData(
					processor.processCanvas(
						this.ctx.getImageData()
					)
				);
			}
		}.bind(this));
		return this;
	},
	frame : function () {
		this.bind('frameRenderStarted');
		this.renderFrame();
		this.bind('frameRenderFinished');
		return this;
	},
	renderFrame : function () {
		if (this.checkAutoDraw()) {
			this.processing('pre');

			if (this.isReady()) {
				this
					.callFrameFn()
					.drawAll();
			} else {
				this.renderProgress();
			}
			this.processing('post');
			if (this.elem != this.origElem) {
				this.show();
			}
		}
		return this;
	}
});

/*
---
description: Every frame cleans canvas with specified color

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Processors.Clearer]
*/  

LibCanvas.Processors.Clearer = new Class({
	style : null,
	initialize : function (style) {
		this.style = style || null;
	},
	process : function (libcanvas) {
		if (this.style) {
			libcanvas.ctx.fillAll(this.style);
		} else {
			libcanvas.ctx.clearAll();
		}
	},
	// processCanvas : function (elem) {}
	// processPixels : function (elem) {}
});

/*
---
description: Every frame cleans canvas with specified color

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Processors.Grayscale]
*/

LibCanvas.Processors.Grayscale = new Class({
	style : null,
	initialize : function (type) {
		// luminance, average, red, green, blue, default
		this.type = type || 'default';
	},
	processPixels : function (data) {
		var d = data.data;
		var set = function (i, value) {
			d[i] = d[i+1] = d[i+2] = value;
		};
		var type = this.type;
		for (var i = 0; i < d.length; i+=4) {
			var r = d[i];
			var g = d[i+1];
			var b = d[i+2];
			switch (type) {
				case 'luminance': set(i, 0.2126*r + 0.7152*g + 0.0722*b); break;
				case 'average'  : set(i, (r + g + b)/3); break;
				case 'red'      : set(i, r); break;
				case 'green'    : set(i, g); break;
				case 'blue'     : set(i, b); break;
				default : set(i, 0.3*r + 0.59*g + 0.11*b); break;
			}
		}
		return data;
	}
});

LibCanvas.Processors.HsbShift = new Class({
	shift : 0,
	param : 'hue',
	initialize : function (shift, param) {
		// hue, sat, bri
		this.param = param || 'hue';
		this.shift = shift * 1;
		if (this.param == 'hue') {
			this.shift %= 360;
			if (this.shift < 0) this.shift += 360;
		} else {
			this.shift = this.shift.limit(-100, 100);
		}
	},
	processPixels : function (data) {
		var d = data.data,
			shift = this.shift,
			param = this.param,
			key   = { hue: 0, sat: 1, bri: 2 }[param],
			i, hsb, rgb;
		for (i = 0; i < d.length; i+=4) {
			if (['hue', 'sat'].contains(param) && d[i] == d[i+1] && d[i] == d[i+2]) continue;

			hsb = [d[i], d[i+1], d[i+2]].rgbToHsb();
			param == 'hue' ?
				(hsb[0  ] = (hsb[0]   + shift) % 360) :
				(hsb[key] = (hsb[key] + shift).limit(0, 100));
			rgb    = hsb.hsbToRgb();

			d[i  ] = rgb[0];
			d[i+1] = rgb[1];
			d[i+2] = rgb[2];
		}
		return data;
	}
});

LibCanvas.Processors.Invert = new Class({
	processPixels : function (data) {
		var d = data.data;
		for (var i = 0; i < d.length; i++) {
			if (i % 4 != 3) d[i] = 255 - d[i];
		}
		return data;
	}
});


LibCanvas.Processors.Mask = new Class({
	color : null,
	initialize : function (color) { // [r,g,b]
		this.color = color || [0,0,0];
	},
	processPixels : function (data) {
		var d = data.data;
		var c = this.color;
		for (var i = 0; i < d.length; i+=4) {
			d[i+3] = d[i];
			d[i]   = c[0];
			d[i+1] = c[1];
			d[i+2] = c[2];
		}
		return data;
	}
});

/*
---
description: Helper for building tile maps (e.g. for Tetris or ur's favorite Dune II - http://en.wikipedia.org/wiki/Tile_engine)

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Behaviors.Bindable

provides: [LibCanvas.Engines.Tile]
*/

LibCanvas.Engines.Tile = new Class({
	Implements : [LibCanvas.Behaviors.Bindable],
	tiles : {},
	rects : {},
	first : true,

	cellWidth  : 0,
	cellHeight : 0,
	margin : 0,
	initialize : function (canvas) {
		this.elem = canvas;
		this.ctx  = canvas.getContext('2d-libcanvas');
	},
	checkMatrix : function (matrix) {
		if (!matrix.length) {
			throw 'Matrix should have at least one row';
		}
		var width = matrix[0].length;
		if (!width) {
			throw 'Matrix should have at least one cell';
		}
		matrix.each(function (line, i) {
			if (line.length != width) {
				throw 'Line ' + i + ' width is ' + line.length + '. Should be ' + width;
			}
		});
		return true;
	},
	createMatrix : function (width, height, fill) {
		var matrix = [];
		height.times(function () {
			var line = [];
			width.times(function () {
				line.push(fill);
			});
			matrix.push(line);
		});
		this.setMatrix(matrix);
		return matrix;
	},
	setMatrix : function (matrix) {
		this.first = true;
		this.checkMatrix(matrix);
		this.matrix    = matrix;
		this.oldMatrix = this.cloneMatrix(matrix);
		return this;
	},
	cloneMatrix : function (matrix) {
		var nexMatrix = [];
		matrix.each(function (line, i) {
			nexMatrix[i] = $extend([], line);
		});
		return nexMatrix;
	},
	addTile : function (index, fn) {
		this.tiles[index] = fn;
		return this;
	},
	addTiles : function (tiles) {
		for (var i in tiles) {
			this.addTile(i, tiles[i]);
		}
		return this;
	},
	setSize : function (cellWidth, cellHeight, margin) {
		this.cellWidth  = cellWidth;
		this.cellHeight = cellHeight;
		this.margin = margin;
		return this;
	},
	update : function () {
		var changed = false;
		var old     = this.oldMatrix;
		this.each(function (cell) {
			var flag = (this.first || old[cell.y][cell.x] != cell.t);
			if (flag) {
				changed = true;
				this.drawCell(cell);
				this.oldMatrix[cell.y][cell.x] = cell.t;
			}
		}.bind(this));
		this.first = false;
		if (changed) {
			this.bind('update');
		}
		return this;
	},
	getRect : function (cell) {
		if (!this.rects['0.0']) {
			this.each(function (cell) {
				var index = cell.x + '.' + cell.y;
				this.rects[index] = new LibCanvas.Shapes.Rectangle({
					from : [
						(this.cellWidth  + this.margin) * cell.x,
						(this.cellHeight + this.margin) * cell.y,
					],
					size : [this.cellWidth, this.cellHeight]
				});
			});
		}
		return this.rects[cell.x + '.' + cell.y];
	},
	getCell : function (point) {
		var x = parseInt(point.x / (this.cellWidth  + this.margin));
		var y = parseInt(point.y / (this.cellHeight + this.margin));
		var my = this.matrix[y];
		if (my && $chk(my[x])) {
			return {
				t : my[x],
				x : x,
				y : y
			};
		} else {
			return null;
		}
	},
	drawCell : function (cell /*{t,x,y}*/) {
		var rect = this.getRect(cell);
		var fn   = this.tiles[cell.t];
		if (!$chk(fn) && $chk(this.tiles['default'])) fn = this.tiles['default'];
		this.ctx.clearRect(rect);
		if ($type(fn) == 'element') {
			this.ctx.cachedDrawImage({
				image : fn,
				draw  : rect
			});
		} else if ($type(fn) == 'function') {
			fn(this.ctx, rect, cell);
		} else if (fn !== null) {
			this.ctx.fill(rect, fn);
		}
		return this;
	},
	each : function (fn) {
		var m = this.matrix;
		for (var y = 0; y < m.length; y++) {
			for (var x = 0; x < m[y].length; x++) {
				fn.call(this, {
					t : m[y][x],
					x : x,
					y : y
				});
			}
		}
		return this;
	},
	width : function () {
		return (this.matrix[0] && this.matrix[0].length) || 0;
	},
	height : function () {
		return this.matrix.length || 0;
	}
});

/*
---
description: Class which contains several basic mouse events 

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Inner.MouseEvents]
*/

LibCanvas.Inner.MouseEvents = new Class({
	subscribers : [],
	lastMouseMove : [],
	lastMouseDown : [],
	initialize : function (mouse) {
		this.mouse = mouse;
		this.point   = mouse.point;
	},
	subscribe : function (elem) {
		this.subscribers.include(elem);
		return this;
	},
	unsubscribe : function (elem) {
		this.subscribers.erase(elem);
		return this;
	},
	overElem : function (elem) {
		return this.mouse.inCanvas && elem.getShape().hasPoint(this.point);
	},
	getOverSubscribers : function () {
		var mouse = this;
		var elements = {
			over : [],
			out  : []
		};
		var maxOverMouseZ = 0;
		this.subscribers
			.sortBy('getZIndex')
			.each(function (elem) {
				if (elem.getZIndex() >= maxOverMouseZ && mouse.overElem(elem)) {
					maxOverMouseZ = elem.getZIndex();
					elements.over.push(elem);
				} else {
					elements.out.push(elem);
				}
			});
		return elements;

	},
	callEvent : function (elem, event, e) {
		if ($type(elem.bind) == 'function') {
			elem.bind(event, [event, e]);
		} else if ($type(elem.event) == 'function') {
			elem.event.call(elem, event, e);
		} else if (typeof(elem.event) == 'object') {
			if (elem.event[event]) {
				elem.event[event].call(elem, event, e);
			} else if (event.begins('away')) {
				if (typeof elem.event.away == 'object' &&
					elem.event.away[event.substr(5)]) {
					elem.event.away[event.substr(5)]
						.call(elem, event, e);
				}
			}
		}
	},
	event : function (type, e) {
		var mouse = this;
		var subscribers = this.getOverSubscribers();

		if (type == 'mousedown') {
			mouse.lastMouseDown = [];
		}
		subscribers.over.each(function (elem) {
			// Mouse move firstly on this element
			if (type == 'mousemove' && !mouse.lastMouseMove.contains(elem)) {
				mouse.callEvent(elem, 'mouseover', e);
				mouse.lastMouseMove.push(elem);
			} else if (type == 'mousedown') {
				mouse.lastMouseDown.push(elem);
			// If mouseuped on this elem and last mousedown was on this elem - click
			} else if (type == 'mouseup' && mouse.lastMouseDown.contains(elem)) {
				mouse.callEvent(elem, 'click', e);
			}
			mouse.callEvent(elem, type, e);
		});

		subscribers.out.each(function (elem) {
			if (this.isOut) {
				mouse.callEvent(elem, 'away:mouseover', e);
			}
			var mouseout = false;
			if (['mousemove', 'mouseout'].contains(type)) {
				if (mouse.lastMouseMove.contains(elem)) {
					mouse.callEvent(elem, 'mouseout', e);
					if (type == 'mouseout') {
						mouse.callEvent(elem, 'away:mouseout', e);
					}
					mouse.lastMouseMove.erase(elem);
					mouseout = true;
				}
			}
			if (!mouseout) {
				mouse.callEvent(elem, 'away:' + type, e);
			}
		});

		return this;
	}
});

/*
---
description: Provides projective textures rendering (more info: http://acko.net/files/projective/index.html)

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Inner.ProjectiveTexture]
*/

(function () {

LibCanvas.Inner.ProjectiveTexture = new Class({
	initialize : function (image) {
		if (typeof image == 'string') {
			this.image = new Image;
			image.src = image
		} else {
			this.image = image;
		}
		this.patchSize = 64;
		this.limit = 4;
	},
	setQuality : function (patchSize, limit) {
		this.patchSize = patchSize || 64;
		this.limit = limit || 4;
		return this;
	},
	setContext : function (ctx) {
		this.ctx = ctx;
		return this;
	},
	render : function (points) {
		var tr = getProjectiveTransform(points);

		// Begin subdivision process.
		var ptl = tr.transformProjectiveVector([0, 0, 1]);
		var ptr = tr.transformProjectiveVector([1, 0, 1]);
		var pbl = tr.transformProjectiveVector([0, 1, 1]);
		var pbr = tr.transformProjectiveVector([1, 1, 1]);

		this.transform = tr;

		divide.call(this, 0, 0, 1, 1, ptl, ptr, pbl, pbr, this.limit);
		
		return this;
	}
});

var divide = function (u1, v1, u4, v4, p1, p2, p3, p4, limit) {

	 // See if we can still divide.
	if (limit) {
		// Measure patch non-affinity.
		var d1 = [p2[0] + p3[0] - 2 * p1[0], p2[1] + p3[1] - 2 * p1[1]];
		var d2 = [p2[0] + p3[0] - 2 * p4[0], p2[1] + p3[1] - 2 * p4[1]];
		var d3 = [d1[0] + d2[0], d1[1] + d2[1]];
		var r = Math.abs((d3[0] * d3[0] + d3[1] * d3[1]) / (d1[0] * d2[0] + d1[1] * d2[1]));

		// Measure patch area.
		d1 = [p2[0] - p1[0] + p4[0] - p3[0], p2[1] - p1[1] + p4[1] - p3[1]];
		d2 = [p3[0] - p1[0] + p4[0] - p2[0], p3[1] - p1[1] + p4[1] - p2[1]];
		var area = Math.abs(d1[0] * d2[1] - d1[1] * d2[0]);

		// Check area > patchSize pixels (note factor 4 due to not averaging d1 and d2)
		// The non-affinity measure is used as a correction factor.
		if ((u1 == 0 && u4 == 1) || ((.25 + r * 5) * area > (this.patchSize * this.patchSize))) {
			// Calculate subdivision points (middle, top, bottom, left, right).
			var umid = (u1 + u4) / 2;
			var vmid = (v1 + v4) / 2;
			var tr   = this.transform;
			var pmid = tr.transformProjectiveVector([umid, vmid, 1]);
			var pt   = tr.transformProjectiveVector([umid, v1, 1]);
			var pb   = tr.transformProjectiveVector([umid, v4, 1]);
			var pl   = tr.transformProjectiveVector([u1, vmid, 1]);
			var pr   = tr.transformProjectiveVector([u4, vmid, 1]);
			
			// Subdivide.
			limit--;
			divide.call(this,   u1,   v1, umid, vmid,   p1,   pt,   pl, pmid, limit);
			divide.call(this, umid,   v1,   u4, vmid,   pt,   p2, pmid,   pr, limit);
			divide.call(this,  u1,  vmid, umid,   v4,   pl, pmid,   p3,   pb, limit);
			divide.call(this, umid, vmid,   u4,   v4, pmid,   pr,   pb,   p4, limit);

			return;
		}
	}
	
	var ctx = this.ctx;

	// Render this patch.
	ctx.save();
	// Set clipping path.
	ctx.beginPath();
	ctx.moveTo(p1[0], p1[1]);
	ctx.lineTo(p2[0], p2[1]);
	ctx.lineTo(p4[0], p4[1]);
	ctx.lineTo(p3[0], p3[1]);
	ctx.closePath();
	//ctx.clip();

	// Get patch edge vectors.
	var d12 = [p2[0] - p1[0], p2[1] - p1[1]];
	var d24 = [p4[0] - p2[0], p4[1] - p2[1]];
	var d43 = [p3[0] - p4[0], p3[1] - p4[1]];
	var d31 = [p1[0] - p3[0], p1[1] - p3[1]];

	// Find the corner that encloses the most area
	var a1 = Math.abs(d12[0] * d31[1] - d12[1] * d31[0]);
	var a2 = Math.abs(d24[0] * d12[1] - d24[1] * d12[0]);
	var a4 = Math.abs(d43[0] * d24[1] - d43[1] * d24[0]);
	var a3 = Math.abs(d31[0] * d43[1] - d31[1] * d43[0]);
	var amax = Math.max(Math.max(a1, a2), Math.max(a3, a4));
	var dx = 0, dy = 0, padx = 0, pady = 0;

	// Align the transform along this corner.
	switch (amax) {
		case a1:
			ctx.transform(d12[0], d12[1], -d31[0], -d31[1], p1[0], p1[1]);
			// Calculate 1.05 pixel padding on vector basis.
			if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
			if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
			break;
		case a2:
			ctx.transform(d12[0], d12[1],  d24[0],  d24[1], p2[0], p2[1]);
			// Calculate 1.05 pixel padding on vector basis.
			if (u4 != 1) padx = 1.05 / Math.sqrt(d12[0] * d12[0] + d12[1] * d12[1]);
			if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
			dx = -1;
			break;
		case a4:
			ctx.transform(-d43[0], -d43[1], d24[0], d24[1], p4[0], p4[1]);
			// Calculate 1.05 pixel padding on vector basis.
			if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
			if (v4 != 1) pady = 1.05 / Math.sqrt(d24[0] * d24[0] + d24[1] * d24[1]);
			dx = -1;
			dy = -1;
			break;
		case a3:
			// Calculate 1.05 pixel padding on vector basis.
			ctx.transform(-d43[0], -d43[1], -d31[0], -d31[1], p3[0], p3[1]);
			if (u4 != 1) padx = 1.05 / Math.sqrt(d43[0] * d43[0] + d43[1] * d43[1]);
			if (v4 != 1) pady = 1.05 / Math.sqrt(d31[0] * d31[0] + d31[1] * d31[1]);
			dy = -1;
			break;
	}

	// Calculate image padding to match.
	var du = (u4 - u1);
	var dv = (v4 - v1);
	var padu = padx * du;
	var padv = pady * dv;


	var iw = this.image.width;
	var ih = this.image.height;

	ctx.drawImage(
		this.image,
		u1 * iw,
		v1 * ih,
		Math.min(u4 - u1 + padu, 1) * iw,
		Math.min(v4 - v1 + padv, 1) * ih,
		dx, dy,
		1 + padx, 1 + pady
	);
	ctx.restore();
}

/**
 * Generic matrix class. Built for readability, not for speed.
 *
 * (c) Steven Wittens 2008
 * http://www.acko.net/
 */
var Matrix = function (w, h, values) {
  this.w = w;
  this.h = h;
  this.values = values || allocate(h);
};

var allocate = function (w, h) {
  var values = [];
  for (var i = 0; i < h; ++i) {
    values[i] = [];
    for (var j = 0; j < w; ++j) {
      values[i][j] = 0;
    }
  }
  return values;
}

var cloneValues = function (values) {
	var clone = [];
	for (var i = 0; i < values.length; ++i) {
		clone[i] = [].concat(values[i]);
	}
	return clone;
}

function getProjectiveTransform(points) {
  var eqMatrix = new Matrix(9, 8, [
    [ 1, 1, 1,   0, 0, 0, -points[3][0],-points[3][0],-points[3][0] ],
    [ 0, 1, 1,   0, 0, 0,  0,-points[2][0],-points[2][0] ],
    [ 1, 0, 1,   0, 0, 0, -points[1][0], 0,-points[1][0] ],
    [ 0, 0, 1,   0, 0, 0,  0, 0,-points[0][0] ],

    [ 0, 0, 0,  -1,-1,-1,  points[3][1], points[3][1], points[3][1] ],
    [ 0, 0, 0,   0,-1,-1,  0, points[2][1], points[2][1] ],
    [ 0, 0, 0,  -1, 0,-1,  points[1][1], 0, points[1][1] ],
    [ 0, 0, 0,   0, 0,-1,  0, 0, points[0][1] ]

  ]);

  var kernel = eqMatrix.rowEchelon().values;
  var transform = new Matrix(3, 3, [
    [-kernel[0][8], -kernel[1][8], -kernel[2][8]],
    [-kernel[3][8], -kernel[4][8], -kernel[5][8]],
    [-kernel[6][8], -kernel[7][8],             1]
  ]);
  return transform;
}

Matrix.prototype = {
	add : function (operand) {
		if (operand.w != this.w || operand.h != this.h) {
			throw "Matrix add size mismatch";
		}

		var values = allocate(this.w, this.h);
		for (var y = 0; y < this.h; ++y) {
			for (var x = 0; x < this.w; ++x) {
			  values[y][x] = this.values[y][x] + operand.values[y][x];
			}
		}
		return new Matrix(this.w, this.h, values);
	},
	transformProjectiveVector : function (operand) {
		var out = [], x, y;
		for (y = 0; y < this.h; ++y) {
			out[y] = 0;
			for (x = 0; x < this.w; ++x) {
				out[y] += this.values[y][x] * operand[x];
			}
		}
		var iz = 1 / (out[out.length - 1]);
		for (y = 0; y < this.h; ++y) {
			out[y] *= iz;
		}
		return out;
	},
	multiply : function (operand) {
		var values, x, y;
		if (+operand !== operand) {
			// Matrix mult
			if (operand.h != this.w) {
				throw "Matrix mult size mismatch";
			}
			values = allocate(this.w, this.h);
			for (y = 0; y < this.h; ++y) {
				for (x = 0; x < operand.w; ++x) {
					var accum = 0;
					for (var s = 0; s < this.w; s++) {
						accum += this.values[y][s] * operand.values[s][x];
					}
					values[y][x] = accum;
				}
			}
			return new Matrix(operand.w, this.h, values);
		}
		else {
			// Scalar mult
			values = allocate(this.w, this.h);
			for (y = 0; y < this.h; ++y) {
				for (x = 0; x < this.w; ++x) {
					values[y][x] = this.values[y][x] * operand;
				}
			}
			return new Matrix(this.w, this.h, values);
		}
	},
	rowEchelon : function () {
		if (this.w <= this.h) {
			throw "Matrix rowEchelon size mismatch";
		}

		var temp = cloneValues(this.values);

		// Do Gauss-Jordan algorithm.
		for (var yp = 0; yp < this.h; ++yp) {
			// Look up pivot value.
			var pivot = temp[yp][yp];
			while (pivot == 0) {
				// If pivot is zero, find non-zero pivot below.
				for (var ys = yp + 1; ys < this.h; ++ys) {
					if (temp[ys][yp] != 0) {
						// Swap rows.
						var tmpRow = temp[ys];
						temp[ys] = temp[yp];
						temp[yp] = tmpRow;
						break;
					}
				}
				if (ys == this.h) {
					// No suitable pivot found. Abort.
					return new Matrix(this.w, this.h, temp);
				}
				else {
					pivot = temp[yp][yp];
				}
			}
			// Normalize this row.
			var scale = 1 / pivot;
			for (var x = yp; x < this.w; ++x) {
				temp[yp][x] *= scale;
			}
			// Subtract this row from all other rows (scaled).
			for (var y = 0; y < this.h; ++y) {
				if (y == yp) continue;
				var factor = temp[y][yp];
				temp[y][yp] = 0;
				for (x = yp + 1; x < this.w; ++x) {
					temp[y][x] -= factor * temp[yp][x];
				}
			}
		}

		return new Matrix(this.w, this.h, temp);
	},
	invert : function () {
		var x, y;

		if (this.w != this.h) {
			throw "Matrix invert size mismatch";
		}

		var temp = allocate(this.w * 2, this.h);

		// Initialize augmented matrix
		for (y = 0; y < this.h; ++y) {
			for (x = 0; x < this.w; ++x) {
				temp[y][x] = this.values[y][x];
				temp[y][x + this.w] = (x == y) ? 1 : 0;
			}
		}

		temp = new Matrix(this.w * 2, this.h, temp);
		temp = temp.rowEchelon();

		// Extract right block matrix.
		var values = allocate(this.w, this.h);
		for (y = 0; y < this.w; ++y) {
			// @todo check if "x < this.w;" is mistake
			for (x = 0; x < this.w; ++x) {
				values[y][x] = temp.values[y][x + this.w];
			}
		}
		return new Matrix(this.w, this.h, values);
	}
};

})();

/*
---
description: Provides basic animation for sprites

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Animation]

requires: 
  core/1.2.4: 'Class'
*/

LibCanvas.Animation = new Class({
	Implements : [LibCanvas.Behaviors.Bindable],

	sprites : {},
	addSprite : function (index, sprite) {
		this.sprites[index] = sprite;
		return this;
	},
	addSprites : function (sprites) {
		$extend(this.sprites, sprites);
		return this;
	},
	defaultSprite : null,
	setDefaultSprite : function (index) {
		this.defaultSprite = index;
		return this;
	},
	getSprite : function () {
		return this.getFrame() ? this.sprites[this.getFrame().sprite] : 
			$chk(this.defaultSprite) ? this.sprites[this.defaultSprite] : null;
	},

	animations : {},
	add : function (animation) {
		if (!animation.frames && animation.line) {
			animation.frames = [];
			animation.line.each(function (f) {
				animation.frames.push({sprite : f, delay : animation.delay});
			});
			delete animation.line;
			return this.add(animation);
		}
		this.animations[animation.name] = animation;
		return this;
	},

	current : null,
	queue : [],
	run : function (name, cfg) {
		if (!name in this.animations) {
			throw 'No animation "' + name + '"';
		}
		var args = {
			name : name,
			cfg  : cfg || {}
		};
		if (this.current) {
			this.queue.push(args);
		} else {
			this.init(args);
		}
		return this;
	},
	stop : function (force) {
		this.current = null;
		if (force) {
			this.queue = [];
		} else {
			this.stopped();
		}
		return this;
	},
	stopped : function () {
		var next = this.queue.shift();
		return $chk(next) && this.init(next);
	},
	init : function (args) {
		this.current = {
			animation : this.animations[args.name],
			index     : -1,
			cfg       : args.cfg
		};
		this.current.repeat = this.getCfg('repeat');
		return this.nextFrame();
	},
	nextFrame : function () {
		if (!this.current) {
			return this;
		}
		this.current.index++;
		var frame = this.getFrame();
		if (!frame && (this.getCfg('loop') || this.current.repeat)) {
			this.current.repeat && this.current.repeat--;
			this.current.index = 0;
			frame = this.getFrame();
		}
		var aniName = this.current.animation.name;
		if (frame) {
			var frameName = frame.name ? 'frame:' + frame.name : 'frame';
			this.bind('changed', [frameName, aniName]);
			this.bind(frameName, [frameName, aniName]);
			$chk(frame.delay) && this.nextFrame.bind(this).delay(frame.delay);
		} else {
			this.bind('changed', ['stop:' + aniName]);
			this.bind('stop:' + aniName, ['stop:' + aniName]);
			this.bind('stop', [aniName]);
			this.current = null;
			this.stopped();
		}
		return this;
	},
	getFrame : function () {
		return !this.current ? null :
			this.current.animation.frames[this.current.index];
	},
	getCfg : function (index) {
		if (index in this.current.cfg) {
			return this.current.cfg[index];
		} else {
			return this.current.animation[index]
		}
	}
});


/*
---
description: LibCanvas.Context2D provides a buffered canvas interface (e.g. for beforehand rendering).

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Buffer]
*/

LibCanvas.Buffer = function (width, height) {
	var a = arguments;
	if (a.length == 1) {
		width  = a[0].width;
		height = a[0].height;
	} else if (!a.length) {
		width  = 0;
		height = 0;
	}
	return new Element("canvas", {
		width  : width,
		height : height
	});
};

/*
---
description: LibCanvas.Canvas2D wraps around native <canvas>.

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Inner.Canvas2D.FrameRenderer
- LibCanvas.Inner.Canvas2D.FpsMeter
- LibCanvas.Inner.Canvas2D.DownloadingProgress
- LibCanvas.Behaviors.Bindable

provides: [LibCanvas.Canvas2D]
*/

LibCanvas.Canvas2D = new Class({
	Implements: [
		LibCanvas.Inner.Canvas2D.FrameRenderer,
		LibCanvas.Inner.Canvas2D.FpsMeter,
		LibCanvas.Inner.Canvas2D.DownloadingProgress,
		LibCanvas.Behaviors.Bindable
	],

	fps        : 20,
	autoUpdate : true,
	interval   : null,

	initialize : function (elem, cfg) {
		this.origElem = elem;
		this.origCtx  = elem.getContext('2d-libcanvas');

		if (cfg && cfg.backBuffer == 'off') {
			this.elem = this.origElem;
			this.ctx  = this.origCtx;
		} else {
			this.elem = this.createBuffer();
			this.ctx  = this.elem.getContext('2d-libcanvas');
		}
	},

	updateFrame : true,
	update : function () {
		if (this.autoUpdate == 'onRequest') {
			this.updateFrame = true;
		} else {
			this.frame();
		}
		return this;
	},

	mouse : null,
	listenMouse : function () {
		this.mouse = new LibCanvas.Mouse(this);
		return this;
	},
	keyboard: null,
	getKey : function (key) {
		return this.keyboard.keyboard(key);
	},
	listenKeyboard : function (preventDefault) {
		this.keyboard = new LibCanvas.Keyboard(this, preventDefault);
		return this;
	},
	createBuffer : function (width, height) {
		return LibCanvas.Buffer.apply(
			LibCanvas.Buffer, arguments.length ?
				arguments : [this.origElem.width, this.origElem.height]
		);
	},
	createGrip : function (config) {
		var grip = new LibCanvas.Ui.Grip(this, config);
		this.addElement(grip);
		return grip;
	},

	// post-/pre- procesing
	processors : { pre: [], post: [] },
	addProcessor : function (type, processor) {
		this.processors[type].push(processor);
		return this;
	},
	rmProcessor : function (type, processor) {
		this.processors[type].erase(processor);
		return this;
	},

	// Element : add, rm
	elems : [],
	addElement : function (elem) {
		this.elems.include(
			elem.setLibcanvas(this)
		);
		return this;
	},
	rmElement : function (elem) {
		this.elems.erase(elem);
		return this;
	},

	// Start, pause, stop
	start : function (fn) {
		this.stop();
		this.fn = fn || this.pauseFn || null;
		delete this.pauseFn;
		this.interval = this.frame.periodical(1000/this.fps, this)
		return this;
	},
	pause : function () {
		this.pauseFn = this.fn;
		return this.stop();
	},
	stop : function () {
		this.fn = undefined;
		this.interval = $clear(this.interval);
		return this;
	}
});

/*
---
description: LibCanvas.Context2D adds new canvas' context '2d-libcanvas'.

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Context2D]
*/

(function () {

var office = {
	all : function (type, style) {
		this.save();
		if (style) {
			this.set(type + 'Style', style);
		}
		this[type + 'Rect'](this.getFullRectangle());
		this.restore();
		return this;
	},
	rect : function (func, args) {
		var rect;
		if (args.length == 0) {
			rect = office.getFullRect.call(this);
		} else if (args[0] instanceof LibCanvas.Shapes.Rectangle) {
			rect = args[0];
		} else {
			rect = new LibCanvas.Shapes.Rectangle()
			rect.set.apply(rect, args);
		}
		return this.original(func,
			[rect.from.x, rect.from.y, rect.getWidth(), rect.getHeight()]);
	},
	getFullRect : function () {
		return new LibCanvas.Shapes.Rectangle(0, 0, this.width, this.height);
	},
	fillStroke : function (type, args) {
		if (args.length >= 1 && args[0] instanceof LibCanvas.Shape) {
			if (args[1]) {
				this.save().set(type + 'Style', args[1]);
			}
			args[0].draw(this, type);
			if (args[1]) {
				this.restore();
			}
		} else {
			if (args.length && args[0]) {
				this.save().set(type + 'Style', args[0]);
			}
			this.original(type);
			if (args.length && args[0]) {
				this.restore();
			}
		}
		
		return this;
	},
	originalPoint : function (func, args) {
		var point = args[0];
		if (!(args[0] instanceof LibCanvas.Point)) {
			point = (args.length == 2) ?
				new LibCanvas.Point(args) :
				new LibCanvas.Point(args[0]);
		}
		return this.original(func, [point.x, point.y]);
	},
	makeRect : function (obj) {
		return obj instanceof LibCanvas.Shapes.Rectangle ?
			obj : new LibCanvas.Shapes.Rectangle(obj);
	},
	createImageCacheData : function (a) {
		var draw = office.makeRect(a.draw);
		var crop = a.crop ? office.makeRect(a.crop) : null;
		return {
			src : a.image.getAttribute('src') || '',
			image : a.image,
			crop : crop ? {
				x : crop.from.x,
				y : crop.from.y,
				w : crop.getWidth(),
				h : crop.getHeight()
			} : null,
			draw : {
				x : 0,
				y : 0,
				w : draw.getWidth(),
				h : draw.getHeight()
			}
		};
	},
	getImageCache : function (data) {
		var src = imageCache[data.src];
		if (src) {
			for (var i = src.length; i--;) {
				if ($equals(src[i].data, data)) {
					return src[i].cache;
				}
			}
		}
		return false;
	},
	putImageCache : function (data, cache) {
		data = office.createImageCacheData(data);
		var src = imageCache[data.src];
		if (!src) {
			src = imageCache[data.src] = [];
		}
		src.push({
			data  : data,
			cache : cache
		});
	},
	getRotatedImageCache : function (data, length) {
		var index = data.angle
			.normalizeAngle()
			.getDegree()
			.toFixed(length);
		var cache = rotatedImageCache[index];
		if (cache) {
			for (var i = cache.length; i--;) {
				if (cache[i].image == data.image) {
					return cache[i].cache;
				}
			}
		}
		return null;
	},
	putRotatedImageCache : function (data, cache, length) {
		var index = data.angle
			.normalizeAngle()
			.getDegree()
			.toFixed(length);
		if (!rotatedImageCache[index]) {
			rotatedImageCache[index] = [];
		}
		rotatedImageCache[index].push({
			image : data.image,
			cache : cache
		});
	}
};

var rotatedImageCache = {};
var imageCache = {};

LibCanvas.Context2D = new Class({
	initialize : function (canvas) {
		if (canvas instanceof CanvasRenderingContext2D) {
			this.ctx2d  = canvas;
			this.canvas = this.ctx2d.canvas;
		} else {
			this.canvas = canvas;
			this.ctx2d  = canvas.getOriginalContext('2d');
		}
		// todo : remove
		this.width  = this.canvas.width;
		this.height = this.canvas.height;
	},
	getFullRectangle : function () {
		return new LibCanvas.Shapes.Rectangle(0, 0, this.width, this.height);
	},
	original : function (method, args) {
		try {
			this.ctx2d[method].apply(this.ctx2d, args || []);
		} catch (e) {
			$log('context2d.error(method, args)', method, args)
			throw e;
		}
		return this;
	},
	getClone : function (width, height) {
		var canvas = this.canvas;
		var clone  = LibCanvas.Buffer(
			width  || canvas.width,
			height || canvas.height
		);
		var ctx = clone.getContext('2d');
		!arguments.length ? ctx.drawImage(canvas, 0, 0) :
			ctx.drawImage(canvas, 0, 0, width, height);
		return clone;
	},

	// All
	fillAll : function (style) {
		office.all.call(this, 'fill', style);
		return this;
	},
	strokeAll : function (style) {
		office.all.call(this, 'stroke', style);
		return this;
	},
	clearAll : function (style) {
		office.all.call(this, 'clear', style);
		return this;
	},

	// Save/Restore
	save : function () {
		return this.original('save');
	},
	restore : function () {
		return this.original('restore');
	},

	// Values
	set : function (name, value) {
		try {
			this.ctx2d[name] = value;
		} catch (e) {
			throw 'Exception while setting аЂа�' + name + 'аЂа� to аЂа�' + value + 'аЂа�: ' + e.message;
		}
		return this;
	},
	get : function (name) {
		return this.ctx2d[name];
	},

	// Fill/Stroke
	fill : function (shape) {
		return office.fillStroke.call(this, 'fill', arguments);
		return this;
	},
	stroke : function (shape) {
		return office.fillStroke.call(this, 'stroke', arguments);
	},

	// Path
	beginPath : function (moveTo) {
		var ret = this.original('beginPath');
		arguments.length && this.moveTo.apply(this, arguments);
		return ret;
	},
	closePath : function () {
		return this.original('closePath');
	},
	clip : function (shape) {
		if (shape && $type(shape.processPath) == 'function') {
			shape.processPath(this);
		}
		return this.original('clip');
	},
	moveTo : function (point) {
		return office.originalPoint.call(this, 'moveTo', arguments);
	},
	lineTo : function (point) {
		return office.originalPoint.call(this, 'lineTo', arguments);
	},

	arc : function (x, y, r, startAngle, endAngle, anticlockwise) {
		var a = arguments;
		var circle, angle, acw;
		if (a.length == 6) {
			return this.original('arc', a);
			// Optimization ?
			circle = new LibCanvas.Shapes.Circle(x, y, r);
			angle  = {
				start : startAngle,
				end   :   endAngle
			};
			acw = !!anticlockwise;
		} else if (a[0].circle) {
			circle = a[0].circle instanceof LibCanvas.Shapes.Circle ? a[0].circle :
				new LibCanvas.Shapes.Circle(a[0].circle);
			var ang = a[0].angle;
			if ($type(ang) == 'array') {
				angle = {
					start : ang[0],
					end   : ang[1]
				}
			} else {
				angle = {
					start : [ ang.start, ang.s ].firstReal(),
					end   : [ ang.end  , ang.e ].firstReal()
				}
				if ($chk(ang.size) && !$chk(angle.end)) {
					angle.end = ang.size + angle.start;
				}
				if ($chk(ang.size) && !$chk(angle.start)) {
					angle.start = angle.end - ang.size;
				}
			}
			acw = !!a[0].anticlockwise || !!a[0].acw;
		} else {
			throw 'Wrong Argumentss In CanvasContext.Arc';
		}
		return this.original('arc', [
			circle.center.x, circle.center.y, circle.radius, angle.start, angle.end, acw
		]);
	},

	arcTo : function () {
		// @todo Beauty arguments
		return this.original('arcTo', arguments);
	},
	quadraticCurveTo : function () {
		// @todo Beauty arguments
		return this.original('quadraticCurveTo', arguments);
	},
	bezierCurveTo : function () {
		// @todo Beauty arguments
		if (arguments.length == 6) {
			return this.original('bezierCurveTo', arguments);
		} else {
			var a = arguments[0];
			return this.original('bezierCurveTo', [
				a.p1.x, a.p1.y, a.p2.x, a.p2.y, a.to.x, a.to.y
			]);
		}
	},
	isPointInPath : function (x, y) {
		var args = arguments;
		if (args.length == 2) {
			return this.ctx2d.isPointInPath(x, y);
		} else {
			var point = args[0];
			if (!(args[0] instanceof LibCanvas.Point)) {
				point = LibCanvas.Point(args[0]);
			}
			return this.ctx2d.isPointInPath(point.x, point.y);
		}		
	},

	// transformation
	rotate : function () {
		return this.original('rotate', arguments);
	},
	translate : function () {
		return office.originalPoint.call(this, 'translate', arguments);
	},
	scale : function () {
		return office.originalPoint.call(this, 'scale', arguments);
	},
	transform : function () {
		// @todo Beauty arguments
		return this.original('transform', arguments);
	},
	setTransform : function () {
		// @todo Beauty arguments
		return this.original('setTransform', arguments);
	},

	// Rectangle
	fillRect : function (rectangle) {
		return office.rect.call(this, 'fillRect', arguments);
	},
	strokeRect : function (rectangle) {
		return office.rect.call(this, 'strokeRect', arguments);
	},
	clearRect : function (rectangle) {
		return office.rect.call(this, 'clearRect', arguments);
	},

	// text
	fillText : function (text, x, y, maxWidth) {
		// @todo Beauty arguments
		return this.original('fillText', arguments);
	},
	strokeText : function (text, x, y, maxWidth) {
		// @todo Beauty arguments
		return this.original('strokeText', arguments);
	},
	measureText : function (textToMeasure) {
		return this.ctx2d.measureText.apply(this.ctx2d, arguments);
	},
	text : function (cfg) {
		if (!this.ctx2d.fillText) {
			return this;
		}
		cfg = $merge({
			text   : '',
			color  : null, /* @color */
			wrap   : 'normal', /* no|normal */
			to     : null,
			align  : 'left', /* center|left|right */
			size   : 16,
			weigth : 'normal', /* bold|normal */
			style  : 'normal', /* italic|normal */
			family : 'sans-serif', /* @fontFamily */
			lineHeight : null,
			overflow   : 'visible', /* hidden|visible */
			padding : [0,0]
		}, cfg);
		this.save();
		var to = cfg.to ?
			office.makeRect(cfg.to) :
			office.getFullRect.call(this);
		var lh = (cfg.lineHeight || (cfg.size * 1.15)).round();
		this.set('font', '{style}{weight}{size}px {family}'
			.substitute({
				style  : cfg.style == 'italic' ? 'italic ' : '',
				weight : cfg.weight == 'bold'  ? 'bold '   : '',
				size   : cfg.size,
				family : cfg.family
			})
		);
		var clip = function () {
			// @todo refatoring
			this.beginPath()
				.moveTo(to.from.x, to.from.y)
				.lineTo(to.from.x, to.to.y)
				.lineTo(to.to.x, to.to.y)
				.lineTo(to.to.x, to.from.y)
				.lineTo(to.from.x, to.from.y)
				.closePath()
				.clip();
		}.bind(this);
		if (cfg.color) {
			this.set('fillStyle', cfg.color);
		}
		if (cfg.overflow == 'hidden') {
			clip();
		}
		var xGet = function (lineWidth) {
			var x;
			if (cfg.align == 'left') {
				x = to.from.x + cfg.padding[1];
			} else {
				if (cfg.align == 'right') {
					x = to.to.x - lineWidth - cfg.padding[1];
				} else /* cfg.align == 'center' */ {
					x = to.from.x + (to.getWidth() - lineWidth)/2;
				}
			}
			return x;
		};
		var x, lines = cfg.text.split('\n');
		if (cfg.wrap == 'no') {
			lines.each(function (line, i) {
				if (cfg.align == 'left') {
					x = to.from.x;
				} else {
					var lineWidth = this.measureText(line).width;
					if (cfg.align == 'right') {
						x = to.to.x - lineWidth;
					} else /* cfg.align == 'center' */ {
						x = to.from.x + (to.getWidth() - lineWidth)/2;
					}
				}
				this.fillText(line, xGet(cfg.align == 'left' ? 0 : this.measureT2ext(line).width), to.from.y + (i+1)*lh);
			}.bind(this));
		} else {
			var lNum = 0;
			lines.each(function (line) {
				var words = line.match(/.+?(\s|$)/g);
				var L  = '';
				var Lw = 0;
				for (var i = 0; i <= words.length; i++) {
					var last = i == words.length;
					if (!last) {
						var text = words[i];
						// @todo too slow. 2-4ms for 50words
						var wordWidth = this.measureText(text).width;
					}
					if (!last && (!Lw || Lw + wordWidth < to.getWidth())) {
						Lw += wordWidth;
						L  += text;
					} else if (Lw) {
						this.fillText(L, xGet(Lw), to.from.y + (++lNum)*lh + cfg.padding[0]);
						L  = '';
						Lw = 0;
					}
				}
				if (Lw) {
					this.fillText(L, xGet(Lw), to.from.y + (++lNum)*lh + cfg.padding[0]);
					L  = '';
					Lw = 0;
				}
			}.bind(this));
			
		}
		return this.restore();
	},

	// image
	createImageData : function () {
		return this.original('createImageData', arguments);
	},
	cachedDrawImage : function (a) {
		if (!a.image || !a.draw) {
			return this.drawImage.apply(this, arguments);
		}
		var data = office.createImageCacheData(a);
		var cache = office.getImageCache(data);
		if (!cache) {
			// cache object
			cache = LibCanvas.Buffer(data.draw.w, data.draw.h);
			cache.getContext('2d-libcanvas')
				.drawImage(data);
			office.putImageCache(data, cache);
		}
		var draw = office.makeRect(a.draw);
		var result = {
			image : cache,
			from  : draw.from
		}
		return this.drawImage(result);
	},
	rotatedImage : function (data, cacheLength) {
		var cacheEnabled = cacheLength !== false;
		cacheLength = (cacheLength || 0) * 1;
		if (!(data.angle.normalizeAngle().getDegree(3) % 360)) {
			return this.drawImage(data);
		}
		var cache = cacheEnabled && office.getRotatedImageCache(data, cacheLength);
		if (!cache) {
			var diagonal = Math.hypotenuse(data.image.width, data.image.height);
			cache = LibCanvas.Buffer(diagonal, diagonal);
			cache.getContext('2d-libcanvas')
				.translate(diagonal/2, diagonal/2)
				.rotate(data.angle)
				.drawImage(data.image, -data.image.width/2, -data.image.height/2);
			cacheEnabled && office.putRotatedImageCache(data, cache, cacheLength);
		}
		var from;
		if (data.center) {
			from = new LibCanvas.Point(data.center);
			from.x -= cache.width/2;
			from.y -= cache.height/2;
		} else {
			from = {
				x : (data.from.x || data.from[0] || 0) - (cache.width  - data.image.width )/2,
				y : (data.from.y || data.from[1] || 0) - (cache.height - data.image.height)/2,
			};
		}
		return this.drawImage({
			image : cache,
			from  : from
		});

	},
	drawImage : function () {
		var a = arguments;
		if ([3, 5, 9].contains(a.length)) {
			return this.original('drawImage', a);
		}
		a = a[0];
		if (!a.image) {
			throw 'No image';
		}
		var from = a.from || a.center;

		if (from) {
			from = $chk(from.x) && $chk(from.y) ? from :
				from instanceof LibCanvas.Point ?
					from : new LibCanvas.Point(from);
			if (a.center) {
				from = {
					x : from.x - a.image.width/2,
					y : from.y - a.image.height/2,
				};
			}
			return this.original('drawImage', [
				a.image, from.x, from.y
			])
		} else if (a.draw) {
			var draw = office.makeRect(a.draw);
			if (a.crop) {
				var crop = office.makeRect(a.crop);
				return this.original('drawImage', [
					a.image,
					crop.from.x, crop.from.y, crop.getWidth(), crop.getHeight(),
					draw.from.x, draw.from.y, draw.getWidth(), draw.getHeight()
				])
			} else {
				return this.original('drawImage', [
					a.image, draw.from.x, draw.from.y, draw.getWidth(), draw.getHeight()
				]);
			}
		} else {
			throw 'Wrong Args in Context.drawImage';
		}
	},
	projectiveImage : function (arg) {
		var drawTo = new LibCanvas.Shapes.Polygon([
			arg.draw[0], arg.draw[1], arg.draw[3], arg.draw[2]
		]);
		new LibCanvas.Inner.ProjectiveTexture(arg.image)
			.setContext(this.ctx2d)
			.setQuality(arg.patchSize, arg.limit)
			.render(drawTo);
		return this;
	},
	putImageData : function () {
		var a = arguments;
		var put = {};
		if (a.length == 1 && typeof a == 'object') {
			a = a[0];
			put.image = a.image;
			put.from  = a.from instanceof LibCanvas.Point ? a.from :
				new LibCanvas.Point(a.from);
		} else if (a.length >= 2) {
			put.image = a[0];
			if (a.length == 2) {
				put.from = a[1] instanceof LibCanvas.Point ? a[1] :
					new LibCanvas.Point(a[1]);
			} else {
				put.from = new LibCanvas.Point(a[1], a[2]);
			}
		}
		return this.original('putImageData', [
			put.image, put.from.x, put.from.y
		]);
	},
	getImageData : function (rectangle) {
		var args = arguments;
		var rect;
		if (args.length == 0) {
			rect = this.getFullRectangle();
		} else if (args[0] instanceof LibCanvas.Shapes.Rectangle) {
			rect = args[0];
		} else {
			rect = new LibCanvas.Shapes.Rectangle()
			rect.set.apply(rect, args);
		}
		return this.ctx2d.getImageData(rect.from.x, rect.from.y, rect.getWidth(), rect.getHeight());
	},
	getPixels : function (rectangle) {
		var args = arguments;
		var rect;
		if (args.length == 0) {
			rect = office.getFullRect.call(this);
		} else if (args[0] instanceof LibCanvas.Shapes.Rectangle) {
			rect = args[0];
		} else {
			rect = new LibCanvas.Shapes.Rectangle()
			rect.set.apply(rect, args);
		}
		var data = this.getImageData(rect).data;

		var dump = [];

		var pixels = [];
		for (var i = 0, L = data.length; i < L; i+=4)  {
			pixels.push({
				r : data[i],
				g : data[i+1],
				b : data[i+2],
				a : data[i+3] / 255
			});
			if (pixels.length == rect.width) {
				dump.push(pixels);
				pixels = [];
			}
		}
		return dump;
	},
	getPixel : function (arg/* {rectangle, point} */) {
		var rect = !arg.rectangle ? office.getFullRect.call(this) :
			arg.rectangle instanceof LibCanvas.Shapes.Rectangle ?
			arg.rectangle : new LibCanvas.Shapes.Rectangle
		var point = arg.point ?
			(arg.point instanceof LibCanvas.Point ? arg.point : new LibCanvas.Point(arg.point)) :
			(arg instanceof LibCanvas.Point ? arg : new LibCanvas.Point(
				$type(arg) == 'array' ? arg : arguments
			))

		var data = this.getImageData.call(this, rect).data;
		var i = (point.y * rect.getWidth() + point.x) * 4;
		return {
			r : data[i],
			g : data[i+1],
			b : data[i+2],
			a : data[i+3] / 255
		};
	},
	// this function is only dublicated as original. maybe, i will change them,
	createLinearGradient : function () {
		return this.ctx2d.createLinearGradient.apply(this.ctx2d, arguments);
	},
	createRadialGradient : function () {
		return this.ctx2d.createRadialGradient.apply(this.ctx2d, arguments);
	},
	createPattern : function () {
		return this.ctx2d.createPattern.apply(this.ctx2d, arguments);
	},
	drawWindow : function () {
		return this.original('drawWindow', arguments);
	}
	// Such moz* methods wasn't duplicated:
	// mozTextStyle, mozDrawText, mozMeasureText, mozPathText, mozTextAlongPath

	// is this just properties , that can be used by set ?
	// shadowOffsetX shadowOffsetY shadowBlur shadowColor
});

LibCanvas.addCanvasContext('2d-libcanvas', LibCanvas.Context2D);

})();

/*
---
description: A keyboard control abstraction class

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Mouse]
*/

(function () {

var keyStates = {};
var bindings  = {};

LibCanvas.Keyboard = new Class({
	initialize : function (canvas, preventDefault) {
		var prevent = function (key) {
			return preventDefault && (
				 $type(preventDefault) != 'array' ||
				($type(preventDefault) == 'array' && preventDefault.contains(key))
			);
		};

		var keyEvent = (function (setTo) {
			return function (evt, ctx) {
				keyStates[evt.key] = setTo;
				if (setTo == true && bindings) {
					if (!bindings[evt.key]) {
						return !prevent(evt.key);
					}
					bindings[evt.key].each(function (keyBind, i) {
						if (keyBind[0] == evt.key) {
							keyBind[1]();
						}
					});
				}
				return !prevent(evt.key);
			}.bind(this);
		}.bind(this));

		// Input
		window.addEvent('keydown', keyEvent(true));
		window.addEvent('keyup',   keyEvent(false));

		preventDefault && window.addEvent('keypress', function (evt) {
			return !prevent(evt.key);
		});
	},
	keyboard : function (keyName) {
		if (keyStates[keyName]) {
			return true;
		}
		return false;
	},
	bind : function (keyName, fn) {
		bindings[keyName] = bindings[keyName] || [];
		return bindings[keyName].push([keyName, fn]);
	},
	unbind : function (key, fn) {
		bindings[key].erase([key, fn]);
	}
});

})();


/*
---
description: A mouse control abstraction class

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Mouse]
*/

LibCanvas.Mouse = new Class({
	initialize : function (libcanvas, noTouch) {
		this.inCanvas = false;
		this.point = new LibCanvas.Point();
		this.x = null;
		this.y = null;

		//noTouch || this.initTouch();

		this.libcanvas = libcanvas;
		this.elem      = libcanvas.origElem;

		this.events = new LibCanvas.Inner.MouseEvents(this);

		this.setEvents();
	},
	setCoords : function (x, y) {
		if (arguments.length == 2) {
			this.x = x;
			this.y = y;
			this.inCanvas = true;
		} else {
			this.x = null;
			this.y = null;
			this.inCanvas = false;
		}
		this.point.set(this.x, this.y);
		return this;
	},
	getOffset : function (e) {
		if (e.event) e = e.event;
		if (!e.offset) {
			this.expandEvent(e);
		}
		return e.offset;
	},
	createOffset : function(elem) {
		var top = 0, left = 0;
		if (elem.getBoundingClientRect) {
			var box = elem.getBoundingClientRect();

			// (2)
			var body = document.body;
			var docElem = document.documentElement;

			// (3)
			var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
			var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;

			// (4)
			var clientTop = docElem.clientTop || body.clientTop || 0;
			var clientLeft = docElem.clientLeft || body.clientLeft || 0;

			// (5)
			top  = box.top  + scrollTop  - clientTop;
			left = box.left + scrollLeft - clientLeft;

			return { top: Math.round(top), left: Math.round(left) };
		} else {
			while(elem) {
				top  = top  + parseInt(elem.offsetTop);
				left = left + parseInt(elem.offsetLeft);
				elem = elem.offsetParent;
			}
			return {top: top, left: left};
		}
	},
	expandEvent : function (e) {
		var event = new Event(e);
		if (!$chk(e.offsetX)) {
			var offset = this.createOffset(e.target);
			e.offsetX = event.page.x - offset.left;
			e.offsetY = event.page.y - offset.top;
		}
		e.offset = new LibCanvas.Point(e.offsetX, e.offsetY);
		return e;
	},
	setEvents : function () {
		var mouse = this;
		$(this.elem).addEvents({
			/* bug in Linux Google Chrome 5.0.356.0 dev
			 * if moving mouse while some text is selected
			 * mouse becomes disable.
			 */
			mousemove : function (e) {
				var offset = mouse.getOffset(e);
				mouse.setCoords(offset.x, offset.y);
				mouse.events.event('mousemove', e.event);
				mouse.isOut = false;
				return false;
			},
			mouseout : function (e) {
				mouse.getOffset(e);
				mouse.setCoords(/* null */);
				mouse.events.event('mouseout', e.event);
				mouse.isOut = true;
				return false;
			},
			mousedown : function (e) {
				mouse.getOffset(e);
				mouse.events.event('mousedown', e.event);
				return false;
			},
			mouseup : function (e) {
				mouse.getOffset(e);
				mouse.events.event('mouseup'  , e.event);
				return false;
			}
		});
		return this;
	},
	subscribe : function (elem) {
		this.events.subscribe(elem);
		return this;
	},
	unsubscribe : function (elem) {
		this.events.unsubscribe(elem);
		return this;
	},
	debug : function () {
		return !this.inCanvas ? 'NotInCanvas' :
			this.x.round(3) + ':' + this.y.round(3);
	}
});

/*
---
description: A X/Y point coordinates encapsulating class

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Behaviors.Bindable

provides: [LibCanvas.Point]
*/

(function () {

var shifts = {
	top    : {x: 0, y:-1},
	right  : {x: 1, y: 0},
	bottom : {x: 0, y: 1},
	left   : {x:-1, y: 0},
	t      : {x: 0, y:-1},
	r      : {x: 1, y: 0},
	b      : {x: 0, y: 1},
	l      : {x:-1, y: 0},
	tl     : {x:-1, y:-1},
	tr     : {x: 1, y:-1},
	bl     : {x:-1, y: 1},
	br     : {x: 1, y: 1}
};

LibCanvas.Point = new Class({
	Implements: [LibCanvas.Behaviors.Bindable],
	initialize : function () {
		this.isNull = true;
		this.set.apply(this, arguments);
	},
	set : function (x, y) {
		if (!$chk(x)) {
			this.x = null;
			this.y = null;
			this.isNull = true;
		} else {
			if (arguments.length != 2) {
				if ($chk(x[0]) && $chk(x[1])) {
					y = x[1];
					x = x[0];
				} else if ($chk(x.x) && $chk(x.y)) {
					y = x.y;
					x = x.x;
				} else {
					$log('Wrong Arguments In Point.Set:', arguments);
					throw 'Wrong Arguments In Point.Set';
				}
			}
			this.isNull = false;
			this.x = x * 1;
			this.y = y * 1;
		}
		return this;
	},
	move : function (distance, reverse) {
		var sign = function (num) {
			return num * (reverse ? -1 : 1);
		};
		var moved = {
			x : sign(distance.x),
			y : sign(distance.y)
		};
		this.set(
			this.x + moved.x,
			this.y + moved.y
		);
		this.bind('move', [moved]);
		// @deprecated
		this.bind('moved', [moved]);
		return this;
	},
	moveTo : function (newCoord, speed) {
		if (speed) {
			return this.animateMoveTo(newCoord, speed);
		} else {
			return this.move(this.diff(newCoord));
		}
	},
	angleTo : function (point) {
		var angle, diff = point.diff(this);

		// @todo just Math.atan2 ?
		if (diff.y == 0) {
			angle = diff.x < 0 ? (180).degree() : 0;
		} else if (diff.x == 0) {
			angle = diff.y < 0 ? (270).degree() : (90).degree();
		} else {
			angle = Math.atan2(diff.y, diff.x);
		}

		return angle.normalizeAngle();
	},
	distanceTo : function (point) {
		var diff = this.diff(point);
		return Math.hypotenuse(diff.x, diff.y);
	},
	diff : function (point) {
		if (arguments.length > 1) {
			point = new LibCanvas.Point(arguments);
		}
		return !point ? {x:0,y:0} : {
			x : point.x - this.x,
			y : point.y - this.y
		};
	},
	rotate : function (angle, pivot, withCache) {
		pivot = pivot || {x : 0, y : 0};
		if (pivot.x == this.x && pivot.y == this.y) {
			return this;
		}
		var useCache = withCache && this.lastAngleCache;
		var radius   = pivot.distanceTo(this);

		var newAngle;
		if (useCache) {
			newAngle = this.lastAngleCache - angle;
		} else {
			var sides = pivot.diff(this);
			newAngle = Math.atan2(sides.x, sides.y) - angle;
		}
		if (withCache) {
			this.lastAngleCache = newAngle;
		}

		return this.moveTo({
			x : newAngle.sin() * radius + pivot.x,
			y : newAngle.cos() * radius + pivot.y
		});
	},
	scale : function (power, pivot) {
		pivot = pivot || {x : 0, y : 0};
		var diff = this.diff(pivot);
		return this.moveTo({
			x : pivot.x - diff.x  * (typeof power == 'object' ? power.x : power),
			y : pivot.y - diff.y  * (typeof power == 'object' ? power.y : power)
		});
	},
	alterPos : function (arg, fn) {
		return this.moveTo({
			x: fn(this.x, typeof arg == 'object' ? arg.x : arg),
			y: fn(this.y, typeof arg == 'object' ? arg.y : arg)
		});
	},
	mul : function (arg) {
		return this.alterPos(arg, function(a, b) {
			return a * b;
		});
	},
	getNeighbour : function (dir) {
		var to = this.clone();
		var s  = shifts[dir];
		to.x += s.x;
		to.y += s.y;
		return to;
	},
	animateMoveTo : function (to, speed) {
		$clear(this.movingInterval);
		this.movingInterval = function () {
			var move = {}, pixelsPerFn = speed / 20;
			var diff = this.diff(to);
			var dist = this.distanceTo(to);
			if (dist > pixelsPerFn) {
				move.x = diff.x * (pixelsPerFn / dist);
				move.y = diff.y * (pixelsPerFn / dist);
			} else {
				move.x = diff.x;
				move.y = diff.y;
				$clear(this.movingInterval);
				this.bind('stopMove');
			}
			this.move(move);
		}.bind(this).periodical(20);
		return this;
	},
	equals : function (to, accuracy) {
		return (arguments.length < 2) ? (to.x == this.x && to.y == this.y) :
			(this.x.equals(to.x, accuracy) && this.y.equals(to.y, accuracy));
	},
	clone : function () {
		return new LibCanvas.Point(this);
	}
});

})();

/*
---
description: Abstract class LibCanvas.Shape defines interface for drawable canvas objects.

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Behaviors.Bindable

provides: [LibCanvas.Shape]
*/

LibCanvas.Shape = new Class({
	Implements: [LibCanvas.Behaviors.Bindable],
	initialize : function () {
		if (arguments.length > 0) {
			this.set.apply(this, arguments);
		}
	},
	checkPoint : function (args) {
		if (args instanceof LibCanvas.Point) {
			return args;
		} else if (args[0] instanceof LibCanvas.Point) {
			return args[0];
		} else {
			return new LibCanvas.Point(args);
		}
	},
	move : function (distance, reverse) {
		var sign = function (num) {
			return num * (reverse ? -1 : 1);
		};
		var moved = {
			x : sign(distance.x),
			y : sign(distance.y)
		};

		this.bind('move', [moved]);
		// @depracated
		this.bind('moved', [moved]);
		return this;
	},
	set : function (a) {
		throw 'Abstract Method Shape.set called';
	},
	hasPoint : function (a) {
		throw 'Abstract Method Shape.hasPoint called';
	},
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	}
});

/*
---
description:

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Ui.Grio]
*/
(function () {

var Beh = LibCanvas.Behaviors;

LibCanvas.Ui.Grip = new Class({
	Extends : Beh.Drawable,
	Implements : [
		Beh.Clickable,
		Beh.Draggable,
		Beh.Droppable,
		Beh.Linkable,
		Beh.MouseListener,
		Beh.Moveable
	],

	config : {},
	initialize : function (libcanvas, config) {
		this.libcanvas = libcanvas;
		this.setConfig(config);
		this.setShape(config.shape);
		
		var update = libcanvas.update.bind(libcanvas);
		this.getShape().bind('move', update);
		this.bind(['moveDrag', 'statusChanged'], update);
	},
	setConfig : function (config) {
		this.config = $merge(this.config, config);
		this.libcanvas.update();
		return this;
	},
	getStyle : function (type) {
		return (this.active && this.config.active && this.config.active[type]) ||
		       (this.hover  && this.config.hover  && this.config.hover [type]) ||
		        this.config[type] || null;
		                  
	},
	drawTo : function (ctx) {
		var fill   = this.getStyle('fill');
		var	stroke = this.getStyle('stroke');
		fill   && ctx.fill  (this.getShape(), fill  );
		stroke && ctx.stroke(this.getShape(), stroke);
		return this;
	},
	draw : function () {
		this.drawTo(this.libcanvas.ctx);
		return this;
	}
});

})();

/*
---
description: Provides audio preloader

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.AudioContainer]
*/

LibCanvas.Utils.AudioContainer = new Class({
	support : false,
	initialize: function (files) {
		this.checkSupport();
		var audio = {};
		for (var i in files) {
			audio[i] = new LibCanvas.Utils.AudioElement(this, files[i]);
		}
		this.audio = audio;
	},
	checkSupport : function () {
		var elem = document.createElement('audio');
		if (elem.canPlayType) {
			var cpt  = elem.canPlayType.bind(elem);
			this.support = new Boolean(!!cpt);
			this.support && $extend(this.support, {
				// codecs
				ogg : cpt('audio/ogg; codecs="vorbis"'),
				mp3 : cpt('audio/mpeg;'),
				wav : cpt('audio/wav; codecs="1"'),
				m4a : cpt('audio/x-m4a;') || cpt('audio/aac;'),
				// diff
				loop : 'loop' in elem
			});
		}
		return this;
	},
	get : function (index) {
		return this.audio[index];
	},
	allAudios : [],
	mute : function (muted) {
		this.allAudios.each(function (audio) {
			audio.muted = muted;
		})
	}
});

/*
---
description: Provides audio container

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.AudioElement]
*/

LibCanvas.Utils.AudioElement = new Class({
	Implements : [LibCanvas.Behaviors.Animatable],
	stub   : true,
	initialize : function (container, file) {
		if (container.support) {
			this.stub = false;
			this.container = container;
			this.support = container.support;
			this.audio = document.createElement("audio");
			this.src(file);
			container.allAudios.push(this.audio);
		}
	},
	src : function (file) {
		if (this.stub) return this;
		this.audio.src = file.replace(/\*/g, this.getExtension());
		this.audio.load();
		return this;
	},
	getExtension : function () {
		if (this.stub) return null;
		return this.support.ogg ? 'ogg' :
		       this.support.mp3 ? 'mp3' : 'wav';
	},
	cloneAudio : function () {
		if (this.stub) return null;
		if (window.opera) { // opera 10.60 bug. Fixed in 10.61
			var audioClone = document.createElement('audio');
			audioClone.src = this.audio.src;
		} else {
			audioClone = this.audio.cloneNode(true);
		}
		this.events.each(function (e) {
			audioClone.addEventListener(e[0], e[1].bind(this), false);
		}.bind(this));
		this.container.allAudios.push(audioClone);
		audioClone.load();
		return audioClone;
	},
	play : function () {
		if (this.stub) return this;
		this.getCurrent().play();
		return this;
	},
	pause : function () {
		if (this.stub) return this;
		this.getCurrent().pause();
		return this;
	},
	stop : function (elem) {
		if (this.stub) return this;
		elem = elem || this.getCurrent();
		if (elem.networkState > 2) {
			// firefox 3.5 starting audio bug
			elem.currentTime = 0.025;
		}
		elem.pause();
		return this;
	},
	events : [],
	event : function (event, fn) {
		if (this.stub) return this;
		this.events.push([event, fn]);
		this.audio.addEventListener(event, fn.bind(this), false);
		return this;
	},

	// Gatling
	gatling : function (count) {
		if (this.stub) return this;
		this.barrels = [];
		this.gatIndex =  0;
		while (count--) {
			this.barrels.push(this.cloneAudio());
		}
		return this;
	},
	getNext : function () {
		if (this.stub) return null;
		++this.gatIndex >= this.barrels.length && (this.gatIndex = 0);
		return this.getCurrent();
	},
	getCurrent : function () {
		if (this.stub) return null;
		return this.barrels ? this.barrels[this.gatIndex] : this.audio;
	},
	playNext : function () {
		if (this.stub) return this;
		var elem = this.getNext();
		this.stop(elem);
		elem.play();
		return this;
	},

	// Loop (using gatling in browsers, that doesn't support loop, e.g. in fx)
	loopBinded : false,
	loop : function () {
		if (this.stub) return this;
		if (this.support.loop) {
			this.audio.loop = 'loop';
			this.stop().play();
		} else {
			if (!this.loopBinded) {
				this.event('ended', function () {
					this.playNext();
				}).gatling(2);
				window.addEvent('unload', function () {
					this.pause.bind(this)
				});
				this.loopBinded = true;
			}
			this.stop().playNext();
		}
		return this;
	},

	// testing. bug if run twice
	fadeOut : function (elem, time) {
		if (this.stub) return this;
		this.animate.call(elem || this.getCurrent(), {
			props  : { volume : 0.05 },
			frames : 20,
			delay  : (time || 1000) / 20,
			onFinish   : function () {
				this.stop();
				this.audio.volume = 0.99;
			}.bind(this)
		});
		return this;
	}
});

/*
---
description: Provides FPS indicator

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.FpsMeter]
*/

LibCanvas.Utils.FpsMeter = new Class({
	initialize : function (framesMax) {
		this.trace = new LibCanvas.Utils.Trace();
		this.genTime   = [];
		this.prevTime  = null;
		this.framesMax = framesMax;
	},
	frame : function () {
		if (this.prevTime) {
			var thisTime = $time() - this.prevTime;
			this.genTime.push(thisTime);
			if (this.genTime.length > this.framesMax) {
				this.genTime.shift();
			}
		}
		this.output();
		this.prevTime = $time();
		return this;
	},
	output : function () {
		if (this.genTime.length) {
			var fps = 1000 / this.genTime.average();
			fps = fps.round(fps > 2 ? 0 : fps > 1 ? 1 : 2);
			this.trace.trace('FPS: ' + fps);
		} else {
			this.trace.trace('FPS: counting');
		}
		return this;
	}
});

/*
---
description: Provides images preloader

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.ImagePreloader]
*/

LibCanvas.Utils.ImagePreloader = new Class({
	initialize: function (images) {
		this.count = {
			errors : 0,
			aborts : 0,
			loaded : 0
		};

		this.images = {};
		this.processed = 0;
		this.number    = this
			.createImages(images)
			.getLength();

		this.readyfuncs = [];
	},
	onProcessed : function (type) {
		this.count[type]++;
		this.processed++;
		if (this.isReady()) {
			this.readyfuncs.each(function (fn) {
				fn(this);
			}.bind(this));
		}
		return this;
	},
	getInfo : function () {
		var stat = "Images loaded: {loaded}; Errors: {errors}; Aborts: {aborts}"
			.substitute(this.count);
		var ready = this.isReady() ? "Image preloading has completed;\n" : '';
		return ready + stat;
	},
	getProgress : function () {
		return this.isReady() ? 1 : (this.processed / this.number).round(3);
	},
	isReady : function () {
		return (this.number == this.processed);
	},
	createEvent : function (type) {
		return (function () {
			this.onProcessed(type);
		}).bind(this);
	},
	createImage : function (img, key) {
		this.images[key] = new Element('img', {
				src : img
			})
			.addEvents({
				load  : this.createEvent('loaded'),
				error : this.createEvent('errors'),
				abort : this.createEvent('aborts')
			});
	},
	createImages : function (images) {
		images = new Hash(images);
		images.each(
			this.createImage.bind(this)
		);
		return images;
	},
	ready : function (fn) {
		if (this.isReady()) {
			fn(this);
		} else {
			this.readyfuncs.push(fn);
		}
		return this;
	}
});

/*
---
description: Provides progress bar canvas object

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.ProgressBar]
*/

LibCanvas.Utils.ProgressBar = new Class({
	initialize : function () {
		this.coord = new LibCanvas.Point;
		this.progress = 0;
	},
	preRender : function () {
		if (this.libcanvas && this.style) {
			var htmlElem = this.libcanvas.ctx.canvas;
			this.coord.set(
				(htmlElem.width -this.style['width'] )/2,
				(htmlElem.height-this.style['height'])/2
			);
			this.line = this.renderLine();
		}
		return this;
	},
	setLibcanvas : function (libcanvas) {
		this.libcanvas = libcanvas;
		return this.preRender();
	},
	createBuffer : function () {
		return new Element('canvas', {
			width  : this.style['width'],
			height : this.style['height']
		}).getContext('2d-libcanvas');
	},
	getBuffer : function () {
		if (!this.buffer) {
			this.buffer = this.createBuffer();
		}
		return this.buffer;
	},
	drawBorder : function () {
		var s = this.style;
		
		var pbRect = new LibCanvas.Shapes.Rectangle({
			from : this.coord,
			size : [s['width'], s['height']]
		});

		this.libcanvas.ctx
			.fillAll(s['bgColor'])
			.set('fillStyle', s['barBgColor'])
			.fill(pbRect)
			.set('strokeStyle', s['borderColor'])
			.stroke(pbRect)
		return this;
	},
	drawLine : function () {
		if (this.progress > 0) {
			var line = this.line;
			var width  = line.width  - 2;
			var height = line.height - 2;
			var prog   = this.progress;
			var c = this.coord;

			this.libcanvas.ctx.drawImage({
				image : line,
				crop  : [0, 0 , width * prog, height],
				draw  : [c.x+1, c.y+1, width * prog, height]
			});
		}
		return this;
	},
	renderLine : function () {
		var b = this.getBuffer();
		var s = this.style;

		// аАяПНаАа�аАа�аБяПНаАа�аБяПНаАа�аАа�аАа�аАа�аАа� аБяПНаАа�аАа�
		b.save();
		b.fillAll(s['barColor']);

		// аАяПНаБяПНаАа�аАа� аАа�аБяПНаАа�аАа�аБяПН аАа�аАа�аАа�аАа�аБяПНаАа�аАа� - аБяПНаАа�аБяПНаБяПНаАа�аАа�
		if (s['strips']) {
			b.set('fillStyle', s['stripColor']);
			// аАа�аАа�аАа�аБяПНаАа�аАа�аАа�аАа� аАа�аАа�аБяПНаБяПНаАа�аАа�аАа� аБяПНаАа�аБяПНаБяПНаАа� аАа�аАа�аАа�аАа�аБяПНаАа�аАа� аАа�аБяПНаАа�аАа�аБяПНаАа�аБяПНаАа�аАа�аБяПНаАа�аАа� аАа�аАа�аАа�аАа�аАа�аАа�
			var shift = s['stripShift'] || 0;
			// аА аАа�аБяПНаБяПНаАа�аАа� аАа�аБяПН аАа�аАа� аАа�аБяПНаАа�аБяПНаАа�аАа�аАа� , аАа�аАа�аАа�аАа� аАа�аАа� аБяПНаАа�аАа�аБяПНаБяПНаАа� аАа�аБяПНаБяПНаБяПН аАа�аАа�аБяПНаБяПНаАа�
			for(var mv = 1; mv < b.canvas.width; mv += s['stripStep']) {
				b.fill(new LibCanvas.Shapes.Polygon([
					[1*mv + 1*shift, 0],
					[1*mv + 1*s['stripWidth'] + 1*shift, 0],
					[1*mv + 1*s['stripWidth'], 1*b.canvas.height ],
					[1*mv, 1*b.canvas.height ]
				]));
			}
		}

		// аАяПНаАа�аАа�аАа�аАа�аАа�аБяПНаАа�аАа� аАа�аАа�аАа�аАа�аБяПНаБяПН аАа�аАа�аАа�аАа�аБяПН, аАа�аБяПНаАа�аАа� аАа�аАа�аАа�аАа�аБяПНаАа�аАа�аАа�аАа�аАа�
		if (s['blend']) {
			b.set('globalAlpha', s['blendOpacity'] < 1 ? s['blendOpacity'] : 0.3);
			b.set('fillStyle',   s['blendColor']);
			b.fillRect({
				from : [0, s['blendVAlign']],
				size : [b.canvas.width, s['blendHeight']]
			});
		}
		return b.restore().canvas;
	},
	setProgress : function (progress) {
		if (this.libcanvas) {
			this.libcanvas.update();
		}
		this.progress = progress;
		return this;
	},
	setStyle : function (newStyle) {
		if (this.libcanvas) {
			this.libcanvas.update();
		}
		this.style = newStyle;
		return this.preRender();
	},
	draw : function () {
		this.libcanvas.ctx.save();
		this.drawBorder()
		    .drawLine();
		this.libcanvas.ctx.restore();
		return this;
	}
});

/*
---
description: Stopwatch

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.StopWatch]
*/

LibCanvas.Utils.StopWatch = new Class({
	startTime : 0,
	time      : 0,
	traceElem : null,
	initialize : function (autoStart) {
		autoStart && this.start();
	},
	start : function () {
		this.startTime = new Date();
		return this;
	},
	stop : function () {
		this.startTime = 0;
		this.time      = 0;
		return this;
	},
	getTime : function (micro) {
		var d2 = function (num) {
			return num < 10 ? '0' + num : num;
		};

		var t = this.time + (new Date - this.startTime);

		if (micro) {
			return t;
		}
		var s = (t / 1000).round();
		var m = (s / 60).round();
		var h = (m / 60).round();
		if (s < 60) {
			return d2((t / 1000).toFixed(1));
		} else {
			return h + ':' + d2(m) + ':' + d2(s % 60);
		}
	},
	trace : function (micro) {
		if (!this.traceElem) {
			this.traceElem = new LibCanvas.Utils.Trace;
		}
		this.traceElem.trace(this.getTime(micro));
		return this;
	}
});

LibCanvas.Utils.Storage = new Class({
	initialize : function () {
		this.store = this.getStorage();
	},
	getStorage : function () {
		return 'localStorage' in window ?
			window.localStorage :
			window.sessionStorage;
	},
	store : '',
	setScope : function (name) {
		var st = this.getStorage();
		name += '\0';
		if (!st[name]) {
			st[name] = {};
		}
		this.scope = st[name];
		return this;
	},
	keys : function () {
		var keys = [];
		$each(this.store, function (val, key) {
			keys.push(key);
		});
		return key;
	},
	values : function () {
		var values = [];
		$each(this.store, function (val) {
			values.push(val);
		});
		return values;
	},
	has : function (name) {
		return (name in this.store);
	},
	get : function (name) {
		return this.has(name) ? this.store[name] : null;
	},
	set  : function (name, value) {
		arguments.length == 1 && typeof name == 'object' ?
			$extend(this.store, name) : (this.store[name] = value);
		return this;
	}
});

/*
---
description: Stop watch

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.TimeLogger]
*/

LibCanvas.Utils.TimeLogger = new Class({
	time : [],
	last : 0,
	sw   : null,
	trace: null,
	initialize : function (last) {
		this.last  = last | 10;
		this.sw    = new LibCanvas.Utils.StopWatch();
		this.trace = new LibCanvas.Utils.Trace();
	},
	from : function () {
		this.sw.start();
		return this;
	},
	to   : function (msg) {
		this.time.push(this.sw.getTime(1));
		this.sw.stop();
		if (this.time.length > 25) {
			this.time.shift();
		}
		this.trace.trace(msg + this.time.average().toFixed(2));
		return;
	}
});

/*
---
description: Useful tool which provides windows with user-defined debug information

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

provides: [LibCanvas.Utils.Trace]
*/

LibCanvas.Utils.Trace = new Class({
	initialize : function (object) {
		if (arguments.length == 1) {
			if (!this.trace) {
				return new LibCanvas.Trace(object);
			}
			this.trace(object);
		}
		this.stopped = false;
		return this;
	},
	stop  : function () {
		this.stopped = true;
		return this;
	},
	trace : function (object) {
		if (this.stopped) {
			return false;
		}
		if (!this.blocked) {
			this.createNode().set('html',
				this.dump(object)
					.safeHTML()
					.replaceAll('\t', '&nbsp;&nbsp;&nbsp;')
					.replaceAll('\n', '<br />')
				|| 'null'
			);
		}
		return this;
	},
	dumpRec : function (obj, level) {
		var callee = arguments.callee;
		var html = '';
		if (level > 5) {
			return '*TOO_DEEP : ' + level + '*';
		}
		var tabs = '\t'.repeat(level);
		if ($type(obj) == 'array') {
			html += tabs + '[\n';
			obj.each(function (key) {
				html += tabs + '\t' + key + ': ' + callee(this, 1+(1*level)) + '\n';
			})
			html += tabs + ']\n';
		} else if ($type(obj) == 'element') {
			var attr = [];
			var meth = [];
			for (var i in obj) {
				(typeof(obj[i]) == 'function') ?
					meth.push(i + '()') : attr.push(i);
			}
			html += obj.toString() + ' {\n';
			if (obj.tagName == 'IMG') {
				try {
					html += tabs + '\tsrc        : ' + obj.src + '\n';
					html += tabs + '\tsize       : ' + obj.width + 'аЃяПН' + obj.height + '\n';
				} catch (ignored) {};
			}
			html += tabs + '\tattributes : ' + meth.join(', ') + '\n';
			html += tabs + '\tmethods    : ' + attr.join(', ') + '\n';
			html += tabs + '}\n'
		} else if (typeof(obj) == 'object') {
			html += '{\n';
			for (var key in obj) {
				html += tabs + '\t' + key + ': ' + callee(obj[key], 1+(1*level)) + '\n';
			}
			html += tabs + '}';
		} else if ($type(obj) === 'boolean') {
			html += obj ? 'true' : 'false';
		} else {
			html += obj;
		}
		return html;
	},
	dump : function (object) {
		return (this.dumpRec(object, [], 0));
	},
	getContainer : function () {
		return $('traceContainer') ||
			new Element('div', {
				'id' : 'traceContainer',
				'styles' :  {
					'position' : 'absolute',
					'top'      : '3px',
					'right'    : '6px',
					'maxWidth' : "70%"
				}
			}).inject($$('body')[0]);
	},
	events : function (remove) {
		var trace = this;
		if (remove) {
			this.node
				.removeEvents('onmouseover')
				.removeEvents('onmouseout')
				.removeEvents('onmousedown')
				.removeEvents('onmouseup');
		} else {
			this.node
				.addEvents({
					mouseover : function () {
						this.setStyle('background', '#222');
					},
					mouseout  : function () {
						this.setStyle('background', '#000');
					},
					mousedown : function () {
						trace.blocked = true;
					},
					mouseup : function () {
						trace.blocked = false;
					}
				});
		}
		return this.node;
	},
	destroy : function () {
		var trace = this;
		this.events(true);
		this.node.setStyle('background', '#300');
		this.timeout = setTimeout (function () {
			if (trace.node) {
				trace.node.destroy();
				trace.node = null;
			}
		}, 500);
		return this;
	},
	createNode : function () {
		var trace = this;
		if (trace.node) {
			if (trace.timeout) {
				clearTimeout(trace.timeout);
				this.events(trace.node);
				trace.node.setStyle('background', '#000');
			}
			return trace.node;
		}

		this.node = new Element('div', {
				'styles' : {
					background : '#000',
					border     : '1px dashed #0c0',
					color      : '#0c0',
					cursor     : 'pointer',
					fontFamily : 'monospace',
					margin     : '1px',
					minWidth   : '200px',
					overflow   : 'auto',
					padding    : '3px 12px',
					whiteSpace : 'pre'
				}
			})
			.inject(trace.getContainer())
			.addEvents({
				click : function () {
					trace.destroy();
				},
				dblclick : function () {
					trace.stop().destroy();
				}
			})
		return this.events();
	}
});

window.trace = function (msg) {
	if (arguments) {
		$A(arguments).each(function (a) {
			new LibCanvas.Utils.Trace(a);
		});
	} else {
		new LibCanvas.Utils.Trace();
	}
	
};

/*
---
description: Provides circle as a canvas object

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Shape

provides: [LibCanvas.Shapes.Circle]
*/

LibCanvas.Shapes.Circle = new Class({
	Extends : LibCanvas.Shape,
	set : function () {
		var a = $A(arguments);
		if (a[0] && !(a[0] instanceof LibCanvas.Point) &&
			(a[0].from || a[0].center || $chk(a[0].x) || $chk(a[0][0]))
		) {
			a = a[0];
		}

		if (a.from) {
			a.center = new LibCanvas.Point(a.from);
			a.center.x += [a.r, a.radius].firstReal();
			a.center.y += [a.r, a.radius].firstReal();
		}

		var setCenter = function () {
			if (!this.center) {
				this.center = new LibCanvas.Point;
			}
			this.center.set.apply(
				this.center, arguments
			);
		}.bind(this);

		if (a.length && a.length >= 3) {
			setCenter(a[0], a[1]);
			this.radius = a[2];
		} else if (a.length && a.length == 2) {
			(a[0] instanceof LibCanvas.Point) ?
				(this.center = a[0]) : setCenter(a[0]);
			this.radius = a[1];
		} else if (typeof a == 'object') {
			if ($chk(a.x) && $chk(a.y)) {
				setCenter(a.x, a.y);
			} else if (a.center instanceof LibCanvas.Point) {
				this.center = a.center;
			} else {
				setCenter(a.center);
			}
			this.radius = [a.r, a.radius].firstReal();
		} else {
			throw 'Wrong Arguments In Circle';
		}
	},
	getCoords : function () {
		return this.center;
	},
	hasPoint : function (point) {
		point = this.checkPoint(arguments);
		return this.center.distanceTo(point) <= this.radius;
			
	},
	scale : function (factor) {
		this.center.scale(factor);
		return this;
	},
	intersect : function (obj) {
		if (obj instanceof LibCanvas.Shapes.Circle) {
			return this.center.distanceTo(obj.center) < this.radius + obj.radius;
		}
		return false;
	},
	move : function (distance) {
		this.center.move(distance);
		return this.parent(distance);
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) {
			ctx.beginPath();
		}
		ctx.arc({
			circle : this,
			angle  : [0, (360).degree()]
		});
		if (!noWrap) {
			ctx.closePath();
		}
		return ctx;
	}
});


/*
---
description: Provides line as a canvas object

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Shape

provides: [LibCanvas.Shapes.Line]
*/

LibCanvas.Shapes.Line = new Class({
	Extends : LibCanvas.Shape,
	set : function (from, to) {
		var a = arguments.length == 1 ?
			arguments[0] : arguments;

		this.from = this.checkPoint(a[0] || a.from);
		this.to   = this.checkPoint(a[1] || a.to);
		
		return this;
	},
	hasPoint : function (point) {
		var max = Math.max;
		var min = Math.min;
		var fx = this.from.x;
		var fy = this.from.y;
		var tx = this.to.x;
		var ty = this.to.y;
		var px = this.point.x;
		var py = this.point.y;

		if (!( px.between(min(fx, tx), max(fx, tx))
		    && py.between(min(fy, ty), max(fy, ty))
		)) {
			return false;
		}

		// if triangle square is zero - points are on one line
		return ((fx-px)*(ty-py)-(tx-px)*(fy-py)).round(6) == 0;
	},
	getCoords : function () {
		return this.from;
	},
	getLength : function () {
		return this.to.distanceTo(this.from);
	},
	move : function (distance) {
		this. to .move(distance);
		this.from.move(distance);
		return this.parent(distance);
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) {
			ctx.beginPath();
		}
		ctx.moveTo(this.from).lineTo(this.to);
		if (!noWrap) {
			ctx.closePath();
		}
		return ctx;
	},
	clone : function () {
		return new LibCanvas.Shapes.Line(this.from.clone(), this.to.clone());
	}
});


/*
---
description: Provides a user-defined path (similar to vector graphics) as canvas object

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Shape

provides: [LibCanvas.Shapes.Path]
*/

LibCanvas.Shapes.Path = new Class({
	Extends : LibCanvas.Shape,
	set : function (builder) {
		this.builder = builder;
		builder.path = this;
		return this;
	},
	getBuffer : function () {
		if (!this.buffer) {
			this.buffer = new Element('canvas', {
				width : 1, height : 1
			})
			this.buffer.ctx = this.buffer.getContext('2d-libcanvas');
		}
		return this.buffer;
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) {
			ctx.beginPath();
		}
		this.builder.parts.each(function (part) {

			ctx[part.method].apply(ctx, part.args);
		});
		if (!noWrap) {
			ctx.closePath();
		}
		return ctx;
	},
	hasPoint : function (point) {
		var ctx = this.getBuffer().ctx;
		if (this.builder.changed) {
			this.builder.changed = false;
			this.processPath(ctx);
		}
		return ctx.isPointInPath(
			this.checkPoint(arguments)
		);
	},
	draw : function (ctx, type) {
		this.processPath(ctx)[type]();
		return this;
	},
	move : function (distance) {
		var moved = [];
		var move = function (a) {
			if (!moved.contains(a)) {
				a.move(distance);
				moved.push(a);
			}
		};
		this.builder.parts.each(function (part) {
			var a = part.args[0];
			switch(part.method) {
				case 'moveTo':
				case 'lineTo':
					move(a);
					break;
				case 'bezierCurveTo':
					['p1', 'p2', 'to'].each(function (prop) {
						move(a[prop]);
					});
					break;
				case 'arc':
					move(a.circle);
					break;
			}
		});
		return this;
	}
});

LibCanvas.Shapes.Path.Builder = new Class({
	Extends : LibCanvas.Shape,
	parts : [],
	changed : true,
	add : function (method, args) {
		this.changed = true;
		this.parts.push({
			method : method,
			args : args
		});
		return this;
	},
	pop : function () {
		this.changed = true;
		this.parts.pop();
		return this;
	},
	move : function () {
		return this.add('moveTo', [
			this.checkPoint(arguments)
		]);
	},
	line : function () {
		return this.add('lineTo', [
			this.checkPoint(arguments)
		]);
	},
	curve : function (p1, p2, to) {
		var args = arguments.length > 1 ?
			arguments : arguments[0];
		if (args.length >= 6) {
			return this.curve(
				[ args[0], args[1] ],
				[ args[2], args[3] ],
				[ args[4], args[5] ]
			);
		}
		if ($chk(args[0])) {
			args = {
				p1 : args[0],
				p2 : args[1],
				to : args[2]
			};
		}
		for (var i in args) {
			args[i] = this.checkPoint(args[i]);
		}
		return this.add('bezierCurveTo', [args]);
	},
	arc : function (circle, angle, acw) {
		var a = (arguments.length > 1) ?
			arguments : arguments[0];
		if (a.length >= 6) {
			return this.arc({
				circle : [ a[0], a[1], a[2] ],
				angle : [ a[3], a[4] ],
				acw : a[5]
			});
		}
		a.circle = a.circle instanceof LibCanvas.Shapes.Circle ? a.circle :
			new LibCanvas.Shapes.Circle(a.circle);
		if ($type(a.angle) == 'array') {
			a.angle = {
				start : a.angle[0],
				end   : a.angle[1]
			};
		}
		a.acw = !!a.acw;
		return this.add('arc', [a]);
	},
	hasPoint : function () {
		var path = this.build();
		return path.hasPoint.apply(path, arguments);
	},
	string : function () {
		var string = '';
		this.parts.each(function (part) {
			var a = part.args[0];
			switch(part.method) {
				case 'moveTo':
					string += 'move,' + a.x.round(2) + ',' + a.y.round(2);
					break;
				case 'lineTo':
					string += 'line,' + a.x.round(2) + ',' + a.y.round(2);
					break;
				case 'bezierCurveTo':
					string += 'curve,';
					['p1', 'p2', 'to'].each(function (prop) {
						string += a[prop].x.round(2) + ',' + a[prop].y.round(2);
						if (prop != 'to') {
							string += ',';
						}
					});
					break;
				case 'arc':
					string += 'arc,';
					string += a.circle.center.x.round(2) + ',' + a.circle.center.y.round(2) + ',';
					string += a.circle.radius.round(2) + ',' + a.angle.start.round(2) + ',';
					string += a.angle.end.round(2) + ',' + (a.acw ? 1 : 0);
					break;
			}
			string += '/';
		}.bind(this));
		return string;
	},
	parseString : function (string) {
		string.split('/').each(function (line) {
			if (line) {
				var parts  = line.split(',');
				var method = parts.shift();
				parts.each(function (value, i) {
					parts[i] *= 1;
				});
				this[method].apply(this, parts);
			}
		}.bind(this));
	},
	build : function () {
		if (arguments.length == 1) {
			this.parseString(arguments[0]);
		}
		if (!this.path) {
			this.path = new LibCanvas.Shapes.Path(this);
		}
		return this.path;
	}
});

/*
---
description: Provides user-defined concave polygon as canvas object

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Shape

provides: [LibCanvas.Shapes.Polygon]
*/

(function (){


var linesIntersect = function (a,b,c,d) {
	var x,y;
	if (d.x == c.x) { // DC == vertical line
		if (b.x == a.x) {
			return a.x == d.x && (a.y.between(c.y, d.y) || b.x.between(c.y, d.y));
		}
		x = d.x;
		y = b.y + (x-b.x)*(a.y-b.y)/(a.x-b.x);
	} else {
		x = ((a.x*b.y - b.x*a.y)*(d.x-c.x)-(c.x*d.y - d.x*c.y)*(b.x-a.x))/((a.y-b.y)*(d.x-c.x)-(c.y-d.y)*(b.x-a.x));
		y = ((c.y-d.y)*x-(c.x*d.y-d.x*c.y))/(d.x-c.x);
		x *= -1;
	}
	return (x.between(a.x, b.x, 'LR') || x.between(b.x, a.x, 'LR'))
		&& (y.between(a.y, b.y, 'LR') || y.between(b.y, a.y, 'LR'))
		&& (x.between(c.x, d.x, 'LR') || x.between(d.x, c.x, 'LR'))
		&& (y.between(c.y, d.y, 'LR') || y.between(d.y, c.y, 'LR'));
};



LibCanvas.Shapes.Polygon = new Class({
	Extends : LibCanvas.Shape,
	set : function () {
		var a = $A(arguments);
		if ($type(a[0][0]) == 'array' || a[0][0] instanceof LibCanvas.Point) {
			a = a[0]
		}
		var polygon = this;
		a.each(function (elem, index) {
			polygon[index] = elem instanceof LibCanvas.Point ?
				elem : new LibCanvas.Point(elem);
		});
		this.length = a.length;
		return this;
	},
	hasPoint : function (point) {
		point = this.checkPoint(arguments);

		var polygon = this;
		var result = false;
		polygon.length.times(function (i) {
			var k = i ? i - 1 : polygon.length - 1;
			var I = polygon[i];
			var K = polygon[k];
			if (
				(point.y.between(I.y , K.y, "L") || point.y.between(K.y , I.y, "L"))
					&&
				 point.x < (K.x - I.x) * (point.y -I.y) / (K.y - I.y) + I.x
			) {
				result = !result;
			}
		});
		return result;
	},
	getCoords : function () {
		return this[0];
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) {
			ctx.beginPath();
		}
		this.each(function (point, i) {
			ctx[i > 0 ? 'lineTo' : 'moveTo'](point.x, point.y);
		});
		if (!noWrap) {
			ctx.closePath();
		}
		return ctx;
	},
	move : function (distance) {
		this.each(function (point) {
			point.move(distance);
		});
		return this.parent(distance);
	},
	rotate : function (angle, pivot, withCache) {
		this.each(function (point) {
			point.rotate(angle, pivot, withCache);
		});
		return this;
	},
	scale : function (x, y) {
		this.each(function (point) {
			point.scale(x, y);
		});
		return this;
	},
	intersect : function (poly) {
		for (var i = 0; i < poly.length; i++) {
			for (var k = 0; k < this.length; k++) {
				var a = this[k];
				var b = this[k+1 == this.length ? 0 : k+1];
				var c = poly[i];
				var d = poly[i+1 == poly.length ? 0 : i+1];
				if (linesIntersect(a,b,c,d)) {
					return true;
				}
			}
		}
		return false;
	},
	each : Array.prototype.each
});

})();

/*
---
description: Provides rectangle as canvas object

license: LGPL

authors:
- Pavel Ponomarenko aka Shock <shocksilien@gmail.com>

requires:
- LibCanvas.Shape

provides: [LibCanvas.Shapes.Rectangle]
*/


LibCanvas.Shapes.Rectangle = new Class({
	Extends : LibCanvas.Shape,
	set : function () {
		var a = arguments;
		if ($type(a[0]) == 'array') {
			a = a[0];
		}
		if (a.length == 4) {
			this.from = new LibCanvas.Point(a[0], a[1]);
			this.to   = this.from.clone().move({x:a[2], y:a[3]});
		} else if (a.length == 2) {
			this.from = this.checkPoint(a[0]);
			this.to   = this.checkPoint(a[1]);
		} else {

			a = a[0];
			if (a.from) {
				this.from = this.checkPoint(a.from);
			} else if ($chk(a.x) && $chk(a.y)) {
				this.from = new LibCanvas.Point(a.x, a.y);
			}
			if (a.to) this.to = this.checkPoint(a.to);
		
			if (!a.from || !a.to) {
				var size = {
					w : [ a.w, a.width,  a.size && a.size.w, a.size && a.size[0], a.size && a.size.width  ].firstReal(),
					h : [ a.h, a.height, a.size && a.size.h, a.size && a.size[1], a.size && a.size.height ].firstReal()
				}
				this.from ?
					(this.to = this.from.clone().move({x: size.w, y: size.h})) :
					(this.from = this.to.clone().move({x:-size.w, y:-size.h}));
			}
		
		}
		return this;
	},

	getWidth : function () {
		return this.to.x - this.from.x;
	},
	getHeight : function () {
		return this.to.y - this.from.y;
	},
	setWidth : function (width) {
		this.to.moveTo({ x : this.from.x + width, y : this.to.y });
		return this;
	},
	setHeight : function (height) {
		this.to.moveTo({ x : this.to.x, y : this.from.y + height });
		return this;
	},
	hasPoint : function (point) {
		var min = Math.min;
		var max = Math.max;
		point = this.checkPoint(arguments);
		return $chk(point.x) && $chk(point.y)
			&& point.x.between(min(this.from.x, this.to.x), max(this.from.x, this.to.x), 1)
			&& point.y.between(min(this.from.y, this.to.y), max(this.from.y, this.to.y), 1);
	},
	move : function (distance, reverse) {
		this.from.move(distance, reverse);
		this. to .move(distance, reverse);
		return this.parent(distance, reverse);
	},
	draw : function (ctx, type) {
		// fixed Opera bug - cant drawing rectangle with width or height below zero
		var min = Math.min;
		var abs = Math.abs;
		ctx.original(type + 'Rect',
			[
				min(this.from.x, this.to.x),
				min(this.from.y, this.to.y),
				abs(this.getWidth()), abs(this.getHeight())
			]
		);
		return this;
	},
	getCoords : function () {
		return this.from;
	},
	getCenter : function () {
		return new LibCanvas.Point(
			(this.from.x + this.to.x) / 2,
			(this.from.y + this.to.y) / 2
		);
	},
	processPath : function (ctx, noWrap) {
		if (!noWrap) {
			ctx.beginPath();
		}
		ctx
			.moveTo(this.from.x, this.from.y)
			.lineTo(this.to.x, this.from.y)
			.lineTo(this.to.x, this.to.y)
			.lineTo(this.from.x, this.to.y)
			.lineTo(this.from.x, this.from.y);
		if (!noWrap) {
			ctx.closePath();
		}
		return ctx;
	},
	getRandomPoint : function (margin) {
		margin = margin || 0;
		return new LibCanvas.Point(
			$random(margin, this.getWidth()  - margin),
			$random(margin, this.getHeight() - margin)
		);
	},
	equals : function (rect) {
		return rect.from.equals(this.from) && rect.to.equals(this.to);
	},
	clone : function () {
		return new LibCanvas.Shapes.Rectangle(
			this.from.clone(), this.to.clone()
		);
	},
}); 

