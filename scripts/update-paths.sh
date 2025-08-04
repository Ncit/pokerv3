#!/bin/bash

# Update Paths Script
# Updates all references from src/ to client/src/ after files were moved to client folder

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[PATH UPDATE]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PATH UPDATE]${NC} ✅ $1"
}

log_warning() {
    echo -e "${YELLOW}[PATH UPDATE]${NC} ⚠️  $1"
}

log_error() {
    echo -e "${RED}[PATH UPDATE]${NC} ❌ $1"
}

# Check if we're in the client directory
if [[ ! -f "index.html" ]]; then
    log_error "Please run this script from the client directory"
    exit 1
fi

# Function to update paths in a file
update_file_paths() {
    local file_path=$1
    local temp_file="${file_path}.tmp"
    
    log "Updating paths in: $file_path"
    
    # Create backup
    cp "$file_path" "${file_path}.backup"
    
    # Update paths
    # Replace src/ with client/src/ but only if it's not already client/src/
    sed 's|src/|client/src/|g' "$file_path" > "$temp_file"
    
    # Check if the file was actually changed
    if cmp -s "$file_path" "$temp_file"; then
        log_warning "No changes needed in: $file_path"
        rm "$temp_file"
        rm "${file_path}.backup"
    else
        mv "$temp_file" "$file_path"
        log_success "Updated: $file_path"
    fi
}

# Function to update test files
update_test_files() {
    log "Updating test files..."
    
    # Find all HTML files in tests directory
    find tests -name "*.html" -type f | while read -r file; do
        update_file_paths "$file"
    done
}

# Function to update documentation files
update_docs() {
    log "Updating documentation files..."
    
    # Find all markdown files in docs directory
    find docs -name "*.md" -type f | while read -r file; do
        update_file_paths "$file"
    done
}

# Function to update scripts
update_scripts() {
    log "Updating script files..."
    
    # Find all shell scripts
    find scripts -name "*.sh" -type f | while read -r file; do
        update_file_paths "$file"
    done
}

# Function to update JavaScript files
update_js_files() {
    log "Updating JavaScript files..."
    
    # Find all JS files that might contain path references
    find . -name "*.js" -type f -not -path "./dependencies/*" | while read -r file; do
        # Only update if file contains src/ references
        if grep -q "src/" "$file"; then
            update_file_paths "$file"
        fi
    done
}

# Function to update all files
update_all() {
    log "Starting comprehensive path update..."
    
    update_test_files
    update_docs
    update_scripts
    update_js_files
    
    log_success "All path updates completed!"
}

# Function to show what would be updated
preview_changes() {
    log "Preview of files that would be updated:"
    echo "======================================"
    
    # Test files
    echo ""
    echo "Test Files:"
    find tests -name "*.html" -type f | while read -r file; do
        if grep -q "src/" "$file"; then
            echo "  - $file"
        fi
    done
    
    # Documentation files
    echo ""
    echo "Documentation Files:"
    find docs -name "*.md" -type f | while read -r file; do
        if grep -q "src/" "$file"; then
            echo "  - $file"
        fi
    done
    
    # Script files
    echo ""
    echo "Script Files:"
    find scripts -name "*.sh" -type f | while read -r file; do
        if grep -q "src/" "$file"; then
            echo "  - $file"
        fi
    done
    
    # JavaScript files
    echo ""
    echo "JavaScript Files:"
    find . -name "*.js" -type f -not -path "./dependencies/*" | while read -r file; do
        if grep -q "src/" "$file"; then
            echo "  - $file"
        fi
    done
}

# Function to restore backups
restore_backups() {
    log "Restoring backups..."
    
    find . -name "*.backup" -type f | while read -r backup_file; do
        original_file="${backup_file%.backup}"
        if [[ -f "$original_file" ]]; then
            mv "$backup_file" "$original_file"
            log_success "Restored: $original_file"
        fi
    done
    
    log_success "All backups restored!"
}

# Function to clean backups
clean_backups() {
    log "Cleaning backup files..."
    
    find . -name "*.backup" -type f -delete
    
    log_success "All backup files cleaned!"
}

# Main menu
show_menu() {
    echo ""
    echo "🔄 Path Update Tool"
    echo "==================="
    echo ""
    echo "1. Preview changes (dry run)"
    echo "2. Update all files"
    echo "3. Update test files only"
    echo "4. Update documentation only"
    echo "5. Update scripts only"
    echo "6. Update JavaScript files only"
    echo "7. Restore backups"
    echo "8. Clean backup files"
    echo "9. Exit"
    echo ""
    read -p "Choose an option (1-9): " choice
}

# Main execution
main() {
    case $1 in
        "preview")
            preview_changes
            ;;
        "all")
            update_all
            ;;
        "tests")
            update_test_files
            ;;
        "docs")
            update_docs
            ;;
        "scripts")
            update_scripts
            ;;
        "js")
            update_js_files
            ;;
        "restore")
            restore_backups
            ;;
        "clean")
            clean_backups
            ;;
        *)
            # Interactive mode
            while true; do
                show_menu
                case $choice in
                    1)
                        preview_changes
                        ;;
                    2)
                        update_all
                        ;;
                    3)
                        update_test_files
                        ;;
                    4)
                        update_docs
                        ;;
                    5)
                        update_scripts
                        ;;
                    6)
                        update_js_files
                        ;;
                    7)
                        restore_backups
                        ;;
                    8)
                        clean_backups
                        ;;
                    9)
                        log "Goodbye!"
                        exit 0
                        ;;
                    *)
                        log_error "Invalid option"
                        ;;
                esac
                
                echo ""
                read -p "Press Enter to continue..."
            done
            ;;
    esac
}

# Run main function with arguments
main "$@" 