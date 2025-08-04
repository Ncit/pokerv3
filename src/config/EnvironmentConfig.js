/**
 * Environment Configuration System
 * Provides scalable environment management for different deployment scenarios
 */

class EnvironmentConfig {
    constructor() {
        this.environments = {
            development: {
                name: 'development',
                debug: true,
                features: {
                    playerSelection: true,
                    debugLogging: true,
                    mockData: true,
                    ngrokHeaders: true,
                    verboseErrors: true
                },
                api: {
                    baseUrl: 'https://api.example.com',
                    timeout: 15000
                }
            },
            productionVK: {
                name: 'vk',
                debug: false,
                features: {
                    playerSelection: false,
                    debugLogging: false,
                    mockData: false,
                    ngrokHeaders: true,
                    verboseErrors: false
                },
                api: {
                    baseUrl: 'https://api.example.com',
                    timeout: 15000
                }
            },
            productionTelegram: {
                name: 'telegram',
                debug: false,
                features: {
                    playerSelection: false,
                    debugLogging: false,
                    mockData: false,
                    ngrokHeaders: true,
                    verboseErrors: false
                },
                api: {
                    baseUrl: 'https://api.example.com',
                    timeout: 15000
                }
            }
        };

        this.currentEnvironment = this.detectEnvironment();
        this.config = this.environments[this.currentEnvironment];
        
        // Initialize global configuration
        this.initializeGlobalConfig();
    }

    /**
     * Detect the current environment based on various indicators
     */
    detectEnvironment() {
        // Check for URL parameters first (highest priority)
        const urlParams = new URLSearchParams(window.location.search);
        const envParam = urlParams.get('env');
        
        if (envParam) {
            // Validate the environment parameter
            if (this.environments[envParam]) {
                console.log(`🌐 Environment set via URL parameter: ${envParam}`);
                return envParam;
            } else {
                console.warn(`⚠️ Invalid environment in URL parameter: ${envParam}`);
                console.warn(`Available environments: ${Object.keys(this.environments).join(', ')}`);
            }
        }
        
        // Check for hash-based environment switching
        const hashEnv = this.detectEnvironmentFromHash();
        if (hashEnv) {
            console.log(`🌐 Environment set via URL hash: ${hashEnv}`);
            return hashEnv;
        }
        
        // Check for platform-specific detection
        const platformEnv = this.detectEnvironmentFromPlatform();
        if (platformEnv) {
            console.log(`🌐 Environment detected from platform: ${platformEnv}`);
            return platformEnv;
        }
        
        // Default to development
        console.log(`🌐 Using default environment: development`);
        return 'development';
    }

    /**
     * Detect environment from URL hash
     */
    detectEnvironmentFromHash() {
        const hash = window.location.hash.toLowerCase();
        
        if (hash.includes('#vk') || hash.includes('#vkontakte')) {
            return 'productionVK';
        } else if (hash.includes('#telegram') || hash.includes('#tg')) {
            return 'productionTelegram';
        } else if (hash.includes('#dev') || hash.includes('#development')) {
            return 'development';
        }
        
        return null;
    }

    /**
     * Detect environment from platform indicators
     */
    detectEnvironmentFromPlatform() {
        // Check for VKontakte platform
        if (window.VK || window.vkBridge || document.referrer.includes('vk.com')) {
            return 'productionVK';
        }
        
        // Check for Telegram platform
        if (window.Telegram || window.TelegramWebApp || document.referrer.includes('t.me')) {
            return 'productionTelegram';
        }
        
        // Check for localhost/development
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('ngrok.io')) {
            return 'development';
        }
        
        return null;
    }

    /**
     * Initialize global configuration accessible throughout the app
     */
    initializeGlobalConfig() {
        // Set legacy compatibility
        window.isDebug = this.config.debug;
        
        // Set new global config object
        window.gameConfig = {
            environment: this.currentEnvironment,
            debug: this.config.debug,
            features: this.config.features,
            api: this.config.api,
            isFeatureEnabled: (featureName) => this.isFeatureEnabled(featureName),
            getApiConfig: () => this.getApiConfig(),
            getEnvironment: () => this.currentEnvironment,
            isDevelopment: () => this.currentEnvironment === 'development',
            isProductionVK: () => this.currentEnvironment === 'productionVK',
            isProductionTelegram: () => this.currentEnvironment === 'productionTelegram',
        };

        // Log environment detection
        if (this.config.debug) {
            console.log(`🎮 Game Environment: ${this.currentEnvironment}`);
            console.log(`🔧 Debug Mode: ${this.config.debug}`);
            console.log(`⚙️ Features:`, this.config.features);
        }
    }

    /**
     * Check if a specific feature is enabled
     */
    isFeatureEnabled(featureName) {
        return this.config.features[featureName] || false;
    }

    /**
     * Get API configuration
     */
    getApiConfig() {
        return this.config.api;
    }

    /**
     * Get current environment name
     */
    getEnvironment() {
        return this.currentEnvironment;
    }

    /**
     * Check if current environment is development
     */
    isDevelopment() {
        return this.currentEnvironment === 'development';
    }

    /**
     * Check if current environment is production VK
     */
    isProductionVK() {
        return this.currentEnvironment === 'productionVK';
    }

    /**
     * Check if current environment is production Telegram
     */
    isProductionTelegram() {
        return this.currentEnvironment === 'productionTelegram';
    }

    /**
     * Override environment (useful for testing)
     */
    setEnvironment(environmentName, updateUrl = true) {
        if (this.environments[environmentName]) {
            this.currentEnvironment = environmentName;
            this.config = this.environments[environmentName];
            this.initializeGlobalConfig();
            console.log(`🔄 Environment changed to: ${environmentName}`);
            
            // Update URL if requested
            if (updateUrl) {
                this.updateUrlWithEnvironment(environmentName);
            }
        } else {
            console.error(`❌ Invalid environment: ${environmentName}`);
            console.error(`Available environments: ${Object.keys(this.environments).join(', ')}`);
        }
    }

    /**
     * Update URL with environment parameter
     */
    updateUrlWithEnvironment(environmentName) {
        const url = new URL(window.location);
        url.searchParams.set('env', environmentName);
        
        // Update URL without reloading the page
        window.history.replaceState({}, '', url);
        console.log(`🌐 URL updated with environment: ${environmentName}`);
    }

    /**
     * Get current environment from URL
     */
    getEnvironmentFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('env');
    }

    /**
     * Remove environment parameter from URL
     */
    removeEnvironmentFromUrl() {
        const url = new URL(window.location);
        url.searchParams.delete('env');
        window.history.replaceState({}, '', url);
        console.log(`🌐 Environment parameter removed from URL`);
    }

    /**
     * Get all available environments
     */
    getAvailableEnvironments() {
        return Object.keys(this.environments);
    }

    /**
     * Get full configuration for current environment
     */
    getConfig() {
        return this.config;
    }

    /**
     * Legacy compatibility method
     */
    isDebug() {
        return this.config.debug;
    }
}

// Export the class itself
export { EnvironmentConfig };

// Create and export singleton instance
const environmentConfig = new EnvironmentConfig();

// Export singleton instance as default
export default environmentConfig;

// Also export individual methods for convenience
export const isFeatureEnabled = (featureName) => environmentConfig.isFeatureEnabled(featureName);
export const getApiConfig = () => environmentConfig.getApiConfig();
export const getEnvironment = () => environmentConfig.getEnvironment();
export const isDevelopment = () => environmentConfig.isDevelopment();
export const isProductionVK = () => environmentConfig.isProductionVK();
export const isProductionTelegram = () => environmentConfig.isProductionTelegram();

// Export URL-based environment methods
export const setEnvironment = (environmentName, updateUrl = true) => environmentConfig.setEnvironment(environmentName, updateUrl);
export const getEnvironmentFromUrl = () => environmentConfig.getEnvironmentFromUrl();
export const updateUrlWithEnvironment = (environmentName) => environmentConfig.updateUrlWithEnvironment(environmentName);
export const removeEnvironmentFromUrl = () => environmentConfig.removeEnvironmentFromUrl();
