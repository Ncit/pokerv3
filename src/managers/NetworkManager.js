import { EventManager } from '../utils/EventManager.js';
import { createSocketOptionsWithNgrokHeaders } from '../utils/NgrokUtils.js';
import { getEnvironment } from '../config/EnvironmentConfig.js';

export class NetworkManager {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.gameId = null;
        this.playerId = null;
        this.serverUrl = this.getServerUrl();
        this.eventManager = new EventManager();
        
        // Connection state
        this.connectionAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
        
        // Game state cache
        this.gameState = null;
        this.players = [];
        
        // Ngrok header for all requests
        this.ngrokHeaders = {
            'ngrok-skip-browser-warning': '69420'
        };
        
        this.setupEventListeners();
    }

    getServerUrl() {
        const environment = getEnvironment();
        
        switch (environment) {
            case 'development':
            case 'productionVK':
            case 'productionTelegram':
            default:
                return 'https://nikmobdev.ru';
        }
    }

    setupEventListeners() {
        // Remove the circular reference - these listeners are not needed
        // as the socket events are handled directly in setupSocketListeners
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                console.log('NetworkManager: Connecting to server...');
                
                // Import socket.io-client dynamically
                import('https://cdn.socket.io/4.7.2/socket.io.esm.min.js')
                    .then(({ io }) => {
                        // Use standard socket options since we're not using ngrok anymore
                        const socketOptions = {
                            transports: ['websocket', 'polling'],
                            timeout: 20000,
                            reconnection: true,
                            reconnectionAttempts: this.maxReconnectAttempts,
                            reconnectionDelay: this.reconnectDelay,
                            path: '/pokerserver/socket.io'
                        };
                        
                        this.socket = io('https://nikmobdev.ru', socketOptions);

                        this.setupSocketListeners();
                        
                        this.socket.on('connect', () => {
                            console.log('NetworkManager: Connected to server');
                            this.isConnected = true;
                            this.connectionAttempts = 0;
                            resolve();
                        });

                        this.socket.on('connect_error', (error) => {
                            console.error('NetworkManager: Connection error:', error);
                            this.isConnected = false;
                            reject(error);
                        });

                        this.socket.on('disconnect', (reason) => {
                            console.log('NetworkManager: Disconnected from server:', reason);
                            this.isConnected = false;
                            this.eventManager.emit('disconnected', { reason });
                        });

                    })
                    .catch(error => {
                        console.error('NetworkManager: Failed to load socket.io:', error);
                        reject(error);
                    });

            } catch (error) {
                console.error('NetworkManager: Connection setup error:', error);
                reject(error);
            }
        });
    }

    setupSocketListeners() {
        if (!this.socket) return;

        // Game events
        this.socket.on('gameJoined', (data) => {
            console.log('NetworkManager: Game joined:', data);
            this.gameId = data.gameId;
            this.playerId = data.playerId;
            this.gameState = data.gameState;
            this.players = data.players;
            
            // Store reconnection state for this session
            this.isReconnection = data.isReconnection || false;
            
            this.eventManager.emit('gameJoined', data);
        });

        this.socket.on('gameStateUpdate', (data) => {
            console.log('NetworkManager: Game state update:', data);
            
            // Validate game state data
            if (!data || !data.gameState) {
                console.warn('NetworkManager: Received invalid gameStateUpdate data:', data);
                return;
            }
            
            this.gameState = data.gameState;
            this.players = data.gameState.players || [];
            
            // Emit directly to scene without going through handleGameStateUpdate
            this.eventManager.emit('gameStateChanged', {
                gameState: this.gameState,
                lastAction: data.lastAction,
                newHand: data.newHand,
                gameStarted: data.gameStarted,
                roomReset: data.roomReset,
                roomResetToOnePlayer: data.roomResetToOnePlayer,
                playerLeft: data.playerLeft,
                newPlayerJoined: data.newPlayerJoined,
                leavingPlayerName: data.leavingPlayerName,
                isReconnection: this.isReconnection
            });
            
            // Reset reconnection flag after first game state update
            if (this.isReconnection) {
                this.isReconnection = false;
            }
        });

        this.socket.on('playerJoined', (data) => {
            console.log('NetworkManager: Player joined:', data);
            // Update players list
            const newPlayer = data.player;
            
            // Check if newPlayer exists and has an id
            if (!newPlayer || !newPlayer.id) {
                console.warn('NetworkManager: Received playerJoined event with invalid player data:', data);
                return;
            }
            
            const existingPlayerIndex = this.players.findIndex(p => p.id === newPlayer.id);
            
            if (existingPlayerIndex >= 0) {
                this.players[existingPlayerIndex] = newPlayer;
            } else {
                this.players.push(newPlayer);
            }
            
            this.eventManager.emit('playerJoined', data);
        });

        this.socket.on('playerLeft', (data) => {
            console.log('NetworkManager: Player left:', data);
            // Remove player from list
            if (data && data.playerId) {
                this.players = this.players.filter(p => p.id !== data.playerId);
            }
            
            this.eventManager.emit('playerLeft', data);
        });

        this.socket.on('playerDisconnected', (data) => {
            console.log('NetworkManager: Player disconnected (may reconnect):', data);
            // Mark player as disconnected but don't remove from list
            if (data && data.playerId) {
                const player = this.players.find(p => p.id === data.playerId);
                if (player) {
                    player.disconnected = true;
                }
            }
            
            this.eventManager.emit('playerDisconnected', data);
        });

        this.socket.on('playerReconnected', (data) => {
            console.log('NetworkManager: Player reconnected:', data);
            // Mark player as reconnected
            if (data && data.playerId) {
                const player = this.players.find(p => p.id === data.playerId);
                if (player) {
                    player.disconnected = false;
                }
            }
            
            this.eventManager.emit('playerReconnected', data);
        });

        this.socket.on('error', (data) => {
            console.error('NetworkManager: Server error:', data);
            this.eventManager.emit('networkError', data);
        });

        // Chat message events
        this.socket.on('chatMessage', (data) => {
            console.log('NetworkManager: Chat message received:', data);
            this.eventManager.emit('chatMessage', data);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        this.isConnected = false;
        this.gameId = null;
        this.playerId = null;
        this.gameState = null;
        this.players = [];
    }

    joinGame(playerData) {
        if (!this.isConnected || !this.socket) {
            throw new Error('Not connected to server');
        }

        console.log('NetworkManager: Joining game with player data:', playerData);
        this.socket.emit('joinGame', playerData);
    }

    sendPokerAction(action, amount = 0) {
        if (!this.isConnected || !this.socket) {
            throw new Error('Not connected to server');
        }

        console.log('NetworkManager: Sending poker action:', { action, amount });
        this.socket.emit('pokerAction', { action, amount });
    }

    startGame() {
        if (!this.isConnected || !this.socket) {
            throw new Error('Not connected to server');
        }

        console.log('NetworkManager: Starting game');
        this.socket.emit('startGame');
    }

    requestNewHand() {
        if (!this.isConnected || !this.socket) {
            throw new Error('Not connected to server');
        }

        console.log('NetworkManager: Requesting new hand');
        this.socket.emit('startNewHand');
    }

    resetRoom() {
        if (!this.isConnected || !this.socket) {
            throw new Error('Not connected to server');
        }

        console.log('NetworkManager: Requesting room reset');
        this.socket.emit('resetRoom');
    }

    sendChatMessage(message) {
        if (!this.isConnected || !this.socket) {
            throw new Error('Not connected to server');
        }

        console.log('NetworkManager: Sending chat message:', message);
        this.socket.emit('chatMessage', {
            message: message,
            timestamp: Date.now()
        });
    }

    // Event handlers - Remove these as they create circular references
    // handleGameStateUpdate, handlePlayerJoined, handlePlayerLeft, handleError are no longer needed

    // Utility methods
    isMyTurn() {
        if (!this.gameState || !this.playerId) return false;
        
        // Find the current player by checking the isCurrentPlayer property
        // Use this.players which is updated from gameStateUpdate
        const currentPlayer = this.players.find(p => p.isCurrentPlayer);
        
        console.log('NetworkManager: isMyTurn check:', {
            playerId: this.playerId,
            currentPlayer: currentPlayer ? currentPlayer.id : null,
            isMyTurn: currentPlayer && currentPlayer.id === this.playerId,
            totalPlayers: this.players.length,
            players: this.players.map(p => ({ id: p.id, name: p.name, isCurrentPlayer: p.isCurrentPlayer }))
        });
        
        return currentPlayer && currentPlayer.id === this.playerId;
    }

    getCurrentPlayer() {
        if (!this.players) return null;
        return this.players.find(p => p.isCurrentPlayer);
    }

    getMyPlayer() {
        if (!this.playerId || !this.players) return null;
        return this.players.find(p => p.id === this.playerId);
    }

    getPlayerById(playerId) {
        if (!this.players) return null;
        return this.players.find(p => p.id === playerId);
    }

    getActivePlayers() {
        if (!this.players) return [];
        return this.players.filter(p => !p.folded);
    }

    getRaiseInfo() {
        if (!this.gameState) return { currentRaises: 0, maxRaises: 3 };
        return {
            currentRaises: this.gameState.currentRaisesInRound || 0,
            maxRaises: this.gameState.maxRaisesPerRound || 3
        };
    }

    canRaise() {
        const raiseInfo = this.getRaiseInfo();
        return raiseInfo.currentRaises < raiseInfo.maxRaises;
    }

    // Event subscription methods
    on(event, callback) {
        this.eventManager.on(event, callback);
    }

    off(event, callback) {
        this.eventManager.off(event, callback);
    }

    // Connection status
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            gameId: this.gameId,
            playerId: this.playerId,
            playerCount: this.players.length
        };
    }

    // Cleanup
    cleanup() {
        this.disconnect();
        this.eventManager.cleanup();
    }

    // Utility method to make fetch requests with ngrok headers
    async fetchWithNgrokHeaders(url, options = {}) {
        const { fetchWithNgrokHeaders } = await import('../utils/NgrokUtils.js');
        return fetchWithNgrokHeaders(url, options);
    }
} 