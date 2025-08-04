/**
 * Environment Switcher Utility
 * Provides easy environment switching via URL parameters and console commands
 */

import { setEnvironment, getEnvironment, getEnvironmentFromUrl, updateUrlWithEnvironment, removeEnvironmentFromUrl } from '../config/EnvironmentConfig.js';

class EnvironmentSwitcher {
    constructor() {
        this.environments = {
            'dev': 'development',
            'development': 'development',
            'vk': 'productionVK',
            'vkontakte': 'productionVK',
            'telegram': 'productionTelegram',
            'tg': 'productionTelegram'
        };
        
        this.initializeConsoleCommands();
        this.showEnvironmentInfo();
    }

    /**
     * Switch to a specific environment
     */
    switchTo(environmentName, updateUrl = true) {
        const normalizedEnv = this.normalizeEnvironmentName(environmentName);
        
        if (normalizedEnv) {
            setEnvironment(normalizedEnv, updateUrl);
            this.showEnvironmentInfo();
            return true;
        } else {
            console.error(`❌ Invalid environment: ${environmentName}`);
            this.showAvailableEnvironments();
            return false;
        }
    }

    /**
     * Normalize environment name (handle aliases)
     */
    normalizeEnvironmentName(name) {
        const normalized = name.toLowerCase();
        return this.environments[normalized] || this.environments[name] || null;
    }

    /**
     * Get current environment info
     */
    getCurrentEnvironmentInfo() {
        const currentEnv = getEnvironment();
        const urlEnv = getEnvironmentFromUrl();
        
        return {
            current: currentEnv,
            fromUrl: urlEnv,
            isUrlOverride: urlEnv && urlEnv !== currentEnv
        };
    }

    /**
     * Show current environment information
     */
    showEnvironmentInfo() {
        const info = this.getCurrentEnvironmentInfo();
        
        console.log('🌐 Environment Information:');
        console.log(`   Current: ${info.current}`);
        console.log(`   From URL: ${info.fromUrl || 'none'}`);
        
        if (info.isUrlOverride) {
            console.log(`   ⚠️ URL override detected`);
        }
        
        console.log(`   Debug Mode: ${window.isDebug ? 'ON' : 'OFF'}`);
        console.log(`   Features:`, window.gameConfig?.features || {});
    }

    /**
     * Show available environments
     */
    showAvailableEnvironments() {
        console.log('🌐 Available Environments:');
        console.log('   Development: dev, development');
        console.log('   VKontakte: vk, vkontakte');
        console.log('   Telegram: telegram, tg');
        console.log('');
        console.log('Usage:');
        console.log('   env.switch("dev")');
        console.log('   env.switch("vk")');
        console.log('   env.switch("telegram")');
    }

    /**
     * Remove environment from URL
     */
    removeFromUrl() {
        removeEnvironmentFromUrl();
        console.log('🌐 Environment parameter removed from URL');
    }

    /**
     * Initialize console commands for easy access
     */
    initializeConsoleCommands() {
        // Make environment switcher globally accessible
        window.env = {
            switch: (env) => this.switchTo(env),
            info: () => this.showEnvironmentInfo(),
            list: () => this.showAvailableEnvironments(),
            remove: () => this.removeFromUrl(),
            current: () => getEnvironment(),
            fromUrl: () => getEnvironmentFromUrl()
        };

        // Add helpful console message
        console.log('🌐 Environment Switcher loaded!');
        console.log('Available commands:');
        console.log('   env.switch("dev") - Switch to development');
        console.log('   env.switch("vk") - Switch to VKontakte');
        console.log('   env.switch("telegram") - Switch to Telegram');
        console.log('   env.info() - Show current environment info');
        console.log('   env.list() - Show available environments');
        console.log('   env.remove() - Remove environment from URL');
    }

    /**
     * Create environment switching buttons (for development)
     */
    createSwitchingButtons() {
        if (!window.isDebug) {
            return; // Only show in debug mode
        }

        const container = document.createElement('div');
        container.id = 'env-switcher-buttons';
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: white;
        `;

        const title = document.createElement('div');
        title.textContent = '🌐 Environment';
        title.style.cssText = 'margin-bottom: 5px; font-weight: bold;';
        container.appendChild(title);

        const buttons = [
            { name: 'Dev', env: 'dev', color: '#4CAF50' },
            { name: 'VK', env: 'vk', color: '#2196F3' },
            { name: 'TG', env: 'telegram', color: '#9C27B0' }
        ];

        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.name;
            button.style.cssText = `
                margin: 2px;
                padding: 5px 10px;
                border: none;
                border-radius: 3px;
                background: ${btn.color};
                color: white;
                cursor: pointer;
                font-size: 11px;
            `;
            
            button.onclick = () => this.switchTo(btn.env);
            container.appendChild(button);
        });

        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.style.cssText = `
            margin: 2px;
            padding: 5px 10px;
            border: none;
            border-radius: 3px;
            background: #f44336;
            color: white;
            cursor: pointer;
            font-size: 11px;
        `;
        removeBtn.onclick = () => this.removeFromUrl();
        container.appendChild(removeBtn);

        document.body.appendChild(container);
    }

    /**
     * Handle URL changes (for hash-based switching)
     */
    handleUrlChange() {
        // Listen for hash changes
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.toLowerCase();
            if (hash.includes('#vk') || hash.includes('#vkontakte')) {
                this.switchTo('vk', false);
            } else if (hash.includes('#telegram') || hash.includes('#tg')) {
                this.switchTo('telegram', false);
            } else if (hash.includes('#dev') || hash.includes('#development')) {
                this.switchTo('dev', false);
            }
        });
    }
}

// Create and export singleton instance
const environmentSwitcher = new EnvironmentSwitcher();

// Export the class and instance
export { EnvironmentSwitcher };
export default environmentSwitcher;

// Make it globally accessible
window.EnvironmentSwitcher = environmentSwitcher; 