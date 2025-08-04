# 🌐 URL-Based Environment Switching

This document explains how to use URL parameters to switch between different environments (development, VKontakte, Telegram) in the poker game.

## 🎯 **Overview**

The environment switching system allows you to change the game's behavior and configuration by adding parameters to the URL. This is useful for testing different environments without modifying code or configuration files.

## 🚀 **Quick Start**

### **URL Parameters**
Add `?env=environmentName` to your URL:

```
# Development environment
https://your-domain.com/?env=development

# VKontakte environment
https://your-domain.com/?env=productionVK

# Telegram environment
https://your-domain.com/?env=productionTelegram
```

### **Hash Fragments**
Use URL hash fragments for quick switching:

```
# Development
https://your-domain.com/#dev

# VKontakte
https://your-domain.com/#vk

# Telegram
https://your-domain.com/#telegram
```

## 📋 **Available Environments**

### **1. Development (`development`)**
- **Debug Mode**: Enabled
- **Features**: All debug features enabled
- **Use Case**: Local development and testing
- **URL**: `?env=development` or `#dev`

### **2. VKontakte (`productionVK`)**
- **Debug Mode**: Disabled
- **Features**: VK-specific optimizations
- **Use Case**: VKontakte platform deployment
- **URL**: `?env=productionVK` or `#vk`

### **3. Telegram (`productionTelegram`)**
- **Debug Mode**: Disabled
- **Features**: Telegram-specific optimizations
- **Use Case**: Telegram platform deployment
- **URL**: `?env=productionTelegram` or `#telegram`

## 🔧 **How It Works**

### **Priority Order**
The environment detection follows this priority order:

1. **URL Parameters** (highest priority)
   - `?env=environmentName`
2. **URL Hash Fragments**
   - `#dev`, `#vk`, `#telegram`
3. **Platform Detection**
   - VKontakte platform indicators
   - Telegram platform indicators
   - Localhost/development indicators
4. **Default** (lowest priority)
   - Falls back to development

### **Environment Detection Logic**
```javascript
// 1. Check URL parameters
const urlParams = new URLSearchParams(window.location.search);
const envParam = urlParams.get('env');

// 2. Check hash fragments
const hash = window.location.hash.toLowerCase();
if (hash.includes('#vk')) return 'productionVK';
if (hash.includes('#telegram')) return 'productionTelegram';
if (hash.includes('#dev')) return 'development';

// 3. Platform detection
if (window.VK || document.referrer.includes('vk.com')) return 'productionVK';
if (window.Telegram || document.referrer.includes('t.me')) return 'productionTelegram';
if (window.location.hostname === 'localhost') return 'development';

// 4. Default
return 'development';
```

## 🎮 **Usage Examples**

### **Basic URL Switching**
```html
<!-- Development -->
<a href="?env=development">Development Mode</a>

<!-- VKontakte -->
<a href="?env=productionVK">VK Mode</a>

<!-- Telegram -->
<a href="?env=productionTelegram">Telegram Mode</a>

<!-- Default (no parameters) -->
<a href="#">Default Mode</a>
```

### **Hash-Based Switching**
```html
<!-- Development -->
<a href="#dev">Development</a>

<!-- VKontakte -->
<a href="#vk">VKontakte</a>

<!-- Telegram -->
<a href="#telegram">Telegram</a>
```

### **Combined Parameters**
```html
<!-- Environment + other parameters -->
<a href="?env=development&debug=true&test=1">Development with Debug</a>
<a href="?env=productionVK&lang=ru">VK with Russian Language</a>
```

## 🛠️ **Console Commands**

The environment switcher provides console commands for easy testing:

### **Switch Environments**
```javascript
// Switch to development
env.switch("dev")

// Switch to VKontakte
env.switch("vk")

// Switch to Telegram
env.switch("telegram")
```

### **Information Commands**
```javascript
// Show current environment info
env.info()

// Show available environments
env.list()

// Get current environment
env.current()

// Get environment from URL
env.fromUrl()
```

### **URL Management**
```javascript
// Remove environment from URL
env.remove()
```

## 🎨 **Visual Environment Switcher**

In debug mode, a visual environment switcher appears in the top-right corner:

### **Features**
- **Dev Button**: Switch to development (green)
- **VK Button**: Switch to VKontakte (blue)
- **TG Button**: Switch to Telegram (purple)
- **Remove Button**: Remove environment from URL (red)

### **Styling**
```css
#env-switcher-buttons {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    padding: 10px;
    border-radius: 5px;
    z-index: 10000;
}
```

## 📊 **Environment Configuration**

### **Development Environment**
```javascript
{
    name: 'development',
    debug: true,
    features: {
        playerSelection: true,
        debugLogging: true,
        mockData: true,
        ngrokHeaders: true,
        verboseErrors: true
    }
}
```

### **VKontakte Environment**
```javascript
{
    name: 'vk',
    debug: false,
    features: {
        playerSelection: false,
        debugLogging: false,
        mockData: false,
        ngrokHeaders: true,
        verboseErrors: false
    }
}
```

### **Telegram Environment**
```javascript
{
    name: 'telegram',
    debug: false,
    features: {
        playerSelection: false,
        debugLogging: false,
        mockData: false,
        ngrokHeaders: true,
        verboseErrors: false
    }
}
```

## 🧪 **Testing**

### **Test File**
Use the provided test file: `test-environment-url.html`

### **Testing Steps**
1. Open `test-environment-url.html` in your browser
2. Open the browser console (F12)
3. Click on different URL examples
4. Watch the console for environment change messages
5. Try console commands: `env.info()`
6. Use the visual switcher buttons (in debug mode)

### **Expected Console Output**
```
🌐 Environment Switcher loaded!
Available commands:
   env.switch("dev") - Switch to development
   env.switch("vk") - Switch to VKontakte
   env.switch("telegram") - Switch to Telegram
   env.info() - Show current environment info
   env.list() - Show available environments
   env.remove() - Remove environment from URL

🌐 Environment Information:
   Current: development
   From URL: development
   Debug Mode: ON
   Features: {playerSelection: true, debugLogging: true, ...}
```

## 🔒 **Security Considerations**

### **URL Parameter Validation**
- Only valid environment names are accepted
- Invalid parameters are logged as warnings
- Falls back to default environment if invalid

### **Production Safety**
- Environment switching buttons only appear in debug mode
- URL parameters don't persist across sessions (unless manually saved)
- No sensitive information is exposed in URLs

## 🔄 **Integration with Existing Systems**

### **Compatibility**
- Works with existing environment configuration
- Maintains backward compatibility
- Integrates with platform detection
- Supports existing feature flags

### **Global Configuration**
```javascript
// Access environment info globally
window.gameConfig.environment
window.gameConfig.debug
window.gameConfig.features
window.isDebug // Legacy compatibility
```

## 🛠️ **Advanced Usage**

### **Dynamic Environment Switching**
```javascript
// Switch environment programmatically
import { setEnvironment } from './config/EnvironmentConfig.js';

setEnvironment('productionVK', true); // true = update URL
```

### **Custom Environment Detection**
```javascript
// Add custom detection logic
class CustomEnvironmentConfig extends EnvironmentConfig {
    detectEnvironmentFromPlatform() {
        // Add your custom logic here
        if (customCondition) {
            return 'customEnvironment';
        }
        return super.detectEnvironmentFromPlatform();
    }
}
```

### **URL Parameter Persistence**
```javascript
// Save environment preference
localStorage.setItem('preferredEnvironment', 'development');

// Restore on page load
const saved = localStorage.getItem('preferredEnvironment');
if (saved && !window.location.search.includes('env=')) {
    setEnvironment(saved, true);
}
```

## 📚 **Related Documentation**

- **[Environment Configuration](../config/EnvironmentConfig.js)**: Core environment configuration
- **[Environment Switcher](../utils/EnvironmentSwitcher.js)**: URL switching utility
- **[Test File](test-environment-url.html)**: Interactive testing interface

## 🆘 **Troubleshooting**

### **Common Issues**

#### **1. Environment Not Switching**
```javascript
// Check if environment is valid
env.list()

// Check current environment
env.info()

// Try manual switch
env.switch("dev")
```

#### **2. URL Not Updating**
```javascript
// Check browser console for errors
// Ensure setEnvironment is called with updateUrl=true
setEnvironment('development', true);
```

#### **3. Visual Switcher Not Appearing**
```javascript
// Check if debug mode is enabled
console.log(window.isDebug);

// Check if DOM is ready
console.log(document.readyState);
```

### **Debug Commands**
```javascript
// Full environment information
console.log(window.gameConfig);

// Check URL parameters
console.log(new URLSearchParams(window.location.search).get('env'));

// Check hash
console.log(window.location.hash);
```

---

**🌐 URL-based environment switching provides a flexible and user-friendly way to test different environments without code changes!** 