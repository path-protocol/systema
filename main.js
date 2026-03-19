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
        World.loadMap(gameState.currentMap);
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
    if (gameState.isPaused) return;

    // Calculate Delta Time (for consistent speed across devices)
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
    if (typeof World !== 'undefined') {
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
    // Example: If player is at edge of home map, load 'office'
    // This will be expanded once world.js is populated
}

/**
 * Global UI Update Helper
 * Use this to change the System HUD from anywhere in the code
 */
function updateSystemHUD(rank, job, staminaPercent) {
    document.getElementById('rank-val').innerText = rank;
    document.getElementById('job-val').innerText = job;
    document.getElementById('stamina-bar').style.width = staminaPercent + "%";
}

// Boot the System
window.onload = init;