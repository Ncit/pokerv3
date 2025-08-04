// Position Calculator - Layout calculations and positioning utilities
import { GameConfig } from '../config/GameConfig.js';

export class PositionCalculator {
    constructor(screenWidth = GameConfig.screen.width, screenHeight = GameConfig.screen.height) {
        this.screenWidth = screenWidth;
        this.screenHeight = screenHeight;
        this.centerX = screenWidth / 2;
        this.centerY = screenHeight / 2;
        this.isDebug = window.gameConfig ? window.gameConfig.isFeatureEnabled('debugLogging') : false;
    }

    // Calculate relative position from center
    fromCenter(offsetX = 0, offsetY = 0) {
        return {
            x: this.centerX + offsetX,
            y: this.centerY + offsetY,
        };
    }

    // Calculate position along a circle (useful for player positioning)
    getCirclePosition(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = (angleInDegrees * Math.PI) / 180;
        return {
            x: centerX + radius * Math.cos(angleInRadians),
            y: centerY + radius * Math.sin(angleInRadians),
        };
    }

    // Calculate evenly spaced positions along a line
    getLinearPositions(startX, startY, endX, endY, count) {
        const positions = [];
        
        if (count <= 1) {
            positions.push({ x: startX, y: startY });
            return positions;
        }

        for (let i = 0; i < count; i++) {
            const progress = i / (count - 1);
            positions.push({
                x: startX + (endX - startX) * progress,
                y: startY + (endY - startY) * progress,
            });
        }

        return positions;
    }

    // Calculate grid positions
    getGridPositions(startX, startY, columns, rows, spacingX, spacingY) {
        const positions = [];
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < columns; col++) {
                positions.push({
                    x: startX + col * spacingX,
                    y: startY + row * spacingY,
                    row,
                    col,
                });
            }
        }

        return positions;
    }

    // Calculate button container positions (for game mode buttons)
    getButtonContainerLayout(buttonCount, spacing = GameConfig.layout.buttonContainer.buttonSpacing) {
        const totalWidth = (buttonCount - 1) * spacing;
        const startX = (this.screenWidth - totalWidth) / 2;
        
        const positions = [];
        for (let i = 0; i < buttonCount; i++) {
            positions.push({
                x: startX + i * spacing,
                y: GameConfig.layout.buttonContainer.y + GameConfig.layout.buttonContainer.buttonY,
                index: i,
            });
        }

        return {
            containerX: startX,
            containerY: GameConfig.layout.buttonContainer.y,
            positions,
            totalWidth,
        };
    }

    // Calculate player table positions (6-player poker table)
    getPokerTablePositions(playerCount = 6) {
        const tableCenter = { x: this.centerX, y: this.centerY };
        const tableRadius = 200;
        
        // Predefined positions for better poker table layout
        const predefinedPositions = [
            { x: 650, y: 540, seat: 'bottom-center', angle: 0 },      // Player 1
            { x: 290, y: 540, seat: 'bottom-left', angle: 60 },      // Player 2
            { x: 150, y: 350, seat: 'middle-left', angle: 120 },     // Player 3
            { x: 290, y: 160, seat: 'top-left', angle: 180 },        // Player 4
            { x: 650, y: 160, seat: 'top-center', angle: 240 },      // Player 5
            { x: 1010, y: 160, seat: 'top-right', angle: 300 },      // Player 6
        ];

        return predefinedPositions.slice(0, playerCount);
    }

    // Calculate responsive scaling factor
    getScaleFactor(targetWidth, targetHeight) {
        const scaleX = this.screenWidth / targetWidth;
        const scaleY = this.screenHeight / targetHeight;
        return Math.min(scaleX, scaleY); // Maintain aspect ratio
    }



    // Calculate card positioning within a container
    getCardLayout(containerX, containerY, cardCount, cardSpacing = 10, cardWidth = 80) {
        const totalWidth = cardCount * cardWidth + (cardCount - 1) * cardSpacing;
        const startX = containerX - totalWidth / 2;
        
        const positions = [];
        for (let i = 0; i < cardCount; i++) {
            positions.push({
                x: startX + i * (cardWidth + cardSpacing) + cardWidth / 2,
                y: containerY + (i * 2), // Slight vertical offset for each card
                index: i,
            });
        }

        return positions;
    }

    // Calculate distance between two points
    getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    // Check if a point is within bounds
    isWithinBounds(x, y, minX = 0, minY = 0, maxX = this.screenWidth, maxY = this.screenHeight) {
        return x >= minX && x <= maxX && y >= minY && y <= maxY;
    }

    // Calculate element bounds
    getElementBounds(x, y, width, height, anchorX = 0.5, anchorY = 0.5) {
        const left = x - width * anchorX;
        const right = x + width * (1 - anchorX);
        const top = y - height * anchorY;
        const bottom = y + height * (1 - anchorY);

        return { left, right, top, bottom, width, height };
    }

    // Check collision between two rectangular bounds
    checkCollision(bounds1, bounds2) {
        return !(
            bounds1.right < bounds2.left ||
            bounds1.left > bounds2.right ||
            bounds1.bottom < bounds2.top ||
            bounds1.top > bounds2.bottom
        );
    }

    // Calculate position with margin constraints
    constrainToMargins(x, y, elementWidth, elementHeight, marginTop = 0, marginRight = 0, marginBottom = 0, marginLeft = 0) {
        const minX = marginLeft + elementWidth / 2;
        const maxX = this.screenWidth - marginRight - elementWidth / 2;
        const minY = marginTop + elementHeight / 2;
        const maxY = this.screenHeight - marginBottom - elementHeight / 2;

        return {
            x: Math.max(minX, Math.min(maxX, x)),
            y: Math.max(minY, Math.min(maxY, y)),
        };
    }

    // Update screen dimensions (for responsive design)
    updateScreenSize(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
        this.centerX = width / 2;
        this.centerY = height / 2;

        if (this.isDebug) {
            console.log(`PositionCalculator: Updated screen size to ${width}x${height}`);
        }
    }
} 