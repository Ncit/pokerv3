import { ButtonManager } from '../managers/ButtonManager.js';
import { UIManager } from '../managers/UIManager.js';
import { PlayerManager } from '../managers/PlayerManager.js';
import { CardManager } from '../managers/CardManager.js';

import { GameConfig } from '../config/GameConfig.js';
import { ButtonConfig } from '../config/ButtonConfig.js';
import { PlayerConfig } from '../config/PlayerConfig.js';
import { AssetConfig } from '../config/AssetConfig.js';
import { AssetHelper } from '../utils/AssetHelper.js';

export class FriendsGameScene extends Phaser.Scene {
    constructor() {
        super('FriendsGameScene');
    }

    preload() {
        // Use AssetHelper for centralized asset loading
        AssetHelper.loadGameAssets(this);
        AssetHelper.loadCardAssets(this);
        AssetHelper.loadPlayerAssets(this);
    }

    create() {
        // Initialize all managers
        this.buttonManager = new ButtonManager(this);
        this.playerManager = new PlayerManager(this);
        this.cardManager = new CardManager(this);
        this.settingsManager = new SettingsManager(this);
        // Initialize UI Manager for Game Scene
        this.uiManager = new UIManager(this);
        this.uiManager.initializeFriendsGameScene();

        // Create background elements (preserved exactly)
        this.background = this.add.image(640, 360, 'game_bg');
        this.gamingTable = this.add.image(640, 320, 'gaming_table');
        
        // Create game interface buttons using ButtonManager (preserved functionality)
        this.menuGame = this.buttonManager.createButton('menuGame', 85, 60);
        this.settingsGame = this.buttonManager.createButton('settingsGame', 150, 60);
        this.chatButton = this.buttonManager.createButton('chat', 150, 640);

        // Create poker action buttons using ButtonManager (preserved functionality)
        this.foldButton = this.buttonManager.createButton('fold', 310, 640);
        this.callButton = this.buttonManager.createButton('call', 510, 640);
        this.raiseButton = this.buttonManager.createButton('raise', 710, 640);
        
        // Create progress control buttons using ButtonManager (preserved functionality)
        // this.minusButton = this.buttonManager.createButton('minus', 850, 640);
        // this.plusButton = this.buttonManager.createButton('plus', 1180, 640);
        
        // Create quick action buttons using ButtonManager (preserved functionality)
        // Quick action buttons removed

        this.underline = this.add.image(640, 700, 'underline');

        // Apply scaling (preserved exactly)
        this.underline.setDisplaySize(400, 10);
        this.gamingTable.scale = 0.4;

        // Add text labels above the quick action buttons (preserved exactly)
        this.createButtonLabels();
        this.createPokerActionLabels();

        // Button interactions are handled automatically by ButtonManager during creation

        // Create chip bank display (preserved exactly)
        this.chipBank = this.add.image(600, 280, 'chip_button');
        this.chipBankText = this.add
            .text(670, 280, 'БАНК: 1000', {
                fontFamily: 'Arial',
                fontSize: '18px',
                fill: '#ffffff',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.chipBank.scale = 0.2;

        // Card containers will be created per player in createCustomPlayer

        // Create hand rank display (preserved exactly)
        this.handRank = this.add
            .text(640, 430, 'FULL HOUSE', {
                fontFamily: 'Arial',
                fontSize: '22px',
                fill: '#FF4B00',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Add all players using PlayerManager (preserved functionality)
        const playerData = [
            {
                name: 'Иванченко',
                bank: '500',
                position: { x: 200, y: 270 },
                avatarUrl: 'https://gravatar.com/avatar/1?s=400&d=robohash&r=x',
            },
            {
                name: 'Петрова',
                bank: '750',
                position: { x: 200, y: 460 },
                avatarUrl: 'https://gravatar.com/avatar/2?s=400&d=robohash&r=x',
            },
            {
                name: window.appData.first_name,
                bank: '1200',
                position: { x: 590, y: 520 },
                avatarUrl: this.getSafeAvatarUrl(window.appData.userAvatar),
            },
            {
                name: 'Козлова',
                bank: '930',
                position: { x: 900, y: 270 },
                avatarUrl: 'https://gravatar.com/avatar/4?s=400&d=robohash&r=x',
            },
            {
                name: 'Волков',
                bank: '680',
                position: { x: 900, y: 460 },
                avatarUrl: 'https://gravatar.com/avatar/8?s=400&d=robohash&r=x',
            },
        ];

        // Wait a frame to ensure all assets are loaded
        this.time.delayedCall(100, () => {
            // Debug: Check if cards are loaded
            const loadedCards = this.cardManager.loadAllCards();
            console.log(`FriendsGameScene: Found ${loadedCards} loaded cards`);
            
            // Create each player using custom positions and avatar loading
            playerData.forEach((player, index) => {
                this.createCustomPlayer(index + 1, player);
            });
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

    createButtonLabels() {
        // Betting button labels removed
    }

    createPokerActionLabels() {
        // Add text labels on poker action buttons (preserved exactly)
        this.foldButtonText = this.add
            .text(310, 628, 'СБРОСИТЬ', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        // Add fold X image
        this.foldButtonValueX = this.add.image(310, 650, 'fold_x');
        this.foldButtonValueX.scale = 0.3;

        this.callButtonText = this.add
            .text(510, 628, 'УРАВНЯТЬ', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.callButtonValueText = this.add
            .text(510, 648, '300', {
                fontFamily: 'Arial',
                fontSize: '20px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.raiseButtonText = this.add
            .text(710, 628, 'ПОДНЯТЬ ДО', {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);

        this.raiseButtonValueText = this.add
            .text(710, 648, '600', {
                fontFamily: 'Arial',
                fontSize: '20px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
    }

    // Delegate to managers for functionality while preserving exact behavior
    handleFold() {
        this.buttonManager.handleFold();
    }

    handleCall() {
        this.buttonManager.handleCall();
    }

    handleRaise(amount) {
        this.buttonManager.handleRaise(amount);
    }

    handleChat() {
        this.buttonManager.handleChat();
    }

    handleSettings() {
        this.buttonManager.handleSettings();
    }

    handleMenu() {
        this.buttonManager.handleMenu();
    }



    // Create a player with custom position and proper card management
    createCustomPlayer(playerNumber, playerData) {
        const { name, bank, position, avatarUrl } = playerData;

        // Create unique property names for each player
        const playerPrefix = `player${playerNumber}`;

        // Name placeholder background - only create if name is not empty
        if (name && name.trim() !== '') {
            this[`${playerPrefix}NamePlaceholder`] = this.add.image(
                position.x,
                position.y,
                'player_name_placeholder'
            );
            this[`${playerPrefix}NamePlaceholder`].scale = 0.36;
        }

        // Avatar circle background (fixed asset name)
        this[`${playerPrefix}AvatarCircle`] = this.add.image(
            position.x + 90,
            position.y,
            'avatarCircle'
        );
        this[`${playerPrefix}AvatarCircle`].scale = 0.3;

        // Load and create avatar from URL
        const avatarKey = `avatar${playerNumber}`;
        this.load.image(avatarKey, avatarUrl);
        
        // Create avatar after loading
        this.load.once('complete', () => {
            if (this.textures.exists(avatarKey)) {
                this[`${playerPrefix}Avatar`] = this.add.image(
                    position.x + 90,
                    position.y,
                    avatarKey
                );
                // Use different scale based on whether it's fallback avatar or user avatar
                const isFallbackAvatar = avatarUrl === 'assets/avatar.png';
                this[`${playerPrefix}Avatar`].scale = isFallbackAvatar ? 0.3 : 0.3;
            } else {
                // Fallback to default avatar if URL loading fails
                this[`${playerPrefix}Avatar`] = this.add.image(
                    position.x + 90,
                    position.y,
                    'avatar'
                );
                this[`${playerPrefix}Avatar`].scale = 0.2; // Always 0.2 for fallback avatar
            }
        });
        
        // Start loading
        this.load.start();

        // Create card container using CardManager
        this.cardManager.createCardContainer(playerNumber, position.x + 134, position.y + 30);

        // Add two back cards to the container
        this.cardManager.addCardToPlayer(playerNumber, '2', 'hearts', false); // face down
        this.cardManager.addCardToPlayer(playerNumber, '3', 'hearts', false); // face down

        // Player name text - only create if name is not empty
        if (name && name.trim() !== '') {
            this[`${playerPrefix}Name`] = this.add
                .text(position.x - 20, position.y - 10, name, {
                    fontFamily: 'Arial',
                    fontSize: '22px',
                    fill: '#FF6A13',
                    strokeThickness: 1,
                })
                .setOrigin(0.5);
        }

        // Player bank text
        this[`${playerPrefix}Bank`] = this.add
            .text(position.x - 10, position.y + 16, bank, {
                fontFamily: 'Arial',
                fontSize: '18px',
                fill: '#ffffff',
                strokeThickness: 1,
            })
            .setOrigin(0.5);
    }

    update() {}
}
