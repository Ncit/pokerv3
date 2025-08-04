#!/bin/bash

# Set Environment to VK Production Script
# Explicitly sets the environment to VK production mode

TARGET_FILE="src/config/EnvironmentConfig.js"

echo "🚀 Setting Environment to VK PRODUCTION"
echo "======================================"

if [[ ! -f "$TARGET_FILE" ]]; then
    echo "❌ Error: $TARGET_FILE not found"
    exit 1
fi

# Check current environment setting
if grep -q "return 'productionVK';" "$TARGET_FILE"; then
    echo "📝 Current environment: VK PRODUCTION (already set)"
    echo "✅ No changes needed"
else
    echo "📝 Current environment: DEVELOPMENT"
    echo "🔄 Switching to: VK PRODUCTION"
    
    # Switch to production VK
    sed -i '' 's/return '\''development'\'';/return '\''productionVK'\'';/g' "$TARGET_FILE"
    
    # Verify the change
    if grep -q "return 'productionVK';" "$TARGET_FILE"; then
        echo "✅ Successfully switched to VK PRODUCTION mode"
    else
        echo "❌ Error: Failed to switch to VK production"
        exit 1
    fi
fi

echo ""
echo "📋 VK Production Environment Features:"
echo "====================================="
echo "🔧 Debug: Disabled"
echo "👥 Player Selection: Disabled (direct game entry)"
echo "📝 Mock Data: Disabled (uses real VK Bridge)"
echo "🌐 Ngrok Headers: Enabled"
echo "⚠️  Verbose Errors: Disabled"

echo ""
echo "💡 To test the change:"
echo "   1. Refresh your browser"
echo "   2. Or restart your development server"
echo ""
echo "🔄 To switch to development: ./set-development.sh" 