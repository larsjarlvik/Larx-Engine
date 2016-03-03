var config = {
    targetFps: 60,
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
        zoomSpeed: 5.0,
        moveSpeed: 2.5,
        rotationSpeed: 0.35,
        default: {
            zoom: 65,
            look: { x: -25, y: 0, z: -25 },
            rotation: { v: 35, h: 45 }
        }
    },
    fog: {
        density: 0.0017,
        gradient: 1.3,
        color: [0.601, 0.816, 0.820]
    },
    water: {
        quality: 50,
        detail: 1.0,
        color: [0.195, 0.805, 0.723],
        reflectionColor: [0.098, 0.535, 0.520],
        waveHeight: 1.2,
        speed: 0.5,
        distortion: 2.5,
        edgeWhitening: 3.0, 
        edgeSoftening: 3.0,
        density: 0.03
    },
    terrain: {
        path: '/maps/test',
        elevation: 8.0,
        waterLevel: 1.5,
        shininess: 4.0,
        specularWeight: 0.65
    },
    decorations: [
        {
            count: 4000,
            model: 'tree',
            tiltLimit: 12.0,
            scale: [1.0, 1.4],
            tiltToTerrain: false,
            yLimits: [0.7, 3.5],
            selectable: true,
            description: 'Spruce'
        },
        {
            count: 350,
            model: 'rock-1',
            tiltLimit: 0.0,
            scale: [0.8, 2.0],
            tiltToTerrain: false,
            yLimits: [-3.0, 1.5],
            selectable: true,
            description: 'Flat rock'
        },
        {
            count: 350,
            model: 'rock-2',
            tiltLimit: 0.0,
            scale: [0.8, 2.0],
            tiltToTerrain: false,
            yLimits: [-3.0, 1.5],
            selectable: true,
            description: 'Round rock'
        },
        {
            count: 50,
            model: 'crate',
            scale: [1.0, 1.0],
            tiltLimit: 0.0,
            tiltToTerrain: true,
            yLimits: [0.5, 3.5],
            selectable: true,
            description: 'Crate'
        }
    ]
    
};