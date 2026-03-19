/**
 * SYSTEMA | Main Game Engine & Loop
 * Core Logic for System Manhwa Career RPG
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Configuration (Internal resolution is low for performance, scaled by CSS)
const CONFIG = {
    width: 320,
    height: 180,
    tile_size: 16,
    low_end_mode: false
};

// Global Game State
let gameState = {
    currentMap: 'home',
    isPaused: false,
    lastTime: 0,
    frames: 0
};

/**
 * System Initialization
 */
function init() {
    // Set internal canvas resolution
    canvas.width = CONFIG.width;
    canvas.height = CONFIG.height;

    // Initialize Player (from player.js)
    if (typeof Player !== 'undefined') {
        Player.init();
    }

    // Initialize World/Map (from world.js)
    if (typeof World !== 'undefined') {
        // world.js handles loading data.json internally via init()
        World.init(); 
    }

    console.log("SYSTEM INITIALIZED: [Rank E Protocol Active]");
    
    // Start the Game Loop
    requestAnimationFrame(gameLoop);
}

/**
 * Core Game Loop
 * @param {number} timestamp - Provided by requestAnimationFrame
 */
function gameLoop(timestamp) {
    const deltaTime = timestamp - gameState.lastTime;
    gameState.lastTime = timestamp;

    // 1. UPDATE LOGIC
    update(deltaTime);

    // 2. RENDER GRAPHICS
    render();

    // 3. REPEAT
    requestAnimationFrame(gameLoop);
}

/**
 * Handles all logic updates (Movement, Collisions, Quests)
 */
function update(dt) {
    if (typeof Player !== 'undefined') {
        Player.update(dt);
    }
    
    // Check for Map Transitions (e.g., walking to the door)
    checkTransitions();
}

/**
 * Handles all drawing to the Canvas
 */
function render() {
    // Clear the screen with System Background color
    ctx.fillStyle = "#0a0b10";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the World Map
    if (typeof World !== 'undefined' && World.isLoaded) {
        World.draw(ctx);
    }

    // Draw the Player
    if (typeof Player !== 'undefined') {
        Player.draw(ctx);
    }
}

/**
 * Logic for moving between Home and Office
 */
function checkTransitions() {
    // If player walks through the bottom door in Home (Based on your data.json grid)
    if (gameState.currentMap === 'home' && Player.y > 170) {
        gameState.currentMap = 'office_rank_e';
        World.loadMap('office_rank_e');
        Player.y = 20; // Spawn at top of the office
        if (typeof AudioEngine !== 'undefined') AudioEngine.playNotif();
    } 
    // If player walks through the top door in Office
    else if (gameState.currentMap === 'office_rank_e' && Player.y < 5) {
        gameState.currentMap = 'home';
        World.loadMap('home');
        Player.y = 160; // Spawn at bottom of home
        if (typeof AudioEngine !== 'undefined') AudioEngine.playNotif();
    }
}

/**
 * Global UI Update Helper
 * Use this to change the System HUD from anywhere in the code
 */
function updateSystemHUD(rank, job, staminaWidth) {
    const rankEl = document.getElementById('rank-val');
    const jobEl = document.getElementById('job-val');
    const staminaEl = document.getElementById('stamina-bar');

    if (rankEl) rankEl.innerText = rank;
    if (jobEl) jobEl.innerText = job;
    if (staminaEl) staminaEl.style.width = staminaWidth + "%";
}

// Audio Unlock: Browsers block sound until a key is pressed or screen is tapped
window.addEventListener('keydown', () => {
    if (typeof AudioEngine !== 'undefined') AudioEngine.init();
}, { once: true });

window.addEventListener('touchstart', () => {
    if (typeof AudioEngine !== 'undefined') AudioEngine.init();
}, { once: true });

// Boot the System
init();