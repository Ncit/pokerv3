import { ButtonManager } from '../managers/ButtonManager.js';
import { UIManager } from '../managers/UIManager.js';
import { PlayerManager } from '../managers/PlayerManager.js';
import { CardManager } from '../managers/CardManager.js';
import { NetworkManager } from '../managers/NetworkManager.js';
import { ChatManager } from '../managers/ChatManager.js';
import { GameConfig } from '../config/GameConfig.js';
import { ButtonConfig } from '../config/ButtonConfig.js';
import { PlayerConfig } from '../config/PlayerConfig.js';
import { AssetConfig } from '../config/AssetConfig.js';
import { AssetHelper } from '../utils/AssetHelper.js';
import { HandEvaluator } from '../utils/HandEvaluator.js';

export class FastGameScene extends Phaser.Scene {
    constructor() {
        super('FastGameScene');
        this.networkManager = new NetworkManager();
        this.handEvaluator = new HandEvaluator();
        
        // Game state
        this.gameState = null;
        this.players = [];
        this.myPlayerId = null;
        this.isMyTurn = false;
        
        // UI elements
        this.playerElements = new Map(); // playerId -> UI elements
        this.communityCardsContainer = null;
        this.chipBankText = null;
        this.phaseText = null;
        this.handRank = null;
        
        // Action buttons
        this.foldButton = null;
        this.callButton = null;
        this.raiseButton = null;
        this.allInButton = null;
        this.nextRoundButton = null;
        
        // Start game button
        this.startGameButton = null;
        
        // Button texts
        this.foldButtonText = null;
        this.callButtonText = null;
        this.raiseButtonText = null;
        this.allInButtonText = null;
        this.nextRoundButtonText = null;
        
        // Start game button text
        this.startGameButtonText = null;
        
        // Connection status
        this.connectionStatus = null;
        this.isConnected = false;
    }

    preload() {
        // Use AssetHelper for centralized asset loading
        AssetHelper.loadGameAssets(this);
        AssetHelper.loadCardAssets(this);
        AssetHelper.loadPlayerAssets(this);
    }

    async create() {
        // Initialize managers
        this.buttonManager = new ButtonManager(this);
        this.playerManager = new PlayerManager(this);
        this.cardManager = new CardManager(this);
        this.uiManager = new UIManager(this);
        this.chatManager = new ChatManager(this, this.networkManager);
        
        // Wait for assets to load
        this.time.delayedCall(100, () => {
            const loadedCards = this.cardManager.loadAllCards();
            console.log(`FastGameScene: Found ${loadedCards} loaded cards`);
            this.initializeGame();
        });
        
        // Initialize UI
        this.uiManager.initializeAIBotScene();
        this.createUI();
        this.setupButtonHandlers();
        
        // Setup network event listeners
        this.setupNetworkListeners();
        
        // Connect to server
        await this.connectToServer();
        
        // Initialize chat UI after connection
        this.chatManager.createChatUI();
        
        // Update chat visibility based on initial player count
        this.chatManager.updateChatVisibility();
        
        // Add scene shutdown event listener
        this.events.on('shutdown', () => {
            console.log('FastGameScene: Scene shutdown event triggered');
            this.shutdown();
        });
    }

    /**
     * Get safe avatar URL with fallback to avatar.png
     * @param {string} avatarUrl - The original avatar URL
     * @returns {string} - Safe avatar URL with fallback
     */
    getSafeAvatarUrl(avatarUrl) {
        // Check if avatar URL is empty, null, undefined, or just whitespace
        if (!avatarUrl || avatarUrl.trim() === '' || avatarUrl === 'null' || avatarUrl === 'undefined') {
            console.log('📱 Avatar URL is empty/null, using fallback avatar.png');
            return 'assets/avatar.png';
        }
        
        // Check if the URL is valid (basic validation)
        try {
            const url = new URL(avatarUrl);
            if (!url.protocol || !url.hostname) {
                console.log('📱 Invalid avatar URL format, using fallback avatar.png');
                return 'assets/avatar.png';
            }
            
            // Check for CORS-prone domains (Telegram, VK, etc.)
            const corsProneDomains = ['t.me', 'telegram.org', 'vk.com', 'vk.ru', 'vk.me'];
            const isCorsProne = corsProneDomains.some(domain => url.hostname.includes(domain));
            
            if (isCorsProne) {
                console.log('📱 Avatar URL from CORS-prone domain detected, using fallback avatar.png');
                console.log('📱 CORS-prone URL:', avatarUrl);
                return 'assets/avatar.png';
            }
            
        } catch (error) {
            console.log('📱 Avatar URL parsing failed, using fallback avatar.png');
            return 'assets/avatar.png';
        }
        
        // For non-CORS-prone URLs, we can try to use them
        console.log('📱 Using provided avatar URL:', avatarUrl);
        return avatarUrl;
    }

    createUI() {
        // Create background elements
        this.background = this.add.image(640, 360, 'game_bg');
        this.gamingTable = this.add.image(640, 320, 'gaming_table');
        this.gamingTable.scale = 0.4;

        // Create game interface buttons
        this.menuGame = this.buttonManager.createButton('menuGame', 85, 60);
        this.settingsGame = this.buttonManager.createButton('settingsGame', 150, 60);
        this.chatButton = this.buttonManager.createButton('chat', 1100, 640);
        
        // Initially hide chat button (will be shown in multiplayer)
        this.chatButton.setVisible(false);

        // Create poker action buttons
        this.foldButton = this.buttonManager.createButton('fold', 310, 640);
        this.callButton = this.buttonManager.createButton('call', 510, 640);
        this.raiseButton = this.buttonManager.createButton('raise', 710, 640);
        this.allInButton = this.buttonManager.createButton('allIn', 910, 640);
        
        // Create start game button under menu button
        this.startGameButton = this.buttonManager.createButton('raise', 120, 220, {
            scale: 0.3,
            interactive: true,
            cursor: 'hand'
        });
        // this.startGameButton.setVisible(false);

        // Create Next Round button under start game button
        this.nextRoundButton = this.buttonManager.createButton('raise', 120, 180, {
            scale: 0.3,
            interactive: true,
            cursor: 'hand'
        });
        this.nextRoundButton.setVisible(false);
        this.nextRoundButton.setInteractive();

        this.underline = this.add.image(640, 700, 'underline');
        this.underline.setDisplaySize(400, 10);

        // Add text labels
        this.createButtonLabels();
        this.createPokerActionLabels();
        this.createNextRoundButtonLabel();
        this.createStartGameButtonLabel();

        // Create chip bank display
        this.chipBank = this.add.image(600, 280, 'chip_button');
        this.chipBankText = this.add
            .text(670, 280, 'БАНК: 0', {
                fontFamily: 'Arial',
                fontSize: '18px',
                fill: '#ffffff',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
        this.chipBank.scale = 0.2;

        // Create community cards container
        this.communityCardsContainer = this.add.container(640, 360);
        this.communityCardsContainer.setScale(0.5);
        
        // Create hand rank display
        this.handRank = this.add
            .text(640, 430, '', {
                fontFamily: 'Arial',
                fontSize: '22px',
                fill: '#FF4B00',
                strokeThickness: 1,
            })
            .setOrigin(0.5);


        this.phaseText = this.add
            .text(940, 80, 'Connecting...', {
                fontFamily: 'Arial',
                fontSize: '18px',
                fill: '#FFD700',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Create raise counter display
        this.raiseCounterText = this.add
            .text(940, 110, '', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#FFD700',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Create connection status text
        this.connectionStatusText = this.add
            .text(940, 140, 'Connecting to server...', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#00FF00',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
            this.connectionStatusText
        // Create turn indicator text
        this.turnIndicatorText = this.add
            .text(940, 170, '', {
                fontFamily: 'Arial',
                fontSize: '16px',
                fill: '#FFD700',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Create player info text (debug mode)
        if (window.gameConfig && window.gameConfig.isFeatureEnabled('debugLogging') && window.appData) {
            this.playerInfoText = this.add
                .text(640, 170, `Playing as: ${window.appData.first_name} (ID: ${window.appData.vk_user_id})`, {
                    fontFamily: 'Arial',
                    fontSize: '12px',
                    fill: '#FFD700',
                    strokeThickness: 1,
                })
                .setOrigin(0.5);
        }
    }

    async connectToServer() {
        try {
            await this.networkManager.connect();
            this.isConnected = true;
            this.connectionStatusText.setText('Connected to server');
            this.connectionStatusText.setFill('#00FF00');
            
            // Join game with player data
            const playerData = {
                name: window.appData?.first_name,
                avatarUrl: this.getSafeAvatarUrl(window.appData?.userAvatar),
                bank: 1000,
                vk_user_id: window.appData?.vk_user_id || 0,
                telegram_user_id: window.appData?.telegram_user_id || 0,
            };
            
            this.networkManager.joinGame(playerData);
            
        } catch (error) {
            console.error('FastGameScene: Failed to connect to server:', error);
            this.connectionStatusText.setText('Connection failed');
            this.connectionStatusText.setFill('#FF0000');
        }
    }

    setupNetworkListeners() {
        // Game joined event
        this.networkManager.on('gameJoined', (data) => {
            console.log('FastGameScene: Game joined:', data);
            this.myPlayerId = data.playerId;
            this.gameState = data.gameState;
            this.players = data.players;
            this.initializePlayers();
            this.updateUI();
        });

                // Game state update event
        this.networkManager.on('gameStateChanged', (data) => {
            console.log('FastGameScene: Game state changed:', data);
            this.gameState = data.gameState;
            this.players = data.gameState.players;
            
            if (data.gameStarted) {
                console.log('FastGameScene: Game started!');
                this.handleGameStarted();
            } else if (data.newHand) {
                this.handleNewHand();
            } else if (data.roomReset) {
                console.log('FastGameScene: Room reset!');
                
                // Handle different types of room resets
                if (data.lastPlayerLeft) {
                    // Complete room reset due to last player leaving
                    this.handleLastPlayerLeftReset(data.leavingPlayerName);
                } else if (data.playerLeft) {
                    // Room reset due to player leaving (but others remain)
                    this.handlePlayerLeftReset(data.leavingPlayerName);
                } else if (data.newPlayerJoined) {
                    // Room reset due to new player joining
                    this.handleNewPlayerJoinedReset(data.newPlayerName);
                } else {
                    // Regular room reset (Next Round button or other reset)
                    this.handleRoomReset();
                }
            } else if (data.roomResetToOnePlayer) {
                // Handle the case where only one player is left in the room
                this.handleRoomResetToOnePlayer();
            }
            
            // Handle showdown results
            if (this.gameState.phase === 'showdown' && this.gameState.showdownResults) {
                this.handleShowdownResults(this.gameState.showdownResults);
            }
            
            this.updateUI();
            this.handleLastAction(data.lastAction);
            
            // If this is a reconnected player, ensure UI is properly restored
            if (data.isReconnection) {
                console.log('FastGameScene: Detected reconnection in game state update');
                this.restoreUIAfterReconnection();
            }
        });

        // Player joined event
        this.networkManager.on('playerJoined', (data) => {
            console.log('FastGameScene: Player joined:', data);
            this.addPlayer(data.player);
        });

        // Player left event
        this.networkManager.on('playerLeft', (data) => {
            console.log('FastGameScene: Player left:', data);
            
            // Remove player's cards from the table if specified
            if (data.removeCards) {
                this.removePlayerCards(data.playerId);
            }
            
            // Note: The server will handle the room reset automatically
            // We don't need to remove the player here as the room reset will handle that
        });

        // Player disconnected event (but may reconnect)
        this.networkManager.on('playerDisconnected', (data) => {
            console.log('FastGameScene: Player disconnected (may reconnect):', data);
            
            // Hide the disconnected player and their cards
            this.hideDisconnectedPlayer(data.playerId);
            
            // Show notification that player disconnected but may reconnect
            const playerName = data.playerName || 'Игрок';
            this.handRank.setText(`${playerName} отключился. Ожидание переподключения...`);
            this.handRank.setFill('#FFA500'); // Orange color for disconnection
            
            // Clear notification after 1 second
            this.time.delayedCall(1000, () => {
                if (this.handRank && this.gameState && this.gameState.status === 'playing') {
                    this.handRank.setText('');
                }
            });
        });

        // Player reconnected event
        this.networkManager.on('playerReconnected', (data) => {
            console.log('FastGameScene: Player reconnected:', data);
            
            // Show the reconnected player and their cards
            this.showReconnectedPlayer(data.playerId);
            
            // Show notification that player reconnected
            const playerName = data.playerName || 'Игрок';
            
            // Check if this is the current player reconnecting
            const isMyReconnection = data.playerId === this.myPlayerId;
            
            if (isMyReconnection) {
                // Check if player is folded
                const myPlayer = this.networkManager.getMyPlayer();
                if (myPlayer && myPlayer.folded) {
                    this.handRank.setText(`${playerName} переподключился! Вы сбросили карты.`);
                    this.handRank.setFill('#FFA500'); // Orange for folded state
                } else {
                    this.handRank.setText(`${playerName} переподключился!`);
                    this.handRank.setFill('#00FF00'); // Green for successful reconnection
                }
                
                // Update UI to restore appropriate state
                if (this.gameState) {
                    console.log('FastGameScene: Reconnected player - updating UI for current state:', this.gameState.status);
                    this.updateUI();
                    
                    // If game is active and it's my turn, restore action buttons
                    if (this.gameState.status === 'playing' && this.networkManager.isMyTurn()) {
                        console.log('FastGameScene: Reconnected player - restoring action buttons for my turn');
                        this.updateActionButtons();
                    }
                } else {
                    console.log('FastGameScene: Reconnected player - no game state available');
                }
                
                // Force a complete UI refresh to ensure all buttons are properly restored
                this.restoreUIAfterReconnection();
            } else {
                this.handRank.setText(`${playerName} переподключился!`);
                this.handRank.setFill('#00FF00'); // Green color for reconnection
            }
            
            // Clear notification after 3 seconds
            this.time.delayedCall(3000, () => {
                if (this.handRank && this.gameState && this.gameState.status === 'playing') {
                    this.handRank.setText('');
                }
            });
        });

        // Note: Player disconnection is now handled by the server automatically
        // When a player disconnects, the server removes them and resets the room
        // No need for separate disconnection handling in the client

        // Network error event
        this.networkManager.on('networkError', (data) => {
            console.error('FastGameScene: Network error:', data);
            // this.connectionStatusText.setText(`Error: ${data.message}`);
            // this.connectionStatusText.setFill('#FF0000');
        });

        // Disconnected event
        this.networkManager.on('disconnected', (data) => {
            console.log('FastGameScene: Disconnected from server:', data);
            this.isConnected = false;
            this.connectionStatusText.setText('Disconnected from server');
            this.connectionStatusText.setFill('#FF0000');
        });
    }

    initializeGame() {
        // Game will be initialized when we join the server
        console.log('FastGameScene: Game initialization ready');
    }

    initializePlayers() {
        // Store existing player numbers before clearing
        const existingPlayerNumbers = Array.from(this.playerElements.values())
            .map(elements => elements.playerNumber)
            .filter(number => number !== undefined);
        
        // Clear existing players
        this.playerElements.clear();
        
        // Clear existing card containers (only if they exist)
        existingPlayerNumbers.forEach(playerNumber => {
            this.cardManager.safeClearPlayerCards(playerNumber);
        });
        
        // Create player positions
        const positions = [
            { x: 280, y: 270 }, // Top left
            { x: 280, y: 460 }, // Bottom left
            { x: 670, y: 520 }, // Bottom center (human player)
            { x: 980, y: 270 }, // Top right
            { x: 980, y: 460 }, // Bottom right
            { x: 670, y: 200 }  // Top center
        ];
        
        // Create UI for each player
        this.players.forEach((player, index) => {
            if (index < positions.length) {
                this.createPlayerUI(player, positions[index], index + 1);
            }
        });
    }

    createPlayerUI(player, position, playerNumber) {
        const { x, y } = position;
        
        // Create avatar
        const avatar = this.add.image(x, y, 'avatar');
        // Use different scale based on whether it's fallback avatar or user avatar
        const isFallbackAvatar = player.avatarUrl === 'assets/avatar.png';
        avatar.setScale(isFallbackAvatar ? 0.3 : 0.3);
        
        // Load avatar from URL
        const avatarKey = `avatar_${player.id}`;
        this.load.image(avatarKey, player.avatarUrl);
        
        this.load.once('complete', () => {
            if (this.textures.exists(avatarKey)) {
                avatar.setTexture(avatarKey);
            }
        });
        this.load.start();
        
        // Create player name background
        const nameX = x - 90;
        const nameY = y + 0;
        const nameBackground = this.add.image(nameX, nameY, 'player_name_placeholder');
        nameBackground.setScale(0.2);
        
        // Create player name text
        const playerName = this.add.text(nameX, nameY, player.name, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1,
        }).setOrigin(0.5);
        
        // Create bank text
        const bankText = this.add.text(x, y + 70, `$${player.bank}`, {
            fontFamily: 'Arial',
            fontSize: '12px',
            fill: '#FFD700',
            stroke: '#000000',
            strokeThickness: 1,
        }).setOrigin(0.5);
        
        // Create card container
        this.cardManager.createCardContainer(playerNumber, x + 60, y + 30);
        
        // Store player elements
        this.playerElements.set(player.id, {
            avatar,
            nameBackground,
            playerName,
            bankText,
            playerNumber
        });
    }

    addPlayer(player) {
        // Find available position
        const positions = [
            { x: 280, y: 270 },
            { x: 280, y: 460 },
            { x: 670, y: 520 },
            { x: 980, y: 270 },
            { x: 980, y: 460 },
            { x: 670, y: 200 }
        ];
        
        const availableIndex = this.players.findIndex(p => p.id === player.id);
        if (availableIndex === -1) {
            this.players.push(player);
        }
        
        const playerIndex = this.players.findIndex(p => p.id === player.id);
        if (playerIndex < positions.length) {
            this.createPlayerUI(player, positions[playerIndex], playerIndex + 1);
        }
    }

    removePlayer(playerId) {
        console.log('FastGameScene: Removing player:', playerId);
        
        const playerElements = this.playerElements.get(playerId);
        if (playerElements) {
            // Always remove cards when player is removed
            if (playerElements.playerNumber) {
                this.cardManager.safeClearPlayerCards(playerElements.playerNumber);
                console.log(`FastGameScene: Removed cards for player ${playerId} during player removal`);
            }
            
            // Remove UI elements
            Object.values(playerElements).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.playerElements.delete(playerId);
        }
        
        // Remove from players list
        this.players = this.players.filter(p => p.id !== playerId);
        
        console.log('FastGameScene: Player removal complete for:', playerId);
    }

    removePlayerCards(playerId) {
        console.log('FastGameScene: Removing cards for player:', playerId);
        
        const playerElements = this.playerElements.get(playerId);
        if (playerElements && playerElements.playerNumber) {
            // Clear all cards for this player
            this.cardManager.safeClearPlayerCards(playerElements.playerNumber);
            console.log(`FastGameScene: Cleared cards for player ${playerId} (player number: ${playerElements.playerNumber})`);
        } else {
            console.warn('FastGameScene: Could not find player elements for card removal:', playerId);
            
            // Fallback: try to find player by ID in the players array and clear cards
            const playerIndex = this.players.findIndex(p => p.id === playerId);
            if (playerIndex !== -1) {
                const playerNumber = playerIndex + 1;
                this.cardManager.safeClearPlayerCards(playerNumber);
                console.log(`FastGameScene: Fallback - cleared cards for player ${playerId} using player number: ${playerNumber}`);
            }
        }
    }

    handleGameStarted() {
        console.log('FastGameScene: Handling game started');
        // Clear any lobby-specific UI
        this.handRank.setText('');
        
        // Clear any existing cards from lobby state
        this.playerElements.forEach((elements, playerId) => {
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
        });
        
        // The game will automatically deal cards and start the first hand
        // Cards will be dealt when the first hand starts
    }

    handleNewHand() {
        // Clear community cards
        this.communityCardsContainer.removeAll(true);
        
        // Clear all player cards
        this.playerElements.forEach((elements, playerId) => {
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
        });
        
        // Clear hand rank and card highlights
        this.handRank.setText('');
        this.clearCardHighlights();
        
        // Hide next round button
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
        
        // Only deal hole cards if game has started
        if (this.gameState.status === 'playing') {
            this.dealHoleCards();
        }
    }

    handleRoomReset() {
        console.log('FastGameScene: Handling room reset');
        
        // Clear community cards
        this.communityCardsContainer.removeAll(true);
        
        // Clear all player cards
        this.playerElements.forEach((elements, playerId) => {
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
        });
        
        // Clear hand rank and card highlights
        this.handRank.setText('');
        this.clearCardHighlights();
        
        // Hide next round button
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
        
        // Reset UI to lobby state
        this.updateUI();
        
        // Ensure start game button is interactive if all players are ready
        if (this.gameState.status === 'lobby' && this.gameState.allPlayersReady) {
            this.startGameButton.setInteractive();
        }
        
        console.log('FastGameScene: Room reset complete - back to lobby state');
    }

    handlePlayerLeftReset(leavingPlayerName) {
        console.log('FastGameScene: Handling room reset due to player leaving');
        
        // Clear all cards immediately when player leaves
        this.playerElements.forEach((elements, playerId) => {
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
        });
        
        // Clear community cards
        this.communityCardsContainer.removeAll(true);
        
        // Clear hand rank and card highlights
        this.handRank.setText('');
        this.clearCardHighlights();
        
        // Hide next round button
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
        
        // Show notification that room was reset due to player leaving
        const playerName = leavingPlayerName || 'Игрок';
        this.handRank.setText(`${playerName} покинул игру. Комната сброшена.`);
        this.handRank.setFill('#FFD700'); // Gold color for notification
        
        // Clear notification after 5 seconds
        this.time.delayedCall(5000, () => {
            if (this.handRank && this.gameState && this.gameState.status === 'lobby') {
                this.handRank.setText('');
            }
        });
        
        // Reset UI to lobby state
        this.updateUI();
        
        // Ensure start game button is interactive if all players are ready
        if (this.gameState.status === 'lobby' && this.gameState.allPlayersReady) {
            this.startGameButton.setInteractive();
        }
        
        console.log(`FastGameScene: Player left reset complete - ${playerName} left, cards hidden and room reset to lobby`);
    }

    handleNewPlayerJoinedReset(newPlayerName) {
        console.log('FastGameScene: Handling room reset due to new player joining');
        
        // Clear all cards immediately when a new player joins
        this.playerElements.forEach((elements, playerId) => {
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
        });
        
        // Clear community cards
        this.communityCardsContainer.removeAll(true);
        
        // Clear hand rank and card highlights
        this.handRank.setText('');
        this.clearCardHighlights();
        
        // Hide next round button
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
        
        // Show notification that room was reset due to new player joining
        const playerName = newPlayerName || 'Игрок';
        this.handRank.setText(`${playerName} присоединился к игре. Комната сброшена.`);
        this.handRank.setFill('#FFD700'); // Gold color for notification
        
        // Clear notification after 5 seconds
        this.time.delayedCall(5000, () => {
            if (this.handRank && this.gameState && this.gameState.status === 'lobby') {
                this.handRank.setText('');
            }
        });
        
        // Reset UI to lobby state
        this.updateUI();
        
        // Ensure start game button is interactive if all players are ready
        if (this.gameState.status === 'lobby' && this.gameState.allPlayersReady) {
            this.startGameButton.setInteractive();
        }
        
        console.log(`FastGameScene: New player joined reset complete - ${playerName} joined, cards hidden and room reset to lobby`);
    }

    handleLastPlayerLeftReset(leavingPlayerName) {
        console.log('FastGameScene: Handling complete room reset due to last player leaving');
        
        // Clear all cards immediately when the last player leaves
        this.playerElements.forEach((elements, playerId) => {
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
        });
        
        // Clear community cards
        this.communityCardsContainer.removeAll(true);
        
        // Clear hand rank and card highlights
        this.handRank.setText('');
        this.clearCardHighlights();
        
        // Hide next round button
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
        
        // Show notification that the game was reset due to the last player leaving
        const playerName = leavingPlayerName || 'Игрок';
        this.handRank.setText(`${playerName} покинул игру. Комната сброшена.`);
        this.handRank.setFill('#FFD700'); // Gold color for notification
        
        // Clear notification after 5 seconds
        this.time.delayedCall(5000, () => {
            if (this.handRank && this.gameState === null) { // Check if gameState is null
                this.handRank.setText('');
            }
        });
        
        // Reset UI to lobby state
        this.updateUI();
        
        // Ensure start game button is interactive if all players are ready
        if (this.gameState === null) { // Check if gameState is null
            this.startGameButton.setInteractive();
        }
        
        console.log(`FastGameScene: Last player left reset complete - ${playerName} left, cards hidden and room reset to lobby`);
    }

    clearCardHighlights() {
        // Clear all card highlights
        this.playerElements.forEach((elements, playerId) => {
            if (elements.playerNumber) {
                for (let cardIndex = 0; cardIndex < 2; cardIndex++) {
                    const cardData = this.cardManager.getCard(elements.playerNumber, cardIndex);
                    if (cardData && cardData.sprite) {
                        cardData.sprite.clearTint();
                    }
                }
            }
        });
    }

    handleShowdownResults(showdownResults) {
        console.log('FastGameScene: Handling showdown results:', showdownResults);
        
        // Display winner information
        const winnerNames = showdownResults.winnerNames.join(', ');
        const handDescription = showdownResults.handDescription;
        
        this.handRank.setText(`Winner: ${winnerNames} (${handDescription})`);
        
        // Show hand rankings in console
        this.showHandRankings(showdownResults.playerHands);
        
        // Reveal all players' cards
        if (showdownResults.revealedCards) {
            this.revealAllPlayersCards(showdownResults.revealedCards);
        }
        
        // Highlight winning players' cards
        this.highlightWinningCards(showdownResults.winners);
        
        // Show Next Round button
        // this.nextRoundButton.setVisible(true);
        // this.nextRoundButtonText.setVisible(true);
        
        // this.nextRoundButton.setInteractive();
        console.log('FastGameScene: Showdown results displayed');
    }
    
    revealAllPlayersCards(revealedCards) {
        console.log('FastGameScene: Revealing all players\' cards:', revealedCards);
        
        revealedCards.forEach(playerCardData => {
            const elements = this.playerElements.get(playerCardData.playerId);
            if (elements && elements.playerNumber && playerCardData.cards) {
                // Clear existing cards first
                this.cardManager.safeClearPlayerCards(elements.playerNumber);
                
                // Add cards face up for all players
                playerCardData.cards.forEach((card, cardIndex) => {
                    this.cardManager.addCardToPlayer(
                        elements.playerNumber,
                        card.value,
                        card.suit,
                        true // Always show face up during showdown
                    );
                });
                
                console.log(`FastGameScene: Revealed cards for ${playerCardData.playerName}:`, playerCardData.cards);
            }
        });
    }

    showHandRankings(playerHands) {
        // Sort hands by strength (strongest first)
        playerHands.sort((a, b) => b.handScore - a.handScore);
        
        // Create hand ranking display
        let rankingText = 'Hand Rankings:\n';
        playerHands.forEach((handData, index) => {
            const rank = index + 1;
            const rankSymbol = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}.`;
            
            rankingText += `${rankSymbol} ${handData.playerName}: ${handData.handRank}\n`;
        });
        
        // Display the rankings in console
        console.log('FastGameScene: Hand Rankings:', rankingText);
    }

    highlightWinningCards(winnerIds) {
        // Reset all card highlights first
        this.playerElements.forEach((elements, playerId) => {
            if (elements.playerNumber) {
                // Clear any existing tints on cards
                for (let cardIndex = 0; cardIndex < 2; cardIndex++) {
                    const cardData = this.cardManager.getCard(elements.playerNumber, cardIndex);
                    if (cardData && cardData.sprite) {
                        cardData.sprite.clearTint();
                    }
                }
            }
        });
        
        // Highlight winning players' cards
        winnerIds.forEach(winnerId => {
            const elements = this.playerElements.get(winnerId);
            if (elements && elements.playerNumber) {
                for (let cardIndex = 0; cardIndex < 2; cardIndex++) {
                    const cardData = this.cardManager.getCard(elements.playerNumber, cardIndex);
                    if (cardData && cardData.sprite) {
                        // Add golden tint to winning cards
                        cardData.sprite.setTint(0xFFD700);
                    }
                }
            }
        });
        
        console.log('FastGameScene: Highlighted winning cards for players:', winnerIds);
    }

    dealHoleCards() {
        // Only deal cards if game has started
        if (this.gameState.status !== 'playing') {
            console.log('FastGameScene: Game not started yet, skipping card dealing');
            return;
        }
        
        this.players.forEach((player, index) => {
            // Don't show cards for spectators
            if (player.isSpectator) {
                console.log('FastGameScene: Skipping card display for spectator player:', player.name);
                return;
            }
            
            if (player.hand && player.hand.length > 0) {
                const playerElements = this.playerElements.get(player.id);
                if (playerElements) {
                    player.hand.forEach((card, cardIndex) => {
                        const isMyPlayer = player.id === this.myPlayerId;
                        this.cardManager.addCardToPlayer(
                            playerElements.playerNumber,
                            card.value,
                            card.suit,
                            isMyPlayer
                        );
                    });
                }
            }
        });
    }

    handleLastAction(lastAction) {
        if (!lastAction) return;
        
        console.log('FastGameScene: Last action:', lastAction);
        
        // Update UI based on action
        switch (lastAction.action) {
            case 'fold':
                this.handlePlayerFold(lastAction);
                break;
            case 'call':
            case 'check':
                this.handlePlayerCall(lastAction);
                break;
            case 'raise':
            case 'allIn':
                this.handlePlayerRaise(lastAction);
                break;
        }
    }

    handlePlayerFold(action) {
        // Player folded - no special UI needed, just update display
        this.updatePlayerDisplay(action.playerId);
    }

    handlePlayerCall(action) {
        // Player called/checked - update display
        this.updatePlayerDisplay(action.playerId);
    }

    handlePlayerRaise(action) {
        // Player raised - update display
        this.updatePlayerDisplay(action.playerId);
    }

    updateUI() {
        // Add call stack protection to prevent infinite loops
        if (this._updatingUI) {
            console.log('FastGameScene: updateUI called recursively, preventing loop');
            return;
        }
        
        this._updatingUI = true;
        
        try {
            console.log('FastGameScene: updateUI - game state:', {
                status: this.gameState ? this.gameState.status : 'null',
                phase: this.gameState ? this.gameState.phase : 'null',
                pot: this.gameState ? this.gameState.pot : 'null',
                readyCount: this.gameState ? this.gameState.readyCount : 'null',
                totalPlayers: this.gameState ? this.gameState.totalPlayers : null
            });
            
            if (!this.gameState) {
                // Game state is null - this means the room was completely reset
                // Set UI to empty lobby state
                this.chipBankText.setText('БАНК: 0');
                this.phaseText.setText('Лобби (0/0 готовы)');
                this.raiseCounterText.setText('');
                
                // Hide all game UI elements
                this.foldButton.setVisible(false);
                this.callButton.setVisible(false);
                this.raiseButton.setVisible(false);
                this.allInButton.setVisible(false);
                this.foldButtonText.setVisible(false);
                this.callButtonText.setVisible(false);
                this.raiseButtonText.setVisible(false);
                this.allInButtonText.setVisible(false);
                
                // Hide start game button
                // this.startGameButton.setVisible(false);
                // this.startGameButton.disableInteractive();
                // this.startGameButtonText.setVisible(false);
                
                // Hide next round button
                this.nextRoundButton.setVisible(false);
                this.nextRoundButtonText.setVisible(false);
                
                // Clear turn indicator
                this.turnIndicatorText.setText('');
                
                // Clear community cards
                this.communityCardsContainer.removeAll(true);
                
                return;
            }
            
            // Update pot display
            this.chipBankText.setText(`БАНК: ${this.gameState.pot}`);
            
            // Update phase text based on game status
            if (this.gameState.status === 'lobby') {
                console.log('FastGameScene: updateUI - calling updateLobbyUI (status is lobby)');
                this.phaseText.setText(`Лобби (${this.gameState.readyCount}/${this.gameState.totalPlayers} готовы)`);
                this.raiseCounterText.setText(''); // Hide raise counter in lobby
                this.turnIndicatorText.setText(''); // Hide turn indicator in lobby
                this.updateLobbyUI();
            } else {
                console.log('FastGameScene: updateUI - calling updateGameUI (status is not lobby)');
                this.phaseText.setText(this.gameState.phase.charAt(0).toUpperCase() + this.gameState.phase.slice(1));
                
                // Update raise counter display
                if (this.gameState.currentRaisesInRound !== undefined && this.gameState.maxRaisesPerRound !== undefined) {
                    this.raiseCounterText.setText(`Raises: ${this.gameState.currentRaisesInRound}/${this.gameState.maxRaisesPerRound}`);
                } else {
                    this.raiseCounterText.setText('');
                }
                
                // Update turn indicator
                this.updateTurnIndicator();
                
                this.updateGameUI();
            }
            
            // Update community cards
            this.updateCommunityCards();
            
            // Update all player displays
            this.players.forEach(player => {
                this.updatePlayerDisplay(player.id);
            });
        } finally {
            this._updatingUI = false;
        }
    }

    updateTurnIndicator() {
        if (!this.gameState || this.gameState.status !== 'playing') {
            this.turnIndicatorText.setText('');
            return;
        }

        // Check if game is in showdown phase
        if (this.gameState.phase === 'showdown') {
            this.turnIndicatorText.setText('Showdown - Game ended');
            this.turnIndicatorText.setFill('#FF6B6B');
            return;
        }

        // Use the same logic as NetworkManager.isMyTurn() for consistency
        const isMyTurn = this.networkManager.isMyTurn();
        const currentPlayer = this.players.find(p => p.isCurrentPlayer);
        
        console.log('FastGameScene: updateTurnIndicator - turn check:', {
            isMyTurn,
            currentPlayer: currentPlayer ? {
                id: currentPlayer.id,
                name: currentPlayer.name
            } : null,
            myPlayerId: this.myPlayerId
        });
        
        if (currentPlayer) {
            if (isMyTurn) {
                this.turnIndicatorText.setText('🎯 YOUR TURN!');
                this.turnIndicatorText.setFill('#00FF00'); // Green for your turn
            } else {
                this.turnIndicatorText.setText(`Waiting for: ${currentPlayer.name}`);
                this.turnIndicatorText.setFill('#FFD700'); // Gold for other player's turn
            }
        } else {
            // No current player found
            this.turnIndicatorText.setText('Waiting for players...');
            this.turnIndicatorText.setFill('#FFD700');
        }
    }

    updateLobbyUI() {
        console.log('FastGameScene: updateLobbyUI called');
        
        // Hide poker action buttons
        this.foldButton.setVisible(false);
        this.callButton.setVisible(false);
        this.raiseButton.setVisible(false);
        this.allInButton.setVisible(false);
        this.foldButtonText.setVisible(false);
        this.callButtonText.setVisible(false);
        this.raiseButtonText.setVisible(false);
        this.allInButtonText.setVisible(false);
        
        // Show start game button if all players are ready
        // Check multiple conditions to ensure button is enabled after reconnection
        const allPlayersReady = this.gameState.allPlayersReady;
        const readyCount = this.gameState.readyCount || 0;
        const totalPlayers = this.gameState.totalPlayers || 0;
        const connectedPlayers = this.players ? this.players.filter(p => !p.disconnected).length : 0;
        
        console.log('FastGameScene: updateLobbyUI - start game button conditions:', {
            allPlayersReady,
            readyCount,
            totalPlayers,
            connectedPlayers,
            shouldEnable: (allPlayersReady || (readyCount >= 2 && readyCount === totalPlayers && totalPlayers >= 2))
        });
        
        if (allPlayersReady || (readyCount >= 2 && readyCount === totalPlayers && totalPlayers >= 2)) {
            this.startGameButton.setVisible(true);
            this.startGameButton.setInteractive();
            this.startGameButton.removeAllListeners('pointerdown');
            this.startGameButton.on('pointerdown', () => this.handleStartGame());
            this.startGameButtonText.setVisible(true);
            console.log('FastGameScene: updateLobbyUI - Start game button enabled');
        } else {
            // this.startGameButton.setVisible(false);
            // this.startGameButton.disableInteractive();
            // this.startGameButtonText.setVisible(false);
            console.log('FastGameScene: updateLobbyUI - Start game button disabled');
        }
        
        // Hide next round button
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);
    }

    updateGameUI() {
        // Hide start game button and disable it
        // this.startGameButton.setVisible(false);
        // this.startGameButton.disableInteractive();
        // this.startGameButtonText.setVisible(false);
        
        // Check if game is in showdown phase
        if (this.gameState.phase === 'showdown') {
            // Hide poker action buttons in showdown
            this.foldButton.setVisible(false);
            this.callButton.setVisible(false);
            this.raiseButton.setVisible(false);
            this.allInButton.setVisible(false);
            this.foldButtonText.setVisible(false);
            this.callButtonText.setVisible(false);
            this.raiseButtonText.setVisible(false);
            this.allInButtonText.setVisible(false);
            
            // Show next round button
            // this.nextRoundButton.setVisible(true);
            // this.nextRoundButtonText.setVisible(true);

            this.nextRoundButton.setInteractive();
            // Enable or visually disable next round button based on player permission
            if (this.canClickNextRound()) {
                this.nextRoundButton.setInteractive();
                this.nextRoundButton.setAlpha(1);
                this.nextRoundButtonText.setFill('#ffffff');
            } else {
                // this.nextRoundButton.disableInteractive();
                this.nextRoundButton.setAlpha(0.5);
                this.nextRoundButtonText.setFill('#888888');
            }
        } else {
            // Show poker action buttons for active game
            this.foldButton.setVisible(true);
            this.callButton.setVisible(true);
            this.raiseButton.setVisible(true);
            this.allInButton.setVisible(true);
            this.foldButtonText.setVisible(true);
            this.callButtonText.setVisible(true);
            this.raiseButtonText.setVisible(true);
            this.allInButtonText.setVisible(true);
            
            // Hide next round button
            this.nextRoundButton.setVisible(false);
            this.nextRoundButtonText.setVisible(false);
            
            // Update action buttons
            this.updateActionButtons();
        }
    }

    // Determines if the current player can click the next round button
    canClickNextRound() {
        const myPlayer = this.networkManager.getMyPlayer();
        console.log('FastGameScene: canClickNextRound check:', {
            myPlayer,
            isSpectator: myPlayer ? myPlayer.isSpectator : undefined,
            folded: myPlayer ? myPlayer.folded : undefined,
            allIn: myPlayer ? myPlayer.allIn : undefined,
            phase: this.gameState ? this.gameState.phase : undefined
        });
        if (myPlayer.isSpectator || myPlayer.folded || myPlayer.allIn) return false;
        return true;
    }

    updateCommunityCards() {
        if (!this.gameState.communityCards) return;
        
        // Clear existing community cards
        this.communityCardsContainer.removeAll(true);
        
        // Add community cards
        this.gameState.communityCards.forEach((card, index) => {
            const cardX = -380 + (index * 200);
            const cardY = 0;
            const cardKey = `${card.value}_of_${card.suit}`;
            
            if (this.textures.exists(cardKey)) {
                const cardSprite = this.add.image(cardX, cardY, cardKey);
                cardSprite.setScale(0.3);
                this.communityCardsContainer.add(cardSprite);
            }
        });
    }

    updatePlayerDisplay(playerId) {
        const player = this.players.find(p => p.id === playerId);
        const elements = this.playerElements.get(playerId);
        
        if (!player || !elements) return;
        
        // Update bank display
        elements.bankText.setText(`$${player.bank}`);
        
        // Update player name with current bet if applicable
        let displayName = player.name;
        
        // Show game status (no ready status since players are auto-ready)
        if (this.gameState.status === 'playing') {
            if (player.currentBet > 0) {
                displayName += ` ($${player.currentBet})`;
            }
            if (player.folded) {
                displayName += ' [FOLDED]';
            }
            if (player.allIn) {
                displayName += ' [ALL IN]';
            }
            if (player.isSpectator) {
                displayName += ' [SPECTATOR]';
            }
        }
        
        elements.playerName.setText(displayName);
        
        // Highlight current player
        if (player.isCurrentPlayer) {
            elements.avatar.setTint(0x00ff00); // Green tint for current player
        } else {
            elements.avatar.clearTint();
        }
        
        // Update cards if this is a new hand and game has started
        if (this.gameState.status === 'playing' && player.hand && player.hand.length > 0) {
            this.updatePlayerCards(player, elements);
        }
    }

    updatePlayerCards(player, elements) {
        // Don't show cards for spectators
        if (player.isSpectator) {
            console.log('FastGameScene: Hiding cards for spectator player:', player.name);
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
            return;
            
        }
        
        // Only update cards if game has started and player has cards
        if (this.gameState.status !== 'playing' || !player.hand || player.hand.length === 0) {
            // Clear any existing cards if game is not started
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
            return;
        }
        
        // Clear existing cards
        this.cardManager.safeClearPlayerCards(elements.playerNumber);
        
        // Add new cards
        player.hand.forEach((card, cardIndex) => {
            const isMyPlayer = player.id === this.myPlayerId;
            this.cardManager.addCardToPlayer(
                elements.playerNumber,
                card.value,
                card.suit,
                isMyPlayer
            );
        });
    }

    updateActionButtons() {
        // Add call stack protection to prevent infinite loops
        if (this._updatingActionButtons) {
            console.log('FastGameScene: updateActionButtons called recursively, preventing loop');
            return;
        }
        
        this._updatingActionButtons = true;
        
        try {
            // Check if game state exists and is in playing status
            if (!this.gameState) {
                console.log('FastGameScene: No game state available - disabling all actions');
                this.disablePlayerActions();
                return;
            }
            
            if (this.gameState.status !== 'playing') {
                console.log('FastGameScene: Game not in playing status - disabling all actions');
                this.disablePlayerActions();
                return;
            }
            
            const isMyTurn = this.networkManager.isMyTurn();
            const myPlayer = this.networkManager.getMyPlayer();
            
            console.log('FastGameScene: updateActionButtons - detailed check:', {
                gameState: this.gameState ? {
                    status: this.gameState.status,
                    phase: this.gameState.phase
                } : null,
                isMyTurn,
                myPlayer: myPlayer ? {
                    id: myPlayer.id,
                    name: myPlayer.name,
                    folded: myPlayer.folded,
                    allIn: myPlayer.allIn,
                    isSpectator: myPlayer.isSpectator
                } : null
            });
            
            // Disable actions if game is in showdown phase
            if (this.gameState.phase === 'showdown') {
                console.log('FastGameScene: Game in showdown phase - disabling all actions');
                this.disablePlayerActions();
                return;
            }
            
            // Disable actions if player is a spectator
            if (myPlayer && myPlayer.isSpectator) {
                console.log('FastGameScene: Player is spectator - disabling actions');
                this.disablePlayerActions();
                return;
            }
            
            if (isMyTurn && myPlayer && !myPlayer.folded && !myPlayer.allIn) {
                console.log('FastGameScene: All conditions met - enabling action buttons');
                
                // Enable basic action buttons (fold, call, all-in)
                this.foldButton.setInteractive();
                this.callButton.setInteractive();
                this.allInButton.setInteractive();
                
                // Reset text colors to normal for enabled buttons
                this.foldButtonText.setFill('#ffffff');
                this.callButtonText.setFill('#ffffff');
                this.allInButtonText.setFill('#ffffff');
                
                console.log('FastGameScene: Basic action buttons enabled - it is my turn');
                
                // Check raise button separately based on raise limit
                const canRaise = this.networkManager.canRaise();
                if (canRaise) {
                    // Enable raise button if raises are still allowed
                    this.raiseButton.setInteractive();
                    this.raiseButtonText.setFill('#ffffff'); // Normal text color
                    console.log('FastGameScene: Raise button enabled - raises still allowed');
                } else {
                    // Disable raise button if maximum raises reached
                    this.raiseButton.disableInteractive();
                    this.raiseButtonText.setFill('#888888'); // Gray out the text
                    console.log('FastGameScene: Raise button disabled - maximum raises reached for this round');
                }
                
                // Double-check button interactivity after enabling
                console.log('FastGameScene: Final button interactivity check:', {
                    foldButton: this.foldButton.input ? this.foldButton.input.enabled : 'no input',
                    callButton: this.callButton.input ? this.callButton.input.enabled : 'no input',
                    raiseButton: this.raiseButton.input ? this.raiseButton.input.enabled : 'no input',
                    allInButton: this.allInButton.input ? this.allInButton.input.enabled : 'no input'
                });
            } else {
                console.log('FastGameScene: Conditions not met for enabling buttons:', {
                    isMyTurn,
                    hasMyPlayer: !!myPlayer,
                    playerFolded: myPlayer ? myPlayer.folded : 'no player',
                    playerAllIn: myPlayer ? myPlayer.allIn : 'no player'
                });
                // this.disablePlayerActions();
            }
        } finally {
            this._updatingActionButtons = false;
        }
    }

    createButtonLabels() {
        // Button labels are created in createPokerActionLabels
    }

    createPokerActionLabels() {
        this.foldButtonText = this.add
            .text(310, 628, 'СБРОСИТЬ', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);


        this.callButtonText = this.add
            .text(510, 628, 'УРАВНЯТЬ', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.raiseButtonText = this.add
            .text(710, 628, 'ПОДНЯТЬ', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.allInButtonText = this.add
            .text(910, 628, 'ВА-БАНК', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
    }

    createNextRoundButtonLabel() {
        this.nextRoundButtonText = this.add
            .text(120, 180, 'СЛЕДУЮЩИЙ РАУНД', {
                fontFamily: 'Arial',
                fontSize: '16px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
        this.nextRoundButtonText.setVisible(false);
    }

    createStartGameButtonLabel() {
        this.startGameButtonText = this.add
            .text(120, 220, 'НОВАЯ ИГРА', {
                fontFamily: 'Arial',
                fontSize: '16px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
        // this.startGameButtonText.setVisible(false);
    }

    setupButtonHandlers() {
        // Setup button click handlers
        this.foldButton.on('pointerdown', () => this.handleFold());
        this.callButton.on('pointerdown', () => this.handleCall());
        this.raiseButton.on('pointerdown', () => this.handleRaise());
        this.allInButton.on('pointerdown', () => this.handleAllIn());
        this.menuGame.on('pointerdown', () => this.handleMenu());
        this.settingsGame.on('pointerdown', () => this.handleSettings());
        this.chatButton.on('pointerdown', () => this.handleChat());
        this.nextRoundButton.on('pointerdown', () => this.handleNextRound());
        
        // Start game button handler only
        this.startGameButton.on('pointerdown', () => this.handleStartGame());
    }

    enablePlayerActions() {
        console.log('FastGameScene: enablePlayerActions called');
        
        // Enable action buttons for human player (excluding raise button which is handled separately)
        this.foldButton.setInteractive();
        this.callButton.setInteractive();
        this.allInButton.setInteractive();
        
        // Reset text colors to normal
        this.foldButtonText.setFill('#ffffff');
        this.callButtonText.setFill('#ffffff');
        this.allInButtonText.setFill('#ffffff');
        // Note: raise button is handled separately in updateActionButtons() based on raise limits
        
        console.log('FastGameScene: Basic action buttons enabled (raise button handled separately)');
        
        // Debug: Check if buttons are actually interactive
        console.log('FastGameScene: Button interactivity status:', {
            foldButton: this.foldButton.input ? this.foldButton.input.enabled : 'no input',
            callButton: this.callButton.input ? this.callButton.input.enabled : 'no input',
            raiseButton: this.raiseButton.input ? this.raiseButton.input.enabled : 'no input',
            allInButton: this.allInButton.input ? this.allInButton.input.enabled : 'no input'
        });
    }

    disablePlayerActions() {
        console.log('FastGameScene: disablePlayerActions called - stack trace:', new Error().stack);
        
        // Disable action buttons
        this.foldButton.disableInteractive();
        this.callButton.disableInteractive();
        this.raiseButton.disableInteractive();
        this.allInButton.disableInteractive();
        
        // Gray out text colors to indicate disabled state
        this.foldButtonText.setFill('#888888');
        this.callButtonText.setFill('#888888');
        this.raiseButtonText.setFill('#888888');
        this.allInButtonText.setFill('#888888');
        
        console.log('FastGameScene: All action buttons disabled');
    }

    // Debug method to force enable buttons
    forceEnableButtons() {
        console.log('FastGameScene: FORCE ENABLING ALL BUTTONS (DEBUG)');
        
        // Force enable all buttons
        this.foldButton.setInteractive();
        this.callButton.setInteractive();
        this.raiseButton.setInteractive();
        this.allInButton.setInteractive();
        
        // Reset text colors
        this.foldButtonText.setFill('#ffffff');
        this.callButtonText.setFill('#ffffff');
        this.raiseButtonText.setFill('#ffffff');
        this.allInButtonText.setFill('#ffffff');
        
        console.log('FastGameScene: All buttons force-enabled');
        
        // Check button interactivity
        console.log('FastGameScene: Force-enabled button interactivity status:', {
            foldButton: this.foldButton.input ? this.foldButton.input.enabled : 'no input',
            callButton: this.callButton.input ? this.callButton.input.enabled : 'no input',
            raiseButton: this.raiseButton.input ? this.raiseButton.input.enabled : 'no input',
            allInButton: this.allInButton.input ? this.allInButton.input.enabled : 'no input'
        });
    }

    handleFold() {
        console.log('FastGameScene: handleFold called');
        
        if (!this.networkManager.isMyTurn()) {
            console.log('FastGameScene: handleFold - not my turn');
            return;
        }
        if (this.gameState.phase === 'showdown') {
            console.log('FastGameScene: handleFold - game in showdown');
            return;
        }
        
        const myPlayer = this.networkManager.getMyPlayer();
        if (myPlayer && myPlayer.isSpectator) {
            console.log('FastGameScene: Spectators cannot make actions');
            return;
        }
        
        if (myPlayer && (myPlayer.folded || myPlayer.allIn)) {
            console.log('FastGameScene: Player cannot act - folded or all-in');
            return;
        }
        
        console.log('FastGameScene: handleFold - sending action');
        try {
            this.networkManager.sendPokerAction('fold');
            this.disablePlayerActions();
        } catch (error) {
            console.error('FastGameScene: Error sending fold action:', error);
        }
    }

    handleCall() {
        if (!this.networkManager.isMyTurn()) return;
        if (this.gameState.phase === 'showdown') return;
        
        const myPlayer = this.networkManager.getMyPlayer();
        if (myPlayer && myPlayer.isSpectator) {
            console.log('FastGameScene: Spectators cannot make actions');
            return;
        }
        
        if (myPlayer && (myPlayer.folded || myPlayer.allIn)) {
            console.log('FastGameScene: Player cannot act - folded or all-in');
            return;
        }
        
        try {
            const currentBet = this.gameState.currentBet;
            const callAmount = currentBet - myPlayer.currentBet;
            
            if (callAmount <= 0) {
                this.networkManager.sendPokerAction('check');
            } else {
                this.networkManager.sendPokerAction('call', callAmount);
            }
            
            this.disablePlayerActions();
        } catch (error) {
            console.error('FastGameScene: Error sending call action:', error);
        }
    }

    handleRaise() {
        if (!this.networkManager.isMyTurn()) return;
        if (this.gameState.phase === 'showdown') return;
        
        const myPlayer = this.networkManager.getMyPlayer();
        if (myPlayer && myPlayer.isSpectator) {
            console.log('FastGameScene: Spectators cannot make actions');
            return;
        }
        
        if (myPlayer && (myPlayer.folded || myPlayer.allIn)) {
            console.log('FastGameScene: Player cannot act - folded or all-in');
            return;
        }
        
        // Check if we can still raise - but don't prevent the button from being enabled
        if (!this.networkManager.canRaise()) {
            console.log('FastGameScene: Cannot raise - limit reached, but button remains enabled');
            // Don't return here - let the server handle the validation
        }
        
        try {
            let totalBetAmount;
            
            // Default big blind if not defined
            const bigBlind = this.gameState.bigBlind || 20;
            
            if (this.gameState.currentBet === 0) {
                // No current bet, so minimum raise is big blind
                totalBetAmount = bigBlind;
            } else {
                // Current bet exists, so raise must be at least current bet + 10
                totalBetAmount = this.gameState.currentBet + 10;
            }
            
            // Ensure totalBetAmount is a valid number
            if (isNaN(totalBetAmount) || totalBetAmount <= 0) {
                console.error('FastGameScene: Invalid raise amount calculated:', totalBetAmount);
                return;
            }
            
            // Check if player has enough money for the minimum raise
            const additionalAmountNeeded = totalBetAmount - myPlayer.currentBet;
            if (myPlayer.bank < additionalAmountNeeded) {
                // Player doesn't have enough for minimum raise, make it all-in
                console.log('FastGameScene: Insufficient funds for minimum raise, making all-in');
                this.networkManager.sendPokerAction('allIn', myPlayer.bank);
            } else {
                // Player has enough money, proceed with normal raise
                // Ensure we don't exceed player's bank
                totalBetAmount = Math.min(totalBetAmount, myPlayer.bank);
                
                // Calculate the additional amount needed
                const additionalAmount = totalBetAmount - myPlayer.currentBet;
                
                console.log('FastGameScene: Raise calculation:', {
                    currentBet: this.gameState.currentBet,
                    myCurrentBet: myPlayer.currentBet,
                    totalBetAmount,
                    additionalAmount,
                    myBank: myPlayer.bank,
                    bigBlind
                });
                
                this.networkManager.sendPokerAction('raise', totalBetAmount);
            }
            
            this.disablePlayerActions();
        } catch (error) {
            console.error('FastGameScene: Error sending raise action:', error);
        }
    }

    handleAllIn() {
        if (!this.networkManager.isMyTurn()) return;
        if (this.gameState.phase === 'showdown') return;
        
        const myPlayer = this.networkManager.getMyPlayer();
        if (myPlayer && myPlayer.isSpectator) {
            console.log('FastGameScene: Spectators cannot make actions');
            return;
        }
        
        if (myPlayer && (myPlayer.folded || myPlayer.allIn)) {
            console.log('FastGameScene: Player cannot act - folded or all-in');
            return;
        }
        
        try {
            this.networkManager.sendPokerAction('allIn', myPlayer.bank);
            this.disablePlayerActions();
        } catch (error) {
            console.error('FastGameScene: Error sending all-in action:', error);
        }
    }

    handleMenu() {
        // Clean up before switching scenes
        this.shutdown();
        this.scene.start('LobbyScene');
    }

    handleSettings() {
        // Handle settings
    }

    handleChat() {
        if (this.chatManager) {
            this.chatManager.toggleChat();
        }
    }

    handleStartGame() {
        try {
            this.networkManager.startGame();
        } catch (error) {
            console.error('FastGameScene: Error starting game:', error);
        }
    }

    handleNextRound() {
        try {
            this.networkManager.resetRoom();
            this.nextRoundButton.setVisible(false);
            this.nextRoundButtonText.setVisible(false);
        } catch (error) {
            console.error('FastGameScene: Error resetting room:', error);
        }
    }

    update() {
        // Game loop updates
        // Periodic room UI sync every 300ms
        if (!this.lastUISyncTime) {
            this.lastUISyncTime = Date.now();
        }
        
        const currentTime = Date.now();

        if (currentTime - this.lastUISyncTime >= 1000) {
            this.lastUISyncTime = currentTime;
            this.syncRoomUI();
        }
    }

    syncRoomUI() {

        // console.log('FastGameScene: syncRoomUI called');
        // Only sync if we have a game state and players
        if (!this.gameState || !this.players || this.players.length === 0) {
            // console.log('FastGameScene: syncRoomUI - no game state or players, skipping');
            return;
        }
        
        // Get all available positions
        const positions = [
            { x: 280, y: 270 }, // Top left
            { x: 280, y: 460 }, // Bottom left
            { x: 670, y: 520 }, // Bottom center (human player)
            { x: 980, y: 270 }, // Top right
            { x: 980, y: 460 }, // Bottom right
            { x: 670, y: 200 }  // Top center
        ];
        
        // Check for position conflicts and fix them
        const positionMap = new Map(); // position index -> player ID
        const conflicts = [];
        
        this.playerElements.forEach((elements, playerId) => {
            const player = this.players.find(p => p.id === playerId);
            if (player) {
                // Try to determine current position by checking avatar position
                const avatarX = elements.avatar.x;
                const avatarY = elements.avatar.y;
                
                // Find which position this player is currently at
                let currentPositionIndex = -1;
                for (let i = 0; i < positions.length; i++) {
                    if (Math.abs(avatarX - positions[i].x) < 10 && Math.abs(avatarY - positions[i].y) < 10) {
                        currentPositionIndex = i;
                        break;
                    }
                }
                
                if (currentPositionIndex !== -1) {
                    if (positionMap.has(currentPositionIndex)) {
                        // Conflict detected - two players at same position
                        conflicts.push({
                            playerId: playerId,
                            playerName: player.name,
                            positionIndex: currentPositionIndex,
                            existingPlayerId: positionMap.get(currentPositionIndex)
                        });
                    } else {
                        positionMap.set(currentPositionIndex, playerId);
                    }
                }
            }
        });
        
        // Fix conflicts by reassigning positions
        if (conflicts.length > 0) {
            // console.log('FastGameScene: syncRoomUI - Position conflicts detected:', conflicts);
            
            conflicts.forEach(conflict => {
                // Find available position for this player
                let availablePositionIndex = -1;
                for (let i = 0; i < positions.length; i++) {
                    if (!positionMap.has(i)) {
                        availablePositionIndex = i;
                        positionMap.set(i, conflict.playerId);
                        break;
                    }
                }
                
                if (availablePositionIndex !== -1) {
                    // Move player to new position
                    const elements = this.playerElements.get(conflict.playerId);
                    if (elements) {
                        const newPosition = positions[availablePositionIndex];
                        elements.avatar.setPosition(newPosition.x, newPosition.y);
                        elements.nameBackground.setPosition(newPosition.x - 90, newPosition.y);
                        elements.playerName.setPosition(newPosition.x - 90, newPosition.y);
                        elements.bankText.setPosition(newPosition.x, newPosition.y + 70);
                        
                        // Update card container position
                        this.cardManager.updateCardContainerPosition(availablePositionIndex + 1, newPosition.x + 60, newPosition.y + 30);
                        
                        // console.log(`FastGameScene: syncRoomUI - Moved ${conflict.playerName} from position ${conflict.positionIndex + 1} to position ${availablePositionIndex + 1}`);
                    }
                } else {
                    // console.warn(`FastGameScene: syncRoomUI - No available position for ${conflict.playerName}`);
                }
            });
        }
        
        // Check if all players in the game state have UI elements
        const missingPlayers = this.players.filter(player => {
            return !this.playerElements.has(player.id);
        });
        
        if (missingPlayers.length > 0) {
            // console.log('FastGameScene: syncRoomUI - missing UI for players:', missingPlayers.map(p => p.name));
            
            // Find which positions are already occupied
            const occupiedPositions = new Set();
            this.playerElements.forEach((elements, playerId) => {
                const player = this.players.find(p => p.id === playerId);
                if (player) {
                    const avatarX = elements.avatar.x;
                    const avatarY = elements.avatar.y;
                    
                    for (let i = 0; i < positions.length; i++) {
                        if (Math.abs(avatarX - positions[i].x) < 10 && Math.abs(avatarY - positions[i].y) < 10) {
                            occupiedPositions.add(i);
                            break;
                        }
                    }
                }
            });
            
            // console.log('FastGameScene: syncRoomUI - occupied positions:', Array.from(occupiedPositions));
            
            // Rebuild player UI for missing players using available positions
            missingPlayers.forEach(player => {
                // Find the first available position
                let availablePositionIndex = -1;
                for (let i = 0; i < positions.length; i++) {
                    if (!occupiedPositions.has(i)) {
                        availablePositionIndex = i;
                        occupiedPositions.add(i); // Mark as occupied
                        break;
                    }
                }
                
                if (availablePositionIndex !== -1) {
                    this.createPlayerUI(player, positions[availablePositionIndex], availablePositionIndex + 1);
                    // console.log(`FastGameScene: syncRoomUI - Created UI for missing player: ${player.name} at position ${availablePositionIndex + 1}`);
                } else {
                    // console.warn(`FastGameScene: syncRoomUI - No available position for player: ${player.name}`);
                }
            });
        } else {
            // console.log('FastGameScene: syncRoomUI - No missing player UIs');
        }
        
        // Ensure all existing players are visible
        this.playerElements.forEach((elements, playerId) => {
            const player = this.players.find(p => p.id === playerId);
            if (player && !player.disconnected) {
                // Make sure all UI elements are visible
                if (!elements.avatar.visible) {
                    elements.avatar.setVisible(true);
                    elements.nameBackground.setVisible(true);
                    elements.playerName.setVisible(true);
                    elements.bankText.setVisible(true);
                    this.cardManager.showPlayerCards(elements.playerNumber);
                    console.log(`FastGameScene: syncRoomUI - Made player visible: ${player.name}`);
                }
            }
        });
        
        // Ensure next round button is properly configured if visible
        if (this.nextRoundButton.visible) {
            if (this.canClickNextRound()) {
                this.nextRoundButton.setInteractive();
                this.nextRoundButton.setAlpha(1);
                this.nextRoundButtonText.setFill('#ffffff');
                console.log('FastGameScene: syncRoomUI - Next round button made interactive');
            } else {
                this.nextRoundButton.setAlpha(0.5);
                this.nextRoundButtonText.setFill('#888888');
                console.log('FastGameScene: syncRoomUI - Next round button made non-interactive');
            }
        }
        
        // Check if it's my turn and enable player actions
        // if (this.gameState && this.gameState.status === 'playing') {
        //     const isMyTurn = this.networkManager.isMyTurn();
        //     const myPlayer = this.networkManager.getMyPlayer();
            
        //     if (isMyTurn && myPlayer && !myPlayer.folded && !myPlayer.allIn && !myPlayer.isSpectator) {
        //         this.enablePlayerActions();
        //         console.log('FastGameScene: syncRoomUI - Enabled player actions for my turn');
        //     }
        // }
        
        console.log('FastGameScene: syncRoomUI complete');
    }

    shutdown() {
        console.log('FastGameScene: Shutting down and cleaning up resources');
        
        // Clean up network manager
        if (this.networkManager) {
            this.networkManager.cleanup();
        }
        
        // Clean up managers
        if (this.cardManager) {
            this.cardManager.cleanup();
        }
        if (this.uiManager) {
            this.uiManager.cleanup();
        }
        if (this.chatManager) {
            this.chatManager.cleanup();
        }

        // Clean up UI elements
        this.playerElements.forEach(elements => {
            Object.values(elements).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
        });

        // Clear all timers and intervals
        if (this.actionTimer) {
            clearTimeout(this.actionTimer);
            this.actionTimer = null;
        }

        // Remove all scene events
        this.events.removeAllListeners();
        
        // Clear any remaining game objects
        this.children.removeAll(true);

        console.log('FastGameScene: Cleanup completed');
    }

    handleNewPlayerJoined(newPlayerName, readyPlayersCount, totalPlayers) {
        // Show notification that a new player joined during lobby
        const playerName = newPlayerName || 'Игрок';
        this.handRank.setText(`${playerName} присоединился к лобби. (${readyPlayersCount}/${totalPlayers} готовы)`);
        this.handRank.setFill('#FFD700'); // Gold color for notification
        // Clear notification after 5 seconds
        this.time.delayedCall(5000, () => {
            if (this.handRank && this.gameState && this.gameState.status === 'lobby') {
                this.handRank.setText('');
            }
        });
        this.updateUI();
        console.log(`FastGameScene: Notified about new player joining: ${playerName}`);
    }

    hideDisconnectedPlayer(playerId) {
        const elements = this.playerElements.get(playerId);
        if (elements) {
            // Hide avatar
            elements.avatar.setVisible(false);
            // Hide name background
            elements.nameBackground.setVisible(false);
            // Hide player name text
            elements.playerName.setVisible(false);
            // Hide bank text
            elements.bankText.setVisible(false);
            // Hide card container
            this.cardManager.hidePlayerCards(elements.playerNumber);
            console.log(`FastGameScene: Hiding disconnected player: ${playerId}`);
        }
    }

    showReconnectedPlayer(playerId) {
        const elements = this.playerElements.get(playerId);
        if (elements) {
            // Show avatar
            elements.avatar.setVisible(true);
            // Show name background
            elements.nameBackground.setVisible(true);
            // Show player name text
            elements.playerName.setVisible(true);
            // Show bank text
            elements.bankText.setVisible(true);
            // Show card container
            this.cardManager.showPlayerCards(elements.playerNumber);
            console.log(`FastGameScene: Showing reconnected player: ${playerId}`);
        }
    }

    restoreUIAfterReconnection() {
        console.log('FastGameScene: Restoring UI after reconnection');
        
        // Force a complete UI update
        this.updateUI();
        
        // Ensure all buttons are properly set up
        this.setupButtonHandlers();
        
        // If in lobby state, ensure start game button is interactive if conditions are met
        if (this.gameState && this.gameState.status === 'lobby') {
            const allPlayersReady = this.gameState.allPlayersReady;
            const readyCount = this.gameState.readyCount || 0;
            const totalPlayers = this.gameState.totalPlayers || 0;
            
            console.log('FastGameScene: restoreUIAfterReconnection - start game button check:', {
                allPlayersReady,
                readyCount,
                totalPlayers,
                shouldEnable: (allPlayersReady || (readyCount >= 2 && readyCount === totalPlayers && totalPlayers >= 2))
            });
            
            if (allPlayersReady || (readyCount >= 2 && readyCount === totalPlayers && totalPlayers >= 2)) {
                this.startGameButton.setVisible(true);
                this.startGameButton.setInteractive();
                this.startGameButton.removeAllListeners('pointerdown');
                this.startGameButton.on('pointerdown', () => this.handleStartGame());
                this.startGameButtonText.setVisible(true);
                console.log('FastGameScene: restoreUIAfterReconnection - Start game button enabled');
            }
        }
        
        // If in game state, ensure action buttons are properly configured
        if (this.gameState && this.gameState.status === 'playing') {
            console.log('FastGameScene: Game is in playing state, updating action buttons');
            
            // Check if it's the player's turn
            const isMyTurn = this.networkManager.isMyTurn();
            const myPlayer = this.networkManager.getMyPlayer();
            
            console.log('FastGameScene: Reconnection turn check:', {
                isMyTurn,
                myPlayer: myPlayer ? {
                    id: myPlayer.id,
                    name: myPlayer.name,
                    folded: myPlayer.folded,
                    allIn: myPlayer.allIn,
                    isSpectator: myPlayer.isSpectator
                } : null,
                gamePhase: this.gameState.phase
            });
            
            // Force update action buttons
            this.updateActionButtons();
            
            // If it's the player's turn, ensure buttons are enabled
            if (isMyTurn && myPlayer && !myPlayer.folded && !myPlayer.allIn && !myPlayer.isSpectator) {
                console.log('FastGameScene: It is my turn after reconnection - enabling buttons');
                this.enablePlayerActions();
                
                // Handle raise button separately based on raise limits
                const canRaise = this.networkManager.canRaise();
                if (canRaise) {
                    this.raiseButton.setInteractive();
                    this.raiseButtonText.setFill('#ffffff');
                    console.log('FastGameScene: Raise button enabled after reconnection - raises still allowed');
                } else {
                    this.raiseButton.disableInteractive();
                    this.raiseButtonText.setFill('#888888');
                    console.log('FastGameScene: Raise button disabled after reconnection - maximum raises reached');
                }
                
                // Double-check button interactivity
                console.log('FastGameScene: Button interactivity check after reconnection:', {
                    foldButton: this.foldButton.input ? this.foldButton.input.enabled : 'no input',
                    callButton: this.callButton.input ? this.callButton.input.enabled : 'no input',
                    raiseButton: this.raiseButton.input ? this.raiseButton.input.enabled : 'no input',
                    allInButton: this.allInButton.input ? this.allInButton.input.enabled : 'no input'
                });
            } else {
                console.log('FastGameScene: Not my turn after reconnection or player cannot act');
            }
        }
        
        // Force update of next round button if in showdown phase
        if (this.gameState && this.gameState.phase === 'showdown') {
            this.updateGameUI();
            console.log('FastGameScene: Forced updateGameUI after reconnection for showdown phase');
        }
        
        console.log('FastGameScene: UI restoration after reconnection complete');
        
        // Additional safety check: if it's the player's turn, force enable buttons
        if (this.gameState && this.gameState.status === 'playing') {
            const isMyTurn = this.networkManager.isMyTurn();
            const myPlayer = this.networkManager.getMyPlayer();
            
            if (isMyTurn && myPlayer && !myPlayer.folded && !myPlayer.allIn && !myPlayer.isSpectator) {
                console.log('FastGameScene: Safety check - forcing button enable after reconnection');
                
                // Force enable basic buttons
                this.foldButton.setInteractive();
                this.callButton.setInteractive();
                this.allInButton.setInteractive();
                
                // Reset text colors for basic buttons
                this.foldButtonText.setFill('#ffffff');
                this.callButtonText.setFill('#ffffff');
                this.allInButtonText.setFill('#ffffff');
                
                // Handle raise button based on raise limits
                const canRaise = this.networkManager.canRaise();
                if (canRaise) {
                    this.raiseButton.setInteractive();
                    this.raiseButtonText.setFill('#ffffff');
                    console.log('FastGameScene: Raise button force-enabled after reconnection - raises allowed');
                } else {
                    this.raiseButton.disableInteractive();
                    this.raiseButtonText.setFill('#888888');
                    console.log('FastGameScene: Raise button force-disabled after reconnection - max raises reached');
                }
                
                console.log('FastGameScene: Buttons force-enabled after reconnection');
            }
        }
    }

    handleRoomResetToOnePlayer() {
        console.log('FastGameScene: Handling room reset to one player');
        // Clear all cards and community cards
        this.playerElements.forEach((elements, playerId) => {
            this.cardManager.safeClearPlayerCards(elements.playerNumber);
        });
        this.communityCardsContainer.removeAll(true);
        this.handRank.setText('Все остальные игроки покинули комнату. Ожидание новых игроков...');
        this.handRank.setFill('#FFD700');
        this.clearCardHighlights();
        this.nextRoundButton.setVisible(false);
        this.nextRoundButtonText.setVisible(false);

        // Hide all disconnected players, show only the last remaining player
        this.playerElements.forEach((elements, playerId) => {
            const player = this.players.find(p => p.id === playerId);
            if (!player || player.disconnected) {
                // Hide disconnected or non-existent player
                elements.avatar.setVisible(false);
                elements.nameBackground.setVisible(false);
                elements.playerName.setVisible(false);
                elements.bankText.setVisible(false);
                this.cardManager.hidePlayerCards(elements.playerNumber);
                console.log(`FastGameScene: Hiding disconnected player in room reset: ${player ? player.name : playerId}`);
            } else {
                // Show the last remaining player
                elements.avatar.setVisible(true);
                elements.nameBackground.setVisible(true);
                elements.playerName.setVisible(true);
                elements.bankText.setVisible(true);
                this.cardManager.showPlayerCards(elements.playerNumber);
                console.log(`FastGameScene: Showing last remaining player: ${player.name}`);
            }
        });

        // Reset UI to lobby state
        this.updateLobbyUI();
        console.log('FastGameScene: Room reset to one player complete - only last player visible');
    }
}