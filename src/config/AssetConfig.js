// Asset Configuration - Centralized asset paths and keys
export const AssetConfig = {
    // Background and overlay assets
    backgrounds: {
        main: { key: 'background', path: 'assets/lobby_background.png' },
        game: { key: 'game_bg', path: 'assets/game_bg.png' },
        game2: { key: 'game_bg_2', path: 'assets/game_bg_2.png' },
        lobbyOverlay: { key: 'lobby_overlay', path: 'assets/lobby_overlay.png' },
        dimOverlay: { key: 'dim_overlay', path: 'assets/dim_overlay.png' },
        gamingTable: { key: 'gaming_table', path: 'assets/gaming_table.png' },
    },

    // UI element assets
    ui: {
        topBar: { key: 'top_bar', path: 'assets/top_bar_logo_betboom.png' },
        bottomBar: { key: 'bottom_bar', path: 'assets/bottom_bar.png' },
        underline: { key: 'underline', path: 'assets/underline.png' },
        progress: { key: 'progress', path: 'assets/progress.png' },
        crown: { key: 'crown', path: 'assets/crown.png' },
        star: { key: 'star', path: 'assets/star.png' },
        planetIcon: { key: 'planet_icon', path: 'assets/planet_icon.png' },
    },

    // Button assets
    buttons: {
        // Action buttons
        call: { key: 'call_button', path: 'assets/call_button.png' },
        fold: { key: 'fold_button', path: 'assets/fold_button.png' },
        raise: { key: 'raise_button', path: 'assets/raise_button.png' },
        
        // Control buttons
        settings: { key: 'settings_button', path: 'assets/settings_button.png' },
        friends: { key: 'friends_button', path: 'assets/friends_button.png' },
        stats: { key: 'stats_button', path: 'assets/stats_button.png' },
        chat: { key: 'chat_button', path: 'assets/chat_button.png' },
        
        // Game interface buttons
        settingsGame: { key: 'settings_game', path: 'assets/settings_game.png' },
        menuGame: { key: 'menu_game', path: 'assets/menu_game.png' },
        
        // Special buttons
        bonus: { key: 'bonus_button', path: 'assets/bonus_button_betboom.png' },
        chip: { key: 'chip_button', path: 'assets/chip_button_betboom.png' },
        plus: { key: 'plus_button', path: 'assets/plus_button.png' },
        minus: { key: 'minus_button', path: 'assets/minus_button.png' },
        
        // Generic placeholder
        placeholder: { key: 'button_placeholder', path: 'assets/button_placeholder.png' },
    },

    // Game mode button assets
    gameModes: {
        fastGame: { key: 'fast_game', path: 'assets/fast_game.png' },
        highBid: { key: 'high_bid', path: 'assets/high_bid.png' },
        trainGame: { key: 'ai_bot_btn', path: 'assets/train_game_betboom.png' },
        randomMatch: { key: 'random_match', path: 'assets/random_match.png' },
        friendsGame: { key: 'friends_game', path: 'assets/friends_game.png' },
    },

    // Player and avatar assets
    players: {
        avatar: { key: 'avatar', path: 'assets/avatar.png' },
        avatarCircle: { key: 'avatar_circle', path: 'assets/avatar_cirlce.png' },
        playerNamePlaceholder: { key: 'player_name_placeholder', path: 'assets/player_name_placeholder.png' },
        foldX: { key: 'fold_x', path: 'assets/fold_x.png' },
    },

    // Card assets
    cards: {
        backCard: { key: 'back_card', path: 'assets/back_card_betboom.png' },
        
        // All playing cards (suits: clubs, diamonds, hearts, spades)
        // Values: 2-10, jack, queen, king, ace
        suits: ['clubs', 'diamonds', 'hearts', 'spades'],
        values: ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king', 'ace'],
        
        // Generate card keys dynamically: e.g., '2_of_clubs', 'ace_of_spades'
        getCardKey: (value, suit) => `${value}_of_${suit}`,
        getCardPath: (value, suit) => `assets/cards/${value}_of_${suit}.png`,
    },

    // Media and branding assets
    media: {
        mediaPoker: { key: 'media_poker', path: 'assets/media_poker.png' },
        winlineLogo: { key: 'logo', path: 'assets/logo_betboom.png' },
        phaser: { key: 'phaser', path: 'assets/phaser.png' },
    },

    // Space/theme assets
    space: {
        space: { key: 'space', path: 'assets/space.png' },
        spaceship: { key: 'spaceship', path: 'assets/spaceship.png' },
    },

    // Dynamic assets (loaded at runtime)
    dynamic: {
        userPhoto: { key: 'avatarQ', source: 'window.appData.userAvatar' },
    },

    // Asset loading groups for efficient batch loading
    loadingGroups: {
        essential: [
            'backgrounds.main',
            'backgrounds.lobbyOverlay',
            'backgrounds.dimOverlay',
            'ui.topBar',
            'ui.bottomBar',
        ],
        
        gameUI: [
            'buttons.call',
            'buttons.fold',
            'buttons.raise',
            'buttons.settings',
            'buttons.friends',
            'buttons.stats',
            'ui.progress',
            'ui.crown',
            'ui.star',
        ],
        
        gameModes: [
            'gameModes.fastGame',
            'gameModes.highBid',
            'gameModes.trainGame',
            'gameModes.randomMatch',
            'gameModes.friendsGame',
        ],
        
        cards: [
            'cards.backCard',
            // Card loading handled dynamically
        ],
        
        players: [
            'players.avatar',
            'players.avatarCircle',
            'players.playerNamePlaceholder',
        ],
    },

    // Asset resolution helper methods
    helpers: {
        // Get asset info by path string like 'buttons.call'
        getAsset: (path) => {
            const keys = path.split('.');
            let asset = AssetConfig;
            for (const key of keys) {
                asset = asset[key];
                if (!asset) return null;
            }
            return asset;
        },
        
        // Get all assets in a loading group
        getLoadingGroup: (groupName) => {
            const group = AssetConfig.loadingGroups[groupName];
            if (!group) return [];
            
            return group.map(path => AssetConfig.helpers.getAsset(path)).filter(asset => asset);
        },
    },
} 