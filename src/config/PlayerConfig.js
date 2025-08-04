// Player Configuration - Player positioning and styling
export const PlayerConfig = {
    // Player positioning (6-player table layout)
    positions: {
        player1: { x: 650, y: 540, seat: 'bottom-center' },
        player2: { x: 290, y: 540, seat: 'bottom-left' },
        player3: { x: 150, y: 350, seat: 'middle-left' },
        player4: { x: 290, y: 160, seat: 'top-left' },
        player5: { x: 650, y: 160, seat: 'top-center' },
        player6: { x: 1010, y: 160, seat: 'top-right' },
    },

    // Player UI element offsets (relative to player position)
    offsets: {
        avatar: { x: 0, y: 0 },
        nameBackground: { x: 0, y: -60 },
        playerName: { x: 0, y: -60 },
        handRank: { x: 0, y: -30 },
        cardContainer: { x: 0, y: 40 }, // Moved cards slightly lower
    },

    // Player styling
    styling: {
        avatar: {
            scale: 0.3,
            defaultKey: 'avatar',
        },
        nameBackground: {
            key: 'player_name_placeholder',
            scale: 0.3,
        },
        playerName: {
            font: {
                fontFamily: 'Arial',
                fontSize: '14px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1,
            },
            tint: 0xFF6A13, // Orange player name
        },
        handRank: {
            font: {
                fontFamily: 'Arial',
                fontSize: '12px',
                color: '#FF4B00', // Orange hand rank
                stroke: '#000000',
                strokeThickness: 1,
            },
        },
    },

    // User profile configuration (for main player)
    userProfile: {
        position: { x: 120, y: 46 },
        elements: {
            avatar: {
                scale: 0.3,
                key: 'avatarQ', // Uses dynamic user photo
            },
            crown: {
                position: { x: 138, y: 60 },
                scale: 0.34,
                key: 'crown',
            },
            userName: {
                position: { x: 166, y: 22 },
                font: {
                    fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
                    fontSize: 24,
                },
                source: 'window.appData.first_name',
            },
            progress: {
                position: { x: 246, y: 64 },
                scale: 0.34,
                key: 'progress',
            },
            star: {
                position: { x: 346, y: 62 },
                scale: 0.36,
                key: 'star',
            },
            starCount: {
                position: { x: 362, y: 50 },
                font: {
                    fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
                    fontSize: 19,
                },
                defaultValue: '366',
            },
        },
    },

    // Status and active players configuration
    statusDisplay: {
        activePlayers: {
            label: {
                position: { x: 320, y: 640 },
                text: 'Активных участников:',
                font: {
                    fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
                    fontSize: 17,
                },
                style: {
                    tint: 0xffffff,
                    alpha: 0.22,
                },
            },
            count: {
                position: { x: 320, y: 660 },
                font: {
                    fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
                    fontSize: 19,
                },
                style: {
                    tint: 0x9fa6b3,
                },
                defaultValue: '12011',
            },
        },
        balance: {
            button: {
                position: { x: 1180, y: 54 },
                key: 'chip_button',
                scale: 0.35,
            },
            label: {
                position: { x: 1050, y: 30 },
                text: 'Ваш баланс:',
                font: {
                    fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
                    fontSize: 17,
                },
                style: {
                    tint: 0xffffff,
                    alpha: 0.22,
                },
            },
            amount: {
                position: { x: 1050, y: 46 },
                font: {
                    fontFamily: 'Georgia, "Goudy Bookletter 1911", Times, serif',
                    fontSize: 26,
                },
                defaultValue: '20000',
            },
        },
    },

    // Card container configuration for players
    cardContainer: {
        size: { width: 120, height: 80 },
        cardSpacing: -40, // Increased spacing between cards
        maxCards: 2, // Poker hand size
        cardScale: 0.36,
    },

    // Default player data structure
    defaultPlayerData: {
        id: null,
        name: 'Player',
        avatar: 'avatar',
        chips: 0,
        handRank: '',
        cards: [],
        isActive: false,
        isDealer: false,
    },
} 