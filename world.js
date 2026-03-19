/**
 * SYSTEMA | World & Map Engine (Data-Driven)
 * Fetches map layouts and collision data from data.json
 */

const World = {
    tileSheet: new Image(),
    isLoaded: false,
    tileSize: 16,
    
    // Data stores
    mapData: null,
    currentMap: null,
    
    // Rendering buffers
    bgCanvas: document.createElement('canvas'),
    bgCtx: null,

    /**
     * Initialize World, Load Sprites, and Fetch JSON Data
     */
    async init() {
        // 1. Load the Spritesheet
        this.tileSheet.src = 'assets/system_sprites.png';
        
        // 2. Fetch the Game Data
        try {
            const response = await fetch('data.json');
            this.mapData = await response.json();
            console.log("SYSTEM DATA: [Retrieved]");
        } catch (error) {
            console.error("SYSTEM ERROR: Failed to load data.json", error);
        }

        this.tileSheet.onload = () => {
            this.isLoaded = true;
            // Set up the offscreen background buffer
            this.bgCanvas.width = 320;
            this.bgCanvas.height = 192;
            this.bgCtx = this.bgCanvas.getContext('2d');
            
            // Start at Home
            this.loadMap('home');
        };
    },

    /**
     * Switch maps using the JSON definitions
     */
    loadMap(mapName) {
        if (!this.mapData) return;

        this.currentMap = this.mapData.maps[mapName];
        if (!this.currentMap) {
            console.error(`MAP ERROR: ${mapName} not found in database.`);
            return;
        }

        console.log(`SYSTEM: Entering [${this.currentMap.name}]`);
        this.preRenderMap();
        
        // Reset player position if needed (Example: spawn at center)
        if (typeof Player !== 'undefined') {
            Player.x = 160; 
            Player.y = 100;
        }
    },

    /**
     * Performance Optimization: Draw the map once to a buffer
     */
    preRenderMap() {
        if (!this.bgCtx || !this.currentMap) return;
        
        this.bgCtx.clearRect(0, 0, 320, 192);
        const grid = this.currentMap.grid;

        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[row].length; col++) {
                const tileID = grid[row][col];
                this.drawTile(this.bgCtx, tileID, col * this.tileSize, row * this.tileSize);
            }
        }
    },

    /**
     * Logic for clipping sprites from system_sprites.png
     */
    drawTile(ctx, id, x, y) {
        if (!this.isLoaded) return;

        // Sprite Sheet Mapping (Adjusted to match system_sprites.png layout)
        let sx = 0, sy = 0;

        switch(id) {
            case 0: sx = 16; sy = 240; break;  // Interior Floor
            case 1: sx = 16; sy = 208; break;  // Dark Wall
            case 2: sx = 256; sy = 832; break; // Office Desk/Laptop
            case 3: sx = 16; sy = 800; break;  // Bed
            case 4: sx = 656; sy = 240; break; // Sidewalk/Concrete
        }

        ctx.drawImage(
            this.tileSheet,
            sx, sy, this.tileSize, this.tileSize,
            x, y, this.tileSize, this.tileSize
        );
    },

    /**
     * Draws the pre-rendered background to the main game screen
     */
    draw(mainCtx) {
        mainCtx.drawImage(this.bgCanvas, 0, 0);
    },

    /**
     * Checks if a specific pixel coordinate is a solid tile
     * @param {number} x 
     * @param {number} y 
     */
    isSolid(x, y) {
        if (!this.currentMap) return false;

        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);
        
        // Out of bounds is solid
        if (row < 0 || row >= this.currentMap.grid.length || col < 0 || col >= 20) return true;

        const tileID = this.currentMap.grid[row][col];
        
        // Check against the collision list in JSON
        return this.currentMap.collision_ids.includes(tileID);
    }
};

// Initialize
World.init();