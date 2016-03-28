var config = {
	clearColor: [0.768, 1.0, 0.992, 1.0],
	mapScale: 5.0,
	mouse: {
		size: [0.5, 0.0, 0.5],
		precision: 0.5,
		colors: {
			default: [1.0, 1.0, 1.0],
			hightlight: [1.0, 1.0, 0.0],
			selection: [0.0, 1.0, 0.0]
		} 
	},
	camera: {
		zoomSpeed: 0.1,
		moveSpeed: 0.4,
		rotationSpeed: 0.7,
		default: {
			zoom: 125,
			look: { x: 0, y: 0, z: 0 },
			rotation: { v: 35, h: 45 }
		}
	},
	fog: {
		density: 0.002,
		gradient: 6.0,
		color: [0.768, 1.0, 0.992]
	},
	water: {
		fps: 20,
		quality: 48,
		detail: 10,
		color: [0.265, 0.503, 0.453],
		waveHeight: 0.5,
		speed: 0.0005,
		distortion: 0.9,
		edgeWhitening: 2.0, 
		edgeSoftening: 4.0,
		density: 0.08
	},
	terrain: {
		path: '/maps/test',
		elevation: 8.0,
		waterLevel: 1.5,
		shininess: 8.0,
		specularWeight: 0.1
	},
	decorations: [
		{
			count: 1000,
			model: 'tree-2',
			tiltLimit: 12.0,
			scale: [1.0, 1.4],
			tiltToTerrain: false,
			yLimits: [1.0, 3.5],
			selectable: true,
			description: 'Tree'
		},
		{
			count: 500,
			model: 'tree-1',
			tiltLimit: 12.0,
			scale: [1.0, 1.4],
			tiltToTerrain: false,
			yLimits: [1.0, 3.5],
			selectable: true,
			description: 'Tree'
		},
		{
			count: 500,
			model: 'tree-3',
			tiltLimit: 12.0,
			scale: [1.0, 1.4],
			tiltToTerrain: false,
			yLimits: [0.3, 1.4],
			selectable: true,
			description: 'Palm'
		},
		{
			count: 500,
			model: 'rock-1',
			tiltLimit: 0.0,
			scale: [0.5, 3.0],
			tiltToTerrain: false,
			yLimits: [-1.5, 1.5],
			selectable: true,
			description: 'Flat rock'
		},
		{
			count: 1000,
			model: 'rock-2',
			tiltLimit: 0.0,
			scale: [0.8, 2.0],
			tiltToTerrain: false,
			yLimits: [-1.5, 1.5],
			selectable: true,
			description: 'Round rock'
		},
		{
			count: 50,
			model: 'crate',
			scale: [1.0, 1.0],
			tiltLimit: 0.0,
			tiltToTerrain: true,
			yLimits: [0.5, 2.5],
			selectable: true,
			description: 'Crate'
		}
	],
	smallDecorationFadeOut: 0.007,
	smallDecorations: [
		{
			count: 12000,
			model: 'grass',
			tiltLimit: 0.0,
			scale: [1.0, 1.4],
			tiltToTerrain: false,
			yLimits: [0.2, 2.7],
			description: 'Grass'
		},
		{
			count: 2000,
			model: 'mushroom',
			tiltLimit: 12.0,
			scale: [1.0, 2.0],
			tiltToTerrain: false,
			yLimits: [0.6, 2.0],
			description: 'Mushroom'
		},
		{
			count: 5000,
			model: 'rock-small',
			tiltLimit: 12.0,
			scale: [1.0, 2.0],
			tiltToTerrain: false,
			yLimits: [-0.3, 1.5],
			description: 'Mushroom'
		}
	]
};