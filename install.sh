#!/bin/bash

# Bash script that verifies presence of dependencies and sets up the database

# Check and install Node.js and npm
check_and_install_node() {
    echo "Checking for Node.js..."
    if ! node --version &>/dev/null; then
        echo "Node.js is not installed. Please install Node.js."
        echo "Visit https://nodejs.org/ for installation instructions."
        exit 1
    else
        echo "Node.js is installed."
    fi

    echo "Checking for npm..."
    if ! npm --version &>/dev/null; then
        echo "npm is not installed. Please ensure it is installed with Node.js."
        exit 1
    else
        echo "npm is installed."
    fi
}

# Ensure Python is installed and update pip
check_and_install_python() {
    echo "Checking for Python 3..."
    if ! python3 --version &>/dev/null; then
        echo "Python 3 is not installed. Installing Python 3..."
        brew install python
        # Ensure pip is up to date
        python3 -m pip install --upgrade pip
    else
        echo "Python 3 is installed."
    fi
}

# Ensure MySQL is installed and start the service
check_and_install_mysql() {
    echo "Checking for MySQL..."
    if ! mysql --version &>/dev/null; then
        echo "MySQL is not installed. Installing MySQL..."
        brew install mysql
        brew services start mysql
        echo "MySQL has been installed and started."
    else
        echo "MySQL is installed."
    fi
}

# Function to set up Python virtual environment and install mysql-connector-python
setup_virtual_environment() {
    echo "Setting up Python virtual environment and installing dependencies..."
    python3 -m venv ~/tax_prep_venv
    source ~/tax_prep_venv/bin/activate
    python3 -m pip install mysql-connector-python
    npm install crypto
}

# Function to configure MySQL user authentication
configure_mysql_authentication() {
    echo "Configuring MySQL user authentication method..."
    mysql -u root -p"$1" -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '$2'; FLUSH PRIVILEGES;"
    if [ $? -eq 0 ]; then
        echo "MySQL user authentication configured successfully."
    else
        echo "Failed to configure MySQL user authentication. Please check your root password and try again."
    fi
}

# Function to download and run the Python script for database initialization
# Also, this takes the user's credentials, encrypts them, and stores them in a local config
run_database_init_script() {
    local config_path="config.json"

    # Check if config file already exists and remove it
    if [ -f "$config_path" ]; then
        echo "Removing existing config file..."
        rm "$config_path"
    fi

    echo "Please enter a MySQL username (e.g., 'Jacob') to use:"
    read mysql_username
    echo "Please enter a MySQL password to use:"
    read -s mysql_password

    # Configure MySQL authentication
    configure_mysql_authentication "$mysql_root_password" "$mysql_password"

    echo "Encrypting and storing credentials..."
    echo "const crypto = require('crypto'); const fs = require('fs'); const algorithm = 'aes-256-cbc'; const key = crypto.randomBytes(32); const iv = crypto.randomBytes(16); const cipher = crypto.createCipheriv(algorithm, key, iv); let data = JSON.stringify({ username: '$mysql_username', password: '$mysql_password' }); let crypted = cipher.update(data, 'utf8', 'hex'); crypted += cipher.final('hex'); fs.writeFileSync('$config_path', JSON.stringify({ key: key.toString('hex'), iv: iv.toString('hex'), encrypted: crypted }));" | node

    if [ $? -ne 0 ]; then
        echo "Failed to encrypt and store credentials."
        exit 1
    fi

    echo "Downloading and running the database initialization script..."
    source ~/tax_prep_venv/bin/activate
    curl -sSL https://raw.githubusercontent.com/ethanreddick/tax-prep-tracker/main/init_db.py -o init_db.py
    python3 init_db.py "$mysql_username" "$mysql_password"
}

# Main function to perform checks
main() {
    # Check for Homebrew installation and install if not present
    if ! command -v brew &>/dev/null; then
        echo "Homebrew is not installed. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi

    check_and_install_node
    check_and_install_python
    check_and_install_mysql
    setup_virtual_environment
    run_database_init_script
}

# Call the main function
main
