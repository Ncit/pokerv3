export class LoadingScene extends Phaser.Scene {
    constructor() {
        super('LoadingScene');
        this.debugPlayers = [
            {
                id: 1,
                name: 'Никита',
                photo: 'https://gravatar.com/avatar/2ee1f504b415b376c586641aee2c3194?s=400&d=robohash&r=x',
                vk_user_id: 123,
                telegram_user_id: 123456789
            },
            {
                id: 2,
                name: 'Анна',
                photo: 'https://gravatar.com/avatar/3ee1f504b415b376c586641aee2c3194?s=400&d=robohash&r=x',
                vk_user_id: 456,
                telegram_user_id: 987654321
            },
            {
                id: 3,
                name: 'Михаил',
                photo: 'https://gravatar.com/avatar/4ee1f504b415b376c586641aee2c3194?s=400&d=robohash&r=x',
                vk_user_id: 789,
                telegram_user_id: 555666777
            }
        ];
        this.selectedPlayer = null;
    }

    preload() {
        // Load splash screen assets
        this.load.image('splash_background', 'assets/space.png');

        this.load.image('background', 'assets/lobby_background.png');
        this.load.image('lobby_overlay', 'assets/lobby_overlay.png');
        this.load.image('dim_overlay', 'assets/dim_overlay.png');
        this.load.image('top_bar', 'assets/top_bar_logo_betboom.png');
        this.load.image('bottom_bar', 'assets/bottom_bar.png');
        this.load.image('planet_icon', 'assets/planet_icon.png');
        this.load.image('settings_button', 'assets/settings_button.png');
        this.load.image('stats_button', 'assets/stats_button.png');
        this.load.image('friends_button', 'assets/friends_button.png');
        this.load.image('chip_button', 'assets/chip_button_betboom.png');
        this.load.image('underline', 'assets/underline.png');
        this.load.image('avatar', 'assets/avatar.png');
        this.load.image('crown', 'assets/crown.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('progress', 'assets/progress.png');

        // Load button assets for horizontal slider
        this.load.image('fast_game_btn', 'assets/fast_game.png');
        this.load.image('friends_game_btn', 'assets/friends_game.png');
        this.load.image('high_bid_btn', 'assets/high_bid.png');
        this.load.image('random_match_btn', 'assets/random_match.png');
        this.load.image('ai_bot_btn', 'assets/train_game_betboom.png');

        // Load bonus button asset
        this.load.image('bonus_button', 'assets/bonus_button_betboom.png');

        // Load debug player selection assets
        this.load.image('player_select_bg', 'assets/player_name_placeholder.png');

        // Debug environment detection
        console.log('🔍 Environment Detection:');
        console.log('  - gameConfig:', window.gameConfig);
        console.log('  - isProductionVK:', window.gameConfig?.isProductionVK());
        console.log('  - isProductionTelegram:', window.gameConfig?.isProductionTelegram());
        console.log('  - Telegram WebApp available:', typeof window.Telegram !== 'undefined' && window.Telegram.WebApp);
        console.log('  - VK Bridge available:', typeof window.vkBridge !== 'undefined');

        if (window.gameConfig && window.gameConfig.isProductionVK()) {
            console.log('🚀 Initializing VK environment');
            this.intiializeVK();
        } else if (window.gameConfig && window.gameConfig.isProductionTelegram()) {
            console.log('🚀 Initializing Telegram environment');
            this.initializeTelegram();
        } else {
            console.log('🚀 Using debug mode (no production environment detected)');
        }
    }

    create() {
        // Initialize default appData to prevent undefined errors
        if (!window.appData) {
            window.appData = {
                vk_user_id: 0,
                telegram_user_id: 0,
                userAvatar: 'assets/avatar.png',
                first_name: 'Player',
                id: 0
            };
        }

        // Create splash screen background
        this.background = this.add.image(640, 360, 'splash_background');

        // Add game title
        this.titleText = this.add
            .text(640, 100, 'Poker Game', {
                fontFamily: 'Arial',
                fontSize: '48px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
            })
            .setOrigin(0.5);

        // Check if player selection feature is enabled
        if (window.gameConfig && (window.gameConfig.isProductionVK() || window.gameConfig.isProductionTelegram())) {
            // If assets are already loaded (e.g., on restart), start timer immediately
            if (this.load.isReady()) {
                this.startTimer();
            }
            
        } else {
             this.createDebugPlayerSelection();
        }
    }

    createDebugPlayerSelection() {
        // Add debug mode indicator
        this.debugText = this.add
            .text(640, 150, 'DEBUG MODE - Select Player', {
                fontFamily: 'Arial',
                fontSize: '24px',
                fill: '#FFD700',
                stroke: '#000000',
                strokeThickness: 2,
            })
            .setOrigin(0.5);

        // Create player selection buttons
        this.createPlayerButtons();

        // Add continue button (initially disabled)
        this.continueButton = this.add
            .text(640, 600, 'Continue to Game', {
                fontFamily: 'Arial',
                fontSize: '20px',
                fill: '#888888',
                stroke: '#000000',
                strokeThickness: 2,
            })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => {
                if (this.selectedPlayer) {
                    this.proceedToGame();
                }
            });
    }

    createPlayerButtons() {
        const buttonSpacing = 200;
        const startX = 640 - (buttonSpacing * (this.debugPlayers.length - 1)) / 2;
        const buttonY = 350;

        this.debugPlayers.forEach((player, index) => {
            const buttonX = startX + (index * buttonSpacing);
            
            // Create button background
            const buttonBg = this.add.image(buttonX, buttonY, 'player_select_bg');
            buttonBg.setScale(0.3);
            buttonBg.setInteractive({ useHandCursor: true });
            
            // Create player avatar
            const avatar = this.add.image(buttonX, buttonY - 40, 'avatar');
            avatar.setScale(0.2);
            
            // Load player avatar from URL
            const avatarKey = `debug_avatar_${player.id}`;
            this.load.image(avatarKey, player.photo);
            this.load.once('complete', () => {
                if (this.textures.exists(avatarKey)) {
                    avatar.setTexture(avatarKey);
                }
            });
            this.load.start();
            
            // Create player name text
            const nameText = this.add
                .text(buttonX, buttonY + 20, player.name, {
                    fontFamily: 'Arial',
                    fontSize: '16px',
                    fill: '#ffffff',
                    stroke: '#000000',
                    strokeThickness: 1,
                })
                .setOrigin(0.5);
            
            // Create player ID text
            const idText = this.add
                .text(buttonX, buttonY + 40, `VK: ${player.vk_user_id} | TG: ${player.telegram_user_id}`, {
                    fontFamily: 'Arial',
                    fontSize: '10px',
                    fill: '#CCCCCC',
                    stroke: '#000000',
                    strokeThickness: 1,
                })
                .setOrigin(0.5);

            // Store button elements
            const buttonElements = {
                bg: buttonBg,
                avatar: avatar,
                nameText: nameText,
                idText: idText,
                player: player
            };

            // Add click handler
            buttonBg.on('pointerdown', () => {
                this.selectPlayer(buttonElements);
            });

            // Store reference to button elements
            if (!this.playerButtons) this.playerButtons = [];
            this.playerButtons.push(buttonElements);
        });
    }

    selectPlayer(selectedButtonElements) {
        // Reset all buttons
        this.playerButtons.forEach(buttonElements => {
            buttonElements.bg.setTint(0xffffff);
            buttonElements.nameText.setFill('#ffffff');
            buttonElements.avatar.setScale(0.2);
        });

        // Highlight selected button
        selectedButtonElements.bg.setTint(0x00ff00);
        selectedButtonElements.nameText.setFill('#00ff00');
        selectedButtonElements.avatar.setScale(0.25); // Slightly larger to show selection

        // Store selected player
        this.selectedPlayer = selectedButtonElements.player;

        // Enable continue button
        this.continueButton.setFill('#00ff00');
        this.continueButton.setText('Continue to Game ✓');

        console.log('Debug: Selected player:', this.selectedPlayer);
    }

    proceedToGame() {
        // Set the selected player as appData
        window.appData = {
            vk_user_id: this.selectedPlayer.vk_user_id,
            telegram_user_id: this.selectedPlayer.telegram_user_id,
            userAvatar: this.selectedPlayer.photo,
            first_name: this.selectedPlayer.name,
        };

        console.log('Debug: Proceeding to game with player:', window.appData);

        // Transition to lobby
        this.scene.start('LobbyScene');
    }

    intiializeVK() {
        initVkBridgeApp();
        setupApp((appData) => {
            window.appData = appData;
            console.log('📱 VK app data set:', appData);
            
            // Show VK-specific loading message
            this.instructionText = this.add
                .text(640, 500, 'Welcome to Poker Game!', {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    fill: '#ffffff',
                })
                .setOrigin(0.5);

            // Transition to lobby after short delay
            this.time.delayedCall(1500, () => {
                this.scene.start('LobbyScene');
            });
        });
    }

    initializeTelegram() {
        // Check if we're actually in Telegram environment
        if (typeof window.Telegram === 'undefined' || !window.Telegram.WebApp) {
            // Create mock Telegram data for testing
            const mockTelegramData = {
                telegram_user_id: 123456789,
                first_name: 'Telegram User',
                last_name: '',
                username: 'telegram_user',
                language_code: 'en',
                userAvatar: 'assets/avatar.png',
                is_premium: false,
                added_to_attachment_menu: false,
                allows_write_to_pm: false
            };
            
            window.appData = mockTelegramData;
            console.log('📱 Mock Telegram app data set for testing:', mockTelegramData);
            
            // Show testing message
            this.instructionText = this.add
                .text(640, 500, 'Telegram Mode (Testing)', {
                    fontFamily: 'Arial',
                    fontSize: '24px',
                    fill: '#FFD700',
                })
                .setOrigin(0.5);

            // Transition to lobby after short delay
            this.time.delayedCall(1500, () => {
                this.scene.start('LobbyScene');
            });
            
            return;
        }

        // Import Telegram functions dynamically
        import('../scripts/telegramlogic.js').then(({ initTelegramWebApp, setupTelegramApp }) => {
            // Initialize Telegram Web App
            if (initTelegramWebApp()) {
                // Setup Telegram app with user data
                setupTelegramApp((appData) => {
                    window.appData = appData;
                    console.log('📱 Telegram app data set:', appData);
                    
                    // Show Telegram-specific loading message
                    this.instructionText = this.add
                        .text(640, 500, 'Welcome to Poker Game!', {
                            fontFamily: 'Arial',
                            fontSize: '24px',
                            fill: '#ffffff',
                        })
                        .setOrigin(0.5);

                    // Transition to lobby after short delay
                    this.time.delayedCall(1500, () => {
                        this.scene.start('LobbyScene');
                    });
                });
            } else {
                console.error('❌ Failed to initialize Telegram Web App');
                this.createDebugPlayerSelection();
            }
        }).catch((error) => {
            console.error('❌ Error loading Telegram logic:', error);
            this.createDebugPlayerSelection();
        });
    }

    startTimer() {
        // Hide loading elements
        if (this.loadingBar) this.loadingBar.setVisible(false);
        if (this.percentText) this.percentText.setVisible(false);
        if (this.loadingText) this.loadingText.setVisible(false);

        // Show "Press any key" or countdown
        this.instructionText = this.add
            .text(640, 500, 'Starting in 2 seconds...', {
                fontFamily: 'Arial',
                fontSize: '24px',
                fill: '#ffffff',
            })
            .setOrigin(0.5);

        // Create countdown timer
        let countdown = 2;
        this.countdownTimer = this.time.addEvent({
            delay: 1000,
            repeat: 1,
            callback: () => {
                countdown--;
                this.instructionText.setText(
                    `Starting in ${countdown} seconds...`
                );

                if (countdown === 0) {
                    this.instructionText.setText('Starting game...');
                }
            },
        });

        // Transition to LobbyScene after 2 seconds
        this.time.delayedCall(2000, () => {
            this.scene.start('LobbyScene');
        });

        // Allow manual skip by clicking/touching
        // this.input.once('pointerdown', () => {
        //     if (this.countdownTimer) {
        //         this.countdownTimer.destroy();
        //     }
        //     this.scene.start('LobbyScene');
        // });
    }
}

/**
 * Get safe avatar URL with fallback to avatar.png
 * @param {string} avatarUrl - The original avatar URL from Telegram/VK
 * @returns {string} - Safe avatar URL with fallback
 */
function getSafeAvatarUrl(avatarUrl) {
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

function setupApp(appDataCallback) {
        vkBridge
        .send('VKWebAppGetLaunchParams')
        .then((data) => {
            if (data.vk_user_id) {
                userInfo(data.vk_user_id, function (authData) {
                    appDataCallback({
                        id: authData.id,
                        first_name: authData.first_name,
                        userAvatar: getSafeAvatarUrl(authData.photo_200),
                        vk_user_id: authData.id
                    });
                });
            }
        })
        .catch((error) => {
            // Ошибка
            console.log(error);
        });
}

function userInfo(userId, authCallback) {
    vkBridge
        .send('VKWebAppGetUserInfo', {
            user_id: userId,
        })
        .then((data) => {
            if (data.id) {
                // Данные пользователя получены
                authCallback(data);
            }
        })
        .catch((error) => {
            // Ошибка
            console.log(error);
        });
}
function initVkBridgeApp() {
    vkBridge.send('VKWebAppInit', {});
} 