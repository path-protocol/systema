/**
 * SYSTEMA | Player Logic & Input (Collision Enabled)
 * Handles movement, wall-collisions, and System HUD updates.
 */

const Player = {
    // Current Position (Pixels)
    x: 160,
    y: 100,
    width: 14,  // Slightly smaller than 16 to allow easier movement through gaps
    height: 14,
    
    // Movement Stats
    speed: 1.5,
    vx: 0,
    vy: 0,
    
    // "System" Attributes
    rank: 'E',
    job: 'UNEMPLOYED',
    stamina: 100,
    maxStamina: 100,

    // Animation & Sprite State
    frameX: 0,
    frameY: 0, 
    isMoving: false,
    
    // Input Buffer
    keys: {},

    /**
     * Initialize Input Listeners
     */
    init() {
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);

        this.updateUI();
        console.log("PLAYER: [System Sync Complete]");
    },

    /**
     * Main Update Loop (Called by main.js)
     */
    update(dt) {
        this.handleInput();
        this.applyMovement();
        this.animate();
        
        // Passive Stamina Drain
        if (this.isMoving && this.stamina > 0) {
            this.stamina -= 0.005; 
            this.updateUI();
        }
    },

    /**
     * Translate Keys to Velocity
     */
    handleInput() {
        this.vx = 0;
        this.vy = 0;
        this.isMoving = false;

        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            this.vy = -this.speed;
            this.frameY = 1; // Row 2: Up
            this.isMoving = true;
        } else if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            this.vy = this.speed;
            this.frameY = 0; // Row 1: Down
            this.isMoving = true;
        }

        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            this.vx = -this.speed;
            this.frameY = 2; // Row 3: Left
            this.isMoving = true;
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            this.vx = this.speed;
            this.frameY = 3; // Row 4: Right
            this.isMoving = true;
        }
    },

    /**
     * Apply Velocity with Collision Checking
     */
    applyMovement() {
        // Horizontal Collision Check
        if (!this.checkCollision(this.x + this.vx, this.y)) {
            this.x += this.vx;
        }

        // Vertical Collision Check
        if (!this.checkCollision(this.x, this.y + this.vy)) {
            this.y += this.vy;
        }

        // Map Boundary Clamp (320x180)
        if (this.x < 0) this.x = 0;
        if (this.y < 0) this.y = 0;
        if (this.x > 320 - this.width) this.x = 320 - this.width;
        if (this.y > 180 - this.height) this.y = 180 - this.height;
    },

    /**
     * Multi-point Collision Detection
     * Checks all 4 corners of the player sprite against World.isSolid
     */
    checkCollision(newX, newY) {
        if (typeof World === 'undefined' || !World.isLoaded) return false;

        const margin = 2; // Buffer to prevent sticking to walls
        return (
            World.isSolid(newX + margin, newY + margin) || // Top-Left
            World.isSolid(newX + this.width - margin, newY + margin) || // Top-Right
            World.isSolid(newX + margin, newY + this.height - margin) || // Bottom-Left
            World.isSolid(newX + this.width - margin, newY + this.height - margin) // Bottom-Right
        );
    },

    /**
     * Sprite Animation Cycle
     */
    animate() {
        if (this.isMoving) {
            // Animates every 150ms
            this.frameX = Math.floor(Date.now() / 150) % 4;
        } else {
            this.frameX = 0; // Idle
        }
    },

    /**
     * Render Player Sprite
     */
    draw(ctx) {
        if (World.isLoaded) {
            // Draw from system_sprites.png
            // Note: sx/sy depend on where your player sits on the sheet
            ctx.drawImage(
                World.tileSheet,
                this.frameX * 16, this.frameY * 16, 16, 16, // Source
                Math.floor(this.x), Math.floor(this.y), 16, 16 // Destination
            );
        } else {
            // Placeholder while loading
            ctx.fillStyle = "#00f2ff";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    },

    /**
     * Push Stats to the HTML/CSS System HUD
     */
    updateUI() {
        const staminaPercent = Math.max(0, (this.stamina / this.maxStamina) * 100);
        if (typeof updateSystemHUD === 'function') {
            updateSystemHUD(this.rank, this.job, staminaPercent);
        }
    }
};