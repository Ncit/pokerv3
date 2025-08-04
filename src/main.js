import { LoadingScene } from './scenes/LoadingScene.js';
import { LobbyScene } from './scenes/LobbyScene.js';
import { FriendsGameScene } from './scenes/FriendsGameScene.js';
import { AIBotScene } from './scenes/AIBotScene.js';
import { FastGameScene } from './scenes/FastGameScene.js';
import { enableGlobalNgrokHeaders } from './utils/NgrokUtils.js';
import { EnvironmentConfig, isFeatureEnabled } from './config/EnvironmentConfig.js';
import environmentSwitcher from './utils/EnvironmentSwitcher.js';

// Initialize environment configuration (this sets up window.gameConfig and window.isDebug)
const envConfig = new EnvironmentConfig();

// Initialize environment switcher (provides URL-based switching and console commands)
environmentSwitcher.handleUrlChange();

// Create environment switching buttons in debug mode
if (window.isDebug) {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            environmentSwitcher.createSwitchingButtons();
        });
    } else {
        environmentSwitcher.createSwitchingButtons();
    }
}

// Global variables
window.firstFlop = false;

// Enable ngrok headers only if feature is enabled
if (isFeatureEnabled('ngrokHeaders')) {
    enableGlobalNgrokHeaders();
}

const config = {
    type: Phaser.AUTO,
    title: 'Overlord Rising',
    description: '',
    parent: 'game-container',
    width: 1280,
    height: 720,
    backgroundColor: '#000000',
    pixelArt: false,
            scene: [LoadingScene, LobbyScene, FriendsGameScene, AIBotScene, FastGameScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
};

new Phaser.Game(config);
