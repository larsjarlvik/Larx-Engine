var config = {
    targetFps: 60,
    clearColor: [0.0, 0.0, 0.0, 1.0],
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
        moveSpeed: 0.5,
        rotationSpeed: 3.0,
        default: {
            zoom: 65,
            look: { x: -25, y: 0, z: -25 },
            rotation: { v: 35, h: 45 }
        }
    },
    trees: {
        count: 800,
        model: 'tree',
        tiltLimit: 12.0,
        yLimits: [1.0, 3.5]
    },
    fog: {
        density: 0.0017,
        gradient: 1.3,
        color: [0.601, 0.816, 0.820]
    },
    water: {
        quality: 40,
        detail: 1.0,
        color: [0.195, 0.805, 0.723],
        reflectionColor: [0.0, 0.235, 0.520],
        waveHeight: 0.25,
        speed: 0.5,
        distortion: 2.5
    },
    terrain: {
        path: '/maps/test',
        elevation: 8.0,
        waterLevel: 1.5,
        shininess: 4.0,
        specularWeight: 0.35
    },
    decorations: [
        {
            count: 550,
            model: 'tree',
            tiltLimit: 12.0,
            scale: [1.0, 1.4],
            tiltToTerrain: false,
            yLimits: [1.0, 3.5],
            selectable: true,
            description: 'Spruce'
        },
        {
            count: 50,
            model: 'rock-1',
            tiltLimit: 0.0,
            scale: [0.8, 2.0],
            tiltToTerrain: true,
            yLimits: [-3.0, 0.5],
            selectable: true,
            description: 'Flat rock'
        },
        {
            count: 50,
            model: 'rock-2',
            tiltLimit: 0.0,
            scale: [0.8, 2.0],
            tiltToTerrain: true,
            yLimits: [-3.0, 0.5],
            selectable: true,
            description: 'Round rock'
        },
        {
            count: 100,
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