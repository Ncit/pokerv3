// UI Manager - Master UI coordination and orchestration
import { GameConfig } from '../config/GameConfig.js';
import { AssetHelper } from '../utils/AssetHelper.js';
import { eventManager } from '../utils/EventManager.js';
import { ButtonManager } from './ButtonManager.js';
import { PlayerManager } from './PlayerManager.js';
import { CardManager } from './CardManager.js';

export class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.isDebug = window.gameConfig ? window.gameConfig.isFeatureEnabled('debugLogging') : false;
        
        // Initialize all sub-managers
        this.buttonManager = new ButtonManager(scene);
        this.playerManager = new PlayerManager(scene);
        this.cardManager = new CardManager(scene);
        this.assetHelper = new AssetHelper(scene);
        
        // UI state tracking
        this.currentScene = scene.scene.key;
        this.uiElements = new Map();
        this.initialized = false;
        
        // Set up event listeners
        this.setupEventListeners();
    }


    // Initialize the UI system for the current scene
    initialize() {
        if (this.initialized) {
            console.warn('UIManager: Already initialized');
            return;
        }

        if (this.isDebug) {
            console.log(`UIManager: Initializing for scene '${this.currentScene}'`);
        }

        // Scene-specific initialization
        if (this.currentScene === 'LobbyScene') {
            this.initializeLobbyScene();
        } else if (this.currentScene === 'FriendsGameScene') {
            this.initializeFriendsGameScene();
        } else if (this.currentScene === 'AIBotScene') {
            this.initializeAIBotScene();
        }

        this.initialized = true;
        eventManager.emit('ui_initialized', this.currentScene);
    }

    // Initialize LobbyScene UI
    initializeLobbyScene() {
        // Create background elements
        this.createBackgroundElements();
        
        // Create user profile
        this.playerManager.createUserProfile();
        
        // Create status display
        this.playerManager.createStatusDisplay();
        
        // Create game mode buttons
        this.buttonManager.createGameModeButtons();
        
        // Create control buttons
        this.createControlButtons();
        
        // Create bonus button
        this.buttonManager.createButton('bonus', 1040, 640);

        if (this.isDebug) {
            console.log('UIManager: LobbyScene UI initialized');
        }
    }

    // Initialize Game scene UI
    initializeFriendsGameScene() {
        // Create background elements
        this.createGameBackgroundElements();
        
        // Load all cards
        this.cardManager.loadAllCards();
        
        // Create players
        this.createAllPlayers();
        
        // Note: Buttons are created by FriendsGameScene to preserve exact positioning
        // UIManager handles event coordination

        if (this.isDebug) {
            console.log('UIManager: Game scene UI initialized');
        }
    }

    // Initialize AI Bot scene UI
    initializeAIBotScene() {
        // Create background elements
        this.createGameBackgroundElements();
        
      
        if (this.isDebug) {
            console.log('UIManager: AI Bot scene UI initialized');
        }
    }

    // Create background elements
    createBackgroundElements() {
        const bg = this.scene.add.image(
            GameConfig.screen.centerX, 
            GameConfig.screen.centerY, 
            'background'
        );
        
        const lobbyOverlay = this.scene.add.image(
            GameConfig.screen.centerX, 
            GameConfig.screen.centerY, 
            'lobby_overlay'
        );
        lobbyOverlay.setScale(GameConfig.scales.lobbyOverlay);
        
        const dimOverlay = this.scene.add.image(
            GameConfig.screen.centerX, 
            GameConfig.screen.centerY, 
            'dim_overlay'
        );
        dimOverlay.setTint(GameConfig.colors.dimOverlay);
        
        const topBar = this.scene.add.image(
            GameConfig.layout.topBar.x, 
            GameConfig.layout.topBar.y, 
            'top_bar'
        );
        topBar.setScale(GameConfig.scales.topBar);
        
        const bottomBar = this.scene.add.image(
            GameConfig.layout.bottomBar.x, 
            GameConfig.layout.bottomBar.y, 
            'bottom_bar'
        );
        bottomBar.setScale(GameConfig.scales.bottomBar);
        
        const underline = this.scene.add.image(
            GameConfig.layout.underline.x, 
            GameConfig.layout.underline.y, 
            'underline'
        );
        underline.setScale(GameConfig.scales.underline);

        // Store references
        this.uiElements.set('background', { bg, lobbyOverlay, dimOverlay, topBar, bottomBar, underline });
    }

    // Create game scene background
    createGameBackgroundElements() {
        const gameBg = this.scene.add.image(
            GameConfig.screen.centerX, 
            GameConfig.screen.centerY, 
            'game_bg'
        );
        
        const gamingTable = this.scene.add.image(
            GameConfig.screen.centerX, 
            GameConfig.screen.centerY, 
            'gaming_table'
        );

        this.uiElements.set('gameBackground', { gameBg, gamingTable });
    }

            // Create control buttons for LobbyScene
    createControlButtons() {
        const controlButtons = [
            { key: 'settings', x: 120, y: 660 },
            { key: 'friends', x: 180, y: 660 },
            { key: 'stats', x: 240, y: 660 },
        ];

        controlButtons.forEach(({ key, x, y }) => {
            this.buttonManager.createButton(key, x, y);
        });
    }

    // Create all players for Game scene
    createAllPlayers() {
        for (let i = 1; i <= 6; i++) {
            const playerData = {
                name: `Player ${i}`,
                avatar: 'avatar',
                handRank: '',
                chips: 1000 * i,
                isActive: i <= 4, // First 4 players active
            };
            
            const playerElements = this.playerManager.createPlayer(i, playerData);
            
            // Create card container for each player
            if (playerElements && playerElements.cardContainer) {
                this.cardManager.createCardContainer(
                    i,
                    playerElements.cardContainer.x,
                    playerElements.cardContainer.y
                );
            }
        }
    }

    // Create poker action buttons
    createPokerActionButtons() {
        const pokerButtons = [
            { key: 'fold', x: 400, y: 650 },
            { key: 'call', x: 640, y: 650 },
            { key: 'raise', x: 880, y: 650 },
        ];

        pokerButtons.forEach(({ key, x, y }) => {
            this.buttonManager.createButton(key, x, y);
        });
    }

    // Create game interface buttons
    createGameInterfaceButtons() {
        const interfaceButtons = [
            { key: 'chat', x: 100, y: 100 },
            { key: 'settingsGame', x: 1180, y: 100 },
            { key: 'menuGame', x: 1180, y: 150 },
        ];

        interfaceButtons.forEach(({ key, x, y }) => {
            this.buttonManager.createButton(key, x, y);
        });
    }

    // Set up event listeners for UI coordination
    setupEventListeners() {
        // Poker action events
        eventManager.on('poker_action', (action) => {
            this.handlePokerAction(action);
        });

        // UI action events
        eventManager.on('ui_action', (action) => {
            this.handleUIAction(action);
        });

        // Button action events
        eventManager.on('button_action', (action, value, target, config) => {
            if (this.isDebug) {
                console.log(`UIManager: Button action '${action}' received`, { value, target });
            }
        });

        // Player events
        eventManager.on('player_updated', (playerNumber, data) => {
            if (this.isDebug) {
                console.log(`UIManager: Player ${playerNumber} updated`, data);
            }
        });

        // Card events
        eventManager.on('dealing_complete', () => {
            if (this.isDebug) {
                console.log('UIManager: Card dealing complete');
            }
        });


    }

    // Handle poker actions
    handlePokerAction(action) {
        if (this.isDebug) {
            console.log(`UIManager: Received poker action '${action}'`);
        }
        
        switch (action) {
            case 'fold':
                // Handle fold logic
                if (this.isDebug) {
                    console.log('UIManager: Handling fold action');
                }
                break;
                
            case 'call':
                // Handle call logic
                if (this.isDebug) {
                    console.log('UIManager: Handling call action');
                }
                break;
                
            case 'raise':
                // Handle raise logic with amount
                break;
        }

        if (this.isDebug) {
            console.log(`UIManager: Handled poker action '${action}'`);
        }
    }

    // Handle UI actions
    handleUIAction(action) {
        switch (action) {
            case 'settings':
                // Open settings
                break;
                
            case 'friends':
                // Open friends list
                break;
                
            case 'stats':
                // Show statistics
                break;
                
            case 'chat':
                // Toggle chat
                break;
                
            case 'menu':
                        // Return to LobbyScene
        this.scene.scene.start('LobbyScene');
                break;
                
            case 'bonus':
                // Handle bonus action
                break;
        }

        if (this.isDebug) {
            console.log(`UIManager: Handled UI action '${action}'`);
        }
    }

    // Start a poker game (deal cards to active players)
    startGame() {
        const activePlayers = [];
        for (let i = 1; i <= 6; i++) {
            const player = this.playerManager.getPlayer(i);
            if (player && player.data.isActive) {
                activePlayers.push(i);
            }
        }

        if (activePlayers.length >= 2) {
            this.cardManager.dealCards(activePlayers, 2, false);
            
            if (this.isDebug) {
                console.log(`UIManager: Started game with ${activePlayers.length} players`);
            }
        } else {
            console.warn('UIManager: Need at least 2 active players to start game');
        }
    }

    // Update UI state
    updateUIState(updates = {}) {
        if (updates.players) {
            Object.entries(updates.players).forEach(([playerNumber, data]) => {
                this.playerManager.updatePlayer(parseInt(playerNumber), data);
            });
        }


        if (updates.buttons) {
            Object.entries(updates.buttons).forEach(([buttonKey, state]) => {
                this.buttonManager.updateButtonState(buttonKey, state.enabled, state.visible);
            });
        }
    }

    // Get comprehensive UI statistics
    getUIStats() {
        return {
            scene: this.currentScene,
            initialized: this.initialized,
            buttons: this.buttonManager.getStats(),
            players: this.playerManager.getStats(),
            cards: this.cardManager.getStats(),
            uiElements: this.uiElements.size,
        };
    }

    // Clean up UI resources
    cleanup() {
        // Clean up all managers
        this.buttonManager.removeAllButtons();
        this.playerManager.removeAllPlayers();
        this.cardManager.cleanup();
   
        
        // Clear UI elements
        this.uiElements.clear();
        
        // Clear event listeners
        eventManager.removeAllListeners('poker_action');
        eventManager.removeAllListeners('ui_action');
        eventManager.removeAllListeners('button_action');
        
        this.initialized = false;

        if (this.isDebug) {
            console.log('UIManager: Cleaned up all resources');
        }
    }

    // Show/hide entire UI
    setUIVisibility(visible) {
        this.uiElements.forEach((elementGroup) => {
            Object.values(elementGroup).forEach(element => {
                if (element && element.setVisible) {
                    element.setVisible(visible);
                }
            });
        });
    }

    // Transition to different scene
    transitionToScene(sceneName) {
        this.cleanup();
        this.scene.scene.start(sceneName);
        
        if (this.isDebug) {
            console.log(`UIManager: Transitioning to scene '${sceneName}'`);
        }
    }
} 