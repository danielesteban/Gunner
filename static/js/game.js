/* some lib funcs */
function $(id) {
	return document.getElementById(id);
}

function cE(type) {
	return document.createElement(type);
}

function addEvent(event, func, element) {
	if(element.addEventListener) {
		element.addEventListener(event, func, false);
	} else {
		element.attachEvent("on" + event, func);
	}
}

function removeEvent(event, func, element) {
	if(element.removeEventListener) {
		element.removeEventListener(event, func, false);
	} else {
		element.detachEvent("on" + event, func);
	}
}

function arraySearch(haystack, needle, index, returnIndex) {
	for(var i in haystack) {
		if(haystack[i][index] === needle) {
			if(returnIndex) {
				return parseInt(i, 10);
			} else {
				return haystack[i];
			}
		}
	}
	
	return false;
}

function cancelHandler(e) {
	e.cancelBubble = true;
	e.returnValue = false;
	if(e.stopPropagation) {
		e.stopPropagation();
	}

	if(e.preventDefault) {
		e.preventDefault();
	}

	return false;
}

function show(e) {
	e.style.display = 'block';
}

function hide(e) {
	e.style.display = 'none';
}

/* image cache & conversion funcs */

PATTERN_CACHE = {};
function genPattern(image, width, height) {
	var id = image.src + width + height;
	if(PATTERN_CACHE[id]) return PATTERN_CACHE[id];
	var canvas = cE('canvas'),
		ctx = canvas.getContext("2d");
		
	canvas.width = Math.ceil(width);
	canvas.height = Math.ceil(height);

	ctx.fillStyle = ctx.createPattern(image, 'repeat');
	ctx.fillRect(0, 0, width, height);
	
	PATTERN_CACHE[id] = canvas;
	
	return canvas;
}

SCALED_CACHE = {};
function genScaledImage(id, image, width, height) {
	id = id + width + height;
	if(SCALED_CACHE[id]) return SCALED_CACHE[id];
	var canvas = cE('canvas'),
		ctx = canvas.getContext("2d");
		
	canvas.width = Math.ceil(width);
	canvas.height = Math.ceil(height);

	ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
	
	SCALED_CACHE[id] = canvas;
	
	return canvas;
}

function flip_image(image) {
	var canvas = cE('canvas'),
		ctx = canvas.getContext("2d");

	canvas.width = image.width;
	canvas.height = image.height;

	ctx.scale(-1,1);
	ctx.drawImage(image, image.width * -1, 0, image.width, image.height);
	
	canvas.src = image.src;
	return canvas;
}

/* canvas library */

CANVAS = {
	tag : null,
	ctx : null,
	items : [],
	scaleX : 1,
	scaleY : 1,
	init : function(width, height, dest) {
		var c = cE('canvas');
		c.width = width;
		c.height = height;
		dest.appendChild(c);
		CANVAS.ctx = c.getContext("2d");
		CANVAS.tag = c;
	},
	add : function(id, x, y, w, h, fillStyle, fixed, scaledImage, text, index) {
		var item = {
			id : id,
			x : x,
			y : y,
			w : w,
			h : h,
			a : 1.0,
			fillStyle : fillStyle,
			scaledImage : scaledImage,
			fixed : fixed,
			text : text,
			font : "Arial",
			fontSize : 12,
			fontStyle : '',
			fontShadowOffset : 2,
			rotation : 0,
			draw : function(ctx) {
				var destX = this.x + (this.fixed ? 0 : SCENE.x),
					destY = this.y + (this.fixed ? 0 : SCENE.y),
					destW = this.w * CANVAS.scaleX,
					destH = this.h * CANVAS.scaleY,
					destFs = this.fontSize * CANVAS.scaleX;
				
				if(this.rotation !== 0) {
					if(this.flip) {
						destY -= this.rotation * 0.5; 
					} else {
						destY -= this.rotation * 0.3;
					}
					if(this.rotation > 0) destX += this.rotation * 0.3;
				}
				
				destX = destX * CANVAS.scaleX;
				destY = destY * CANVAS.scaleY;
				
				if(this.rotation !== 0) {
					ctx.save();
					ctx.translate(destX, destY);
					ctx.rotate(this.rotation * Math.PI / 180);
					destX = destY = 0;
				}
				
				ctx.globalAlpha = this.a;
				
				if(this.text) {
					ctx.textBaseline = "bottom";
					ctx.font = this.fontStyle + ' ' + destFs + 'pt ' + this.font;
					ctx.fillStyle = this.shadowColor || '#000';
					ctx.fillText(this.text, destX + this.fontShadowOffset, destY + this.fontShadowOffset);
					ctx.fillStyle = this.fillStyle;
					ctx.fillText(this.text, destX, destY);
				} else if(this.scaledImage) {
					ctx.drawImage(genScaledImage((this.flip ? 'f_' : '') + this.scaledImage.src, this.scaledImage, destW, destH), destX, destY);
				} else {
					if(typeof this.fillStyle !== 'object') {	
						ctx.fillStyle = this.fillStyle;
						ctx.fillRect(destX, destY, destW, destH);
					} else {
						ctx.drawImage(genPattern(this.fillStyle, destW, destH), destX, destY);
					}
				}
				
				if(this.rotation !== 0) ctx.restore();
			}
		};
		if(index) CANVAS.items.splice(index, 0, item);
		else CANVAS.items.push(item);
		return item;
	},
	get : function(id, returnIndex) {
		return arraySearch(CANVAS.items, id, 'id', returnIndex);
	},
	remove : function(id) {
		CANVAS.items.splice(CANVAS.get(id, true), 1);
	},
	promote : function(id) {
		var index = CANVAS.get(id, true),
			item;
		if(index < CANVAS.items.length - 1) {
			item = CANVAS.items.splice(index, 1)[0];
			CANVAS.items.splice(index, 0, item);
		}
	},
	demote : function(id) {
		var index = CANVAS.get(id, true),
			item;
		if(index > 0) {
			item = CANVAS.items.splice(index, 1)[0];
			CANVAS.items.splice(index - 1, 0, item);
		}
	},
	draw : function() {
		for(var i in CANVAS.items) {
			CANVAS.items[i].draw(CANVAS.ctx);
		}
	},
	clear : function(full) {
		CANVAS.ctx.clearRect(0, 0, CANVAS.tag.width, CANVAS.tag.height);
		if(full) CANVAS.items = [];
		return CANVAS;
	}
};

/* threads library */

THREAD = {
	t : {},
	start : function(func, id, duration) {
		var fps = 25,
			times = 0,
			ms = Math.round(1000 / fps);
		
		if(duration > 0) times = Math.round(duration / ms);
		
		func = function(func, times) {
			return function(draw, c) {
				func(draw, (times > 0 ? Math.sin(c / times * Math.PI / 2) : c));
			}
		}(func, times);
		
		id = id || 'mainThread';
			
		THREAD.stop(id);
		
		THREAD.t[id] = setInterval(function(func, id, times, ms) {	
			var c = 0,
				start = new Date().getTime();
			
			return function() {
				var running = (c*ms),
					diff = new Date().getTime() - start - running - ms;
					
				while(diff > ms) {
					diff -= ms;
					func(false, ++c);
				}
				func(true, ++c);
				
				if(times > 0 && c >= times) {
					THREAD.stop(id);
					func(true, times);
				}
			}
		}(func, id, times, ms), ms);
		
	},
	stop : function(id) {
		id = id || 'mainThread';
		if(THREAD.t[id]) {
			clearInterval(THREAD.t[id]);
			THREAD.t[id] = null;
		}
	}
};

/* sound library */

SOUND = {
	muted : false,
	channels : [],
	toggle : function() {
		for(var t in SOUND.channels) SOUND.destroy(t);
		SOUND.muted = !SOUND.muted;
		GAME.updateUI();
		document.cookie = 'mute=' + (SOUND.muted ? 1 : 0) + ';expires=' + (new Date(new Date().getTime() + (3600 * 24 * 365 * 7 * 1000)).toGMTString()) + ';';
	},
	play : function(id, overrideMute) {
		if(!overrideMute && SOUND.muted) return;
		var snd = LOADER.sounds[id].cloneNode(true),
			t = new Date().getTime();
		addEvent('ended', function(e) {
			SOUND.destroy(t);
		}, snd);
		snd.volume = 0.4;
		SOUND.channels[t] = snd;
		if(SOUND.channels.length > 5) {
			for(t in SOUND.channels) {
				SOUND.destroy(t);
				break;
			}
		}
		snd.play();
	},
	destroy : function(t) {
		SOUND.channels[t].pause();
		SOUND.channels[t].src = '';
		delete SOUND.channels[t];
	},
	getMuteCookie : function() {
		var cookies = document.cookie.split(';'),
			i, c;
		
		for(i in cookies) {
			c = cookies[i].split('=');
			if(c[0] === 'mute') {
				SOUND.muted = (parseInt(c[1], 10) === 1 ? true : false);
				break;
			}
		}
	}
};

/* game preloader */

LOADER = {
	images : {loaded: 0},
	sounds : {loaded: 0},
	preloadImages : function() {
		var img_path = 'static/img/',
			patterns = ['metal.jpg', 'wall.jpg'],
			images = ['guy1.png', 'dani1.png', 'dani2.png', 'dani3.png', 'dani4.png', 'dani5.png', 'bullet.png', 'gun.png'],
			preload = patterns.concat(images),
			id, img, i;
		
		$('loading').innerHTML = 'Loading Images... 1/' + preload.length;
		
		for(i in preload) {
			id = preload[i];
			img = new Image();
			addEvent('load', function(id) {
				return function(e) {
					LOADER.images[id] = this;
					if(images.indexOf(id) !== -1) LOADER.images['flip_' + id] = flip_image(this);
					LOADER.images.loaded ++;
					$('loading').innerHTML = 'Loading Images... ' + LOADER.images.loaded + '/' + preload.length;
					if(LOADER.images.loaded === preload.length) {
						setTimeout(LOADER.preloadSounds, 0);
					}
				}
			}(id), img);
			img.src = img_path + id;
		}
	},
	preloadSounds : function() {
		var snd_path = 'static/snd/',
			sounds = ['shoot', 'dead'],
			sound, snd, i;
		
		$('loading').innerHTML = 'Loading Sounds... 1/' + sounds.length;
			
		for(i in sounds) {
			sound = sounds[i];
			snd = cE('audio');
			snd.autoplay = snd.muted = true;
			snd.addEventListener('canplaythrough', function(id) {
				return function(e) {
					if(e.target.readyState === 4 && !LOADER.sounds[id]) {
						LOADER.sounds[id] = this;
						$('main').removeChild(this);
						LOADER.sounds.loaded ++;
						$('loading').innerHTML = 'Loading Sounds... ' + LOADER.sounds.loaded + '/' + sounds.length;
						if(LOADER.sounds.loaded === sounds.length) {
							setTimeout(LOADER.init, 0);
						}
					}
				}
			}(sound), true);
			snd.src = snd_path + sound + '.' + (snd.canPlayType("audio/ogg") ? 'ogg' : 'mp3');
			$('main').appendChild(snd); //if i don't do this, chrome destroys the object before it fires the event
		}
	},
	init : function(){
		CANVAS.init(640, 480, $('main'));

		addEvent('keydown', GAME.keydown, window);
		addEvent('keyup', GAME.keyup, window);
		addEvent('click', GAME.click, window);
		addEvent('mousemove', GAME.mousemove, window);
		
		GAME.onResize();
		addEvent('resize', GAME.onResize, window);
		hide($('loading'));
		show($('main'));
		
		SOUND.getMuteCookie();
				
		//GAME.start(); //for quick debug
		var h = document.location.hash.substr(2).split('/');
		if(h[0] === 'editor') EDITOR.render(h[1]); //editor
		else GAME.renderSplashScreen(); //regular behaviour
	}
};

/* general game functions */

GAME = {
	lastKeyPressed : null,
	renderSplashScreen : function() {
		var i;
		
		THREAD.stop();
		CANVAS.clear(true);
		
		hide($('mute'));
		show($('newGame'));
		
		i = CANVAS.add('title', 80, 200, 0, 0, '#fff', null, null, 'GUNNER');
		i.font = 'Georgia';
		i.fontStyle = 'bold'
		i.fontSize = 72;
		i.fontShadowOffset = 4;
		i = CANVAS.add('btb1', 190, i.y + 30, 260, 60, '#000');
		CANVAS.add('btbg1', i.x + 2, i.y + 2, i.w - 4, i.h - 4, '#000');
		i = CANVAS.add('bttxt', i.x + 72, i.y + 40, i.w - 4, i.h - 4, '#fff', null, null, 'Start Game');
		i.font = 'Arial Black';
		i.fontSize = 14;
		i = CANVAS.add('version', 355, 455, 0, 0, '#fff', null, null, 'An html5 crappy platform game by D. Esteban - v0.1');
		i.fontSize = 9;
		
		THREAD.start(function(draw) {
			if(draw) CANVAS.clear().draw();
		});
	},
	renderUI : function() {
		var uiY = 10,
			i;
		
		i = CANVAS.add('lifeLabel', 15, uiY + 18, 0, 0, '#fff', true, null, '1UP');
		i = CANVAS.add('lifeBarBorder', i.x + 45, uiY, 160, 20, '#fff', true);
		CANVAS.add('lifeBarBg', i.x + 2, uiY + 2, 156, 16, '#000', true);
		CANVAS.add('lifeBar', i.x + 2, uiY + 2, 0, 16, '#aa7b3f', true);
		i = CANVAS.add('ammoLabel', i.x + 180, uiY + 18, 0, 0, '#fff', true);
		i = CANVAS.add('soundLabel', i.x + 290, uiY + 18, 0, 0, '#fff', true);
		GAME.updateUI();
	},
	updateUI : function() {
		if(SCENE.mainPlayer) {
			CANVAS.get('lifeBar').w = SCENE.mainPlayer.life * 1.56;
			CANVAS.get('ammoLabel').text = 'AMMO ' + SCENE.mainPlayer.ammo;
		}
		CANVAS.get('soundLabel').text = 'SOUND ' + (SOUND.muted ? 'OFF' : 'ON');
	},
	start : function() {
		hide($('newGame'));
		show($('mute'));
		SCENE.load(SCENES.main);
	},
	onResize : function() {
		var w, h, ml = 0, mt = 0;
		if(document.documentElement && document.documentElement.clientHeight) {
			w = document.documentElement.clientWidth;
			h = document.documentElement.clientHeight;
		} else {
			w = document.body.clientWidth;
			h = document.body.clientHeight;
		}
	
		if(w > h) {
			ml = w;
			w = 640 * h / 480;
			ml = (ml - w) / 2;
		} else {
			mt = h;
			h = 480 * w / 640;
			mt = (mt - h) / 2;
		}
		
		with($('main').style) {
			marginTop = mt + 'px';
			marginLeft = ml + 'px';
			width = CANVAS.tag.width = w;
			height = CANVAS.tag.height = h;
		}
		CANVAS.scaleX = w / 640;
		CANVAS.scaleY = h / 480;
		
		with($('newGame').style) {
			width = (260 * CANVAS.scaleX) + 'px';
			height = (60 * CANVAS.scaleY) + 'px';
			top = (290 * CANVAS.scaleY) + 'px';
			marginTop = (-60 * CANVAS.scaleY) + 'px';
			marginLeft = (188 * CANVAS.scaleX) + 'px';
		}
		
		with($('mute').style) {
			width = (107 * CANVAS.scaleX) + 'px';
			height = (25 * CANVAS.scaleY) + 'px';
			top = (32 * CANVAS.scaleY) + 'px';
			marginTop = (-25 * CANVAS.scaleY) + 'px';
			marginLeft = (523 * CANVAS.scaleX) + 'px';
		}
		
		CANVAS.clear().draw();
	},
	keydown : function(e) {
		var code = e.keyCode ? e.keyCode : e.which;
		
		if(SCENE.mainPlayer) {
			var codes = [37, 38, 39, 65, 87, 68, 32, 13],
				player = SCENE.mainPlayer;
			
			if(codes.indexOf(code) !== -1) cancelHandler(e);
			
			if(GAME.lastKeyPressed !== code) {
				GAME.lastKeyPressed = code;
				if(code === 37 || code === 65) {
					player.move = -1;
				} else if(code === 39 || code === 68) {
					player.move = 1;
				} else if((code === 38 || code === 87) && !player.jump) {
					player.jump = true;
				} else if(code === 32) {
					PLAYER.fire(player);
				}
			}
		} else if(code === 13 || code === 32) GAME.start();
	},
	keyup : function(e) {
		if(!SCENE.mainPlayer) return;
		var codes = [37, 38, 39, 65, 87, 68, 32, 13],
			code = e.keyCode ? e.keyCode : e.which,
			player = SCENE.mainPlayer;
	
		if(codes.indexOf(code) !== -1) cancelHandler(e);
	
		if(code === GAME.lastKeyPressed) GAME.lastKeyPressed = null;
		if(((code === 37 || code === 65) && player.move === -1) || ((code === 39 || code === 68) && player.move === 1)) {
			 player.move = null;
		}
	},
	click : function(e) {
		if(SCENE.mainPlayer) {
			var player = SCENE.mainPlayer,
				mouse = GAME.getMouseRelPos(e),
				gM = player.x + (player.w / 2);
			
			if(!player.onAir && ((!player.flip && mouse.x < gM) || (player.flip && mouse.x > gM))) {
				player.flip = !player.flip
				SCENE.movePlayers();
			}
			
			PLAYER.fire(player);
		}
	},
	mousemove : function(e) {
		if(SCENE.mainPlayer) {
			var mouse = GAME.getMouseRelPos(e);
			PLAYER.aimTo(SCENE.mainPlayer, mouse.x, mouse.y);
		}
	},
	getMouseRelPos : function(e) {
		var x = ((e.clientX - CANVAS.tag.offsetLeft) / CANVAS.scaleX) - SCENE.x,
			y = ((e.clientY - CANVAS.tag.offsetTop) / CANVAS.scaleY) - SCENE.y;
		
		return { x: x, y: y };
	}
};

/* player related funcs */

PLAYER = {
	/* models definitions */
	models : {
		guy : { w: 35, h: 94, ws: 1, we: 1, j: 1, g: 0.4 },
		dani : { w: 35, h: 94, ws: 2, we: 5, j: 1, g: 0.2 }
	},
	add : function(id, x, y, w, h, imgId, walkingStartFrame, walkingEndFrame, onAirFrame, gunOffset, ammo, life) {
		var player = CANVAS.add(id, x, y, w, h, null, false, LOADER.images[imgId + '1.png']);
		player.gun = CANVAS.add(id + '_gun', -50, -16, 50, 16, null, false, LOADER.images['gun.png']);
		CANVAS.demote(player.gun.id);
		player.imgId = imgId;
		player.flip = false;
		player.currentFrame = 1;
		player.gunOffset = gunOffset;
		player.walkingStartFrame = walkingStartFrame || 1;
		player.walkingEndFrame = walkingEndFrame || 1;
		player.onAirFrame = onAirFrame || 1;
		player.jump = player.onAir = false;
		player.move = player.hit = null;
		player.ammo = ammo || -1; //-1 is unlimited
		player.vSpeed = player.lastShoot = 0;
		player.life = life || 50;

		return player;
	},
	hit : function(player, damage) {
		player.life -= damage;
		if(player.life <= 0) {
			player.life = 0;
			if(player !== SCENE.mainPlayer) player.move = 0;
		}
		if(player === SCENE.mainPlayer) GAME.updateUI();
		player.hit = 1;
	},
	fire : function(player) {
		var timestamp =  new Date().getTime(),
			index = CANVAS.get(player.gun.id, true),
			bullet;
		
		if(player.ammo !== 0 && player.lastShoot < timestamp - 250) {
			player.lastShoot = timestamp;
			player.ammo --;
			bullet = CANVAS.add('bullet' + timestamp, player.gun.x + (player.gun.w * 0.5), player.gun.y + (player.gun.h / 3) + (player.gun.rotation * 0.5), 8, 2, LOADER.images[(player.flip ? 'flip_' : '') + 'bullet.png'], null, null, null, index);
			bullet.move = (player.flip ? -1 : 1);
			bullet.flip = player.flip;
			bullet.damage = 20;
			bullet.rotation = player.gun.rotation;
			SCENE.bullets.push(bullet);
			SOUND.play('shoot');
			if(player === SCENE.mainPlayer) GAME.updateUI();
		}
	},
	verticalHit : function(player) {
		var i, object;
		
		for(i in SCENE.floors) {
			object = SCENE.floors[i];
			if(player.x + (player.w * 0.7) > object.x && player.x + (player.w * 0.3) < object.x + object.w) {
				if(player.y + player.h <= object.y && player.y + player.h - player.vSpeed >= object.y) {
					return {hit: 'bottom', y: object.y};
				} else if(player.y > object.y && player.y - player.vSpeed <= object.y + object.h) {
					return {hit: 'top', y: object.y + object.h};
				}
			}
		}
		
		return false;
	},
	horizontalHit : function(player, step) {
		var objects = SCENE.floors.concat(SCENE.players),
			i, object;
		
		for(i in objects) {
			object = objects[i];
			var isFloor = SCENE.floors.indexOf(object) !== -1;
			if(object !== player && (isFloor ? object.y > player.y : object.y >= player.y) && (isFloor ? object.y < player.y + player.h : object.y <= player.y + player.h) && player.x + step + (player.w * 0.7) > object.x && player.x + step + (player.w * 0.3) < object.x + object.w) {
				return true;
			}
		}
		
		return false;
	},
	aimTo : function(player, tX, tY) {
		var dx, dy, gM = player.x + (player.w / 2),
			isInFront = ((!player.flip && tX < gM) || (player.flip && tX > gM) ? false : true),
			cursorAngle;
	
		if(player === SCENE.mainPlayer || isInFront) {
			// get relative target location
			if(tX < gM) {
				tX = gM + (gM - tX);
			}
		
			dx = tX - player.gun.x;
			dy = tY - player.gun.y;
			// determine angle, convert to degrees
			cursorAngle = 360 * (Math.atan2(dy,dx) / (2*Math.PI));
			if(player.flip) cursorAngle = (cursorAngle * -1);
			if(cursorAngle < -40) cursorAngle = -40;
			if(cursorAngle > 40) cursorAngle = 40;
			// point at cursor
			if(cursorAngle !== player.gun.rotation) player.gun.rotation = cursorAngle;
		} else {
			player.gun.rotation = 0;
		}
	}
};

/* scene related funcs */

SCENE = {
	mainPlayer : null,
	floors : null,
	players : null,
	bullets : null,
	w : null, h : null, x : null, y : null,
	load : function(scene, dontDraw) {
		var player = SCENE.mainPlayer,
			previousLife = (player ? player.life : 0),
			previousAmmo = (player ? player.ammo : 0),
			i, o, g, mp, floors = [], players = [];
		
		SCENE.clear();
		
		//mainVars
		SCENE.x = scene.x;
		SCENE.y = scene.y;
		SCENE.w = scene.w;
		SCENE.h = scene.h;
		
		if(scene.background) CANVAS.add('background', 0, 0, scene.w, scene.h, LOADER.images[scene.background + '.jpg']);
		for(i in scene.floors) {
			o = scene.floors[i];
			floors.push(CANVAS.add('floor' + i, o.x, o.y, o.w, o.h, LOADER.images[o.t + '.jpg']));
		}
		SCENE.floors = floors;
		
		if(!scene.enemies) scene.enemies = [];
		scene.enemies.push(scene.mainPlayer);
		for(i in scene.enemies) {
			o = scene.enemies[i];
			g = PLAYER.models[o.g];
			mp = (o === scene.mainPlayer)
			players.push(PLAYER.add((mp ? 'mainPlayer' : 'enemy' + i), o.x, o.y, g.w, g.h, o.g, g.ws, g.we, g.j, g.g, (mp ? previousAmmo || o.a : -1), (mp ? previousLife || o.l : o.l)));
		}
		SCENE.players = players;
		SCENE.mainPlayer = players[players.length - 1];
		
		if(!dontDraw) {
			GAME.renderUI();
		
			THREAD.start(function(draw) {
				SCENE.movePlayers();
				SCENE.moveBullets();
				if(draw) CANVAS.clear().draw();
			});
		}
	},
	clear : function() {
		THREAD.stop('moveScene');
		THREAD.stop();
		CANVAS.clear(true);
		SCENE.bullets = [];
	},
	move : function(toX) {
		var fromX = SCENE.x,
			diff = toX - fromX;
		
		THREAD.start(function(draw, i) {
			SCENE.x = fromX + (diff * i);
		}, 'moveScene', 500);
	},
	movePlayers : function() {
		var i, player, deadPlayers = [],
			step, verticalHit, horizontalHit;
		
		for(i in SCENE.players) {
			player = SCENE.players[i];
			step = (player.onAir ? 6 : 4);
			
			if(player.life > 0) {
				//enemies AI
				if(player !== SCENE.mainPlayer) {
					if(Math.round(Math.random() * 20) === 1) player.move = Math.round(Math.random() * 2) - 1;
					if(Math.round(Math.random() * 40) === 1) {
						PLAYER.aimTo(player, SCENE.mainPlayer.x, SCENE.mainPlayer.y - 50 + Math.round(Math.random() * (SCENE.mainPlayer.h + 100)));
						PLAYER.fire(player);
					}
				}
		
				if(player.move) {
					player.flip = player.move === -1;
					player.currentFrame += 0.4;
					if(player.currentFrame < player.walkingStartFrame || player.currentFrame > player.walkingEndFrame) player.currentFrame = player.walkingStartFrame;
					
					horizontalHit = PLAYER.horizontalHit(player, player.move * step)
					if(!horizontalHit) player.x += player.move * step;	
					
					if(player.x < 0) {
						player.x = 0;
						horizontalHit = true;
					} else if(player.x + player.w > SCENE.w) {
						player.x = SCENE.w - player.w;
						horizontalHit = true;
					}
					
					if(horizontalHit && !player.jump && !player.onAir) {
						player.currentFrame = 1;
					}
			
					if(player === SCENE.mainPlayer && !THREAD.t['moveScene'] && ((player.move === 1 && -SCENE.x + 640 < SCENE.w && player.x + player.w > -SCENE.x + 640 - 20) || (player.move === -1 && SCENE.x < 0 && player.x < -SCENE.x + 20))) {
						SCENE.move(SCENE.x - (player.move * 640));
					}
			
					if(!player.jump && !player.onAir && PLAYER.verticalHit(player) === false) {
						if(player === SCENE.mainPlayer) {
							player.onAir = true;
							player.vSpeed = 0;
						} else { //enemies AI
							player.move = player.move * -1;
							player.flip = player.move === -1;
							player.x += player.move * step;
						}
					}
				} else {
					player.currentFrame = 1;
				}
		
				if(player.jump && !player.onAir) {
					player.onAir = true;
					player.vSpeed = 20;
				}
		
				if(player.onAir) {
					player.currentFrame = player.onAirFrame;
					if(player.vSpeed >= -40) player.vSpeed -= 2;
					verticalHit = PLAYER.verticalHit(player);
					switch(verticalHit.hit) {
						case 'bottom':
							player.jump = player.onAir = false;
							if(player.vSpeed <= -30) {
								PLAYER.hit(player, player.vSpeed * -0.5);
							}
							player.vSpeed = 0;
							if(player.y + player.h !== verticalHit.y) player.y = verticalHit.y - player.h;
							break;
						case 'top':
							if(player.y !== verticalHit.y) player.y = verticalHit.y;
							player.vSpeed = 0;
						default:
							player.y -= player.vSpeed;
					}
				}
		
				player.scaledImage = LOADER.images[(player.flip ? 'flip_' : '') + player.imgId + Math.floor(player.currentFrame) + '.png'];
				
				if(player.flip !== player.gun.flip) player.gun.rotation = player.gun.rotation * -1;
				player.gun.flip = player.flip;
				player.gun.scaledImage = LOADER.images[(player.flip ? 'flip_' : '') + 'gun.png'];
				player.gun.x = player.x + (player.w * (player.flip ? -0.7 : 0.2));
				player.gun.y = player.y + (player.h * player.gunOffset);
			}
			
			if(player.hit) {
				if(player.hit < 8) {
					player.a = player.gun.a = 0.3 + ((Math.floor(player.hit) % 2) * 0.7);
					player.hit += 0.5;
					if(player.life === 0 && player.hit >= 8) {
						player.vSpeed = 10;
						SOUND.play('dead');
					}
				} else {
					if(player.life === 0) {
						if(CANVAS.tag.height + SCENE.y > player.y) { //fall to death
							player.vSpeed -= 2;
							player.y -= player.vSpeed;
							player.gun.y -= player.vSpeed;
						} else { //die!
							deadPlayers.push(player)
						}
					} else {
						player.hit = null;
					}
				}
			}
		};
		
		for(i in deadPlayers) {
			player = deadPlayers[i];
			CANVAS.remove(player.id);
			for(var x=0; x<SCENE.players.length; x++) {
				if(SCENE.players[x] === player) {
					SCENE.players.splice(x, 1);
					break;
				}
			}
			if(player === SCENE.mainPlayer) {
				//game over
				var i = CANVAS.add('gameOver', 70, 250, 0, 0, '#fff', true, null, 'YOU FAIL');
				i.font = 'Georgia';
				i.fontStyle = 'bold'
				i.fontSize = 72;
				i.fontShadowOffset = 4;
				SCENE.mainPlayer = null;
			}
		}
	},
	moveBullets : function() {
		var i, x, bullet, 
			ba, dx, dy,
			player, floor, dead, deadBullets = [];
		
		for(i in SCENE.bullets) {
			bullet = SCENE.bullets[i];
			dead = true;
			if((bullet.move === 1 && bullet.x <= SCENE.w) || (bullet.move === -1 && bullet.x + bullet.w >= 0)) {
				ba = 2 * Math.PI * (bullet.rotation * (bullet.flip ? -1 : 1) / 360);
				dx = bullet.move * 20 * Math.cos(ba);
				dy = 20 * Math.sin(ba);
				bullet.x += dx;
				bullet.y += dy;
				dead = false;
				
				for(x in SCENE.players) {
					player = SCENE.players[x];
					if(!player.hit && player.life > 0 && bullet.y + bullet.h > player.y && bullet.y < player.y + player.h && bullet.x >= player.x && bullet.x <= player.x + player.w) {
						PLAYER.hit(player, bullet.damage);
						if(player !== SCENE.mainPlayer) player.move = bullet.move * -1; //enemies AI
						dead = true;
						break;
					}
				}
				
				if(!dead) {
					for(x in SCENE.floors) {
						floor = SCENE.floors[x];
						if(floor.y <= bullet.y && floor.y + floor.h >= bullet.y + bullet.h && floor.x + floor.w >= bullet.x && floor.x <= bullet.x + bullet.w) {
							dead = true;
							break;
						}
					}
				}
			}
			
			if(dead) deadBullets.push(bullet);
		}
		
		for(i in deadBullets) {
			bullet = deadBullets[i];
			CANVAS.remove(bullet.id);
			for(x=0; x<SCENE.bullets.length; x++) {
				if(SCENE.bullets[x] === bullet) {
					SCENE.bullets.splice(x, 1);
					break;
				}
			}
		}
	}
};

/* levels editor */

EDITOR = {
	render : function(scene_id) {
		var scene = SCENES[scene_id];
		if(!scene) {
			scene_id = new Date().getTime();
			scene = {
				x : 0,
				y : 0,
				w : 640,
				h : 480,
				enemies : [],
				mainPlayer : { g: 'dani', x: 0, y: 0, a: 200, l: 100 }
			};
			SCENES[scene_id] = scene;
		}
		
		SCENE.load(scene, true);
		
		CANVAS.clear().draw();
	}
};

/* scenes definition */

SCENES = {
	/* example scene */
	main : {
		x : 0,
		y : 0,
		w : 1280,
		h : 480,
		background : 'wall',
		floors : [
			{ x : 0, y: 460, w: 1280, h: 20, t: 'metal'},
			{ x : 0, y: 380, w: 200, h: 20, t: 'metal'},
			{ x : 100, y: 320, w: 200, h: 20, t: 'metal'},
			{ x : 400, y: 380, w: 200, h: 20, t: 'metal'},
			{ x : 980, y: 260, w: 300, h: 20, t: 'metal'},
			{ x : 880, y: 370, w: 40, h: 20, t: 'metal'},
			{ x : 930, y: 320, w: 40, h: 20, t: 'metal'}
		],
		enemies : [
			{ g: 'guy', x: 460, y: 286, l: 50 },
			{ g: 'guy', x: 1120, y: 166, l: 50 },
			{ g: 'guy', x: 205, y: 366, l: 50 }
		],
		mainPlayer : { g: 'dani', x: 20, y: 286, a: 200, l: 100 }
	}
};

addEvent('load', LOADER.preloadImages, window);