#!/bin/bash

# Asset Verification Script
# Verifies that all required game assets are present in the client directory

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[ASSET VERIFY]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[ASSET VERIFY]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[ASSET VERIFY]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[ASSET VERIFY]${NC} ❌ $1"
}

# Check if we're in the client directory
if [[ ! -f "index.html" ]]; then
    log_error "Please run this script from the client directory"
    exit 1
fi

# Function to check if a file exists
check_asset() {
    local asset_path=$1
    local asset_name=$2
    
    if [[ -f "$asset_path" ]]; then
        log_success "$asset_name"
        return 0
    else
        log_error "$asset_name (missing: $asset_path)"
        return 1
    fi
}

# Function to check critical assets
check_critical_assets() {
    log "Checking critical game assets..."
    
    local missing_count=0
    
    # Critical UI assets
    critical_assets=(
        "assets/friends_button.png:Friends Button"
        "assets/avatar.png:Player Avatar"
        "assets/lobby_background.png:Lobby Background"
        "assets/top_bar_logo.png:Top Bar Logo"
        "assets/bottom_bar.png:Bottom Bar"
        "assets/call_button.png:Call Button"
        "assets/fold_button.png:Fold Button"
        "assets/raise_button.png:Raise Button"
        "assets/settings_button.png:Settings Button"
        "assets/chat_button.png:Chat Button"
        "assets/fast_game.png:Fast Game Button"
        "assets/train_game.png:AI Bot Button"
        "assets/back_card.png:Card Back"
    )
    
    for asset_info in "${critical_assets[@]}"; do
        IFS=':' read -r asset_path asset_name <<< "$asset_info"
        if ! check_asset "$asset_path" "$asset_name"; then
            missing_count=$((missing_count + 1))
        fi
    done
    
    return $missing_count
}

# Function to check card assets
check_card_assets() {
    log "Checking card assets..."
    
    local missing_count=0
    local total_cards=0
    
    # Check for card directory
    if [[ ! -d "assets/cards" ]]; then
        log_error "Cards directory missing (assets/cards/)"
        return 1
    fi
    
    # Check a few sample cards
    sample_cards=(
        "assets/cards/ace_of_spades.png:Ace of Spades"
        "assets/cards/king_of_hearts.png:King of Hearts"
        "assets/cards/queen_of_diamonds.png:Queen of Diamonds"
        "assets/cards/jack_of_clubs.png:Jack of Clubs"
        "assets/cards/10_of_hearts.png:10 of Hearts"
        "assets/cards/2_of_clubs.png:2 of Clubs"
    )
    
    for card_info in "${sample_cards[@]}"; do
        IFS=':' read -r card_path card_name <<< "$card_info"
        if ! check_asset "$card_path" "$card_name"; then
            missing_count=$((missing_count + 1))
        fi
        total_cards=$((total_cards + 1))
    done
    
    # Count total cards
    local actual_cards=$(find assets/cards -name "*.png" | wc -l)
    if [[ $actual_cards -ge 52 ]]; then
        log_success "Card deck complete ($actual_cards cards found)"
    else
        log_warning "Incomplete card deck ($actual_cards cards found, expected 52+)"
    fi
    
    return $missing_count
}

# Function to check font assets
check_font_assets() {
    log "Checking font assets..."
    
    local missing_count=0
    
    # Check font directory
    if [[ ! -d "assets/fonts" ]]; then
        log_error "Fonts directory missing (assets/fonts/)"
        return 1
    fi
    
    # Check for font files
    font_files=(
        "assets/fonts/fonts.css:Font CSS"
        "assets/fonts/PFDinTextCompPro-Regular.woff2:Regular Font"
        "assets/fonts/PFDinTextCompPro-Medium.woff2:Medium Font"
        "assets/fonts/PFDinTextCompPro-Bold.woff2:Bold Font"
    )
    
    for font_info in "${font_files[@]}"; do
        IFS=':' read -r font_path font_name <<< "$font_info"
        if ! check_asset "$font_path" "$font_name"; then
            missing_count=$((missing_count + 1))
        fi
    done
    
    return $missing_count
}

# Function to check asset directory structure
check_directory_structure() {
    log "Checking asset directory structure..."
    
    local structure_ok=true
    
    # Check main assets directory
    if [[ ! -d "assets" ]]; then
        log_error "Assets directory missing"
        structure_ok=false
    fi
    
    # Check subdirectories
    if [[ ! -d "assets/cards" ]]; then
        log_error "Cards subdirectory missing"
        structure_ok=false
    fi
    
    if [[ ! -d "assets/fonts" ]]; then
        log_error "Fonts subdirectory missing"
        structure_ok=false
    fi
    
    if $structure_ok; then
        log_success "Asset directory structure is correct"
        return 0
    else
        return 1
    fi
}

# Function to show asset statistics
show_asset_stats() {
    log "Asset Statistics:"
    
    local total_assets=$(find assets -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" | wc -l)
    local total_cards=$(find assets/cards -name "*.png" | wc -l)
    local total_fonts=$(find assets/fonts -name "*.woff*" -o -name "*.ttf" -o -name "*.otf" | wc -l)
    local total_size=$(du -sh assets | cut -f1)
    
    echo "   📊 Total assets: $total_assets"
    echo "   🃏 Playing cards: $total_cards"
    echo "   🔤 Font files: $total_fonts"
    echo "   💾 Total size: $total_size"
}

# Main verification function
run_verification() {
    log "Starting asset verification..."
    echo ""
    
    local total_errors=0
    local total_successes=0
    
    # Check directory structure
    if check_directory_structure; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + 1))
    fi
    
    # Check critical assets
    if check_critical_assets; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + $?))
    fi
    
    # Check card assets
    if check_card_assets; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + $?))
    fi
    
    # Check font assets
    if check_font_assets; then
        total_successes=$((total_successes + 1))
    else
        total_errors=$((total_errors + $?))
    fi
    
    echo ""
    show_asset_stats
    
    echo ""
    echo "=========================================="
    echo "📊 ASSET VERIFICATION SUMMARY"
    echo "=========================================="
    echo "✅ Successful checks: $total_successes"
    echo "❌ Errors found: $total_errors"
    echo ""
    
    if [[ $total_errors -eq 0 ]]; then
        log_success "All assets verified successfully!"
        return 0
    else
        log_error "Found $total_errors issues that need attention"
        return 1
    fi
}

# Main execution
main() {
    case $1 in
        "structure")
            check_directory_structure
            ;;
        "critical")
            check_critical_assets
            ;;
        "cards")
            check_card_assets
            ;;
        "fonts")
            check_font_assets
            ;;
        "stats")
            show_asset_stats
            ;;
        *)
            run_verification
            ;;
    esac
}

# Run main function with arguments
main "$@" 