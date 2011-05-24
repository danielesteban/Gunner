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
				mainPlayer : { g: 'dani', x: 0, y: 4, a: 200, l: 100 }
			};
			SCENES[scene_id] = scene;
		}
		
		SCENE.load(scene, true);
		EDITOR.renderGrid();
		addEvent('resize', EDITOR.renderGrid, window);
		
		THREAD.start(function(draw) {
			if(draw) CANVAS.clear().draw();
		});
	},
	renderGrid : function() {
		var c = cE('canvas'),
			ctx = c.getContext("2d");
		
		c.width = 20 * CANVAS.scaleX;
	 	c.height = 20 * CANVAS.scaleY;
		ctx.globalAlpha = 0.25;
		ctx.fillStyle = '#ff0';
		ctx.fillRect(0, 0, c.width, c.height);
		ctx.clearRect(CANVAS.scaleX, CANVAS.scaleY, c.width - (CANVAS.scaleX * 2), c.height - (CANVAS.scaleY * 2));
		c.src = 'editorGrid' + c.width + '_' + c.height;
		
		if(CANVAS.get('editorGrid', true) !== false) CANVAS.remove('editorGrid');
		CANVAS.add('editorGrid', 0, 0, SCENE.w, SCENE.h, c, null, null, null, CANVAS.get('background', true));
	}
};

EDITOR.render();
