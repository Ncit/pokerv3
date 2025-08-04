#!/bin/bash

# List All Environment Scripts
# Shows all available environment management scripts

echo "📋 Available Environment Scripts"
echo "================================"
echo ""

echo "🛠️  set-development.sh"
echo "   Purpose: Set environment to development mode"
echo "   Usage: ./scripts/set-development.sh"
echo "   Features: Debug enabled, player selection, mock data"
echo ""

echo "🚀 set-vk.sh"
echo "   Purpose: Set environment to VK production mode"
echo "   Usage: ./scripts/set-vk.sh"
echo "   Features: Debug disabled, direct game entry, real VK Bridge"
echo ""

echo "📱 set-telegram.sh"
echo "   Purpose: Set environment to production Telegram mode"
echo "   Usage: ./scripts/set-telegram.sh"
echo "   Features: Debug disabled, direct game entry, real Telegram Web App"
echo ""

echo "🔄 toggle-environment.sh"
echo "   Purpose: Toggle between development, VK production, and Telegram production"
echo "   Usage: ./scripts/toggle-environment.sh"
echo "   Features: Cycles through all three environments"
echo ""

echo "🔍 check-environment.sh"
echo "   Purpose: Show current environment status"
echo "   Usage: ./scripts/check-environment.sh"
echo "   Features: No changes, just information display"
echo ""

echo "📋 list-scripts.sh"
echo "   Purpose: Show this help information"
echo "   Usage: ./scripts/list-scripts.sh"
echo "   Features: Lists all available scripts"
echo ""

echo "🧪 run-tests.sh"
echo "   Purpose: Interactive test runner"
echo "   Usage: ./scripts/run-tests.sh"
echo "   Features: Categorized test selection and execution"
echo ""

echo "🚀 Server Scripts (in server-scripts/):"
echo "======================================="
echo "   start-multiplayer.sh - Start multiplayer server"
echo "   test-server.js       - Test server functionality"
echo "   test-websocket.js    - Test WebSocket connections"
echo "   test-allin-setup.js  - Test all-in scenarios"
echo ""

echo "💡 Quick Commands:"
echo "=================="
echo "   Check status:     ./scripts/check-environment.sh"
echo "   Set development:  ./scripts/set-development.sh"
echo "   Set VK:          ./scripts/set-vk.sh"
echo "   Set telegram:     ./scripts/set-telegram.sh"
echo "   Toggle:          ./scripts/toggle-environment.sh"
echo "   Run tests:       ./scripts/run-tests.sh"
echo "   Start server:    ./server-scripts/start-multiplayer.sh"
echo ""

echo "📖 For detailed documentation:"
echo "   cat docs/ENVIRONMENT_SCRIPTS_README.md" 