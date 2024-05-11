#!/bin/bash
# Bash script that verifies presence of dependencies and sets up the database

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
}

# Function to download and run the Python script for database initialization
run_database_init_script() {
    echo "Please enter a MySQL username (e.g., 'Jacob') to use:"
    read mysql_username
    echo "Please enter a MySQL password to use:"
    read -s mysql_password

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

    check_and_install_python
    check_and_install_mysql
    setup_virtual_environment
    run_database_init_script
}

# Call the main function
main
