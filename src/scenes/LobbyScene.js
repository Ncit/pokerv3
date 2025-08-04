import { ButtonManager } from '../managers/ButtonManager.js';
import { UIManager } from '../managers/UIManager.js';
import { SettingsManager } from '../managers/SettingsManager.js';
import { GameConfig } from '../config/GameConfig.js';
import { ButtonConfig } from '../config/ButtonConfig.js';
import { AssetConfig } from '../config/AssetConfig.js';

export class LobbyScene extends Phaser.Scene {
    constructor() {
        super('LobbyScene');
    }

    preload() {
        // Get safe avatar URL with fallback
        this.safeAvatarUrl = this.getSafeAvatarUrl(window.appData?.userAvatar);
        this.load.image('avatarQ', this.safeAvatarUrl);
    }

    /**
     * Get safe avatar URL with fallback to avatar.png
     * Handles CORS issues with external avatar URLs
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

    create() {
        // Initialize managers
        this.buttonManager = new ButtonManager(this);
        this.uiManager = new UIManager(this);
        this.settingsManager = new SettingsManager(this);

        // Create background elements (preserved exactly)
        this.background = this.add.image(640, 360, 'background');
        this.lobbyOverlay = this.add.image(640, 360, 'lobby_overlay');
        this.dimOverlay = this.add.image(640, 360, 'dim_overlay');
        this.topBar = this.add.image(640, 50, 'top_bar');
        this.bottomBar = this.add.image(640, 660, 'bottom_bar');
        this.underline = this.add.image(680, 700, 'underline');

        // Create control buttons using ButtonManager (preserved functionality)
        this.settingsButton = this.buttonManager.createButton('settings', 120, 660);
        this.friendsButton = this.buttonManager.createButton('friends', 180, 660);
        this.statsButton = this.buttonManager.createButton('stats', 240, 660);
        this.planetIcon = this.add.image(300, 660, 'planet_icon');

        // Create text elements (preserved exactly)
        this.activePlayers = this.add.text(320, 640, 'Активных участников:', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: 17,
        });
        this.activePlayersCount = this.add.text(320, 660, '12011', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: 19,
        });

        // Create chip elements (preserved exactly)
        this.chipButton = this.add.image(1180, 54, 'chip_button');
        this.chipLabel = this.add.text(1050, 30, 'Ваш баланс:', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: 17,
        });
        this.chipCount = this.add.text(1050, 46, '20000', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: 26,
        });

        // Create user profile elements (preserved exactly)
        this.userAvatar = this.add.image(120, 46, 'avatarQ');
        // Use different scale based on whether it's fallback avatar or user avatar
        const isFallbackAvatar = this.safeAvatarUrl === 'assets/avatar.png';
        this.userAvatar.scale = isFallbackAvatar ? 0.3 : 0.3;
        this.crown = this.add.image(138, 60, 'crown');
        // Get user name from appData or use default
        const userName = window.appData && window.appData.first_name ? window.appData.first_name : 'Player';
        this.userName = this.add.text(166, 22, userName, {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: 24,
        });
        this.star = this.add.image(346, 62, 'star');
        this.progress = this.add.image(246, 64, 'progress');
        this.starCount = this.add.text(362, 50, '366', {
            fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
            fontSize: 19,
        });
        this.crown.scale = 0.34;
        this.progress.scale = 0.34;
        this.star.scale = 0.36;

        // Apply UI styling (preserved exactly)
        this.chipButton.scale = 0.35;
        this.chipLabel.setTint(0xffffff);
        this.chipLabel.setAlpha(0.22);

        this.activePlayers.setTint(0xffffff);
        this.activePlayers.setAlpha(0.22);
        this.activePlayersCount.setTint(0x9fa6b3);

        // Apply layout scaling (preserved exactly)
        this.planetIcon.scale = 0.3;
        this.dimOverlay.setTint(0xff0000);
        this.lobbyOverlay.scale = 0.5;
        this.topBar.setScale(0.5);
        this.bottomBar.setScale(0.5);
        this.underline.setScale(0.25);

        // Create game mode buttons using ButtonManager
        this.createButtons();

        // Create bonus button using ButtonManager (preserved functionality)
        this.bonusButton = this.buttonManager.createButton('bonus', 1040, 640);
        this.settingsButton.on('pointerdown', () => {
            this.settingsManager.showSettings();
        });
    }

    createButtons() {
        const buttonScale = 0.27;
        const buttonSpacing = 240;
        const buttonY = 100;

        const buttonData = [
            { key: 'fast_game_btn', label: 'Fast Game' },
            { key: 'high_bid_btn', label: 'High Bid' },
            { key: 'ai_bot_btn', label: 'Train Game' },
            { key: 'random_match_btn', label: 'Random Match' },
            { key: 'friends_game_btn', label: 'Friends Game' },
        ];

        // Create container for slider (preserved exactly)
        this.buttonContainer = this.add.container(0, 250);
        this.buttonContainer.setSize(buttonData.length * buttonSpacing, 300);

        this.buttons = [];

        buttonData.forEach((data, index) => {
            const x = index * buttonSpacing;
            const button = this.add.image(x, buttonY, data.key);

            // Set individual button scales (preserved exactly)
            const scales = [0.25, 0.27, 0.29, 0.27, 0.25];
            button.setScale(scales[index]);
            button.setInteractive({ useHandCursor: true });

            button.gameMode = data.label;
            this.buttons.push(button);
            this.buttonContainer.add(button);

            // Apply button interactions (preserved exactly)
            button.on('pointerover', () => {
                if (!this.isDragging) {
                    button.setScale(buttonScale * 1.1);
                    button.setTint(0xdddddd);
                }
            });

            button.on('pointerout', () => {
                button.setScale(scales[index]);
                button.clearTint();
            });

            button.on('pointerdown', (pointer, localX, localY, event) => {
                if (this.isDragging) {
                    event.stopPropagation();
                    return;
                }

                button.setTint(0x888888);
                console.log(`${data.label} button clicked!`);

                if (data.key === 'friends_game_btn') {
                    this.time.delayedCall(150, () => {
                        button.clearTint();
                        this.scene.start('FriendsGameScene');
                    });
                } else if (data.key === 'ai_bot_btn') {
                    this.time.delayedCall(150, () => {
                        button.clearTint();
                        // Create a unique scene key for this AI bot session
                        const sessionId = Date.now();
                        const sceneKey = `AIBotScene_${sessionId}`;
                        
                        console.log(`LobbyScene: Creating new AI Bot scene with key: ${sceneKey}`);
                        
                        // Import and create a new AIBotScene instance with unique key
                        import('./AIBotScene.js').then(({ AIBotScene }) => {
                            try {
                                // Check if scene already exists and remove it
                                if (this.scene.isActive(sceneKey)) {
                                    console.log(`LobbyScene: Stopping existing scene: ${sceneKey}`);
                                    this.scene.stop(sceneKey);
                                }
                                
                                // Try to remove the scene if it exists (this is safe even if it doesn't exist)
                                try {
                                    this.scene.remove(sceneKey);
                                    console.log(`LobbyScene: Removed existing scene: ${sceneKey}`);
                                } catch (removeError) {
                                    console.log(`LobbyScene: Scene ${sceneKey} didn't exist, continuing...`);
                                }
                                
                                // Add the new scene instance with unique key
                                this.scene.add(sceneKey, new AIBotScene(sceneKey), false);
                                console.log(`LobbyScene: Added new AI Bot scene: ${sceneKey}`);
                                
                                // Start the new scene
                                this.scene.start(sceneKey);
                                console.log(`LobbyScene: Started AI Bot scene: ${sceneKey}`);
                            } catch (error) {
                                console.error('LobbyScene: Error during scene creation:', error);
                            }
                        }).catch(error => {
                            console.error('LobbyScene: Failed to load AIBotScene:', error);
                        });
                    });
                } else if (data.key === 'fast_game_btn') {
                    this.time.delayedCall(150, () => {
                        button.clearTint();
                        this.scene.start('FastGameScene');
                    });
                } else {
                    this.time.delayedCall(150, () => {
                        button.clearTint();
                    });
                }
            });
        });

        // Center the container (preserved exactly)
        const totalWidth = (buttonData.length - 1) * buttonSpacing;
        const containerStartX = (1280 - totalWidth) / 2;
        this.buttonContainer.x = containerStartX;
    }

    update() {}
} 