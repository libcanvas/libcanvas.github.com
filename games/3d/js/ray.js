/** @class Eye.Ray */
atom.declare( 'Eye.Ray', {
	width : 400,
	height: 200,
	fov   : (60).degree(),
	stripWidth: 1,
	wallHeight: 1,

	initialize: function (controller) {
		this.controller = controller;
		this.canvas = LibCanvas.buffer(this.width, this.height, true);

		atom.dom(this.canvas)
			.css({ width: this.width*2, height: this.height*2})
			.addClass('view')
			.appendTo('body');

		// расстояние между пользователем и монитором
		this.viewDist = this.width / 2 / Math.tan(this.fov / 2);

		this.imageData   = this.canvas.ctx.ctx2d.getImageData(0, 0, this.canvas.width, this.canvas.height);
		this.imagePixels = new Uint32Array( this.imageData.data.buffer );

		this.sourcePixels = Array.range(0,5).map(function (i) {
			var buffer = LibCanvas.buffer(256,256,true);
			buffer.ctx.drawImage(this.controller.images.get('textures'+i));
			var imageData   = buffer.ctx.ctx2d.getImageData(0, 0, buffer.width, buffer.height);
			return new Uint32Array( imageData.data.buffer );
		}.bind(this));
	},

	cast: function () {
		var ctx = this.canvas.ctx.ctx2d;
		this.canvas.ctx.fillAll('black');

		var vShift     = (this.controller.player.vShift * this.height).round();
		var images     = this.controller.images;
		var stripWidth = this.stripWidth;
		var numRays    = this.width / stripWidth;
		var viewDist   = this.viewDist;
		var wallHeight = this.wallHeight;
		var pixels     = this.imagePixels;
		var map        = this.controller.map;
		var player     = this.controller.player;
		var playerPos  = player.position;
		var mapBlocks  = map.blocks;
		var mapWidth   = map.width;
		var mapHeight  = map.height;

		var
			source = this.sourcePixels,
			texWidth  = 64,
			texHeight = 64,
			m = Math,
			pi   = m.PI,
			degree = pi/180,
			d90  =  90*degree,
			d180 = 180*degree,
			d270 = 270*degree,
			d360 = 360*degree;

		var walls = [] ;

		function textI (dist) {
			return dist > 18 ? 5 :
			       dist > 14 ? 4 :
			       dist > 10 ? 3 :
			       dist >  7 ? 2 :
			       dist >  2 ? 1 : 0;
		}

		for (var i = numRays; i--;) {
			// x-координата луча на мониторе
			var rayScreenPos = (i - numRays/2) * stripWidth;

			var ray = this.castSingleRay(rayScreenPos);

			var fixCos = m.cos(player.angle - ray.angle);
			var dist = m.sqrt(ray.dist) * fixCos;

			var height = m.round(this.wallHeight * viewDist / dist);
			var top    = m.round(this.height/2 - height * ( 1 - player.height )) + vShift;
			var bottom = top + height;
			var textureX, textureY;

			if (dist) {

				var x = i * stripWidth;

				walls.push([
					images.get('textures' + textI(dist)),
					//cropX
					parseInt(texWidth * (ray.textureX + (ray.wallIsHorizontal ? 1 : 0))),
					//cropY
					texHeight * (ray.wallType-1),
					1,
					texHeight,
					x,
					top,
					stripWidth,
					height
				]);

				var rayScreenY, ceilDist, projDegreeTan, projDegreeCoTan, floorDist;

				if (top > 0) for (var ceilRay = 0; ceilRay < top; ceilRay++) {
					// отдалённость от центра
					rayScreenY    = this.height/2 - ceilRay + vShift;
					// котангенс угла, по отношению к потолку
					projDegreeCoTan = viewDist / rayScreenY;
					// расстояние по потолку , но не напрямик
					ceilDist = (wallHeight - player.height) * projDegreeCoTan / fixCos;

					var ceilX = playerPos.x + ray.angleCos * ceilDist;
					var ceilY = playerPos.y + ray.angleSin * ceilDist;
					var fCeilX = m.floor(ceilX);
					var fCeilY = m.floor(ceilY);
					textureX = m.round((ceilX - fCeilX) * texWidth);
					textureY = m.round((ceilY - fCeilY) * texHeight);
					if (textureX < 0) textureX = texWidth - textureX;
					if (textureY < 0) textureY = texHeight - textureY;
					if (textureX + stripWidth > texWidth ) textureX = texWidth  - stripWidth;
					if (textureY + stripWidth > texHeight) textureY = texHeight - stripWidth;
					if (fCeilX % 7 == 0 || fCeilY % 3 == 0) textureY += 64;
					if (fCeilX % 3 == 0 || fCeilY % 7 == 0) textureY += 64;
					if (fCeilX % 9 == 0 || fCeilY % 9 == 0) textureY += 64;

					pixels[x+ceilRay*this.width] = source[textI(ceilDist)][m.floor(textureX+192+textureY*256)];
				}

				if (bottom < this.height) for (var floorRay = bottom; floorRay < this.height; floorRay++) {
					if (floorRay + stripWidth < 0) continue;
					// отдалённость от центра
					rayScreenY    = floorRay - this.height/2 - vShift;
					// котангенс угла, по отношению к полу
					projDegreeTan = rayScreenY / viewDist;
					// расстояние по полу , но не напрямик
					floorDist = player.height / projDegreeTan / fixCos;

					var floorX = playerPos.x + ray.angleCos * floorDist;
					var floorY = playerPos.y + ray.angleSin * floorDist;
					var fFloorX = m.floor(floorX);
					var fFloorY = m.floor(floorY);
					textureX = m.round((floorX - fFloorX) * texWidth);
					textureY = m.round((floorY - fFloorY) * texHeight);
					if (textureX + stripWidth > texWidth ) textureX = texWidth  - stripWidth;
					if (textureY + stripWidth > texHeight) textureY = texHeight - stripWidth;

					if (fFloorX % 7 == 0 || fFloorY % 4 == 0) textureY += 64;
					if (fFloorX % 4 == 0 || fFloorY % 2 == 0) textureY += 64;
					if (fFloorX % 6 == 0 || fFloorY % 7 == 0) textureY += 64;

					if (textureX < 0) textureX = 0;
					if (textureY < 0) textureY = 0;

					pixels[x+floorRay*this.width] = source[textI(floorDist)][m.floor(textureX+128+textureY*256)];
				}


				/*var
					wallRay = Math.max(top, 0),
					max = Math.min(bottom, this.height);
				for (; wallRay < max; wallRay++) {
					pixels[x+wallRay*this.width] = 0xff666666;
				}*/
			}
		}
		ctx.putImageData(this.imageData, 0, 0);

		for (var i = walls.length; i--;) {
			ctx.drawImage.apply(ctx, walls[i]);
		}


	},

	castSingleRay: function (rayScreenPos) {
		if (rayScreenPos == null) rayScreenPos = 0;

		var m  = Math;
		var pi = m.PI;
		var viewDist   = this.viewDist;
		var map        = this.controller.map;
		var player     = this.controller.player;
		var playerPos  = player.position;
		var mapBlocks  = map.blocks;
		var mapWidth   = map.width;
		var mapHeight  = map.height;

		var
			degree = pi/180,
			d90  =  90*degree,
			d180 = 180*degree,
			d270 = 270*degree;

		// расстояние между пользователем и точкой на мониторе
		var rayViewDist  = Math.sqrt(rayScreenPos*rayScreenPos + viewDist*viewDist);
		// реальный угол луча (угол игрока+угол луча)
		var rayAngle = player.angle + Math.asin(rayScreenPos / rayViewDist);
		rayAngle = rayAngle.normalizeAngle();

		// направление движения
		var right = rayAngle > d270 || rayAngle < d90;
		var up    = rayAngle > d180 || rayAngle < 0;

		var angleSin = m.sin(rayAngle);
		var angleCos = m.cos(rayAngle);


		var dist = 0; // the distance to the block we hit
		var xHit = 0; // the x and y coord of where the ray hit the block
		var yHit = 0;

		var textureX;	// the x-coord on the texture of the block, ie. what part of the texture are we going to render
		var wallXH, wallYH, wallXV, wallYV;	// the (x,y) map coords of the block

		var slope, dX, dY, x ,y, distX, distY;

		var wallType, wallIsHorizontal = false;

		// first check against the vertical map/wall lines
		// we do this by moving to the right or left edge of the block we're standing in
		// and then moving in 1 map unit steps horizontally. The amount we have to move vertically
		// is determined by the slope of the ray, which is simply defined as sin(angle) / cos(angle).

		slope = angleSin / angleCos; 	// the slope of the straight line made by the ray
		dX = right ? 1 : -1; 	// we move either 1 map unit to the left or right
		dY = dX * slope; 		// how much to move up or down

		x = right ? m.ceil(playerPos.x) : m.floor(playerPos.x);	// starting horizontal position, at one of the edges of the current map block
		y = playerPos.y + (x - playerPos.x) * slope;			// starting vertical position. We add the small horizontal step we just made, multiplied by the slope.


		while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
			wallXV = m.floor(x + (right ? 0 : -1));
			wallYV = m.floor(y);

			// is this point inside a wall block?
			if (mapBlocks[wallYV*mapWidth + wallXV]) {

				distX = x - playerPos.x;
				distY = y - playerPos.y;
				dist = distX*distX + distY*distY;	// the distance from the player to this point, squared.

				textureX = y % 1;	// where exactly are we on the wall? textureX is the x coordinate on the texture that we'll use when texturing the wall.
				if (!right) textureX = 1 - textureX; // if we're looking to the left side of the map, the texture should be reversed

				xHit = x;	// save the coordinates of the hit. We only really use these to draw the rays on minimap.
				yHit = y;

				wallType = map.cells[wallYV*mapWidth + wallXV];

				break;
			}
			x += dX;
			y += dY;
		}



		// now check against horizontal lines. It's basically the same, just "turned around".
		// the only difference here is that once we hit a map block,
		// we check if there we also found one in the earlier, vertical run. We'll know that if dist != 0.
		// If so, we only register this hit if this distance is smaller.

		slope = angleCos / angleSin;
		dY = up ? -1 : 1;
		dX = dY * slope;
		y = up ? m.floor(playerPos.y) : m.ceil(playerPos.y);
		x = playerPos.x + (y - playerPos.y) * slope;

		while (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
			wallYH = m.floor(y + (up ? -1 : 0));
			wallXH = m.floor(x);
			if (mapBlocks[wallYH*mapWidth + wallXH]) {
				distX = x - playerPos.x;
				distY = y - playerPos.y;
				var blockDist = distX*distX + distY*distY;
				if (!dist || blockDist < dist) {
					dist = blockDist;
					xHit = x;
					yHit = y;
					textureX = x % 1;
					if (up) textureX = 1 - textureX;
					wallIsHorizontal = true;
					wallType = map.cells[wallYH*mapWidth + wallXH];
				}
				break;
			}
			x += dX;
			y += dY;
		}

		return {
			dist: dist,
			textureX: textureX,
			wallIsHorizontal: wallIsHorizontal,
			wallType: wallType,
			angle: rayAngle,
			angleCos: angleCos,
			angleSin: angleSin,
			x: wallIsHorizontal ? wallXH : wallXV,
			y: wallIsHorizontal ? wallYH : wallYV
		};
	}


});