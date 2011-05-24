/* levels editor */

EDITOR = {
	sceneId : null,
	selectedItem : null,
	render : function(scene_id) {
		var scene = SCENES[scene_id];
		if(!scene) {
			scene_id = new Date().getTime();
			scene = {
				x : 0,
				y : 0,
				w : 1280,
				h : 480,
				enemies : [],
				mainPlayer : { g: 'dani', x: 0, y: 4, a: 200, l: 100 }
			};
			SCENES[scene_id] = scene;
		}
		
		EDITOR.sceneId = scene_id;
		
		SCENE.load(scene, true);
		CANVAS.tag.width = scene.w;
		CANVAS.tag.height = scene.h;
		$('main').className = 'edit';
		EDITOR.selectedItem = CANVAS.get('background');
		EDITOR.renderGrid();
		EDITOR.renderInspector();
		
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
	},
	renderInspector : function() {
		var item = EDITOR.selectedItem,
			j_item,
			h1 = cE('h1'),
			dest = $('inspector'),
			rf = function(label, value) {
				var p = cE('p'),
					l = cE('label'),
					i = cE('input');

				l.innerHTML = label;
				p.appendChild(l);
				i.value = value;
				p.appendChild(i);
				dest.appendChild(p)
			};
		
		emptyNode(dest);
		
		h1.innerHTML = item.id;
		dest.appendChild(h1);
		
		rf('x', item.x);
		rf('y', item.y);
		rf('w', item.w);
		rf('h', item.h);
		if(item.id === 'background') {
			j_item = SCENES[EDITOR.sceneId];
			rf('t', j_item.background || '');
		}
		
	}
};

EDITOR.render();
