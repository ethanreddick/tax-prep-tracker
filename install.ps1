# PowerShell script that verifies presence of dependencies and sets up the database

# Ensure Python is installed and update pip
function Check-And-Install-Python {
    Write-Host "Checking for Python 3..."
    $python = Get-Command python -ErrorAction SilentlyContinue
    if ($null -eq $python) {
        Write-Host "Python 3 is not installed. Please install Python 3 from https://www.python.org/"
        Exit
    } else {
        Write-Host "Python 3 is installed."
        python -m pip install --upgrade pip
    }
}

# Ensure MySQL is installed and start the service
function Check-And-Install-MySQL {1
    Write-Host "Checking for MySQL..."
    $mysql = Get-Command mysql -ErrorAction SilentlyContinue
    if ($null -eq $mysql) {
        Write-Host "MySQL is not installed. Please install MySQL from https://dev.mysql.com/downloads/mysql/"
        Exit
    } else {
        Write-Host "MySQL is installed."
    }
}

# Function to set up Python virtual environment and install mysql-connector-python
function Setup-VirtualEnvironment {
    Write-Host "Setting up Python virtual environment and installing dependencies..."
    python -m venv "$env:USERPROFILE\tax_prep_venv"
    & "$env:USERPROFILE\tax_prep_venv\Scripts\Activate.ps1"
    python -m pip install mysql-connector-python
}

# Function to download and run the Python script for database initialization
function Run-Database-Init-Script {
    Write-Host "Please enter a MySQL username (e.g., 'root') to use:"
    $mysqlUsername = Read-Host
    Write-Host "Please enter a MySQL password to use:"
    $mysqlPassword = Read-Host -AsSecureString

    Write-Host "Downloading and running the database initialization script..."
    & "$env:USERPROFILE\tax_prep_venv\Scripts\Activate.ps1"
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/ethanreddick/tax-prep-tracker/main/init_db.py" -OutFile "$env:USERPROFILE\tax_prep_venv\init_db.py"
    python "$env:USERPROFILE\tax_prep_venv\init_db.py" $mysqlUsername ([Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysqlPassword)))
}

# Main function to perform checks
function Main {
    Check-And-Install-Python
    Check-And-Install-MySQL
    Setup-VirtualEnvironment
    Run-Database-Init-Script
}

# Call the main function
Main
