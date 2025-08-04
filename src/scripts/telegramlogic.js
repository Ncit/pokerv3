/**
 * Get safe avatar URL with fallback to avatar.png
 * Handles CORS issues with external avatar URLs
 * @param {string} avatarUrl - The original avatar URL from Telegram/VK
 * @returns {string} - Safe avatar URL with fallback
 */
function getSafeAvatarUrl(avatarUrl) {
    // Check if avatar URL is empty, null, undefined, or just whitespace
    if (!avatarUrl || avatarUrl.trim() === '' || avatarUrl === 'null' || avatarUrl === 'undefined') {
        console.log('📱 Avatar URL is empty/null, using fallback avatar.png');
        return 'assets/avatar.png';
    }
    
    // Check if the URL is valid (basic validation)
    try {
        const url = new URL(avatarUrl);
        if (!url.protocol || !url.hostname) {
            console.log('📱 Invalid avatar URL format, using fallback avatar.png');
            return 'assets/avatar.png';
        }
        
        // Check for CORS-prone domains (Telegram, VK, etc.)
        const corsProneDomains = ['t.me', 'telegram.org', 'vk.com', 'vk.ru', 'vk.me'];
        const isCorsProne = corsProneDomains.some(domain => url.hostname.includes(domain));
        
        if (isCorsProne) {
            console.log('📱 Avatar URL from CORS-prone domain detected, using fallback avatar.png');
            console.log('📱 CORS-prone URL:', avatarUrl);
            return 'assets/avatar.png';
        }
        
    } catch (error) {
        console.log('📱 Avatar URL parsing failed, using fallback avatar.png');
        return 'assets/avatar.png';
    }
    
    // For non-CORS-prone URLs, we can try to use them
    console.log('📱 Using provided avatar URL:', avatarUrl);
    return avatarUrl;
}

/**
 * Test avatar URL for CORS compatibility
 * @param {string} avatarUrl - The avatar URL to test
 * @returns {Promise<boolean>} - True if URL is accessible, false if CORS blocked
 */
async function testAvatarUrl(avatarUrl) {
    if (!avatarUrl || avatarUrl === 'assets/avatar.png') {
        return true; // Local asset is always accessible
    }
    
    try {
        const response = await fetch(avatarUrl, { 
            method: 'HEAD',
            mode: 'no-cors' // This will always succeed but doesn't guarantee access
        });
        return true;
    } catch (error) {
        console.log('📱 Avatar URL CORS test failed:', error.message);
        return false;
    }
}

/**
 * Telegram Mini App Integration
 * Handles Telegram Web App API integration for the poker game
 */

// Global Telegram WebApp object (will be available in Telegram environment)
let TelegramWebApp = null;

/**
 * Initialize Telegram Web App
 */
function initTelegramWebApp() {
    try {
        // Check if Telegram WebApp is available
        if (typeof window.Telegram !== 'undefined' && window.Telegram.WebApp) {
            TelegramWebApp = window.Telegram.WebApp;
            Telegram.WebApp.expand();
  
            // Optional: Prevent accidental closing (shows a confirmation dialog)
            Telegram.WebApp.enableClosingConfirmation();
            
            console.log('📱 Telegram WebApp object found:', TelegramWebApp);
            
            // Initialize the Web App with error handling
            try {
                if (typeof TelegramWebApp.ready === 'function') {
                    TelegramWebApp.ready();
                    console.log('✅ Telegram WebApp ready() called');
                } else {
                    console.warn('⚠️ TelegramWebApp.ready() not available');
                }
            } catch (readyError) {
                console.warn('⚠️ Error calling TelegramWebApp.ready():', readyError);
            }
            
            // Expand the Web App to full height with error handling
            try {
                if (typeof TelegramWebApp.expand === 'function') {
                    TelegramWebApp.expand();
                    console.log('✅ Telegram WebApp expand() called');
                } else {
                    console.warn('⚠️ TelegramWebApp.expand() not available');
                }
            } catch (expandError) {
                console.warn('⚠️ Error calling TelegramWebApp.expand():', expandError);
            }
            
            console.log('✅ Telegram Web App initialized successfully');
            return true;
        } else {
            console.warn('⚠️ Telegram Web App not available');
            console.log('📱 window.Telegram:', typeof window.Telegram);
            console.log('📱 window.Telegram.WebApp:', typeof window.Telegram?.WebApp);
            return false;
        }
    } catch (error) {
        console.error('❌ Error initializing Telegram Web App:', error);
        return false;
    }
}

/**
 * Setup Telegram app with user data
 */
function setupTelegramApp(appDataCallback) {
    try {
        if (!TelegramWebApp) {
            console.error('❌ Telegram Web App not initialized');
            throw new Error('Telegram Web App not initialized');
        }
        TelegramWebApp.requestFullscreen();
        TelegramWebApp.lockOrientation("landscape");
        console.log('📱 Setting up Telegram app...');
        console.log('📱 TelegramWebApp:', TelegramWebApp);
        console.log('📱 TelegramWebApp.initDataUnsafe:', TelegramWebApp.initDataUnsafe);

        // Get user data from Telegram Web App
        const user = TelegramWebApp.initDataUnsafe?.user;
        
        if (user) {
            console.log('📱 Telegram user data found:', user);
            
            // Format user data to match app expectations
            const appData = {
                telegram_user_id: user.id,
                first_name: user.first_name,
                last_name: user.last_name || '',
                username: user.username || '',
                language_code: user.language_code || 'en',
                userAvatar: getSafeAvatarUrl(user.photo_url),
                // Add Telegram-specific fields
                is_premium: user.is_premium || false,
                added_to_attachment_menu: user.added_to_attachment_menu || false,
                allows_write_to_pm: user.allows_write_to_pm || false
            };
            
            console.log('✅ Telegram user data formatted:', appData);
            appDataCallback(appData);
        } else {
            console.warn('⚠️ No user data available from Telegram');
            console.log('📱 TelegramWebApp.initDataUnsafe:', TelegramWebApp.initDataUnsafe);
            
            // Provide fallback data for development
            const fallbackData = {
                telegram_user_id: 123456789,
                first_name: 'Telegram User',
                last_name: '',
                username: 'telegram_user',
                language_code: 'en',
                userAvatar: getSafeAvatarUrl(''),
                is_premium: false,
                added_to_attachment_menu: false,
                allows_write_to_pm: false
            };
            console.log('📱 Using fallback data:', fallbackData);
            appDataCallback(fallbackData);
        }
    } catch (error) {
        console.error('❌ Error setting up Telegram app:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            TelegramWebApp: TelegramWebApp
        });
        
        // Provide fallback data on error
        const fallbackData = {
            telegram_user_id: 123456789,
            first_name: 'Telegram User',
            last_name: '',
            username: 'telegram_user',
            language_code: 'en',
            userAvatar: getSafeAvatarUrl(''),
            is_premium: false,
            added_to_attachment_menu: false,
            allows_write_to_pm: false
        };
        console.log('📱 Using error fallback data:', fallbackData);
        appDataCallback(fallbackData);
    }
}

/**
 * Get Telegram user information
 */
function getTelegramUserInfo(callback) {
    if (!TelegramWebApp) {
        console.error('❌ Telegram Web App not initialized');
        return;
    }

    try {
        const user = TelegramWebApp.initDataUnsafe?.user;
        if (user) {
            callback(user);
        } else {
            console.warn('⚠️ No user data available');
            callback(null);
        }
    } catch (error) {
        console.error('❌ Error getting Telegram user info:', error);
        callback(null);
    }
}

/**
 * Show Telegram main button
 */
function showTelegramMainButton(text, callback) {
    if (!TelegramWebApp) {
        console.warn('⚠️ Telegram Web App not available');
        return;
    }

    try {
        TelegramWebApp.MainButton.setText(text);
        TelegramWebApp.MainButton.onClick(callback);
        TelegramWebApp.MainButton.show();
        console.log('✅ Telegram main button shown:', text);
    } catch (error) {
        console.error('❌ Error showing Telegram main button:', error);
    }
}

/**
 * Hide Telegram main button
 */
function hideTelegramMainButton() {
    if (!TelegramWebApp) {
        return;
    }

    try {
        TelegramWebApp.MainButton.hide();
        console.log('✅ Telegram main button hidden');
    } catch (error) {
        console.error('❌ Error hiding Telegram main button:', error);
    }
}

/**
 * Show Telegram back button
 */
function showTelegramBackButton(callback) {
    if (!TelegramWebApp) {
        console.warn('⚠️ Telegram Web App not available');
        return;
    }

    try {
        TelegramWebApp.BackButton.onClick(callback);
        TelegramWebApp.BackButton.show();
        console.log('✅ Telegram back button shown');
    } catch (error) {
        console.error('❌ Error showing Telegram back button:', error);
    }
}

/**
 * Hide Telegram back button
 */
function hideTelegramBackButton() {
    if (!TelegramWebApp) {
        return;
    }

    try {
        TelegramWebApp.BackButton.hide();
        console.log('✅ Telegram back button hidden');
    } catch (error) {
        console.error('❌ Error hiding Telegram back button:', error);
    }
}

/**
 * Show Telegram Haptic feedback
 */
function showTelegramHapticFeedback(style = 'light') {
    if (!TelegramWebApp) {
        return;
    }

    try {
        TelegramWebApp.HapticFeedback.impactOccurred(style);
    } catch (error) {
        console.error('❌ Error showing haptic feedback:', error);
    }
}

/**
 * Show Telegram notification
 */
function showTelegramNotification(message, callback) {
    if (!TelegramWebApp) {
        console.warn('⚠️ Telegram Web App not available');
        return;
    }

    try {
        TelegramWebApp.showAlert(message, callback);
    } catch (error) {
        console.error('❌ Error showing Telegram notification:', error);
    }
}

/**
 * Show Telegram confirmation dialog
 */
function showTelegramConfirm(message, callback) {
    if (!TelegramWebApp) {
        console.warn('⚠️ Telegram Web App not available');
        return;
    }

    try {
        TelegramWebApp.showConfirm(message, callback);
    } catch (error) {
        console.error('❌ Error showing Telegram confirmation:', error);
    }
}

/**
 * Close Telegram Web App
 */
function closeTelegramWebApp() {
    if (!TelegramWebApp) {
        console.warn('⚠️ Telegram Web App not available');
        return;
    }

    try {
        TelegramWebApp.close();
        console.log('✅ Telegram Web App closed');
    } catch (error) {
        console.error('❌ Error closing Telegram Web App:', error);
    }
}

/**
 * Get Telegram theme parameters
 */
function getTelegramThemeParams() {
    if (!TelegramWebApp) {
        return null;
    }

    try {
        return TelegramWebApp.themeParams;
    } catch (error) {
        console.error('❌ Error getting Telegram theme params:', error);
        return null;
    }
}

/**
 * Check if running in Telegram
 */
function isTelegramEnvironment() {
    return typeof window.Telegram !== 'undefined' && window.Telegram.WebApp;
}

/**
 * Get Telegram platform
 */
function getTelegramPlatform() {
    if (!TelegramWebApp) {
        return 'unknown';
    }

    try {
        return TelegramWebApp.platform;
    } catch (error) {
        console.error('❌ Error getting Telegram platform:', error);
        return 'unknown';
    }
}

/**
 * Get Telegram version
 */
function getTelegramVersion() {
    if (!TelegramWebApp) {
        return 'unknown';
    }

    try {
        return TelegramWebApp.version;
    } catch (error) {
        console.error('❌ Error getting Telegram version:', error);
        return 'unknown';
    }
}

// Export functions for use in other modules
export {
    initTelegramWebApp,
    setupTelegramApp,
    getTelegramUserInfo,
    showTelegramMainButton,
    hideTelegramMainButton,
    showTelegramBackButton,
    hideTelegramBackButton,
    showTelegramHapticFeedback,
    showTelegramNotification,
    showTelegramConfirm,
    closeTelegramWebApp,
    getTelegramThemeParams,
    isTelegramEnvironment,
    getTelegramPlatform,
    getTelegramVersion
}; 