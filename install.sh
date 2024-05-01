#!/bin/bash

# Function to check and install Python 3
check_and_install_python() {
    echo "Checking for Python 3..."
    if ! python3 --version &>/dev/null; then
        echo "Python 3 is not installed. Installing Python 3..."
        brew install python
    else
        echo "Python 3 is installed."
    fi
}

# Function to check and install MySQL
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

# Main function to perform checks
main() {
    # Check for Homebrew installation and install if not present
    if ! command -v brew &>/dev/null; then
        echo "Homebrew is not installed. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi

    check_and_install_python
    check_and_install_mysql
}

# Call the main function
main
