# PowerShell script to verify presence of dependencies and set up the database

function Check-AndInstallNode {
    Write-Host "Checking for Node.js..."
    if (-Not (Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Host "Node.js is not installed. Installing Node.js..."

        # Determine system architecture
        $arch = if ([System.Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }

        # Download and install Node.js
        $nodeInstaller = "https://nodejs.org/dist/v14.17.0/node-v14.17.0-$arch.msi"
        $installerPath = "$env:TEMP\nodejs.msi"
        Invoke-WebRequest -Uri $nodeInstaller -OutFile $installerPath
        Start-Process msiexec.exe -ArgumentList "/i", $installerPath, "/quiet", "/norestart" -Wait

        if (-Not (Get-Command node -ErrorAction SilentlyContinue)) {
            Write-Host "Failed to install Node.js. Please install it manually from https://nodejs.org/"
            exit 1
        }
    }
    Write-Host "Node.js is installed."

    Write-Host "Checking for npm..."
    if (-Not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Host "npm is not installed. Please ensure it is installed with Node.js."
        exit 1
    }
    Write-Host "npm is installed."
}

function Check-AndInstallPdfkit {
    Write-Host "Checking for pdfkit..."
    if (-Not (npm list pdfkit -g -depth=0 | Select-String -Pattern "pdfkit")) {
        Write-Host "pdfkit is not installed. Installing pdfkit..."
        npm install -g pdfkit
    }
    Write-Host "pdfkit is installed."
}

function Check-AndInstallPython {
    Write-Host "Checking for Python 3..."
    if (-Not (Get-Command python -ErrorAction SilentlyContinue)) {
        Write-Host "Python 3 is not installed. Installing Python 3..."
        $pythonInstaller = "https://www.python.org/ftp/python/3.9.5/python-3.9.5-amd64.exe"
        $installerPath = "$env:TEMP\python.exe"
        Invoke-WebRequest -Uri $pythonInstaller -OutFile $installerPath
        Start-Process -FilePath $installerPath -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait

        if (-Not (Get-Command python -ErrorAction SilentlyContinue)) {
            Write-Host "Failed to install Python 3. Please install it manually from https://www.python.org/"
            exit 1
        }
    }
    Write-Host "Python 3 is installed."

    Write-Host "Updating pip..."
    python -m pip install --upgrade pip
}

function Check-AndInstallMySQL {
    Write-Host "Checking for MySQL..."
    if (-Not (Get-Command mysql -ErrorAction SilentlyContinue)) {
        Write-Host "MySQL is not installed. Installing MySQL..."
        $mysqlInstaller = "https://dev.mysql.com/get/Downloads/MySQLInstaller/mysql-installer-web-community-8.0.23.0.msi"
        $installerPath = "$env:TEMP\mysql.msi"
        Invoke-WebRequest -Uri $mysqlInstaller -OutFile $installerPath
        Start-Process msiexec.exe -ArgumentList "/i", $installerPath, "/quiet", "/norestart" -Wait

        if (-Not (Get-Command mysql -ErrorAction SilentlyContinue)) {
            Write-Host "Failed to install MySQL. Please install it manually from https://dev.mysql.com/downloads/installer/"
            exit 1
        }
    }
    Write-Host "MySQL is installed."
}

function Setup-VirtualEnvironment {
    Write-Host "Setting up Python virtual environment and installing dependencies..."
    python -m venv "$env:USERPROFILE\tax_prep_venv"
    & "$env:USERPROFILE\tax_prep_venv\Scripts\Activate.ps1"
    python -m pip install mysql-connector-python
    npm install -g crypto
}

function Run-DatabaseInitScript {
    $configPath = "config.json"

    # Check if config file already exists and remove it
    if (Test-Path $configPath) {
        Write-Host "Removing existing config file..."
        Remove-Item $configPath
    }

    $mysqlUsername = Read-Host "Please enter a MySQL username (e.g., 'Jacob') to use"
    $mysqlPassword = Read-Host "Please enter a MySQL password to use" -AsSecureString | ConvertFrom-SecureString

    Write-Host "Encrypting and storing credentials..."
    $cryptoScript = @"
const crypto = require('crypto');
const fs = require('fs');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const cipher = crypto.createCipheriv(algorithm, key, iv);
let crypted = cipher.update('$mysqlUsername:$mysqlPassword', 'utf8', 'hex');
crypted += cipher.final('hex');
fs.writeFileSync('$configPath', JSON.stringify({ key: key.toString('hex'), iv: iv.toString('hex'), encrypted: crypted }));
"@
    echo $cryptoScript | node

    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to encrypt and store credentials."
        exit 1
    }

    Write-Host "Downloading and running the database initialization script..."
    & "$env:USERPROFILE\tax_prep_venv\Scripts\Activate.ps1"
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/ethanreddick/tax-prep-tracker/main/init_db.py" -OutFile "init_db.py"
    python init_db.py $mysqlUsername $mysqlPassword

    Write-Host "Configuring MySQL authentication plugin..."
    mysql -u $mysqlUsername -p"$mysqlPassword" -e "ALTER USER '$mysqlUsername'@'localhost' IDENTIFIED WITH mysql_native_password BY '$mysqlPassword'; FLUSH PRIVILEGES;"
}

# Main function to perform checks
function Main {
    Check-AndInstallNode
    Check-AndInstallPdfkit
    Check-AndInstallPython
    Check-AndInstallMySQL
    Setup-VirtualEnvironment
    Run-DatabaseInitScript
}

# Call the main function
Main
