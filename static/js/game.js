function $(a){return document.getElementById(a)}function cE(a){return document.createElement(a)}function addEvent(c,b,a){if(a.addEventListener){a.addEventListener(c,b,false)}else{a.attachEvent("on"+c,b)}}function removeEvent(c,b,a){if(a.removeEventListener){a.removeEventListener(c,b,false)}else{a.detachEvent("on"+c,b)}}function arraySearch(d,e,b,a){for(var c in d){if(d[c][b]===e){if(a){return parseInt(c,10)}else{return d[c]}}}return false}function cancelHandler(a){a.cancelBubble=true;a.returnValue=false;if(a.stopPropagation){a.stopPropagation()}if(a.preventDefault){a.preventDefault()}return false}function renderScript(c){var a=cE("script"),b=document.getElementsByTagName("script")[0];a.type="text/javascript";a.async=true;a.src=c;b.parentNode.insertBefore(a,b)}function emptyNode(a){while(a.firstChild){a.removeChild(a.firstChild)}}function show(a){a.style.display="block"}function hide(a){a.style.display="none"}PATTERN_CACHE={};function genPattern(e,d,a){var f=e.src+d+a;if(PATTERN_CACHE[f]){return PATTERN_CACHE[f]}var c=cE("canvas"),b=c.getContext("2d");c.width=Math.ceil(d);c.height=Math.ceil(a);b.fillStyle=b.createPattern(e,"repeat");b.fillRect(0,0,d,a);PATTERN_CACHE[f]=c;return c}SCALED_CACHE={};function genScaledImage(f,e,d,a){f=f+d+a;if(SCALED_CACHE[f]){return SCALED_CACHE[f]}var c=cE("canvas"),b=c.getContext("2d");c.width=Math.ceil(d);c.height=Math.ceil(a);b.drawImage(e,0,0,e.width,e.height,0,0,d,a);SCALED_CACHE[f]=c;return c}function flip_image(c){var b=cE("canvas"),a=b.getContext("2d");b.width=c.width;b.height=c.height;a.scale(-1,1);a.drawImage(c,c.width*-1,0,c.width,c.height);b.src=c.src;return b}CANVAS={tag:null,ctx:null,items:[],scaleX:1,scaleY:1,init:function(d,a,b){var e=cE("canvas");e.width=d;e.height=a;b.appendChild(e);CANVAS.ctx=e.getContext("2d");CANVAS.tag=e},add:function(a,g,f,i,c,j,b,e,k,d){var l={id:a,x:g,y:f,w:i,h:c,a:1,fillStyle:j,scaledImage:e,fixed:b,text:k,font:"Arial",fontSize:12,fontStyle:"",fontShadowOffset:2,rotation:0,draw:function(m){var n=this.x+(this.fixed?0:SCENE.x),h=this.y+(this.fixed?0:SCENE.y),o=this.w*CANVAS.scaleX,p=this.h*CANVAS.scaleY,q=this.fontSize*CANVAS.scaleX;if(this.rotation!==0){if(this.flip){h-=this.rotation*0.5}else{h-=this.rotation*0.3}if(this.rotation>0){n+=this.rotation*0.3}}n=n*CANVAS.scaleX;h=h*CANVAS.scaleY;if(this.rotation!==0){m.save();m.translate(n,h);m.rotate(this.rotation*Math.PI/180);n=h=0}m.globalAlpha=this.a;if(this.text){m.textBaseline="bottom";m.font=this.fontStyle+" "+q+"pt "+this.font;m.fillStyle=this.shadowColor||"#000";m.fillText(this.text,n+this.fontShadowOffset,h+this.fontShadowOffset);m.fillStyle=this.fillStyle;m.fillText(this.text,n,h)}else{if(this.scaledImage){m.drawImage(genScaledImage((this.flip?"f_":"")+this.scaledImage.src,this.scaledImage,o,p),n,h)}else{if(typeof this.fillStyle!=="object"){m.fillStyle=this.fillStyle;m.fillRect(n,h,o,p)}else{m.drawImage(genPattern(this.fillStyle,o,p),n,h)}}}if(this.rotation!==0){m.restore()}}};if(d){CANVAS.items.splice(d,0,l)}else{CANVAS.items.push(l)}return l},get:function(b,a){return arraySearch(CANVAS.items,b,"id",a)},remove:function(a){CANVAS.items.splice(CANVAS.get(a,true),1)},promote:function(c){var a=CANVAS.get(c,true),b;if(a<CANVAS.items.length-1){b=CANVAS.items.splice(a,1)[0];CANVAS.items.splice(a,0,b)}},demote:function(c){var a=CANVAS.get(c,true),b;if(a>0){b=CANVAS.items.splice(a,1)[0];CANVAS.items.splice(a-1,0,b)}},draw:function(){for(var a in CANVAS.items){CANVAS.items[a].draw(CANVAS.ctx)}},clear:function(a){CANVAS.ctx.clearRect(0,0,CANVAS.tag.width,CANVAS.tag.height);if(a){CANVAS.items=[]}return CANVAS}};THREAD={t:{},start:function(b,f,d){var c=25,e=0,a=Math.round(1000/c);if(d>0){e=Math.round(d/a)}b=function(g,h){return function(i,j){g(i,(h>0?Math.sin(j/h*Math.PI/2):j))}}(b,e);f=f||"mainThread";THREAD.stop(f);THREAD.t[f]=setInterval(function(h,l,i,g){var k=0,j=new Date().getTime();return function(){var m=(k*g),n=new Date().getTime()-j-m-g;while(n>g){n-=g;h(false,++k)}h(true,++k);if(i>0&&k>=i){THREAD.stop(l);h(true,i)}}}(b,f,e,a),a)},stop:function(a){a=a||"mainThread";if(THREAD.t[a]){clearInterval(THREAD.t[a]);THREAD.t[a]=null}}};SOUND={muted:false,channels:[],toggle:function(){for(var a in SOUND.channels){SOUND.destroy(a)}SOUND.muted=!SOUND.muted;GAME.updateUI();document.cookie="mute="+(SOUND.muted?1:0)+";expires="+(new Date(new Date().getTime()+(3600*24*365*7*1000)).toGMTString())+";"},play:function(d,b){if(!b&&SOUND.muted){return}var a=LOADER.sounds[d].cloneNode(true),c=new Date().getTime();addEvent("ended",function(f){SOUND.destroy(c)},a);a.volume=0.4;SOUND.channels[c]=a;if(SOUND.channels.length>5){for(c in SOUND.channels){SOUND.destroy(c);break}}a.play()},destroy:function(a){SOUND.channels[a].pause();SOUND.channels[a].src="";delete SOUND.channels[a]},getMuteCookie:function(){var b=document.cookie.split(";"),a,d;for(a in b){d=b[a].split("=");if(d[0]==="mute"){SOUND.muted=(parseInt(d[1],10)===1?true:false);break}}}};LOADER={images:{loaded:0},sounds:{loaded:0},preloadImages:function(){var f="static/img/",e=["metal.jpg","wall.jpg"],a=["guy1.png","dani1.png","dani2.png","dani3.png","dani4.png","dani5.png","bullet.png","gun.png"],c=e.concat(a),g,b,d;$("loading").innerHTML="Loading Images... 1/"+c.length;for(d in c){g=c[d];b=new Image();addEvent("load",function(h){return function(i){LOADER.images[h]=this;if(a.indexOf(h)!==-1){LOADER.images["flip_"+h]=flip_image(this)}LOADER.images.loaded++;$("loading").innerHTML="Loading Images... "+LOADER.images.loaded+"/"+c.length;if(LOADER.images.loaded===c.length){setTimeout(LOADER.preloadSounds,0)}}}(g),b);b.src=f+g}},preloadSounds:function(){var c="static/snd/",b=["shoot","dead"],e,a,d;$("loading").innerHTML="Loading Sounds... 1/"+b.length;for(d in b){e=b[d];a=cE("audio");a.autoplay=a.muted=true;a.addEventListener("canplaythrough",function(f){return function(g){if(g.target.readyState===4&&!LOADER.sounds[f]){LOADER.sounds[f]=this;$("main").removeChild(this);LOADER.sounds.loaded++;$("loading").innerHTML="Loading Sounds... "+LOADER.sounds.loaded+"/"+b.length;if(LOADER.sounds.loaded===b.length){setTimeout(LOADER.init,0)}}}}(e),true);a.src=c+e+"."+(a.canPlayType("audio/ogg")?"ogg":"mp3");$("main").appendChild(a)}},init:function(){CANVAS.init(640,480,$("main"));var b=document.location.hash.substr(2).split("/");if(b[0]==="editor"){var a=cE("div");a.id="inspector";$("main").parentNode.appendChild(a);renderScript("static/js/editor.js?"+(new Date().getTime()/1000))}else{addEvent("keydown",GAME.keydown,window);addEvent("keyup",GAME.keyup,window);addEvent("click",GAME.click,window);addEvent("mousemove",GAME.mousemove,window);GAME.onResize();addEvent("resize",GAME.onResize,window);SOUND.getMuteCookie();GAME.renderSplashScreen()}hide($("loading"));show($("main"))}};GAME={lastKeyPressed:null,renderSplashScreen:function(){var a;THREAD.stop();CANVAS.clear(true);hide($("mute"));show($("newGame"));a=CANVAS.add("title",80,200,0,0,"#fff",null,null,"GUNNER");a.font="Georgia";a.fontStyle="bold";a.fontSize=72;a.fontShadowOffset=4;a=CANVAS.add("btb1",190,a.y+30,260,60,"#000");CANVAS.add("btbg1",a.x+2,a.y+2,a.w-4,a.h-4,"#000");a=CANVAS.add("bttxt",a.x+72,a.y+40,a.w-4,a.h-4,"#fff",null,null,"Start Game");a.font="Arial Black";a.fontSize=14;a=CANVAS.add("version",355,455,0,0,"#fff",null,null,"An html5 crappy platform game by D. Esteban - v0.1");a.fontSize=9;THREAD.start(function(b){if(b){CANVAS.clear().draw()}})},renderUI:function(){var b=10,a;a=CANVAS.add("lifeLabel",15,b+18,0,0,"#fff",true,null,"1UP");a=CANVAS.add("lifeBarBorder",a.x+45,b,160,20,"#fff",true);CANVAS.add("lifeBarBg",a.x+2,b+2,156,16,"#000",true);CANVAS.add("lifeBar",a.x+2,b+2,0,16,"#aa7b3f",true);a=CANVAS.add("ammoLabel",a.x+180,b+18,0,0,"#fff",true);a=CANVAS.add("soundLabel",a.x+290,b+18,0,0,"#fff",true);GAME.updateUI()},updateUI:function(){if(SCENE.mainPlayer){CANVAS.get("lifeBar").w=SCENE.mainPlayer.life*1.56;CANVAS.get("ammoLabel").text="AMMO "+SCENE.mainPlayer.ammo}CANVAS.get("soundLabel").text="SOUND "+(SOUND.muted?"OFF":"ON")},start:function(){hide($("newGame"));show($("mute"));SCENE.load(SCENES.main)},onResize:function(){var w,h,ml=0,mt=0;if(document.documentElement&&document.documentElement.clientHeight){w=document.documentElement.clientWidth;h=document.documentElement.clientHeight}else{w=document.body.clientWidth;h=document.body.clientHeight}if(w>h){ml=w;w=640*h/480;ml=(ml-w)/2}else{mt=h;h=480*w/640;mt=(mt-h)/2}with($("main").style){marginTop=mt+"px";marginLeft=ml+"px";width=CANVAS.tag.width=w;height=CANVAS.tag.height=h}CANVAS.scaleX=w/640;CANVAS.scaleY=h/480;with($("newGame").style){width=(260*CANVAS.scaleX)+"px";height=(60*CANVAS.scaleY)+"px";top=(290*CANVAS.scaleY)+"px";marginTop=(-60*CANVAS.scaleY)+"px";marginLeft=(188*CANVAS.scaleX)+"px"}with($("mute").style){width=(107*CANVAS.scaleX)+"px";height=(25*CANVAS.scaleY)+"px";top=(32*CANVAS.scaleY)+"px";marginTop=(-25*CANVAS.scaleY)+"px";marginLeft=(523*CANVAS.scaleX)+"px"}CANVAS.clear().draw()},keydown:function(d){var c=d.keyCode?d.keyCode:d.which;if(SCENE.mainPlayer){var a=[37,38,39,65,87,68,32,13],b=SCENE.mainPlayer;if(a.indexOf(c)!==-1){cancelHandler(d)}if(GAME.lastKeyPressed!==c){GAME.lastKeyPressed=c;if(c===37||c===65){b.move=-1}else{if(c===39||c===68){b.move=1}else{if((c===38||c===87)&&!b.jump){b.jump=true}else{if(c===32){PLAYER.fire(b)}}}}}}else{if(c===13||c===32){GAME.start()}}},keyup:function(d){if(!SCENE.mainPlayer){return}var a=[37,38,39,65,87,68,32,13],c=d.keyCode?d.keyCode:d.which,b=SCENE.mainPlayer;if(a.indexOf(c)!==-1){cancelHandler(d)}if(c===GAME.lastKeyPressed){GAME.lastKeyPressed=null}if(((c===37||c===65)&&b.move===-1)||((c===39||c===68)&&b.move===1)){b.move=null}},click:function(d){if(SCENE.mainPlayer){var b=SCENE.mainPlayer,a=GAME.getMouseRelPos(d),c=b.x+(b.w/2);if(!b.onAir&&((!b.flip&&a.x<c)||(b.flip&&a.x>c))){b.flip=!b.flip;SCENE.movePlayers()}PLAYER.fire(b)}},mousemove:function(b){if(SCENE.mainPlayer){var a=GAME.getMouseRelPos(b);PLAYER.aimTo(SCENE.mainPlayer,a.x,a.y)}},getMouseRelPos:function(b){var a=((b.clientX-CANVAS.tag.offsetLeft)/CANVAS.scaleX)-SCENE.x,c=((b.clientY-CANVAS.tag.offsetTop)/CANVAS.scaleY)-SCENE.y;return{x:a,y:c}}};PLAYER={models:{guy:{w:35,h:94,ws:1,we:1,j:1,g:0.4},dani:{w:35,h:94,ws:2,we:5,j:1,g:0.2}},add:function(b,k,i,m,e,a,l,c,d,g,f,j){var n=CANVAS.add(b,k,i,m,e,null,false,LOADER.images[a+"1.png"]);n.gun=CANVAS.add(b+"_gun",-50,-16,50,16,null,false,LOADER.images["gun.png"]);CANVAS.demote(n.gun.id);n.imgId=a;n.flip=false;n.currentFrame=1;n.gunOffset=g;n.walkingStartFrame=l||1;n.walkingEndFrame=c||1;n.onAirFrame=d||1;n.jump=n.onAir=false;n.move=n.hit=null;n.ammo=f||-1;n.vSpeed=n.lastShoot=0;n.life=j||50;return n},hit:function(a,b){a.life-=b;if(a.life<=0){a.life=0;if(a!==SCENE.mainPlayer){a.move=0}}if(a===SCENE.mainPlayer){GAME.updateUI()}a.hit=1},fire:function(c){var d=new Date().getTime(),b=CANVAS.get(c.gun.id,true),a;if(c.ammo!==0&&c.lastShoot<d-250){c.lastShoot=d;c.ammo--;a=CANVAS.add("bullet"+d,c.gun.x+(c.gun.w*0.5),c.gun.y+(c.gun.h/3)+(c.gun.rotation*0.5),8,2,LOADER.images[(c.flip?"flip_":"")+"bullet.png"],null,null,null,b);a.move=(c.flip?-1:1);a.flip=c.flip;a.damage=20;a.rotation=c.gun.rotation;SCENE.bullets.push(a);SOUND.play("shoot");if(c===SCENE.mainPlayer){GAME.updateUI()}}},verticalHit:function(c){var b,a;for(b in SCENE.floors){a=SCENE.floors[b];if(c.x+(c.w*0.7)>a.x&&c.x+(c.w*0.3)<a.x+a.w){if(c.y+c.h<=a.y&&c.y+c.h-c.vSpeed>=a.y){return{hit:"bottom",y:a.y}}else{if(c.y>a.y&&c.y-c.vSpeed<=a.y+a.h){return{hit:"top",y:a.y+a.h}}}}}return false},horizontalHit:function(c,d){var e=SCENE.floors.concat(SCENE.players),b,a;for(b in e){a=e[b];var f=SCENE.floors.indexOf(a)!==-1;if(a!==c&&(f?a.y>c.y:a.y>=c.y)&&(f?a.y<c.y+c.h:a.y<=c.y+c.h)&&c.x+d+(c.w*0.7)>a.x&&c.x+d+(c.w*0.3)<a.x+a.w){return true}}return false},aimTo:function(e,a,h){var c,b,g=e.x+(e.w/2),f=((!e.flip&&a<g)||(e.flip&&a>g)?false:true),d;if(e===SCENE.mainPlayer||f){if(a<g){a=g+(g-a)}c=a-e.gun.x;b=h-e.gun.y;d=360*(Math.atan2(b,c)/(2*Math.PI));if(e.flip){d=(d*-1)}if(d<-40){d=-40}if(d>40){d=40}if(d!==e.gun.rotation){e.gun.rotation=d}}else{e.gun.rotation=0}}};SCENE={mainPlayer:null,floors:null,players:null,bullets:null,w:null,h:null,x:null,y:null,load:function(k,a){var m=SCENE.mainPlayer,f=(m?m.life:0),c=(m?m.ammo:0),j,d,l,e,h=[],b=[];SCENE.clear();SCENE.x=k.x;SCENE.y=k.y;SCENE.w=k.w;SCENE.h=k.h;CANVAS.add("background",0,0,k.w,k.h,(k.background?LOADER.images[k.background+".jpg"]:"0"));for(j in k.floors){d=k.floors[j];h.push(CANVAS.add("floor"+j,d.x,d.y,d.w,d.h,LOADER.images[d.t+".jpg"]))}SCENE.floors=h;if(!k.enemies){k.enemies=[]}k.enemies.push(k.mainPlayer);for(j in k.enemies){d=k.enemies[j];l=PLAYER.models[d.g];e=(d===k.mainPlayer);b.push(PLAYER.add((e?"mainPlayer":"enemy"+j),d.x,d.y,l.w,l.h,d.g,l.ws,l.we,l.j,l.g,(e?c||d.a:-1),(e?f||d.l:d.l)))}SCENE.players=b;SCENE.mainPlayer=b[b.length-1];if(!a){GAME.renderUI();THREAD.start(function(g){SCENE.movePlayers();SCENE.moveBullets();if(g){CANVAS.clear().draw()}})}},clear:function(){THREAD.stop("moveScene");THREAD.stop();CANVAS.clear(true);SCENE.bullets=[]},move:function(c){var b=SCENE.x,a=c-b;THREAD.start(function(d,e){SCENE.x=b+(a*e)},"moveScene",500)},movePlayers:function(){var c,b,f=[],d,g,e;for(c in SCENE.players){b=SCENE.players[c];d=(b.onAir?6:4);if(b.life>0){if(b!==SCENE.mainPlayer&&b.x+b.w>=-SCENE.x&&b.x<-SCENE.x+640&&b.y+b.h>=-SCENE.y&&b.y<-SCENE.y+480){if(Math.round(Math.random()*20)===1){b.move=Math.round(Math.random()*2)-1}if(Math.round(Math.random()*40)===1){PLAYER.aimTo(b,SCENE.mainPlayer.x,SCENE.mainPlayer.y-50+Math.round(Math.random()*(SCENE.mainPlayer.h+100)));PLAYER.fire(b)}}if(b.move){b.flip=b.move===-1;b.currentFrame+=0.4;if(b.currentFrame<b.walkingStartFrame||b.currentFrame>b.walkingEndFrame){b.currentFrame=b.walkingStartFrame}e=PLAYER.horizontalHit(b,b.move*d);if(!e){b.x+=b.move*d}if(b.x<0){b.x=0;e=true}else{if(b.x+b.w>SCENE.w){b.x=SCENE.w-b.w;e=true}}if(e&&!b.jump&&!b.onAir){b.currentFrame=1}if(b===SCENE.mainPlayer&&!THREAD.t.moveScene&&((b.move===1&&-SCENE.x+640<SCENE.w&&b.x+b.w>-SCENE.x+640-20)||(b.move===-1&&SCENE.x<0&&b.x<-SCENE.x+20))){SCENE.move(SCENE.x-(b.move*640))}if(!b.jump&&!b.onAir&&PLAYER.verticalHit(b)===false){if(b===SCENE.mainPlayer){b.onAir=true;b.vSpeed=0}else{b.move=b.move*-1;b.flip=b.move===-1;b.x+=b.move*d}}}else{b.currentFrame=1}if(b.jump&&!b.onAir){b.onAir=true;b.vSpeed=20}if(b.onAir){b.currentFrame=b.onAirFrame;if(b.vSpeed>=-40){b.vSpeed-=2}g=PLAYER.verticalHit(b);switch(g.hit){case"bottom":b.jump=b.onAir=false;if(b.vSpeed<=-30){PLAYER.hit(b,b.vSpeed*-0.5)}b.vSpeed=0;if(b.y+b.h!==g.y){b.y=g.y-b.h}break;case"top":if(b.y!==g.y){b.y=g.y}b.vSpeed=0;default:b.y-=b.vSpeed}}b.scaledImage=LOADER.images[(b.flip?"flip_":"")+b.imgId+Math.floor(b.currentFrame)+".png"];if(b.flip!==b.gun.flip){b.gun.rotation=b.gun.rotation*-1}b.gun.flip=b.flip;b.gun.scaledImage=LOADER.images[(b.flip?"flip_":"")+"gun.png"];b.gun.x=b.x+(b.w*(b.flip?-0.7:0.2));b.gun.y=b.y+(b.h*b.gunOffset)}if(b.hit){if(b.hit<8){b.a=b.gun.a=0.3+((Math.floor(b.hit)%2)*0.7);b.hit+=0.5;if(b.life===0&&b.hit>=8){b.vSpeed=10;SOUND.play("dead")}}else{if(b.life===0){if(CANVAS.tag.height+SCENE.y>b.y){b.vSpeed-=2;b.y-=b.vSpeed;b.gun.y-=b.vSpeed}else{f.push(b)}}else{b.hit=null}}}}for(c in f){b=f[c];CANVAS.remove(b.id);for(var a=0;a<SCENE.players.length;a++){if(SCENE.players[a]===b){SCENE.players.splice(a,1);break}}if(b===SCENE.mainPlayer){var c=CANVAS.add("gameOver",70,250,0,0,"#fff",true,null,"YOU FAIL");c.font="Georgia";c.fontStyle="bold";c.fontSize=72;c.fontShadowOffset=4;SCENE.mainPlayer=null}}},moveBullets:function(){var c,g,a,e,k,j,h,d,f,b=[];for(c in SCENE.bullets){a=SCENE.bullets[c];f=true;if((a.move===1&&a.x<=SCENE.w)||(a.move===-1&&a.x+a.w>=0)){e=2*Math.PI*(a.rotation*(a.flip?-1:1)/360);k=a.move*20*Math.cos(e);j=20*Math.sin(e);a.x+=k;a.y+=j;f=false;for(g in SCENE.players){h=SCENE.players[g];if(!h.hit&&h.life>0&&a.y+a.h>h.y&&a.y<h.y+h.h&&a.x>=h.x&&a.x<=h.x+h.w){PLAYER.hit(h,a.damage);if(h!==SCENE.mainPlayer){h.move=a.move*-1}f=true;break}}if(!f){for(g in SCENE.floors){d=SCENE.floors[g];if(d.y<=a.y&&d.y+d.h>=a.y+a.h&&d.x+d.w>=a.x&&d.x<=a.x+a.w){f=true;break}}}}if(f){b.push(a)}}for(c in b){a=b[c];CANVAS.remove(a.id);for(g=0;g<SCENE.bullets.length;g++){if(SCENE.bullets[g]===a){SCENE.bullets.splice(g,1);break}}}}};SCENES={main:{x:0,y:0,w:1280,h:480,background:"wall",floors:[{x:0,y:460,w:1280,h:20,t:"metal"},{x:0,y:380,w:200,h:20,t:"metal"},{x:100,y:320,w:200,h:20,t:"metal"},{x:400,y:380,w:200,h:20,t:"metal"},{x:980,y:260,w:300,h:20,t:"metal"},{x:880,y:370,w:40,h:20,t:"metal"},{x:930,y:320,w:40,h:20,t:"metal"}],enemies:[{g:"guy",x:460,y:286,l:50},{g:"guy",x:1120,y:166,l:50},{g:"guy",x:205,y:366,l:50}],mainPlayer:{g:"dani",x:20,y:286,a:200,l:100}}};addEvent("load",LOADER.preloadImages,window);