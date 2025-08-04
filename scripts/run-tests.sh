#!/bin/bash

# Test Runner Script
# Easily run tests from the tests directory

echo "🧪 Poker Game Test Runner"
echo "========================"
echo ""

# Check if server is running
if ! curl -s http://localhost:8000 > /dev/null 2>&1; then
    echo "⚠️  No server detected on port 8000"
    echo "🚀 Starting development server..."
    python3 -m http.server 8000 &
    SERVER_PID=$!
    sleep 2
    echo "✅ Server started (PID: $SERVER_PID)"
    echo ""
else
    echo "✅ Server already running on port 8000"
    echo ""
fi

# Function to open test in browser
open_test() {
    local test_file=$1
    local test_name=$2
    
    if [[ -f "tests/$test_file" ]]; then
        echo "🌐 Opening $test_name..."
        if command -v open > /dev/null; then
            open "http://localhost:8000/tests/$test_file"
        elif command -v xdg-open > /dev/null; then
            xdg-open "http://localhost:8000/tests/$test_file"
        else
            echo "💡 Open manually: http://localhost:8000/tests/$test_file"
        fi
    else
        echo "❌ Test file not found: tests/$test_file"
    fi
}

# Show available test categories
echo "📋 Available Test Categories:"
echo "============================="
echo "1. Environment Tests"
echo "2. AI Bot Tests"
echo "3. Game Mechanics Tests"
echo "4. Chat Tests"
echo "5. Connection Tests"
echo "6. UI Tests"
echo "7. All Tests List"
echo ""

read -p "Select test category (1-7) or press Enter for environment tests: " choice

case $choice in
    1|"")
        echo ""
        echo "🔧 Environment Tests:"
        echo "===================="
        echo "1. Environment Configuration Test"
        echo "2. Import Fix Test"
        echo "3. Simple Environment Test"
        echo ""
        read -p "Select test (1-3): " env_choice
        case $env_choice in
            1) open_test "test-environment-config.html" "Environment Configuration Test" ;;
            2) open_test "test-import-fix.html" "Import Fix Test" ;;
            3) open_test "simple-test.html" "Simple Environment Test" ;;
            *) echo "❌ Invalid choice" ;;
        esac
        ;;
    2)
        echo ""
        echo "🤖 AI Bot Tests:"
        echo "==============="
        echo "1. AI Bot Black Screen Fix"
        echo "2. AI Bot Call Fix"
        echo "3. Enhanced AI Test"
        echo "4. New AI Bot Scene"
        echo ""
        read -p "Select test (1-4): " ai_choice
        case $ai_choice in
            1) open_test "test-ai-bot-black-screen.html" "AI Bot Black Screen Fix" ;;
            2) open_test "test-ai-bot-call-fix.html" "AI Bot Call Fix" ;;
            3) open_test "test-enhanced-ai.html" "Enhanced AI Test" ;;
            4) open_test "test-new-ai-bot-scene.html" "New AI Bot Scene" ;;
            *) echo "❌ Invalid choice" ;;
        esac
        ;;
    3)
        echo ""
        echo "🎮 Game Mechanics Tests:"
        echo "======================="
        echo "1. All-In Fix"
        echo "2. Raise Button Fix"
        echo "3. Turn Management Fix"
        echo "4. Card Container Fix"
        echo ""
        read -p "Select test (1-4): " game_choice
        case $game_choice in
            1) open_test "test-all-in-fix.html" "All-In Fix" ;;
            2) open_test "test-raise-fix.html" "Raise Button Fix" ;;
            3) open_test "test-turn-management-fix.html" "Turn Management Fix" ;;
            4) open_test "test-card-container-fix.html" "Card Container Fix" ;;
            *) echo "❌ Invalid choice" ;;
        esac
        ;;
    4)
        echo ""
        echo "💬 Chat Tests:"
        echo "=============="
        echo "1. Chat Functionality"
        echo "2. Chat Messages"
        echo "3. Chat Positioning"
        echo "4. Pretty Chat"
        echo ""
        read -p "Select test (1-4): " chat_choice
        case $chat_choice in
            1) open_test "test-chat-functionality.html" "Chat Functionality" ;;
            2) open_test "test-chat-messages.html" "Chat Messages" ;;
            3) open_test "test-chat-positioning.html" "Chat Positioning" ;;
            4) open_test "test-pretty-chat.html" "Pretty Chat" ;;
            *) echo "❌ Invalid choice" ;;
        esac
        ;;
    5)
        echo ""
        echo "🔗 Connection Tests:"
        echo "==================="
        echo "1. Reconnection Test"
        echo "2. Disconnect/Connect Test"
        echo "3. Reconnection Buttons"
        echo "4. Server Client Sync"
        echo ""
        read -p "Select test (1-4): " conn_choice
        case $conn_choice in
            1) open_test "test-reconnection.html" "Reconnection Test" ;;
            2) open_test "test-disconnect-connect.html" "Disconnect/Connect Test" ;;
            3) open_test "test-reconnection-buttons.html" "Reconnection Buttons" ;;
            4) open_test "test-server-client-sync.html" "Server Client Sync" ;;
            *) echo "❌ Invalid choice" ;;
        esac
        ;;
    6)
        echo ""
        echo "🎨 UI Tests:"
        echo "============"
        echo "1. UI Updates"
        echo "2. Winner Display"
        echo "3. Button Activation"
        echo "4. Ready Button"
        echo ""
        read -p "Select test (1-4): " ui_choice
        case $ui_choice in
            1) open_test "test-ui-updates.html" "UI Updates" ;;
            2) open_test "test-winner-display.html" "Winner Display" ;;
            3) open_test "test-button-activation.html" "Button Activation" ;;
            4) open_test "test-ready-button.html" "Ready Button" ;;
            *) echo "❌ Invalid choice" ;;
        esac
        ;;
    7)
        echo ""
        echo "📋 All Available Tests:"
        echo "======================"
        ls tests/test-*.html | sed 's|tests/||' | sed 's|.html||' | nl
        echo ""
        read -p "Enter test number or filename: " test_input
        if [[ $test_input =~ ^[0-9]+$ ]]; then
            # Number input
            test_file=$(ls tests/test-*.html | sed -n "${test_input}p" | sed 's|tests/||')
            if [[ -n "$test_file" ]]; then
                open_test "$test_file" "$test_file"
            else
                echo "❌ Invalid test number"
            fi
        else
            # Filename input
            if [[ $test_input == *".html" ]]; then
                open_test "$test_input" "$test_input"
            else
                open_test "${test_input}.html" "$test_input"
            fi
        fi
        ;;
    *)
        echo "❌ Invalid choice"
        ;;
esac

echo ""
echo "💡 Tips:"
echo "   - Use browser dev tools (F12) for debugging"
echo "   - Check console for error messages"
echo "   - Use ./check-environment.sh to verify environment"
echo ""
echo "🔄 To run another test, execute this script again" 