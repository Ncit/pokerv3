import { eventManager } from '../utils/EventManager.js';
import { GameConfig } from '../config/GameConfig.js';

export class ChatManager {
    constructor(scene, networkManager) {
        this.scene = scene;
        this.networkManager = networkManager;
        this.eventManager = eventManager;
        
        // Chat state
        this.isChatOpen = false;
        this.messages = [];
        this.maxMessages = 50;
        
        // UI elements
        this.chatContainer = null;
        this.chatBackground = null;
        this.messagesContainer = null;
        this.inputField = null;
        this.sendButton = null;
        this.closeButton = null;
        
        // Chat visibility control
        this.isMultiplayer = false;
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Listen for network events to determine multiplayer status
        this.networkManager.on('gameJoined', (data) => {
            this.isMultiplayer = data.players && data.players.length > 1;
            this.updateChatVisibility();
        });

        this.networkManager.on('playerJoined', (data) => {
            this.isMultiplayer = true;
            this.updateChatVisibility();
        });

        this.networkManager.on('playerLeft', (data) => {
            // Check if we still have multiple players
            const playerCount = this.networkManager.players ? this.networkManager.players.length : 0;
            this.isMultiplayer = playerCount > 1;
            this.updateChatVisibility();
        });

        // Listen for chat messages from server
        this.networkManager.on('chatMessage', (data) => {
            this.addMessage(data.playerName, data.message, data.timestamp);
        });
    }

    createChatUI() {
        // Create chat container - positioned at bottom-right
        this.chatContainer = this.scene.add.container(1100, 400);
        
        // Create main chat background with gradient effect
        this.chatBackground = this.scene.add.rectangle(0, 0, 280, 320, 0x1a1a2e, 0.95);
        this.chatBackground.setStrokeStyle(3, 0x4a90e2);
        this.chatBackground.setStrokeStyle(1, 0xffffff, 0.3);
        this.chatContainer.add(this.chatBackground);
        
        // Create header background with gradient
        const headerBackground = this.scene.add.rectangle(0, -150, 280, 40, 0x16213e, 0.98);
        headerBackground.setStrokeStyle(1, 0x4a90e2, 0.5);
        this.chatContainer.add(headerBackground);
        
        // Create chat title with icon
        const chatTitle = this.scene.add.text(-100, -150, '💬 Chat', {
            fontFamily: 'Arial',
            fontSize: '16px',
            fill: '#ffffff',
            fontStyle: 'bold',
            stroke: '#4a90e2',
            strokeThickness: 1
        });
        chatTitle.setOrigin(0, 0.5);
        this.chatContainer.add(chatTitle);
        
        // Create close button with hover effect
        this.closeButton = this.scene.add.text(120, -150, '✕', {
            fontFamily: 'Arial',
            fontSize: '18px',
            fill: '#ff6b6b',
            fontStyle: 'bold',
            stroke: '#ffffff',
            strokeThickness: 1
        });
        this.closeButton.setOrigin(0.5);
        this.closeButton.setInteractive();
        this.closeButton.on('pointerdown', () => this.closeChat());
        this.closeButton.on('pointerover', () => {
            this.closeButton.setFill('#ff8e8e');
        });
        this.closeButton.on('pointerout', () => {
            this.closeButton.setFill('#ff6b6b');
        });
        this.chatContainer.add(this.closeButton);
        
        // Create messages container with scroll area background
        const messagesBackground = this.scene.add.rectangle(0, -10, 260, 200, 0x0f0f23, 0.8);
        messagesBackground.setStrokeStyle(1, 0x4a90e2, 0.3);
        this.chatContainer.add(messagesBackground);
        
        this.messagesContainer = this.scene.add.container(0, -10);
        this.chatContainer.add(this.messagesContainer);
        
        // Create input field background with modern design
        const inputBackground = this.scene.add.rectangle(0, 120, 240, 40, 0x2d3748, 0.9);
        inputBackground.setStrokeStyle(2, 0x4a90e2, 0.6);
        this.chatContainer.add(inputBackground);
        
        // Create input field placeholder
        const inputPlaceholder = this.scene.add.text(-110, 110, 'Type a message...', {
            fontFamily: 'Arial',
            fontSize: '12px',
            fill: '#718096',
            fontStyle: 'italic'
        });
        this.chatContainer.add(inputPlaceholder);
        
        // Create input field
        this.inputField = this.scene.add.text(-110, 110, '', {
            fontFamily: 'Arial',
            fontSize: '13px',
            fill: '#ffffff',
            wordWrap: { width: 180 }
        });
        this.chatContainer.add(this.inputField);
        
        // Create send button with modern design
        this.sendButtonBg = this.scene.add.rectangle(80, 120, 60, 30, 0x4a90e2, 0.9);
        this.sendButtonBg.setStrokeStyle(1, 0xffffff, 0.3);
        this.chatContainer.add(this.sendButtonBg);
        
        // Debug: Check what type of object we created
        console.log('ChatManager: sendButtonBg type:', typeof this.sendButtonBg);
        console.log('ChatManager: sendButtonBg constructor:', this.sendButtonBg.constructor.name);
        console.log('ChatManager: sendButtonBg methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(this.sendButtonBg)));
        
        this.sendButton = this.scene.add.text(80, 120, 'Send', {
            fontFamily: 'Arial',
            fontSize: '12px',
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        this.sendButton.setOrigin(0.5);
        this.sendButton.setInteractive();
        this.sendButton.on('pointerdown', () => this.sendMessage());
        this.sendButton.on('pointerover', () => {
            if (this.sendButtonBg) {
                try {
                    // Try different methods to change fill color
                    if (typeof this.sendButtonBg.setFill === 'function') {
                        this.sendButtonBg.setFill(0x5ba0f2);
                    } else if (this.sendButtonBg.fillColor !== undefined) {
                        this.sendButtonBg.fillColor = 0x5ba0f2;
                    } else if (this.sendButtonBg.fill !== undefined) {
                        this.sendButtonBg.fill = 0x5ba0f2;
                    } else {
                        console.warn('ChatManager: No fill method available for sendButtonBg');
                    }
                } catch (error) {
                    console.warn('ChatManager: Error changing sendButtonBg fill:', error);
                }
            } else {
                console.warn('ChatManager: sendButtonBg not available');
            }
        });
        this.sendButton.on('pointerout', () => {
            if (this.sendButtonBg) {
                try {
                    // Try different methods to change fill color
                    if (typeof this.sendButtonBg.setFill === 'function') {
                        this.sendButtonBg.setFill(0x4a90e2);
                    } else if (this.sendButtonBg.fillColor !== undefined) {
                        this.sendButtonBg.fillColor = 0x4a90e2;
                    } else if (this.sendButtonBg.fill !== undefined) {
                        this.sendButtonBg.fill = 0x4a90e2;
                    } else {
                        console.warn('ChatManager: No fill method available for sendButtonBg');
                    }
                } catch (error) {
                    console.warn('ChatManager: Error changing sendButtonBg fill:', error);
                }
            } else {
                console.warn('ChatManager: sendButtonBg not available');
            }
        });
        this.chatContainer.add(this.sendButton);
        
        
        // Store placeholder reference for input handling
        this.inputPlaceholder = inputPlaceholder;
        
        // Initially hide chat
        this.chatContainer.setVisible(false);
        
        // Set up input handling
        this.setupInputHandling();
    }

    setupInputHandling() {
        // Handle keyboard input for chat
        this.scene.input.keyboard.on('keydown-ENTER', () => {
            if (this.isChatOpen) {
                this.sendMessage();
            } else if (this.isMultiplayer) {
                this.openChat();
            }
        });

        this.scene.input.keyboard.on('keydown-ESC', () => {
            if (this.isChatOpen) {
                this.closeChat();
            }
        });

        // Handle text input
        this.scene.input.keyboard.on('keydown', (event) => {
            if (this.isChatOpen && this.inputField) {
                if (event.key === 'Backspace') {
                    const currentText = this.inputField.text;
                    this.inputField.setText(currentText.slice(0, -1));
                    this.updatePlaceholderVisibility();
                } else if (event.key.length === 1 && event.key !== 'Enter') {
                    const currentText = this.inputField.text;
                    this.inputField.setText(currentText + event.key);
                    this.updatePlaceholderVisibility();
                }
            }
        });
    }

    updatePlaceholderVisibility() {
        if (this.inputPlaceholder) {
            this.inputPlaceholder.setVisible(this.inputField.text.length === 0);
        }
    }

    openChat() {
        if (!this.isMultiplayer) return;
        
        this.isChatOpen = true;
        this.chatContainer.setVisible(true);
        
        // Focus on input field
        if (this.inputField) {
            this.inputField.setText('');
            this.updatePlaceholderVisibility();
        }
        
        console.log('ChatManager: Chat opened');
    }

    closeChat() {
        this.isChatOpen = false;
        this.chatContainer.setVisible(false);
        
        // Clear input field
        if (this.inputField) {
            this.inputField.setText('');
            this.updatePlaceholderVisibility();
        }
        
        console.log('ChatManager: Chat closed');
    }

    sendMessage() {
        if (!this.inputField || !this.isChatOpen) return;
        
        const message = this.inputField.text.trim();
        if (message.length === 0) return;
        
        // Send message through network manager
        try {
            this.networkManager.sendChatMessage(message);
        } catch (error) {
            console.error('ChatManager: Failed to send message:', error);
        }
        
        // Clear input field
        this.inputField.setText('');
        this.updatePlaceholderVisibility();
        
        console.log('ChatManager: Chat message sent:', message);
    }

    addMessage(playerName, message, timestamp) {
        // Add message to history
        this.messages.push({
            playerName,
            message,
            timestamp: timestamp || Date.now()
        });
        
        // Limit message history
        if (this.messages.length > this.maxMessages) {
            this.messages.shift();
        }
        
        // Update UI
        this.updateMessagesDisplay();
        
        console.log('ChatManager: Message received:', { playerName, message });
    }

    updateMessagesDisplay() {
        if (!this.messagesContainer) return;
        
        // Clear existing messages
        this.messagesContainer.removeAll(true);
        
        // Display recent messages (last 8 for smaller window)
        const recentMessages = this.messages.slice(-8);
        const messageHeight = 32;
        const startY = -80;
        
        recentMessages.forEach((msg, index) => {
            const y = startY + (index * messageHeight);
            
            // Create message background for better readability
            // const messageBg = this.scene.add.rectangle(-120, y + 8, 240, 18, 0x2d3748, 0.6);
            // messageBg.setStrokeStyle(1, 0x4a90e2, 0.3);
            // this.messagesContainer.add(messageBg);
            
            // Create player name text with gradient effect
            const nameText = this.scene.add.text(-115, y, `${msg.playerName}:`, {
                fontFamily: 'Arial',
                fontSize: '11px',
                fill: '#4a90e2',
                fontStyle: 'bold',
                stroke: '#ffffff',
                strokeThickness: 0.5
            });
            this.messagesContainer.add(nameText);
            
            // Create message text with better styling
            const messageText = this.scene.add.text(-115, y + 12, msg.message, {
                fontFamily: 'Arial',
                fontSize: '11px',
                fill: '#e2e8f0',
                wordWrap: { width: 220 }
            });
            this.messagesContainer.add(messageText);
            
            // Add timestamp
            const timestamp = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const timeText = this.scene.add.text(115, y, timestamp, {
                fontFamily: 'Arial',
                fontSize: '9px',
                fill: '#718096',
                fontStyle: 'italic'
            });
            timeText.setOrigin(1, 0);
            this.messagesContainer.add(timeText);
        });
    }

    updateChatVisibility() {
        // Only show chat button in multiplayer
        const chatButton = this.scene.chatButton;
        if (chatButton) {
            chatButton.setVisible(this.isMultiplayer);
            console.log('ChatManager: Chat button visibility updated:', this.isMultiplayer);
        }
    }

    toggleChat() {
        if (this.isChatOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    cleanup() {
        // Remove event listeners
        this.scene.input.keyboard.off('keydown-ENTER');
        this.scene.input.keyboard.off('keydown-ESC');
        this.scene.input.keyboard.off('keydown');
        
        // Clean up UI elements
        if (this.chatContainer) {
            this.chatContainer.destroy();
            this.chatContainer = null;
        }
        
        // Clear messages
        this.messages = [];
        
        console.log('ChatManager: Cleanup completed');
    }
} 