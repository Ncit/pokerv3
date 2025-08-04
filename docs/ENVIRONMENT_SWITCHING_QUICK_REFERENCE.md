# 🌐 Environment Switching - Quick Reference

## 🚀 **URL Parameters**

| Environment | URL Parameter | Hash Fragment |
|-------------|---------------|---------------|
| **Development** | `?env=development` | `#dev` |
| **VKontakte** | `?env=productionVK` | `#vk` |
| **Telegram** | `?env=productionTelegram` | `#telegram` |

## 🎮 **Console Commands**

```javascript
// Switch environments
env.switch("dev")        // Development
env.switch("vk")         // VKontakte  
env.switch("telegram")   // Telegram

// Information
env.info()               // Show current environment
env.list()               // Show available environments
env.current()            // Get current environment
env.fromUrl()            // Get environment from URL

// URL management
env.remove()             // Remove environment from URL
```

## 🎨 **Visual Switcher**

In debug mode, buttons appear in top-right corner:
- 🟢 **Dev** - Development
- 🔵 **VK** - VKontakte
- 🟣 **TG** - Telegram
- 🔴 **Remove** - Remove from URL

## 📋 **Environment Features**

| Feature | Development | VKontakte | Telegram |
|---------|-------------|-----------|----------|
| **Debug Mode** | ✅ ON | ❌ OFF | ❌ OFF |
| **Player Selection** | ✅ ON | ❌ OFF | ❌ OFF |
| **Debug Logging** | ✅ ON | ❌ OFF | ❌ OFF |
| **Mock Data** | ✅ ON | ❌ OFF | ❌ OFF |
| **Ngrok Headers** | ✅ ON | ✅ ON | ✅ ON |
| **Verbose Errors** | ✅ ON | ❌ OFF | ❌ OFF |

## 🔧 **Priority Order**

1. **URL Parameters** (`?env=development`)
2. **Hash Fragments** (`#dev`)
3. **Platform Detection** (VK/Telegram indicators)
4. **Default** (development)

## 🧪 **Test File**

Open `test-environment-url.html` for interactive testing.

## 💡 **Pro Tips**

- Environment changes apply immediately (no page reload)
- URL parameters take priority over platform detection
- Visual switcher only appears in debug mode
- Check browser console for detailed environment info 