# Poker Game v2 - Client

The client-side application for the Poker Game v2 project, built with Phaser.js and supporting multiple platforms.

## 🎯 **Overview**

The client is a modern web-based poker game that supports:
- **Texas Hold'em** poker gameplay
- **AI Bot** opponents
- **Multiplayer** real-time games
- **Platform Integration** (VKontakte, Telegram)
- **Responsive Design** for mobile and desktop

## 📁 **Project Structure**

```
client/
├── src/                    # Source code
│   ├── config/            # Configuration files
│   │   ├── AssetConfig.js
│   │   ├── ButtonConfig.js
│   │   ├── EnvironmentConfig.js
│   │   ├── GameConfig.js
│   │   └── PlayerConfig.js
│   ├── managers/          # Game managers
│   │   ├── ButtonManager.js
│   │   ├── CardManager.js
│   │   ├── ChatManager.js
│   │   ├── NetworkManager.js
│   │   ├── PlayerManager.js
│   │   └── UIManager.js
│   ├── scenes/            # Phaser.js scenes
│   │   ├── AIBotScene.js
│   │   ├── FastGameScene.js
│   │   ├── FriendsGameScene.js
│   │   ├── LoadingScene.js
│   │   └── LobbyScene.js
│   ├── scripts/           # Platform integration
│   │   ├── telegramlogic.js
│   │   └── vklogic.js
│   ├── utils/             # Utility functions
│   │   ├── AssetHelper.js
│   │   ├── EventManager.js
│   │   ├── HandEvaluator.js
│   │   ├── NgrokUtils.js
│   │   └── PositionCalculator.js
│   └── main.js            # Main entry point
├── assets/                # Game assets
│   ├── cards/            # Card images (52 playing cards)
│   ├── fonts/            # Custom fonts
│   ├── *.png             # UI elements, buttons, backgrounds
│   └── *.jpg             # Additional game assets
├── dependencies/          # External libraries
│   ├── phaser.js
│   ├── rexui.js
│   └── vkbridge.js
├── tests/                # Test files
├── docs/                 # Client documentation
├── scripts/              # Client-specific scripts
├── index.html            # Main HTML file
├── project.config        # Project configuration
├── .prettierrc          # Code formatting
└── thumbnail.png         # App thumbnail
```

## 🚀 **Quick Start**

### **Development**
```bash
# Navigate to client directory
cd client

# Start development server
python3 -m http.server 8000

# Open in browser
open http://localhost:8000
```

**Note**: All game assets are included in the `client/assets/` directory for self-contained deployment.

### **Environment Setup**
```bash
# Check current environment
./scripts/check-environment.sh

# Toggle between environments (Development ↔ VK ↔ Telegram)
./scripts/toggle-environment.sh

# Set specific environment
./scripts/set-development.sh
./scripts/set-vk.sh
./scripts/set-telegram.sh
```

**Note**: All scripts use relative paths (`src/config/EnvironmentConfig.js`) since they run from within the client directory.

### **Asset Verification**
```bash
# Verify all game assets are present
./scripts/verify-assets.sh

# Check specific asset categories
./scripts/verify-assets.sh critical  # Critical UI assets
./scripts/verify-assets.sh cards     # Playing cards
./scripts/verify-assets.sh fonts     # Font files
./scripts/verify-assets.sh stats     # Asset statistics
```

## 🎮 **Game Features**

### **Core Gameplay**
- **Texas Hold'em Rules**: Standard poker gameplay
- **AI Opponents**: Intelligent bot players
- **Multiplayer Support**: Real-time multiplayer games
- **Chat System**: In-game communication
- **Spectator Mode**: Watch games without playing

### **Platform Integration**
- **VKontakte**: Native VK platform integration
- **Telegram**: Telegram Mini App support
- **User Authentication**: Platform-specific user data
- **Avatar Management**: Unified avatar system

### **UI/UX Features**
- **Responsive Design**: Works on mobile and desktop
- **Custom UI**: Modern, intuitive interface
- **Animations**: Smooth card and UI animations
- **Sound Effects**: Immersive audio experience

## 🧪 **Testing**

### **Test Categories**
- **Game Mechanics**: Card handling, betting, turn management
- **AI Bot Tests**: Scene management and game logic
- **Chat Tests**: Communication system
- **Connection Tests**: Network and multiplayer
- **UI Tests**: User interface components
- **Platform Integration**: VK and Telegram integration

### **Running Tests**
```bash
# Run all tests
cd tests
python3 -m http.server 8001
open http://localhost:8001
```

## 🔧 **Configuration**

### **Environment Config**
The client supports three environments:
- **Development**: Debug features, player selection, mock data
- **ProductionVK**: VK platform integration, production features
- **ProductionTelegram**: Telegram Mini App integration

### **Asset Configuration**
- **Card Images**: 52 standard playing cards
- **UI Elements**: Buttons, backgrounds, overlays
- **Fonts**: Custom typography for branding
- **Audio**: Sound effects and background music

## 📱 **Platform Support**

### **VKontakte Platform**
- **VK Bridge**: Seamless platform integration
- **User Data**: VK user information and authentication
- **Social Features**: Friend invites and sharing

### **Telegram Mini App**
- **Web App API**: Telegram platform integration
- **User Data**: Telegram user information
- **Mini App Features**: Native Telegram experience

### **Web Browser**
- **Development**: Local development environment
- **Debug Tools**: Player selection, mock data
- **Testing**: Comprehensive test suite

## 🛠️ **Development**

### **Code Organization**
- **Modular Architecture**: Clean separation of concerns
- **Manager Pattern**: Centralized game state management
- **Scene System**: Phaser.js scene-based architecture
- **Event System**: Decoupled communication between components

### **Dependencies**
- **Phaser.js**: Game engine and rendering
- **RexUI**: UI components and layouts
- **VK Bridge**: VKontakte platform integration

### **Build Process**
- **No Build Step**: Pure HTML/CSS/JavaScript
- **Development Server**: Simple HTTP server
- **Asset Loading**: Dynamic asset management
- **Environment Switching**: Runtime environment configuration

## 📚 **Documentation**

- **[Main README](../README.md)**: Complete project overview
- **[Game Documentation](../docs/README.md)**: Detailed game features
- **[Platform Guides](../docs/TELEGRAM_README.md)**: Platform-specific guides
- **[Changelog](../CHANGELOG.md)**: Complete change history

## 🔮 **Future Enhancements**

- **Additional Platforms**: Support for more social platforms
- **Advanced Features**: Enhanced multiplayer capabilities
- **Performance**: Optimization for mobile platforms
- **Analytics**: Platform-specific analytics integration

---

*This client represents a modern, multi-platform poker game with comprehensive testing and documentation.* 