// Button Manager - Centralized button creation and interaction handling
import { ButtonConfig } from '../config/ButtonConfig.js';
import { GameConfig } from '../config/GameConfig.js';
import { eventManager } from '../utils/EventManager.js';

export class ButtonManager {
    constructor(scene) {
        this.scene = scene;
        this.buttons = new Map();
        this.isDebug = window.gameConfig ? window.gameConfig.isFeatureEnabled('debugLogging') : false;
    }

    // Create a button using pattern configuration
    createButton(buttonKey, x, y, customConfig = {}) {
        const buttonDef = ButtonConfig.buttons[buttonKey];
        if (!buttonDef) {
            console.error(`ButtonManager: Button definition not found for '${buttonKey}'`);
            return null;
        }

        const pattern = ButtonConfig.patterns[buttonDef.pattern];
        if (!pattern) {
            console.error(`ButtonManager: Pattern not found for '${buttonDef.pattern}'`);
            return null;
        }

        // Merge configurations (custom overrides pattern overrides button)
        const config = { ...buttonDef, ...pattern, ...customConfig };
        
        // Create the button image
        const button = this.scene.add.image(x, y, config.key || buttonDef.key);
        
        // Apply scale (handle special cases like game mode buttons)
        if (config.scales && config.index !== undefined) {
            button.setScale(config.scales[config.index]);
        } else {
            button.setScale(config.scale || 1);
        }

        // Make interactive if specified
        if (config.interactive) {
            this.makeInteractive(button, config);
        }

        // Set up action handling
        if (config.action) {
            this.setupAction(button, config);
        }

        // Store button reference
        this.buttons.set(buttonKey, { button, config });

        if (this.isDebug) {
            console.log(`ButtonManager: Created button '${buttonKey}' at (${x}, ${y})`);
        }

        return button;
    }

    // Make a button interactive with hover/click effects
    makeInteractive(button, config) {
        button.setInteractive({ useHandCursor: config.cursor === 'hand' });

        // Hover effects
        if (config.tints?.hover) {
            button.on('pointerover', () => {
                if (!button._isClicked) {
                    button.setTint(config.tints.hover);
                    
                    // Scale effect for game mode buttons
                    if (config.hoverScale && button.scaleX < 1) {
                        button.setScale(button.scaleX * config.hoverScale);
                    }
                }
            });

            button.on('pointerout', () => {
                if (!button._isClicked) {
                    button.clearTint();
                    
                    // Reset scale
                    if (config.hoverScale && config.scales && config.index !== undefined) {
                        button.setScale(config.scales[config.index]);
                    } else if (config.scale) {
                        button.setScale(config.scale);
                    }
                }
            });
        }

        // Click effects
        if (config.tints?.click) {
            button.on('pointerdown', () => {
                button._isClicked = true;
                button.setTint(config.tints.click);
            });

            button.on('pointerup', () => {
                if (config.feedback?.resetDelay) {
                    this.scene.time.delayedCall(config.feedback.resetDelay, () => {
                        button._isClicked = false;
                        button.clearTint();
                    });
                } else {
                    button._isClicked = false;
                    button.clearTint();
                }
            });
        }
    }

    // Set up button action handling
    setupAction(button, config) {
        button.on('pointerdown', () => {
            const action = config.action;
            const value = config.value;
            const target = config.target;

            if (this.isDebug) {
                console.log(`ButtonManager: Button action '${action}' triggered`, { value, target });
            }

            // Emit event for action
            eventManager.emit('button_action', action, value, target, config);

            // Handle common actions
            switch (action) {
                case 'fold':
                    eventManager.emit('poker_action', 'fold');
                    break;
                    
                case 'call':
                    eventManager.emit('poker_action', 'call');
                    break;
                    
                case 'raise':
                    eventManager.emit('poker_action', 'raise');
                    break;
                    
                case 'setProgress':
                    eventManager.emit('progress_set', value);
                    break;
                    
                case 'increaseProgress':
                    eventManager.emit('progress_change', 'increase');
                    break;
                    
                case 'decreaseProgress':
                    eventManager.emit('progress_change', 'decrease');
                    break;
                    
                case 'startScene':
                    if (target) {
                        this.scene.scene.start(target);
                    }
                    break;
                    
                case 'settings':
                    eventManager.emit('ui_action', 'settings');
                    break;
                    
                case 'friends':
                    eventManager.emit('ui_action', 'friends');
                    break;
                    
                case 'stats':
                    eventManager.emit('ui_action', 'stats');
                    break;
                    
                case 'chat':
                    eventManager.emit('ui_action', 'chat');
                    break;
                    
                case 'menu':
                    eventManager.emit('ui_action', 'menu');
                    break;
                    
                case 'bonus':
                    eventManager.emit('ui_action', 'bonus');
                    break;
                    
                default:
                    eventManager.emit('custom_action', action, value, target);
                    break;
            }
        });
    }

    // Create multiple buttons from a list
    createButtonGroup(buttonList, positions = []) {
        const createdButtons = [];
        
        buttonList.forEach((buttonKey, index) => {
            const position = positions[index] || { x: 0, y: 0 };
            const button = this.createButton(buttonKey, position.x, position.y);
            if (button) {
                createdButtons.push(button);
            }
        });

        return createdButtons;
    }

    // Handle settings button click
    handleSettings() {
        if (this.scene.settingsManager) {
            this.scene.settingsManager.showSettings();
        } else {
            console.warn('ButtonManager: SettingsManager not available in scene');
        }
    }

    // Create game mode buttons with automatic positioning
    createGameModeButtons() {
        const buttonKeys = ['fastGame', 'highBid', 'trainGame', 'randomMatch', 'friendsGame'];
        const spacing = GameConfig.layout.buttonContainer.buttonSpacing;
        const baseY = GameConfig.layout.buttonContainer.y + GameConfig.layout.buttonContainer.buttonY;
        
        // Calculate container position
        const totalWidth = (buttonKeys.length - 1) * spacing;
        const startX = (GameConfig.screen.width - totalWidth) / 2;

        const buttons = [];
        buttonKeys.forEach((buttonKey, index) => {
            const x = startX + index * spacing;
            const button = this.createButton(buttonKey, x, baseY);
            if (button) {
                buttons.push(button);
            }
        });

        return buttons;
    }

    // Get a created button by key
    getButton(buttonKey) {
        const buttonData = this.buttons.get(buttonKey);
        return buttonData ? buttonData.button : null;
    }

    // Update button state
    updateButtonState(buttonKey, enabled = true, visible = true) {
        const button = this.getButton(buttonKey);
        if (button) {
            button.setInteractive(enabled);
            button.setVisible(visible);
            
            if (!enabled) {
                button.setTint(0x888888); // Disabled tint
            } else {
                button.clearTint();
            }
        }
    }

    // Remove a button
    removeButton(buttonKey) {
        const buttonData = this.buttons.get(buttonKey);
        if (buttonData) {
            buttonData.button.destroy();
            this.buttons.delete(buttonKey);
            
            if (this.isDebug) {
                console.log(`ButtonManager: Removed button '${buttonKey}'`);
            }
        }
    }

    // Remove all buttons
    removeAllButtons() {
        this.buttons.forEach((buttonData, key) => {
            buttonData.button.destroy();
        });
        this.buttons.clear();
        
        if (this.isDebug) {
            console.log('ButtonManager: Removed all buttons');
        }
    }

    // Get button statistics
    getStats() {
        return {
            totalButtons: this.buttons.size,
            buttonKeys: Array.from(this.buttons.keys()),
        };
    }
} 