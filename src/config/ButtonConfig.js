// Button Configuration - Template-based button patterns
export const ButtonConfig = {
    // Button pattern templates
    patterns: {
        // Poker action buttons (FOLD, CALL, RAISE)
        poker_action: {
            scale: 0.3,
            interactive: true,
            cursor: 'hand',
            tints: {
                hover: 0xdddddd,
            },
            feedback: {
                duration: 150,
                resetDelay: 150,
            },
        },

        // Quick action buttons (MIN, HALF, BANK, MAX)
        quick_action: {
            scale: 0.25,
            interactive: true,
            cursor: 'hand',
            tints: {
                hover: 0xdddddd,
                click: 0x888888,
            },
            feedback: {
                duration: 150,
                resetDelay: 150,
            },
        },

        // Game mode selection buttons
        game_mode: {
            baseScale: 0.27,
            scales: [0.25, 0.27, 0.29, 0.27, 0.25], // Individual scales for each button
            interactive: true,
            cursor: 'hand',
            tints: {
                hover: 0xdddddd,
                click: 0x888888,
            },
            hoverScale: 1.1,
            feedback: {
                duration: 150,
                resetDelay: 150,
            },
        },

        // Control buttons (settings, friends, stats)
        control: {
            scale: 0.35,
            interactive: true,
            cursor: 'hand',
            tints: {
                hover: 0xdddddd,
                click: 0x888888,
            },
            feedback: {
                duration: 150,
                resetDelay: 150,
            },
        },

        // Special buttons (bonus, chip)
        special: {
            scale: 0.4,
            interactive: true,
            cursor: 'hand',
            tints: {
                hover: 0xdddddd,
                click: 0x888888,
            },
            feedback: {
                duration: 150,
                resetDelay: 150,
            },
        },
    },

    // Specific button definitions
    buttons: {
        // Poker action buttons
        fold: {
            pattern: 'poker_action',
            key: 'fold_button',
            action: 'fold',
        },
        call: {
            pattern: 'poker_action',
            key: 'call_button',
            action: 'call',
        },
        raise: {
            pattern: 'poker_action',
            key: 'raise_button',
            action: 'raise',
        },
        allIn: {
            pattern: 'poker_action',
            key: 'raise_button',
            action: 'allIn',
        },



        // Quick betting buttons removed

        // Game mode buttons
        fastGame: {
            pattern: 'game_mode',
            key: 'fast_game',
            label: 'Fast Game',
            index: 0,
        },
        highBid: {
            pattern: 'game_mode',
            key: 'high_bid',
            label: 'High Bid',
            index: 1,
        },
        trainGame: {
            pattern: 'game_mode',
            key: 'ai_bot_btn',
            label: 'Train Game',
            index: 2,
        },
        randomMatch: {
            pattern: 'game_mode',
            key: 'random_match',
            label: 'Random Match',
            index: 3,
        },
        friendsGame: {
            pattern: 'game_mode',
            key: 'friends_game',
            label: 'Friends Game',
            index: 4,
            action: 'startScene',
            target: 'FriendsGameScene',
        },

        // Control buttons
        settings: {
            pattern: 'control',
            key: 'settings_button',
            action: 'settings',
        },
        friends: {
            pattern: 'control',
            key: 'friends_button',
            action: 'friends',
        },
        stats: {
            pattern: 'control',
            key: 'stats_button',
            action: 'stats',
        },

        // Game interface buttons
        chat: {
            pattern: 'control',
            key: 'chat_button',
            action: 'chat',
        },
        settingsGame: {
            pattern: 'control',
            key: 'settings_game',
            action: 'settings',
        },
        menuGame: {
            pattern: 'control',
            key: 'menu_game',
            action: 'menu',
        },

        // Special buttons
        bonus: {
            pattern: 'special',
            key: 'bonus_button',
            action: 'bonus',
            scale: 0.4,
        },
        chip: {
            pattern: 'special',
            key: 'chip_button',
            action: 'chip',
            scale: 0.35,
        },


    },
} 