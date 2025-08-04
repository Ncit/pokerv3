// Player Manager - Player UI creation and management
import { PlayerConfig } from '../config/PlayerConfig.js';
import { GameConfig } from '../config/GameConfig.js';
import { eventManager } from '../utils/EventManager.js';

export class PlayerManager {
    constructor(scene) {
        this.scene = scene;
        this.players = new Map();
        this.userProfile = null;
        this.isDebug = window.gameConfig ? window.gameConfig.isFeatureEnabled('debugLogging') : false;
    }

    // Create a player at a specific position
    createPlayer(playerNumber, playerData = {}) {
        const positionKey = `player${playerNumber}`;
        const position = PlayerConfig.positions[positionKey];
        
        if (!position) {
            console.error(`PlayerManager: No position defined for ${positionKey}`);
            return null;
        }

        // Merge with default player data
        const finalPlayerData = { ...PlayerConfig.defaultPlayerData, ...playerData, id: playerNumber };

        // Create player UI elements
        const playerElements = this.createPlayerElements(position.x, position.y, finalPlayerData);
        
        // Store player reference
        this.players.set(playerNumber, {
            position,
            data: finalPlayerData,
            elements: playerElements,
        });

        if (this.isDebug) {
            console.log(`PlayerManager: Created player ${playerNumber} at ${position.seat}`, finalPlayerData);
        }

        return playerElements;
    }

    // Create all UI elements for a player
    createPlayerElements(x, y, playerData) {
        const elements = {};
        const { styling, offsets } = PlayerConfig;

        // Player avatar
        elements.avatar = this.scene.add.image(
            x + offsets.avatar.x,
            y + offsets.avatar.y,
            playerData.avatar || styling.avatar.defaultKey
        );
        elements.avatar.setScale(styling.avatar.scale);

        // Player name background
        elements.nameBackground = this.scene.add.image(
            x + offsets.nameBackground.x,
            y + offsets.nameBackground.y,
            styling.nameBackground.key
        );
        elements.nameBackground.setScale(styling.nameBackground.scale);

        // Player name text
        elements.playerName = this.scene.add.text(
            x + offsets.playerName.x,
            y + offsets.playerName.y,
            playerData.name || 'Player',
            styling.playerName.font
        );
        elements.playerName.setOrigin(0.5);
        elements.playerName.setTint(styling.playerName.tint);

        // Hand rank text
        elements.handRank = this.scene.add.text(
            x + offsets.handRank.x,
            y + offsets.handRank.y,
            playerData.handRank || '',
            styling.handRank.font
        );
        elements.handRank.setOrigin(0.5);

        // Card container (will be managed by CardManager)
        elements.cardContainer = this.scene.add.container(
            x + offsets.cardContainer.x,
            y + offsets.cardContainer.y
        );

        return elements;
    }

    // Create user profile UI (for main player)
    createUserProfile() {
        const { userProfile } = PlayerConfig;
        const elements = {};

        // User avatar
        elements.avatar = this.scene.add.image(
            userProfile.position.x,
            userProfile.position.y,
            userProfile.elements.avatar.key
        );
        elements.avatar.setScale(userProfile.elements.avatar.scale);

        // Crown
        elements.crown = this.scene.add.image(
            userProfile.elements.crown.position.x,
            userProfile.elements.crown.position.y,
            userProfile.elements.crown.key
        );
        elements.crown.setScale(userProfile.elements.crown.scale);

        // User name
        elements.userName = this.scene.add.text(
            userProfile.elements.userName.position.x,
            userProfile.elements.userName.position.y,
            eval(userProfile.elements.userName.source) || 'User',
            userProfile.elements.userName.font
        );

        // Progress bar
        elements.progress = this.scene.add.image(
            userProfile.elements.progress.position.x,
            userProfile.elements.progress.position.y,
            userProfile.elements.progress.key
        );
        elements.progress.setScale(userProfile.elements.progress.scale);

        // Star
        elements.star = this.scene.add.image(
            userProfile.elements.star.position.x,
            userProfile.elements.star.position.y,
            userProfile.elements.star.key
        );
        elements.star.setScale(userProfile.elements.star.scale);

        // Star count
        elements.starCount = this.scene.add.text(
            userProfile.elements.starCount.position.x,
            userProfile.elements.starCount.position.y,
            userProfile.elements.starCount.defaultValue,
            userProfile.elements.starCount.font
        );

        this.userProfile = elements;

        if (this.isDebug) {
            console.log('PlayerManager: Created user profile');
        }

        return elements;
    }

    // Create status display (active players, balance)
    createStatusDisplay() {
        const { statusDisplay } = PlayerConfig;
        const elements = {};

        // Active players label
        elements.activePlayersLabel = this.scene.add.text(
            statusDisplay.activePlayers.label.position.x,
            statusDisplay.activePlayers.label.position.y,
            statusDisplay.activePlayers.label.text,
            statusDisplay.activePlayers.label.font
        );
        elements.activePlayersLabel.setTint(statusDisplay.activePlayers.label.style.tint);
        elements.activePlayersLabel.setAlpha(statusDisplay.activePlayers.label.style.alpha);

        // Active players count
        elements.activePlayersCount = this.scene.add.text(
            statusDisplay.activePlayers.count.position.x,
            statusDisplay.activePlayers.count.position.y,
            statusDisplay.activePlayers.count.defaultValue,
            statusDisplay.activePlayers.count.font
        );
        elements.activePlayersCount.setTint(statusDisplay.activePlayers.count.style.tint);

        // Balance button
        elements.balanceButton = this.scene.add.image(
            statusDisplay.balance.button.position.x,
            statusDisplay.balance.button.position.y,
            statusDisplay.balance.button.key
        );
        elements.balanceButton.setScale(statusDisplay.balance.button.scale);

        // Balance label
        elements.balanceLabel = this.scene.add.text(
            statusDisplay.balance.label.position.x,
            statusDisplay.balance.label.position.y,
            statusDisplay.balance.label.text,
            statusDisplay.balance.label.font
        );
        elements.balanceLabel.setTint(statusDisplay.balance.label.style.tint);
        elements.balanceLabel.setAlpha(statusDisplay.balance.label.style.alpha);

        // Balance amount
        elements.balanceAmount = this.scene.add.text(
            statusDisplay.balance.amount.position.x,
            statusDisplay.balance.amount.position.y,
            statusDisplay.balance.amount.defaultValue,
            statusDisplay.balance.amount.font
        );

        if (this.isDebug) {
            console.log('PlayerManager: Created status display');
        }

        return elements;
    }

    // Update player data
    updatePlayer(playerNumber, newData) {
        const player = this.players.get(playerNumber);
        if (!player) {
            console.warn(`PlayerManager: Player ${playerNumber} not found`);
            return false;
        }

        // Update stored data
        Object.assign(player.data, newData);

        // Update UI elements
        if (newData.name && player.elements.playerName) {
            player.elements.playerName.setText(newData.name);
        }

        if (newData.handRank !== undefined && player.elements.handRank) {
            player.elements.handRank.setText(newData.handRank);
        }

        if (newData.avatar && player.elements.avatar) {
            player.elements.avatar.setTexture(newData.avatar);
        }

        if (this.isDebug) {
            console.log(`PlayerManager: Updated player ${playerNumber}`, newData);
        }

        // Emit update event
        eventManager.emit('player_updated', playerNumber, newData);

        return true;
    }

    // Update balance display
    updateBalance(newBalance) {
        // Update user balance or status display balance
        // Implementation depends on which balance to update
        if (this.userProfile?.balance) {
            this.userProfile.balance.setText(newBalance);
        }
        
        eventManager.emit('balance_updated', newBalance);
    }

    // Update active players count
    updateActivePlayersCount(count) {
        // This would typically be managed by status display
        eventManager.emit('active_players_updated', count);
    }

    // Get player data
    getPlayer(playerNumber) {
        return this.players.get(playerNumber);
    }

    // Get all players
    getAllPlayers() {
        return Array.from(this.players.values());
    }

    // Remove player
    removePlayer(playerNumber) {
        const player = this.players.get(playerNumber);
        if (player) {
            // Destroy all UI elements
            Object.values(player.elements).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });

            this.players.delete(playerNumber);

            if (this.isDebug) {
                console.log(`PlayerManager: Removed player ${playerNumber}`);
            }

            eventManager.emit('player_removed', playerNumber);
            return true;
        }
        return false;
    }

    // Remove all players
    removeAllPlayers() {
        this.players.forEach((player, playerNumber) => {
            this.removePlayer(playerNumber);
        });

        if (this.isDebug) {
            console.log('PlayerManager: Removed all players');
        }
    }

    // Show/hide player
    setPlayerVisibility(playerNumber, visible) {
        const player = this.players.get(playerNumber);
        if (player) {
            Object.values(player.elements).forEach(element => {
                if (element && element.setVisible) {
                    element.setVisible(visible);
                }
            });
        }
    }

    // Get player statistics
    getStats() {
        return {
            totalPlayers: this.players.size,
            playerNumbers: Array.from(this.players.keys()),
            activePlayers: this.getAllPlayers().filter(p => p.data.isActive).length,
        };
    }
} 