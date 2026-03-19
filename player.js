/**
 * SYSTEMA | Player Logic & Progression
 * Handles movement, collisions, mini-games, and stats.
 */

const Player = {
    // Position and Physics
    x: 160, 
    y: 100,
    width: 14, 
    height: 14,
    speed: 1.5, 
    vx: 0, 
    vy: 0,
    
    // System Attributes
    rank: 'E',
    job: 'UNEMPLOYED',
    stamina: 100,
    maxStamina: 100,
    logic: 0,
    charisma: 0,
    credits: 0,

    // Animation & State
    frameX: 0, 
    frameY: 0, 
    isMoving: false,
    miniGameActive: false,
    keys: {},

    /**
     * Initialize Input Listeners and Load Data
     */
    init() {
        window.addEventListener('keydown', e => this.keys[e.code] = true);
        window.addEventListener('keyup', e => this.keys[e.code] = false);
        this.loadProgress();
        this.updateUI();
        console.log("PLAYER: [System Sync Complete]");
    },

    /**
     * Main Update Loop
     */
    update(dt) {
        if (this.miniGameActive) return; // Freeze movement during mini-games

        this.handleInput();
        this.applyMovement();
        this.animate();

        // Passive stamina drain while moving
        if (this.isMoving && this.stamina > 0) {
            this.stamina -= 0.01;
            this.updateUI();
        }
    },

    handleInput() {
        this.vx = 0; 
        this.vy = 0; 
        this.isMoving = false;

        if (this.keys['ArrowUp'] || this.keys['KeyW']) { 
            this.vy = -this.speed; 
            this.frameY = 1; 
            this.isMoving = true; 
        } else if (this.keys['ArrowDown'] || this.keys['KeyS']) { 
            this.vy = this.speed; 
            this.frameY = 0; 
            this.isMoving = true; 
        }

        if (this.keys['ArrowLeft'] || this.keys['KeyA']) { 
            this.vx = -this.speed; 
            this.frameY = 2; 
            this.isMoving = true; 
        } else if (this.keys['ArrowRight'] || this.keys['KeyD']) { 
            this.vx = this.speed; 
            this.frameY = 3; 
            this.isMoving = true; 
        }
    },

    applyMovement() {
        // Horizontal Collision
        if (!this.checkCollision(this.x + this.vx, this.y)) {
            this.x += this.vx;
        }
        // Vertical Collision
        if (!this.checkCollision(this.x, this.y + this.vy)) {
            this.y += this.vy;
        }
    },

    checkCollision(newX, newY) {
        if (!World.isLoaded) return false;
        const margin = 2;
        return (
            World.isSolid(newX + margin, newY + margin) ||
            World.isSolid(newX + this.width - margin, newY + margin) ||
            World.isSolid(newX + margin, newY + this.height - margin) ||
            World.isSolid(newX + this.width - margin, newY + this.height - margin)
        );
    },

    checkInteraction() {
        if (this.miniGameActive) return;

        const prompt = document.getElementById('action-prompt');
        // Check center-point of player for tile interaction
        const checkY = Math.floor((this.y - 10) / 16);
        const checkX = Math.floor((this.x + 8) / 16);
        
        const tileID = (World.currentMap && World.currentMap.grid[checkY]) ? World.currentMap.grid[checkY][checkX] : 0;
        
        if (tileID === 2) { // Laptop/Desk Tile
            prompt.classList.remove('hidden');
            if (this.keys['KeyE']) this.startResumeGame();
        } else if (tileID === 3) { // Bed Tile
            prompt.classList.remove('hidden');
            if (this.keys['KeyE']) this.restAndSave();
        } else {
            prompt.classList.add('hidden');
        }
    },

    // --- MINI-GAME LOGIC ---
    
    startResumeGame() {
        if (this.job !== 'UNEMPLOYED') return;
        
        this.miniGameActive = true;
        const ui = document.getElementById('minigame-ui');
        const target = document.getElementById('mg-target');
        const input = document.getElementById('mg-input');
        
        ui.classList.remove('hidden');
        target.innerText = "RANK_E_INIT";
        input.value = "";
        input.focus();

        const checkInput = () => {
            if (input.value.toUpperCase() === "RANK_E_INIT") {
                this.job = "INTERN";
                this.logic += 5;
                this.completeMiniGame(true);
                input.removeEventListener('input', checkInput);
            }
        };
        input.addEventListener('input', checkInput);
    },

    completeMiniGame(success) {
        this.miniGameActive = false;
        document.getElementById('minigame-ui').classList.add('hidden');
        if (success) {
            if (typeof AudioEngine !== 'undefined') AudioEngine.playLevelUp();
            this.updateUI();
        }
    },

    restAndSave() {
        this.stamina = this.maxStamina;
        this.saveProgress();
        if (typeof AudioEngine !== 'undefined') AudioEngine.playNotif();
        alert("SYSTEM: [Progress Synchronized. Stamina Restored.]");
        this.updateUI();
    },

    // --- DATA PERSISTENCE ---

    saveProgress() {
        const saveData = {
            rank: this.rank,
            job: this.job,
            logic: this.logic,
            charisma: this.charisma,
            credits: this.credits,
            stamina: this.stamina
        };
        localStorage.setItem('systema_save', JSON.stringify(saveData));
        console.log("SYSTEM: [Data Saved to LocalStorage]");
    },

    loadProgress() {
        const saved = localStorage.getItem('systema_save');
        if (saved) {
            const data = JSON.parse(saved);
            this.rank = data.rank || 'E';
            this.job = data.job || 'UNEMPLOYED';
            this.logic = data.logic || 0;
            this.charisma = data.charisma || 0;
            this.credits = data.credits || 0;
            this.stamina = data.stamina || 100;
        }
    },

    // --- RENDERING ---

    animate() {
        if (this.isMoving) {
            this.frameX = Math.floor(Date.now() / 150) % 4;
        } else {
            this.frameX = 0;
        }
    },

    draw(ctx) {
        if (World.isLoaded) {
            // Draws 32x48 sprite from the sheet
            ctx.drawImage(
                World.tileSheet,
                this.frameX * 32, this.frameY * 48, 32, 48, 
                Math.floor(this.x - 8), Math.floor(this.y - 24), 32, 48
            );
            this.checkInteraction();
        } else {
            // Loading placeholder
            ctx.fillStyle = "#00f2ff";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    },

    updateUI() {
        if (typeof updateSystemHUD === 'function') {
            updateSystemHUD(this.rank, this.job, (this.stamina / this.maxStamina) * 100);
        }
    }
};