// Card Manager - Card loading and container management
import { AssetConfig } from '../config/AssetConfig.js';
import { PlayerConfig } from '../config/PlayerConfig.js';
import { PositionCalculator } from '../utils/PositionCalculator.js';
import { eventManager } from '../utils/EventManager.js';

export class CardManager {
    constructor(scene) {
        this.scene = scene;
        this.loadedCards = new Set();
        this.cardContainers = new Map();
        this.positionCalculator = new PositionCalculator();
        this.isDebug = window.gameConfig ? window.gameConfig.isFeatureEnabled('debugLogging') : false;
    }

    // Load all playing cards
    loadAllCards() {
        let loadedCount = 0;
        const { suits, values } = AssetConfig.cards;

        // Check if cards are already loaded by AssetHelper
        suits.forEach(suit => {
            values.forEach(value => {
                const key = AssetConfig.cards.getCardKey(value, suit);
                if (this.scene.textures.exists(key)) {
                    this.loadedCards.add(key);
                    loadedCount++;
                }
            });
        });

        // Check back card
        const backCard = AssetConfig.cards.backCard;
        if (this.scene.textures.exists(backCard.key)) {
            this.loadedCards.add(backCard.key);
            loadedCount++;
        }

        if (this.isDebug) {
            console.log(`CardManager: Found ${loadedCount} already loaded card assets`);
        }

        return loadedCount;
    }

    // Create a card container for a player
    createCardContainer(playerNumber, x, y) {
        const containerKey = `player${playerNumber}_cards`;
        
        // Create container
        const container = this.scene.add.container(x, y);
        container.setSize(
            PlayerConfig.cardContainer.size.width,
            PlayerConfig.cardContainer.size.height
        );

        // Store container reference
        this.cardContainers.set(containerKey, {
            container,
            playerNumber,
            cards: [],
            maxCards: PlayerConfig.cardContainer.maxCards,
        });

        if (this.isDebug) {
            console.log(`CardManager: Created card container for player ${playerNumber}`);
        }

        return container;
    }

    // Add a card to a player's container
    addCardToPlayer(playerNumber, cardValue, cardSuit, faceUp = false) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (!containerData) {
            console.error(`CardManager: No container found for player ${playerNumber}`);
            return null;
        }

        if (containerData.cards.length >= containerData.maxCards) {
            console.warn(`CardManager: Player ${playerNumber} already has maximum cards`);
            return null;
        }

        // Determine card texture
        let cardKey;
        if (faceUp) {
            cardKey = AssetConfig.cards.getCardKey(cardValue, cardSuit);
        } else {
            cardKey = AssetConfig.cards.backCard.key;
        }

        // Try to create the card sprite - Phaser will handle missing textures gracefully
        // The loadedCards check is not reliable during preload phase

        // Calculate card position within container
        const cardIndex = containerData.cards.length;
        const cardPositions = this.positionCalculator.getCardLayout(
            0, 0, // Container relative position
            containerData.maxCards,
            PlayerConfig.cardContainer.cardSpacing,
            80 // Card width
        );

        const cardPosition = cardPositions[cardIndex];
        
        // Create card sprite
        let card;
        try {
            // Check if texture exists
            if (!this.scene.textures.exists(cardKey)) {
                console.error(`CardManager: Card texture '${cardKey}' not found`);
                return null;
            }
            
            card = this.scene.add.image(cardPosition.x, cardPosition.y, cardKey);
            // Use different scales for front and back cards
            const cardScale = faceUp ? 0.1 : 0.36;
            card.setScale(cardScale);
            
            // Apply rotation based on card index (first card: -8°, second card: 8°)
            const rotation = cardIndex === 0 ? -8 : 8;
            card.setRotation(Phaser.Math.DegToRad(rotation));
            
            if (this.isDebug) {
                console.log(`CardManager: Created card with scale ${PlayerConfig.cardContainer.cardScale}`);
            }
        } catch (error) {
            console.error(`CardManager: Failed to create card sprite for ${cardKey}:`, error);
            return null;
        }

        // Store card data
        const cardData = {
            sprite: card,
            value: cardValue,
            suit: cardSuit,
            faceUp: faceUp,
            index: cardIndex,
        };

        // Add to container
        containerData.container.add(card);
        containerData.cards.push(cardData);

        if (this.isDebug) {
            console.log(`CardManager: Added card ${cardValue} of ${cardSuit} to player ${playerNumber}`);
        }

        // Emit card added event
        eventManager.emit('card_added', playerNumber, cardData);

        return cardData;
    }

    // Reveal a card (show face up without rotation) - for showdown
    revealCard(playerNumber, cardIndex) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (!containerData || !containerData.cards[cardIndex]) {
            console.error(`CardManager: Card not found for player ${playerNumber}, index ${cardIndex}`);
            return false;
        }

        const cardData = containerData.cards[cardIndex];
        
        // Only reveal if not already face up
        if (!cardData.faceUp) {
            cardData.faceUp = true;

            // Update card texture to face up
            const newCardKey = AssetConfig.cards.getCardKey(cardData.value, cardData.suit);
            cardData.sprite.setTexture(newCardKey);
            
            // Set scale for face up card without rotation
            const cardScale = 0.1;
            cardData.sprite.setScale(cardScale);
            
            // Keep the card at 0 rotation (no rotation)
            cardData.sprite.setRotation(0);

            if (this.isDebug) {
                console.log(`CardManager: Revealed card for player ${playerNumber} without rotation`);
            }

            // Emit card revealed event
            eventManager.emit('card_revealed', playerNumber, cardIndex);
        }

        return true;
    }

    // Flip a card (change from face down to face up or vice versa)
    flipCard(playerNumber, cardIndex) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (!containerData || !containerData.cards[cardIndex]) {
            console.error(`CardManager: Card not found for player ${playerNumber}, index ${cardIndex}`);
            return false;
        }

        const cardData = containerData.cards[cardIndex];
        cardData.faceUp = !cardData.faceUp;

        // Update card texture
        let newCardKey;
        if (cardData.faceUp) {
            newCardKey = AssetConfig.cards.getCardKey(cardData.value, cardData.suit);
        } else {
            newCardKey = AssetConfig.cards.backCard.key;
        }

        cardData.sprite.setTexture(newCardKey);
        
        // Update card scale based on face up/down state
        const cardScale = cardData.faceUp ? 0.1 : 0.36;
        cardData.sprite.setScale(cardScale);
        
        // Maintain rotation when flipping cards
        const rotation = cardData.index === 0 ? -12 : 12;
        cardData.sprite.setRotation(Phaser.Math.DegToRad(rotation));

        if (this.isDebug) {
            console.log(`CardManager: Flipped card for player ${playerNumber}, now ${cardData.faceUp ? 'face up' : 'face down'} with scale ${cardScale}`);
        }

        // Emit card flipped event
        eventManager.emit('card_flipped', playerNumber, cardIndex, cardData.faceUp);

        return true;
    }

    // Remove a card from a player's container
    removeCardFromPlayer(playerNumber, cardIndex) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (!containerData || !containerData.cards[cardIndex]) {
            console.error(`CardManager: Card not found for player ${playerNumber}, index ${cardIndex}`);
            return false;
        }

        const cardData = containerData.cards[cardIndex];
        
        // Remove from container and destroy sprite
        containerData.container.remove(cardData.sprite);
        cardData.sprite.destroy();
        
        // Remove from cards array
        containerData.cards.splice(cardIndex, 1);

        // Reposition remaining cards
        this.repositionCards(playerNumber);

        if (this.isDebug) {
            console.log(`CardManager: Removed card from player ${playerNumber}`);
        }

        // Emit card removed event
        eventManager.emit('card_removed', playerNumber, cardIndex);

        return true;
    }

    // Remove all cards from a player's container
    clearPlayerCards(playerNumber) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (!containerData) {
            // Don't log error for missing containers during initialization
            return false;
        }

        // Destroy all card sprites
        containerData.cards.forEach(cardData => {
            containerData.container.remove(cardData.sprite);
            cardData.sprite.destroy();
        });

        // Clear cards array
        containerData.cards = [];

        if (this.isDebug) {
            console.log(`CardManager: Cleared all cards for player ${playerNumber}`);
        }

        // Emit cards cleared event
        eventManager.emit('cards_cleared', playerNumber);

        return true;
    }

    // Safely clear player cards without error logging
    safeClearPlayerCards(playerNumber) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (!containerData) {
            return false;
        }

        // Destroy all card sprites
        containerData.cards.forEach(cardData => {
            containerData.container.remove(cardData.sprite);
            cardData.sprite.destroy();
        });

        // Clear cards array
        containerData.cards = [];

        if (this.isDebug) {
            console.log(`CardManager: Safely cleared all cards for player ${playerNumber}`);
        }

        // Emit cards cleared event
        eventManager.emit('cards_cleared', playerNumber);

        return true;
    }

    // Reposition cards in a container (after removal)
    repositionCards(playerNumber) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (!containerData) return;

        const cardPositions = this.positionCalculator.getCardLayout(
            0, 0,
            containerData.maxCards,
            PlayerConfig.cardContainer.cardSpacing,
            80
        );

        containerData.cards.forEach((cardData, index) => {
            const position = cardPositions[index];
            cardData.sprite.setPosition(position.x, position.y);
            cardData.index = index;
            
            // Maintain rotation when repositioning cards
            const rotation = index === 0 ? -12 : 12;
            cardData.sprite.setRotation(Phaser.Math.DegToRad(rotation));
        });
    }

    // Update card container position
    updateCardContainerPosition(playerNumber, x, y) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (!containerData) {
            console.warn(`CardManager: No container found for player ${playerNumber}`);
            return false;
        }

        // Update container position
        containerData.container.setPosition(x, y);
        
        if (this.isDebug) {
            console.log(`CardManager: Updated card container position for player ${playerNumber} to (${x}, ${y})`);
        }

        return true;
    }

    // Remove card container for a player
    removeCardContainer(playerNumber) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (containerData) {
            this.clearPlayerCards(playerNumber);
            containerData.container.destroy();
            this.cardContainers.delete(containerKey);
            
            if (this.isDebug) {
                console.log(`CardManager: Removed card container for player ${playerNumber}`);
            }
        }
    }

    // Get player's cards
    getPlayerCards(playerNumber) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        return containerData ? [...containerData.cards] : [];
    }

    // Get card by player and index
    getCard(playerNumber, cardIndex) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        return containerData?.cards[cardIndex] || null;
    }

    // Set card visibility for a player
    setPlayerCardsVisibility(playerNumber, visible) {
        const containerKey = `player${playerNumber}_cards`;
        const containerData = this.cardContainers.get(containerKey);
        
        if (containerData) {
            containerData.container.setVisible(visible);
        }
    }

    // Hide player cards (for disconnected players)
    hidePlayerCards(playerNumber) {
        this.setPlayerCardsVisibility(playerNumber, false);
        if (this.isDebug) {
            console.log(`CardManager: Hidden cards for player ${playerNumber}`);
        }
    }

    // Show player cards (for reconnected players)
    showPlayerCards(playerNumber) {
        this.setPlayerCardsVisibility(playerNumber, true);
        if (this.isDebug) {
            console.log(`CardManager: Shown cards for player ${playerNumber}`);
        }
    }

    // Deal cards to multiple players
    dealCards(playerNumbers, cardsPerPlayer = 2, faceUp = false) {
        const dealSequence = [];
        
        // Create dealing sequence (round-robin)
        for (let cardNum = 0; cardNum < cardsPerPlayer; cardNum++) {
            playerNumbers.forEach(playerNumber => {
                dealSequence.push({ playerNumber, cardNumber: cardNum });
            });
        }

        // Deal cards with animation delay
        let dealIndex = 0;
        const dealNext = () => {
            if (dealIndex >= dealSequence.length) {
                eventManager.emit('dealing_complete');
                return;
            }

            const { playerNumber } = dealSequence[dealIndex];
            
            // For now, deal random cards (in real game, would come from server)
            const suits = AssetConfig.cards.suits;
            const values = AssetConfig.cards.values;
            const randomSuit = suits[Math.floor(Math.random() * suits.length)];
            const randomValue = values[Math.floor(Math.random() * values.length)];
            
            this.addCardToPlayer(playerNumber, randomValue, randomSuit, faceUp);
            
            dealIndex++;
            
            // Deal next card after delay
            this.scene.time.delayedCall(200, dealNext);
        };

        // Start dealing
        dealNext();

        if (this.isDebug) {
            console.log(`CardManager: Started dealing ${cardsPerPlayer} cards to ${playerNumbers.length} players`);
        }
    }

    // Get card loading statistics
    getStats() {
        return {
            loadedCards: this.loadedCards.size,
            cardContainers: this.cardContainers.size,
            totalCardsInPlay: Array.from(this.cardContainers.values())
                .reduce((total, container) => total + container.cards.length, 0),
        };
    }

    // Clean up resources
    cleanup() {
        this.cardContainers.forEach((containerData, key) => {
            this.removeCardContainer(containerData.playerNumber);
        });
        this.loadedCards.clear();
        
        if (this.isDebug) {
            console.log('CardManager: Cleaned up all resources');
        }
    }
} 