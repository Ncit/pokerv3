#!/bin/bash

# Set Environment to Development Script
# Explicitly sets the environment to development mode

TARGET_FILE="src/config/EnvironmentConfig.js"

echo "🛠️  Setting Environment to DEVELOPMENT"
echo "====================================="

if [[ ! -f "$TARGET_FILE" ]]; then
    echo "❌ Error: $TARGET_FILE not found"
    exit 1
fi

# Check current environment setting
if grep -q "return 'development';" "$TARGET_FILE"; then
    echo "📝 Current environment: DEVELOPMENT (already set)"
    echo "✅ No changes needed"
else
    echo "📝 Current environment: PRODUCTION VK"
    echo "🔄 Switching to: DEVELOPMENT"
    
    # Switch to development
    sed -i '' 's/return '\''productionVK'\'';/return '\''development'\'';/g' "$TARGET_FILE"
    
    # Verify the change
    if grep -q "return 'development';" "$TARGET_FILE"; then
        echo "✅ Successfully switched to DEVELOPMENT mode"
    else
        echo "❌ Error: Failed to switch to development"
        exit 1
    fi
fi

echo ""
echo "📋 Development Environment Features:"
echo "==================================="
echo "🔧 Debug: Enabled"
echo "👥 Player Selection: Enabled (debug player selection screen)"
echo "📝 Mock Data: Enabled (uses mock VK user data)"
echo "🌐 Ngrok Headers: Enabled"
echo "⚠️  Verbose Errors: Enabled"

echo ""
echo "💡 To test the change:"
echo "   1. Refresh your browser"
echo "   2. Or restart your development server"
echo ""
echo "🔄 To switch to VK production: ./set-vk.sh" 