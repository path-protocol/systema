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
        // 1. Set the source (Path updated to root for your current file structure)
        this.tileSheet.src = 'assets/system_sprites.png';
        
        try {
            // 2. Fetch the Game Data
            const response = await fetch('data.json');
            this.mapData = await response.json();
            console.log("SYSTEM DATA: [Retrieved]");

            // 3. Wait for the Image to load before finalizing
            this.tileSheet.onload = () => {
                this.isLoaded = true;
                
                // Set up the offscreen background buffer
                this.bgCanvas.width = 320;
                this.bgCanvas.height = 192;
                this.bgCtx = this.bgCanvas.getContext('2d');
                
                // Load the starting map defined in data.json
                const startMap = this.mapData.system_config.starting_map || 'home';
                this.loadMap(startMap);
                console.log(`WORLD SYSTEM: [${startMap.toUpperCase()} Rendered]`);
            };
        } catch (error) {
            console.error("SYSTEM ERROR: Failed to synchronize world data", error);
        }
    },

    /**
     * Loads a map from the JSON data and pre-renders it to an offscreen canvas
     */
    loadMap(mapID) {
        if (!this.mapData || !this.mapData.maps[mapID]) return;
        
        this.currentMap = this.mapData.maps[mapID];
        
        // Clear the background buffer
        this.bgCtx.fillStyle = "#0a0b10";
        this.bgCtx.fillRect(0, 0, this.bgCanvas.width, this.bgCanvas.height);

        // Render the grid
        for (let y = 0; y < this.currentMap.grid.length; y++) {
            for (let x = 0; x < this.currentMap.grid[y].length; x++) {
                const tileID = this.currentMap.grid[y][x];
                this.drawTile(tileID, x * this.tileSize, y * this.tileSize);
            }
        }
    },

    /**
     * Internal helper to draw specific tiles from the spritesheet
     */
    drawTile(id, x, y) {
        if (!this.isLoaded) return;

        // Sprite Sheet Mapping (Using the coordinate system from your data.json)
        let sx = 0, sy = 0;

        switch(id) {
            case 0: sx = 16; sy = 240; break;  // Interior Floor
            case 1: sx = 320; sy = 208; break; // Tech Wall
            case 2: sx = 256; sy = 832; break; // Office Desk/Laptop
            case 3: sx = 16; sy = 800; break;  // Bed
            case 4: sx = 656; sy = 240; break; // Sidewalk/Concrete
        }

        this.bgCtx.drawImage(
            this.tileSheet,
            sx, sy, this.tileSize, this.tileSize,
            x, y, this.tileSize, this.tileSize
        );
    },

    /**
     * Draws the pre-rendered background to the main game screen
     */
    draw(mainCtx) {
        if (this.isLoaded) {
            mainCtx.drawImage(this.bgCanvas, 0, 0);
        }
    },

    /**
     * Checks if a specific pixel coordinate is a solid tile (for collisions)
     */
    isSolid(x, y) {
        if (!this.currentMap) return false;

        const col = Math.floor(x / this.tileSize);
        const row = Math.floor(y / this.tileSize);

        // Out of bounds is considered solid
        if (row < 0 || row >= this.currentMap.grid.length || col < 0 || col >= this.currentMap.grid[0].length) {
            return true;
        }

        const tileID = this.currentMap.grid[row][col];
        // Tile 1 is our Wall
        return tileID === 1;
    }
};