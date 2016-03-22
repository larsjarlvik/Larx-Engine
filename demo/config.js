var config = {
    clearColor: [0.601, 0.816, 0.820, 1.0],
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
        color: [0.601, 0.816, 0.820]
    },
    water: {
        fps: 40,
        quality: 20,
        detail: 10,
        color: [0.295, 0.905, 0.823],
        waveHeight: 1.4,
        speed: 0.001,
        distortion: 2.5,
        edgeWhitening: 1.8, 
        edgeSoftening: 3.0,
        density: 0.15
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
            count: 2000,
            model: 'tree',
            tiltLimit: 12.0,
            scale: [1.0, 1.4],
            tiltToTerrain: false,
            yLimits: [1.0, 4.5],
            selectable: true,
            description: 'Spruce'
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