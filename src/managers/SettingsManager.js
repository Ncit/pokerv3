// Settings Manager - Handles settings dialog and app information
import { VersionConfig, getVersionString, getVersionInfo } from '../config/VersionConfig.js';

export class SettingsManager {
    constructor(scene) {
        this.scene = scene;
        this.dialog = null;
        this.isOpen = false;
    }

    // Show settings dialog
    showSettings() {
        if (this.isOpen) {
            return; // Prevent multiple dialogs
        }

        this.isOpen = true;
        this.createSettingsDialog();
    }

    // Hide settings dialog
    hideSettings() {
        if (this.dialog) {
            this.dialog.destroy();
            this.dialog = null;
        }
        this.isOpen = false;
    }

    // Create the settings dialog
    createSettingsDialog() {
        const { width, height } = this.scene.scale;
        
        // Create dialog container
        this.dialog = this.scene.add.container(width / 2, height / 2);
        
        // Create background overlay
        const overlay = this.scene.add.rectangle(0, 0, width, height, 0x000000, 0.7);
        overlay.setOrigin(0.5);
        this.dialog.add(overlay);
        
        // Create dialog background
        const dialogBg = this.scene.add.rectangle(0, 0, 600, 500, 0x2c3e50, 0.95);
        dialogBg.setStrokeStyle(2, 0x3498db);
        this.dialog.add(dialogBg);
        
        // Create title
        const title = this.scene.add.text(0, -200, 'Settings & App Info', {
            fontFamily: 'Arial',
            fontSize: '28px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 2
        }).setOrigin(0.5);
        this.dialog.add(title);
        
        // Create close button
        const closeButton = this.scene.add.text(250, -220, '✕', {
            fontFamily: 'Arial',
            fontSize: '24px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0.5);
        closeButton.setInteractive({ useHandCursor: true });
        closeButton.on('pointerdown', () => this.hideSettings());
        this.dialog.add(closeButton);
        
        // Create app info section
        this.createAppInfoSection();
        
        // Create settings section
        this.createSettingsSection();
        
        // Add click handler to overlay to close dialog
        overlay.setInteractive();
        overlay.on('pointerdown', (pointer, localX, localY, event) => {
            // Only close if clicking on overlay, not on dialog content
            if (event.target === overlay) {
                this.hideSettings();
            }
        });
        
        // Add ESC key handler
        this.scene.input.keyboard.on('keydown-ESC', () => {
            this.hideSettings();
        });
    }

    // Create app info section
    createAppInfoSection() {
        const versionInfo = getVersionInfo();
        
        // App Info Title
        const appInfoTitle = this.scene.add.text(-250, -150, 'App Information', {
            fontFamily: 'Arial',
            fontSize: '20px',
            fill: '#3498db',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0, 0.5);
        this.dialog.add(appInfoTitle);
        
        // App details
        const details = [
            { label: 'App Name:', value: VersionConfig.appName },
            { label: 'Version:', value: versionInfo.version },
            { label: 'Build:', value: `${versionInfo.buildDate} ${versionInfo.buildTime}` },
            { label: 'Commit:', value: versionInfo.commit },
            { label: 'Branch:', value: versionInfo.branch },
            { label: 'Engine:', value: versionInfo.engine },
            { label: 'Developer:', value: VersionConfig.developer }
        ];
        
        details.forEach((detail, index) => {
            const y = -100 + (index * 25);
            
            // Label
            const label = this.scene.add.text(-250, y, detail.label, {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#bdc3c7',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0, 0.5);
            this.dialog.add(label);
            
            // Value
            const value = this.scene.add.text(-100, y, detail.value, {
                fontFamily: 'Arial',
                fontSize: '14px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0, 0.5);
            this.dialog.add(value);
        });
        
        // Platform support
        const platformTitle = this.scene.add.text(-250, 50, 'Supported Platforms:', {
            fontFamily: 'Arial',
            fontSize: '16px',
            fill: '#3498db',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0, 0.5);
        this.dialog.add(platformTitle);
        
        VersionConfig.platforms.forEach((platform, index) => {
            const y = 75 + (index * 20);
            const platformText = this.scene.add.text(-250, y, `• ${platform}`, {
                fontFamily: 'Arial',
                fontSize: '12px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0, 0.5);
            this.dialog.add(platformText);
        });
    }

    // Create settings section
    createSettingsSection() {
        // Settings Title
        const settingsTitle = this.scene.add.text(50, -150, 'Settings', {
            fontFamily: 'Arial',
            fontSize: '20px',
            fill: '#3498db',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0, 0.5);
        this.dialog.add(settingsTitle);
        
        // Sound toggle
        this.createToggleSetting(50, -100, 'Sound Effects', true, (enabled) => {
            console.log('Sound effects:', enabled ? 'ON' : 'OFF');
            // TODO: Implement sound toggle
        });
        
        // Music toggle
        this.createToggleSetting(50, -70, 'Background Music', true, (enabled) => {
            console.log('Background music:', enabled ? 'ON' : 'OFF');
            // TODO: Implement music toggle
        });
        
        // Notifications toggle
        this.createToggleSetting(50, -40, 'Notifications', true, (enabled) => {
            console.log('Notifications:', enabled ? 'ON' : 'OFF');
            // TODO: Implement notifications toggle
        });
        
        // Debug mode toggle (only in development)
        if (window.gameConfig && window.gameConfig.isFeatureEnabled('debugMode')) {
            this.createToggleSetting(50, -10, 'Debug Mode', false, (enabled) => {
                console.log('Debug mode:', enabled ? 'ON' : 'OFF');
                // TODO: Implement debug mode toggle
            });
        }
        
        // Contact information
        const contactTitle = this.scene.add.text(50, 50, 'Contact & Support', {
            fontFamily: 'Arial',
            fontSize: '16px',
            fill: '#3498db',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0, 0.5);
        this.dialog.add(contactTitle);
        
        const contactInfo = [
            `Email: ${VersionConfig.support.email}`,
            `Telegram: ${VersionConfig.support.telegram}`,
            `Website: ${VersionConfig.support.website}`
        ];
        
        contactInfo.forEach((info, index) => {
            const y = 75 + (index * 20);
            const contactText = this.scene.add.text(50, y, info, {
                fontFamily: 'Arial',
                fontSize: '12px',
                fill: '#ffffff',
                stroke: '#000000',
                strokeThickness: 1
            }).setOrigin(0, 0.5);
            this.dialog.add(contactText);
        });
    }

    // Create a toggle setting
    createToggleSetting(x, y, label, defaultValue, callback) {
        // Label
        const labelText = this.scene.add.text(x, y, label, {
            fontFamily: 'Arial',
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000000',
            strokeThickness: 1
        }).setOrigin(0, 0.5);
        this.dialog.add(labelText);
        
        // Toggle button
        const toggleBg = this.scene.add.rectangle(x + 200, y, 40, 20, defaultValue ? 0x27ae60 : 0x7f8c8d);
        toggleBg.setStrokeStyle(1, 0x34495e);
        this.dialog.add(toggleBg);
        
        const toggleButton = this.scene.add.circle(x + 200 + (defaultValue ? 10 : -10), y, 8, 0xffffff);
        toggleButton.setStrokeStyle(1, 0x34495e);
        this.dialog.add(toggleButton);
        
        // Make interactive
        toggleBg.setInteractive({ useHandCursor: true });
        toggleButton.setInteractive({ useHandCursor: true });
        
        let isEnabled = defaultValue;
        
        const updateToggle = () => {
            toggleBg.setFillStyle(isEnabled ? 0x27ae60 : 0x7f8c8d);
            toggleButton.x = x + 200 + (isEnabled ? 10 : -10);
            callback(isEnabled);
        };
        
        const toggle = () => {
            isEnabled = !isEnabled;
            updateToggle();
        };
        
        toggleBg.on('pointerdown', toggle);
        toggleButton.on('pointerdown', toggle);
    }

    // Get current settings
    getSettings() {
        return {
            sound: true,
            music: true,
            notifications: true,
            debugMode: false
        };
    }

    // Update settings
    updateSettings(newSettings) {
        // TODO: Implement settings persistence
        console.log('Settings updated:', newSettings);
    }
} 