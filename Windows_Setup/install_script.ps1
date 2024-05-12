# PowerShell script that verifies presence of dependencies and sets up the database

function Check-And-Install-Node {
    Write-Host "Checking for Node.js..."
    $node = Get-Command "node" -ErrorAction SilentlyContinue
    if ($null -eq $node) {
        Write-Host "Node.js is not installed. Please install Node.js."
        Write-Host "Visit https://nodejs.org/ for installation instructions."
        exit
    } else {
        Write-Host "Node.js is installed."
    }

    Write-Host "Checking for npm..."
    $npm = Get-Command "npm" -ErrorAction SilentlyContinue
    if ($null -eq $npm) {
        Write-Host "npm is not installed. Please ensure it is installed with Node.js."
        exit
    } else {
        Write-Host "npm is installed."
    }
}

function Check-And-Install-Python {
    Write-Host "Checking for Python 3..."
    $python = Get-Command "python3" -ErrorAction SilentlyContinue
    if ($null -eq $python) {
        Write-Host "Python 3 is not installed. Installing Python 3..."
        Start-Process "brew" -ArgumentList "install python" -Wait
        python3 -m pip install --upgrade pip
    } else {
        Write-Host "Python 3 is installed."
    }
}

function Check-And-Install-MySQL {
    Write-Host "Checking for MySQL..."
    $mysql = Get-Command "mysql" -ErrorAction SilentlyContinue
    if ($null -eq $mysql) {
        Write-Host "MySQL is not installed. Installing MySQL..."
        Start-Process "brew" -ArgumentList "install mysql" -Wait
        Start-Process "brew" -ArgumentList "services start mysql" -Wait
        Write-Host "MySQL has been installed and started."
    } else {
        Write-Host "MySQL is installed."
    }
}

function Setup-VirtualEnvironment {
    Write-Host "Setting up Python virtual environment and installing dependencies..."
    python3 -m venv "$env:USERPROFILE\tax_prep_venv"
    & "$env:USERPROFILE\tax_prep_venv\Scripts\Activate.ps1"
    python3 -m pip install mysql-connector-python
    npm install crypto
}

function Run-Database-Init-Script {
    $config_path = "$env:USERPROFILE\config.json"

    # Check if config file already exists and remove it
    if (Test-Path $config_path) {
        Write-Host "Removing existing config file..."
        Remove-Item $config_path
    }

    Write-Host "Please enter a MySQL username (e.g., 'Jacob') to use:"
    $mysql_username = Read-Host
    Write-Host "Please enter a MySQL password to use:"
    $mysql_password = Read-Host -AsSecureString
    $mysql_password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($mysql_password))

    Write-Host "Encrypting and storing credentials..."
    $script = @"
const crypto = require('crypto');
const fs = require('fs');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv(algorithm, key, iv);
let crypted = cipher.update('$mysql_username:$mysql_password', 'utf8', 'hex');
crypted += cipher.final('hex');
fs.writeFileSync('$config_path', JSON.stringify({ key: key.toString('hex'), iv: iv.toString('hex'), encrypted: crypted }));
"@
    node -e $script

    Write-Host "Downloading and running the database initialization script..."
    & "$env:USERPROFILE\tax_prep_venv\Scripts\Activate.ps1"
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/ethanreddick/tax-prep-tracker/main/init_db.py" -OutFile "$env:USERPROFILE\init_db.py"
    python3 "$env:USERPROFILE\init_db.py" $mysql_username $mysql_password
}

function Main {
    Check-And-Install-Node
    Check-And-Install-Python
    Check-And-Install-MySQL
    Setup-VirtualEnvironment
    Run-Database-Init-Script
}

Main
