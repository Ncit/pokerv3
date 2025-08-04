// Asset Helper - Utility for efficient asset loading and management
import { AssetConfig } from '../config/AssetConfig.js';

export class AssetHelper {
    constructor(scene) {
        this.scene = scene;
        this.isDebug = window.gameConfig ? window.gameConfig.isFeatureEnabled('debugLogging') : false;
        this.loadedAssets = new Set();
        this.failedAssets = new Set();
    }

    // Load a single asset by config path (e.g., 'buttons.call')
    loadAsset(configPath) {
        const asset = AssetConfig.helpers.getAsset(configPath);
        if (!asset) {
            console.warn(`AssetHelper: Asset not found at path '${configPath}'`);
            return false;
        }

        return this.loadAssetDirect(asset.key, asset.path);
    }

    // Load asset directly with key and path
    loadAssetDirect(key, path) {
        try {
            this.scene.load.image(key, path);
            this.loadedAssets.add(key);
            
            if (this.isDebug) {
                console.log(`AssetHelper: Loaded asset '${key}' from '${path}'`);
            }
            return true;
        } catch (error) {
            console.error(`AssetHelper: Failed to load asset '${key}':`, error);
            this.failedAssets.add(key);
            return false;
        }
    }

    // Load an entire asset group
    loadAssetGroup(groupName) {
        const assets = AssetConfig.helpers.getLoadingGroup(groupName);
        if (!assets.length) {
            console.warn(`AssetHelper: No assets found in group '${groupName}'`);
            return 0;
        }

        let loadedCount = 0;
        assets.forEach(asset => {
            if (this.loadAssetDirect(asset.key, asset.path)) {
                loadedCount++;
            }
        });

        if (this.isDebug) {
            console.log(`AssetHelper: Loaded ${loadedCount}/${assets.length} assets from group '${groupName}'`);
        }

        return loadedCount;
    }

    // Load all playing cards dynamically
    loadAllCards() {
        let loadedCount = 0;
        const { suits, values } = AssetConfig.cards;

        suits.forEach(suit => {
            values.forEach(value => {
                const key = AssetConfig.cards.getCardKey(value, suit);
                const path = AssetConfig.cards.getCardPath(value, suit);
                
                if (this.loadAssetDirect(key, path)) {
                    loadedCount++;
                }
            });
        });

        if (this.isDebug) {
            console.log(`AssetHelper: Loaded ${loadedCount} playing cards`);
        }

        return loadedCount;
    }

    // Load dynamic assets (like user photos)
    loadDynamicAssets() {
        const { userPhoto } = AssetConfig.dynamic;
        
        try {
            // Load user photo from window.appData
            this.scene.load.image(userPhoto.key, eval(userPhoto.source));
            this.loadedAssets.add(userPhoto.key);
            
            if (this.isDebug) {
                console.log(`AssetHelper: Loaded dynamic asset '${userPhoto.key}'`);
            }
            return true;
        } catch (error) {
            console.error('AssetHelper: Failed to load dynamic assets:', error);
            this.failedAssets.add(userPhoto.key);
            return false;
        }
    }

    // Check if an asset is loaded
    isAssetLoaded(key) {
        return this.scene.textures.exists(key);
    }

    // Get asset loading statistics
    getLoadingStats() {
        return {
            loaded: this.loadedAssets.size,
            failed: this.failedAssets.size,
            loadedAssets: Array.from(this.loadedAssets),
            failedAssets: Array.from(this.failedAssets),
        };
    }

    // Validate that all required assets are loaded
    validateAssets(requiredAssets = []) {
        const missing = requiredAssets.filter(key => !this.isAssetLoaded(key));
        
        if (missing.length > 0) {
            console.warn('AssetHelper: Missing required assets:', missing);
            return false;
        }
        
        if (this.isDebug) {
            console.log('AssetHelper: All required assets validated successfully');
        }
        return true;
    }

    // Preload assets with progress callback
    preloadAssets(assetList, onProgress = null, onComplete = null) {
        let loadedCount = 0;
        const totalCount = assetList.length;

        const checkProgress = () => {
            loadedCount++;
            
            if (onProgress) {
                onProgress(loadedCount, totalCount, loadedCount / totalCount);
            }
            
            if (loadedCount === totalCount && onComplete) {
                onComplete();
            }
        };

        // Set up load event listeners
        this.scene.load.on('filecomplete', checkProgress);
        
        // Load all assets
        assetList.forEach(asset => {
            if (typeof asset === 'string') {
                this.loadAsset(asset);
            } else {
                this.loadAssetDirect(asset.key, asset.path);
            }
        });

        // Start loading
        this.scene.load.start();
    }

    // Clean up resources
    cleanup() {
        this.loadedAssets.clear();
        this.failedAssets.clear();
        
        if (this.isDebug) {
            console.log('AssetHelper: Cleaned up resources');
        }
    }

    static loadGameAssets(scene) {
        scene.load.image('game_bg', 'assets/game_bg_2.png');
        scene.load.image('menu_game', 'assets/menu_game.png');
        scene.load.image('settings_game', 'assets/settings_game.png');
        scene.load.image('gaming_table', 'assets/gaming_table.png');
        scene.load.image('chat_button', 'assets/chat_button.png');
        scene.load.image('fold_button', 'assets/fold_button.png');
        scene.load.image('call_button', 'assets/call_button.png');
        scene.load.image('raise_button', 'assets/raise_button.png');
        scene.load.image('minus_button', 'assets/minus_button.png');
        scene.load.image('plus_button', 'assets/plus_button.png');
        scene.load.image('fold_x', 'assets/fold_x.png');
        scene.load.image('button_placeholder', 'assets/button_placeholder.png');
        scene.load.image('underline', 'assets/underline.png');
        scene.load.image('chip_button', 'assets/chip_button_betboom.png');
        scene.load.image('back_card', 'assets/back_card_betboom.png');
        scene.load.image('player_name_placeholder', 'assets/player_name_placeholder.png');
        scene.load.image('avatarCircle', 'assets/avatar_cirlce.png');
        scene.load.image('avatar', 'assets/avatar.png');
        scene.load.image('dummy_avatar', 'https://gravatar.com/avatar/2ee1f504b415b376c586641aee2c3194?s=400&d=robohash&r=x');
    }

    static loadCardAssets(scene) {
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const values = [
            '2', '3', '4', '5', '6', '7', '8', '9', '10',
            'jack', 'queen', 'king', 'ace'
        ];
        suits.forEach((suit) => {
            values.forEach((value) => {
                const cardKey = `${value}_of_${suit}`;
                const cardPath = `assets/cards/${value}_of_${suit}.png`;
                scene.load.image(cardKey, cardPath);
            });
        });
        const variantCards = [
            'ace_of_spades2', 'jack_of_clubs2', 'jack_of_diamonds2', 'jack_of_hearts2', 'jack_of_spades2',
            'queen_of_clubs2', 'queen_of_diamonds2', 'queen_of_hearts2', 'queen_of_spades2',
            'king_of_clubs2', 'king_of_diamonds2', 'king_of_hearts2', 'king_of_spades2'
        ];
        variantCards.forEach((cardKey) => {
            scene.load.image(cardKey, `assets/cards/${cardKey}.png`);
        });
    }

    static loadPlayerAssets(scene) {
        // Add player-specific asset loading here if needed
    }
} 