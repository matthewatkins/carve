#!/bin/bash

# Interactive Project Initialization Script
# This script provides an interactive CLI for project initialization

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BRIGHT='\033[1m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}ℹ️  ${NC}$1"
}

print_success() {
    echo -e "${GREEN}✅ ${NC}$1"
}

print_warning() {
    echo -e "${YELLOW}⚠️  ${NC}$1"
}

print_error() {
    echo -e "${RED}❌ ${NC}$1"
}

print_header() {
    echo -e "\n${BRIGHT}${CYAN}$1${NC}\n"
}

# Get project name from directory
get_project_name_from_dir() {
    local current_dir=$(pwd)
    local dir_name=$(basename "$current_dir")

    # Clean the directory name (remove invalid characters)
    echo "$dir_name" | sed 's/[^a-z0-9-]/-/gi' | tr '[:upper:]' '[:lower:]'
}

# Validate project name
validate_project_name() {
    local name="$1"

    if [[ -z "$name" ]]; then
        echo "Project name cannot be empty"
        return 1
    fi

    if [[ ! "$name" =~ ^[a-z0-9-]+$ ]]; then
        echo "Project name must contain only lowercase letters, numbers, and hyphens"
        return 1
    fi

    if [[ "$name" =~ ^- ]] || [[ "$name" =~ -$ ]]; then
        echo "Project name cannot start or end with a hyphen"
        return 1
    fi

    if [[ ${#name} -gt 50 ]]; then
        echo "Project name must be 50 characters or less"
        return 1
    fi

    return 0
}

# Function to replace text in files with proper escaping
replace_in_file() {
    local file="$1"
    local old_text="$2"
    local new_text="$3"

    if [[ -f "$file" ]]; then
        # Use sed with different syntax for macOS vs Linux
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|$old_text|$new_text|g" "$file"
        else
            # Linux
            sed -i "s|$old_text|$new_text|g" "$file"
        fi
    fi
}

# Create backup
create_backup() {
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local backup_dir=".backup-$timestamp"

    if [[ ! -d "$backup_dir" ]]; then
        mkdir -p "$backup_dir"
    fi

    # Copy files to backup (excluding node_modules, .git, etc.)
    local exclude_dirs=("node_modules" ".git" ".backup-*" "dist" "build")

    function copy_dir() {
        local src="$1"
        local dest="$2"

        if [[ ! -d "$dest" ]]; then
            mkdir -p "$dest"
        fi

        for item in "$src"/*; do
            if [[ -e "$item" ]]; then
                local item_name=$(basename "$item")
                local src_path="$item"
                local dest_path="$dest/$item_name"

                # Skip excluded directories
                local skip=false
                for exclude in "${exclude_dirs[@]}"; do
                    if [[ "$item_name" == *"$exclude"* ]]; then
                        skip=true
                        break
                    fi
                done

                if [[ "$skip" == true ]]; then
                    continue
                fi

                if [[ -d "$src_path" ]]; then
                    copy_dir "$src_path" "$dest_path"
                else
                    cp "$src_path" "$dest_path"
                fi
            fi
        done
    }

    copy_dir "." "$backup_dir"
    echo "$backup_dir"
}

# Ask user for input
ask_question() {
    local question="$1"
    local default_value="$2"

    if [[ -n "$default_value" ]]; then
        read -p "$question ($default_value): " answer
        echo "${answer:-$default_value}"
    else
        read -p "$question: " answer
        echo "$answer"
    fi
}

# Main initialization function
initialize_project() {
    print_header "🚀 Project Initialization"

    # Get suggested project name from directory
    local suggested_name=$(get_project_name_from_dir)

    print_status "Detected project name from directory: $suggested_name"

    # Ask user for project name
    local project_name=$(ask_question "Enter your project name" "$suggested_name")

    # Validate project name
    local validation_error=$(validate_project_name "$project_name")
    if [[ $? -ne 0 ]]; then
        print_error "$validation_error"
        exit 1
    fi

    print_status "Initializing project: $project_name"

    # Confirm before proceeding
    local confirm=$(ask_question "Proceed with renaming to '$project_name'? (y/N)" "n")
    if [[ ! "$confirm" =~ ^[Yy] ]]; then
        print_status "Initialization cancelled"
        return
    fi

    # Create backup
    print_status "Creating backup..."
    local backup_dir=$(create_backup)
    print_success "Backup created in $backup_dir"

    local old_name="carve"
    local new_name="$project_name"

    # Files to process
    local files_to_process=(
        "package.json"
        "apps/api-server/package.json"
        "apps/auth-server/package.json"
        "apps/web/package.json"
        "packages/api/package.json"
        "packages/shared-types/package.json"
        "packages/shared-utils/package.json"
        "docker-compose.yml"
        "README.md"
        "scripts/predev.sh"
    )

    # Update package.json files
    print_status "Updating package.json files..."
    for file in "${files_to_process[@]}"; do
        if [[ -f "$file" ]]; then
            print_status "Processing $file"

            # Replace package names with proper escaping
            replace_in_file "$file" "\"@$old_name/" "\"@$new_name/"
            replace_in_file "$file" "\"name\": \"$old_name\"" "\"name\": \"$new_name\""
            replace_in_file "$file" "\"name\": \"@$old_name/" "\"name\": \"@$new_name/"

            print_success "Updated $file"
        fi
    done

    # Update turbo filter commands in root package.json
    print_status "Updating turbo filter commands..."
    if [[ -f "package.json" ]]; then
        replace_in_file "package.json" "turbo -F @$old_name/" "turbo -F @$new_name/"
        print_success "Updated turbo filter commands"
    fi

    # Update import statements in TypeScript/JavaScript files
    print_status "Updating import statements..."
    local import_patterns=(
        "apps/api-server/src"
        "apps/auth-server/src"
        "apps/web/app"
        "packages/api/src"
        "packages/shared-types/src"
        "packages/shared-utils/src"
    )

    for pattern in "${import_patterns[@]}"; do
        if [[ -d "$pattern" ]]; then
            # Find and process TypeScript/JavaScript/Vue files
            find "$pattern" -type f \( -name "*.ts" -o -name "*.js" -o -name "*.vue" \) 2>/dev/null | while read -r file; do
                if [[ -f "$file" ]]; then
                    replace_in_file "$file" "@$old_name/" "@$new_name/"
                fi
            done
        fi
    done

    # Update Docker configuration
    print_status "Updating Docker configuration..."
    if [[ -f "docker-compose.yml" ]]; then
        replace_in_file "docker-compose.yml" "name: '$old_name'" "name: '$new_name'"
        replace_in_file "docker-compose.yml" "container_name: ${old_name}_postgres" "container_name: ${new_name}_postgres"
    fi

    # Update README.md
    print_status "Updating README.md..."
    if [[ -f "README.md" ]]; then
        replace_in_file "README.md" "# $old_name - Microservices Architecture" "# $new_name - Microservices Architecture"
        replace_in_file "README.md" "docker logs ${old_name}-postgres" "docker logs ${new_name}-postgres"
        replace_in_file "README.md" "$old_name/" "$new_name/"
    fi

    # Update scripts
    print_status "Updating scripts..."
    if [[ -f "scripts/predev.sh" ]]; then
        replace_in_file "scripts/predev.sh" "@$old_name/" "@$new_name/"
    fi

    # Remove lock files
    print_status "Cleaning up lock files..."
    local lock_files=("bun.lock" "package-lock.json" "yarn.lock")
    for lock_file in "${lock_files[@]}"; do
        if [[ -f "$lock_file" ]]; then
            rm "$lock_file"
            print_warning "Removed $lock_file - run 'bun install' to regenerate"
        fi
    done

        print_success "Project initialization complete!"

        # Ask if user wants to install dependencies
    local deps_confirm=$(ask_question "Would you like to install dependencies now? (y/N)" "n")

    if [[ "$deps_confirm" =~ ^[Yy] ]]; then
        print_header "📦 Installing Dependencies"
        print_status "Installing dependencies..."
        if bun install; then
            print_success "Dependencies installed successfully!"

            # Ask if user wants to set up database
            local db_confirm=$(ask_question "Would you like to start the database and set up schemas? (y/N)" "n")

            if [[ "$db_confirm" =~ ^[Yy] ]]; then
                print_header "🐳 Setting Up Database"

                # Start database
                print_status "Starting database with Docker..."
                if docker-compose up --build -d; then
                    print_success "Database started successfully!"

                    # Wait for database to be ready and create databases
                    print_status "Waiting for database to be ready..."
                    sleep 10

                    # Check if databases exist, if not create them
                    if ! docker exec ${new_name}-postgres psql -U postgres -lqt | cut -d \| -f 1 | grep -qw auth_db; then
                        print_status "Creating databases..."
                        docker exec ${new_name}-postgres psql -U postgres -c "CREATE DATABASE auth_db;"
                        docker exec ${new_name}-postgres psql -U postgres -c "CREATE DATABASE api_db;"
                        print_success "Databases created successfully!"
                    fi

                    # Wait a moment for database to be ready
                    print_status "Waiting for database to be ready..."
                    sleep 3

                                        # Create .env files for database connections
                    print_status "Creating .env files for database connections..."

                    # Copy example.env to .env for auth-server
                    if [[ -f "apps/auth-server/example.env" && ! -f "apps/auth-server/.env" ]]; then
                        cp "apps/auth-server/example.env" "apps/auth-server/.env"
                        print_success "Created apps/auth-server/.env from example.env"
                    elif [[ ! -f "apps/auth-server/.env" ]]; then
                        print_warning "No example.env found for auth-server, creating basic .env"
                        cat > "apps/auth-server/.env" << EOF
# Database Configuration
AUTH_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db

# Server Configuration
PORT=3001
HOST=0.0.0.0

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Better Auth Configuration
BETTER_AUTH_SECRET=your-super-secret-better-auth-key-change-this-in-production
BETTER_AUTH_URL=http://localhost:3001
EOF
                        print_success "Created apps/auth-server/.env"
                    fi

                    # Copy example.env to .env for api-server
                    if [[ -f "apps/api-server/example.env" && ! -f "apps/api-server/.env" ]]; then
                        cp "apps/api-server/example.env" "apps/api-server/.env"
                        print_success "Created apps/api-server/.env from example.env"
                    elif [[ ! -f "apps/api-server/.env" ]]; then
                        print_warning "No example.env found for api-server, creating basic .env"
                        cat > "apps/api-server/.env" << EOF
# Database Configuration
API_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/api_db

# Server Configuration
PORT=3002
HOST=0.0.0.0

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Auth Server URL
AUTH_SERVER_URL=http://localhost:3001
EOF
                        print_success "Created apps/api-server/.env"
                    fi

                    # Push schemas
                    print_status "Setting up database schemas..."
                    if bun run db:push:auth && bun run db:push:api; then
                        print_success "Database schemas set up successfully!"

                        print_header "🎉 Setup Complete!"
                        echo "Your project has been fully initialized and set up!"
                        echo ""
                        echo "Next steps:"
                        echo "1. Set up your environment variables (see README.md)"
                        echo "2. Start development: bun dev"
                        echo ""
                        echo "Service URLs:"
                        echo "- Web App: http://localhost:3000"
                        echo "- Auth Server: http://localhost:3001"
                        echo "- API Server: http://localhost:3002"

                        # Ask about backup cleanup
                        local cleanup_confirm=$(ask_question "Would you like to delete the backup directory? ($backup_dir) (y/N)" "n")
                        if [[ "$cleanup_confirm" =~ ^[Yy] ]]; then
                            rm -rf "$backup_dir"
                            print_success "Backup deleted successfully!"
                        else
                            print_status "Backup preserved in $backup_dir"
                        fi
                    else
                        print_warning "Failed to set up database schemas. You may need to check your environment variables."
                        print_status "You can try manually: bun run db:push:auth && bun run db:push:api"
                    fi
                else
                    print_warning "Failed to start database. You may need to install Docker or check your Docker setup."
                    print_status "You can try starting it manually with: docker-compose up --build -d"
                fi
            else
                print_header "📋 Next Steps"
                echo "1. Set up your environment variables (see README.md)"
                echo "2. Start database: docker-compose up --build -d"
                echo "3. Push database schemas: bun run db:push:auth && bun run db:push:api"
                echo "4. Start development: bun dev"
                echo "5. Backup available in $backup_dir if needed"

                # Ask about backup cleanup
                local cleanup_confirm=$(ask_question "Would you like to delete the backup directory? ($backup_dir) (y/N)" "n")
                if [[ "$cleanup_confirm" =~ ^[Yy] ]]; then
                    rm -rf "$backup_dir"
                    print_success "Backup deleted successfully!"
                else
                    print_status "Backup preserved in $backup_dir"
                fi
            fi
        else
            print_error "Failed to install dependencies"
            exit 1
        fi
            else
                        # Create .env files even if not setting up database
            print_status "Creating .env files for database connections..."

            # Copy example.env to .env for auth-server
            if [[ -f "apps/auth-server/example.env" && ! -f "apps/auth-server/.env" ]]; then
                cp "apps/auth-server/example.env" "apps/auth-server/.env"
                print_success "Created apps/auth-server/.env from example.env"
            elif [[ ! -f "apps/auth-server/.env" ]]; then
                print_warning "No example.env found for auth-server, creating basic .env"
                cat > "apps/auth-server/.env" << EOF
# Database Configuration
AUTH_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/auth_db

# Server Configuration
PORT=3001
HOST=0.0.0.0

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Better Auth Configuration
BETTER_AUTH_SECRET=your-super-secret-better-auth-key-change-this-in-production
BETTER_AUTH_URL=http://localhost:3001
EOF
                print_success "Created apps/auth-server/.env"
            fi

            # Copy example.env to .env for api-server
            if [[ -f "apps/api-server/example.env" && ! -f "apps/api-server/.env" ]]; then
                cp "apps/api-server/example.env" "apps/api-server/.env"
                print_success "Created apps/api-server/.env from example.env"
            elif [[ ! -f "apps/api-server/.env" ]]; then
                print_warning "No example.env found for api-server, creating basic .env"
                cat > "apps/api-server/.env" << EOF
# Database Configuration
API_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/api_db

# Server Configuration
PORT=3002
HOST=0.0.0.0

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Auth Server URL
AUTH_SERVER_URL=http://localhost:3001
EOF
                print_success "Created apps/api-server/.env"
            fi

            print_header "📋 Next Steps"
            echo "1. Run 'bun install' to install dependencies"
            echo "2. Set up your environment variables (see README.md)"
            echo "3. Start database: docker-compose up --build -d"
            echo "4. Push database schemas: bun run db:push:auth && bun run db:push:api"
            echo "5. Start development: bun dev"
            echo "6. Update any remaining references manually if needed"
            echo "7. Backup available in $backup_dir if needed"

        # Ask about backup cleanup
        local cleanup_confirm=$(ask_question "Would you like to delete the backup directory? ($backup_dir) (y/N)" "n")
        if [[ "$cleanup_confirm" =~ ^[Yy] ]]; then
            rm -rf "$backup_dir"
            print_success "Backup deleted successfully!"
        else
            print_status "Backup preserved in $backup_dir"
        fi
    fi
}

# Run the initialization
initialize_project