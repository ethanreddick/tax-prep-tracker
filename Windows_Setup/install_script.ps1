# Function to check if running as Administrator
function Test-IsAdministrator {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Relaunch script as Administrator if not already running as Administrator
if (-not (Test-IsAdministrator)) {
    Write-Host "Script is not running as Administrator. Restarting with elevated privileges..."
    Start-Process -FilePath "powershell.exe" -ArgumentList "-ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Start-Sleep -Seconds 5  # Give some time for the script to restart

# Log file path
$logPath = "$env:TEMP\install_script.log"

# Function to log messages to the log file
function Log-Message {
    param (
        [string]$message,
        [bool]$exitOnError = $false
    )
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp - $message" | Out-File -FilePath $logPath -Append
    Write-Host $message
    if ($exitOnError) {
        exit 1
    }
}

Log-Message "Script started."

# Read MySQL credentials from the INI file
$credsPath = "$env:USERPROFILE\Downloads\mysql_creds.ini"

if (Test-Path $credsPath) {
    $username = (Get-Content $credsPath | Select-String -Pattern 'Username').Line.Split('=')[1].Trim()
    $password = (Get-Content $credsPath | Select-String -Pattern 'Password').Line.Split('=')[1].Trim()
} else {
    # Prompt user for credentials if the INI file does not exist
    $username = Read-Host "Enter MySQL username"

    while ($true) {
        $password = Read-Host "Enter MySQL password" -AsSecureString
        $confirmPassword = Read-Host "Confirm MySQL password" -AsSecureString
        $password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
        $confirmPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($confirmPassword))

        if ($password -eq $confirmPassword) {
            break
        } else {
            Write-Host "Passwords do not match. Please try again."
        }
    }
}

Log-Message "MySQL credentials obtained."

# Directory for storing config.json
$configDir = "$env:APPDATA\TaxPrepTracker"
if (-Not (Test-Path $configDir)) {
    New-Item -Path $configDir -ItemType Directory -Force
}
$configPath = "$configDir\config.json"

# Delete existing config.json if it exists
if (Test-Path $configPath) {
    Remove-Item -Path $configPath -Force
    Log-Message "Existing config.json file deleted."
}

# Encrypt MySQL credentials and write to config.json
function Encrypt-Credentials {
    param (
        [string]$data,
        [string]$configPath
    )

    # Generate key and IV
    $key = [System.Security.Cryptography.Aes]::Create().Key
    $iv = [System.Security.Cryptography.Aes]::Create().IV

    # Create AES cipher
    $aes = [System.Security.Cryptography.Aes]::Create()
    $aes.Key = $key
    $aes.IV = $iv
    $encryptor = $aes.CreateEncryptor()

    # Convert data to bytes and encrypt
    $dataBytes = [System.Text.Encoding]::UTF8.GetBytes($data)
    $encryptedBytes = $encryptor.TransformFinalBlock($dataBytes, 0, $dataBytes.Length)
    $encryptedText = [BitConverter]::ToString($encryptedBytes) -replace '-', ''

    # Save key, IV, and encrypted data to config.json
    $config = @{
        key = [BitConverter]::ToString($key) -replace '-', ''
        iv = [BitConverter]::ToString($iv) -replace '-', ''
        encrypted = $encryptedText
    }
    $config | ConvertTo-Json | Set-Content -Path $configPath

    Log-Message "Encrypted credentials written to config.json"
}

# Encrypt and store credentials
$credentials = "$username`:$password"
Encrypt-Credentials -data $credentials -configPath $configPath

Log-Message "Credentials encryption completed."

# PowerShell script to verify presence of dependencies and set up the database

function Check-AndInstallNode {
    Log-Message "Checking for Node.js..."
    if (-Not (Get-Command node -ErrorAction SilentlyContinue)) {
        Log-Message "Node.js is not installed. Installing Node.js..."

        # Determine system architecture
        $arch = if ([System.Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }

        # Download and install Node.js
        $nodeInstaller = "https://nodejs.org/dist/v14.17.0/node-v14.17.0-$arch.msi"
        $installerPath = "$PWD\nodejs.msi"
        try {
            Invoke-WebRequest -Uri $nodeInstaller -OutFile $installerPath -ErrorAction Stop
        } catch {
            Log-Message "Failed to download Node.js installer. Error: $_" $true
        }
        Log-Message "Node.js installer downloaded."

        try {
            Start-Process msiexec.exe -ArgumentList "/i", $installerPath, "/quiet", "/norestart" -Wait -ErrorAction Stop
        } catch {
            Log-Message "Failed to install Node.js. Error: $_" $true
        }

        if (-Not (Get-Command node -ErrorAction SilentlyContinue)) {
            Log-Message "Failed to install Node.js. Please install it manually from https://nodejs.org/" $true
        }
    }
    Log-Message "Node.js is installed."

    Log-Message "Checking for npm..."
    if (-Not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Log-Message "npm is not installed. Please ensure it is installed with Node.js."
        exit 1
    }
    Log-Message "npm is installed."
}

function Check-AndInstallPdfkit {
    Log-Message "Checking for pdfkit..."
    if (-Not (npm list pdfkit -g -depth=0 | Select-String -Pattern "pdfkit")) {
        Log-Message "pdfkit is not installed. Installing pdfkit..."
        npm install -g pdfkit
    }
    Log-Message "pdfkit is installed."
}

function Check-AndInstallElectronUpdater {
    Log-Message "Checking for electron-updater..."
    if (-Not (npm list electron-updater -g -depth=0 | Select-String -Pattern "electron-updater")) {
        Log-Message "electron-updater is not installed. Installing electron-updater..."
        npm install -g electron-updater
    }
    Log-Message "electron-updater is installed."
}

function Check-AndInstallNodeModules {
    Log-Message "Checking for required Node.js modules..."
    $modules = @("mysql2", "electron-updater", "pdfkit")

    foreach ($module in $modules) {
        Log-Message "Checking for module $module..."
        if (-Not (npm list $module -g -depth=0 | Select-String -Pattern $module)) {
            Log-Message "Module $module is not installed. Installing $module..."
            npm install -g $module
        }
        Log-Message "Module $module is installed."
    }
}

function Check-AndInstallPython {
    Log-Message "Checking for Python 3..."
    if (-Not (Get-Command python -ErrorAction SilentlyContinue)) {
        Log-Message "Python 3 is not installed. Installing Python 3..."
        $pythonInstaller = "https://www.python.org/ftp/python/3.9.5/python-3.9.5-amd64.exe"
        $installerPath = "$PWD\python.exe"
        try {
            Invoke-WebRequest -Uri $pythonInstaller -OutFile $installerPath -ErrorAction Stop
        } catch {
            Log-Message "Failed to download Python installer. Error: $_" $true
        }
        Log-Message "Python installer downloaded."

        try {
            Start-Process -FilePath $installerPath -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait -ErrorAction Stop
        } catch {
            Log-Message "Failed to install Python. Error: $_" $true
        }

        if (-Not (Get-Command python -ErrorAction SilentlyContinue)) {
            Log-Message "Failed to install Python 3. Please install it manually from https://www.python.org/" $true
        }
    }
    Log-Message "Python 3 is installed."

    Log-Message "Updating pip..."
    python -m pip install --upgrade pip
}

function Check-AndInstallMySQL {
    Log-Message "Checking for MySQL..."
    if (-Not (Get-Command mysql -ErrorAction SilentlyContinue)) {
        Log-Message "MySQL is not installed. Installing MySQL..."
        $mysqlServerInstaller = "https://dev.mysql.com/get/Downloads/MySQL-8.4/mysql-8.4.0-winx64.msi"
        $installerPath = "$PWD\mysql_server.msi"

        if (-Not (Test-Path $installerPath)) {
            Log-Message "Downloading MySQL Server installer..."
            try {
                Invoke-WebRequest -Uri $mysqlServerInstaller -OutFile $installerPath -ErrorAction Stop
            } catch {
                Log-Message "Failed to download MySQL installer. Error: $_" $true
            }
            Log-Message "Downloaded MySQL Server installer to $installerPath"
        } else {
            Log-Message "MySQL Server installer already exists at $installerPath. Skipping download."
        }

        # Run the installer in GUI mode
        try {
            Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`"" -Wait -ErrorAction Stop
        } catch {
            Log-Message "Failed to install MySQL. Error: $_" $true
        }

        # Check if installation succeeded
        if (-Not (Test-Path "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe")) {
            Log-Message "MySQL installation failed." $true
        }
    }
    Log-Message "MySQL is installed."

    # Add a pause to wait for user to complete MySQL installation
    Write-Host "MySQL installation completed. Please complete the MySQL setup and then press ENTER to continue..."
    Read-Host

    Log-Message "Configuring MySQL Server..."

    # Ensure the data directory is empty before initialization
    $dataDir = "C:\Program Files\MySQL\MySQL Server 8.4\data"
    if (Test-Path $dataDir) {
        Remove-Item -Recurse -Force $dataDir
    }

    & "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe" --initialize-insecure --console

    Log-Message "Starting MySQL Service..."

    # Manually set up the MySQL service using sc.exe
    $serviceName = "MySQL84"
    $binPath = "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysqld.exe"
    $defaultFile = "C:\Program Files\MySQL\MySQL Server 8.4\my.ini"
    sc.exe create $serviceName binPath= "\"$binPath\" --defaults-file=\"$defaultFile\" $serviceName" DisplayName= "MySQL84" start= auto > $null 2>&1

    Start-Sleep -Seconds 5 # Wait a few seconds before attempting to start the service

    sc.exe start $serviceName > $null 2>&1

    # Verify if the service started
    $service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
    if ($service -eq $null -or $service.Status -ne 'Running') {
        Log-Message "Could not start the MySQL service. Checking event logs for MySQL errors..."
        Get-EventLog -LogName Application -Source MySQL* | Select-Object -First 10 | Out-File -FilePath "$env:TEMP\mysql_event_logs.txt" -Append
        Log-Message "Event logs captured to $env:TEMP\mysql_event_logs.txt"
        exit 1
    }
    Log-Message "Started MySQL service: MySQL84"

    Log-Message "Installing mysql2..."
    npm install mysql2 --save
    Log-Message "mysql2 installed."
}

function Setup-VirtualEnvironment {
    Log-Message "Setting up Python virtual environment and installing dependencies..."
    python -m venv "$env:USERPROFILE\tax_prep_venv"
    & "$env:USERPROFILE\tax_prep_venv\Scripts\Activate.ps1"
    pip install mysql-connector-python
    Log-Message "Virtual environment and dependencies are set up."
}

function Run-DatabaseInitScript {
    Log-Message "Running database initialization script..."

    # Ensure the resources directory exists
    $resourcesDir = "$env:USERPROFILE\tax_prep_venv\resources"
    if (-Not (Test-Path $resourcesDir)) {
        New-Item -ItemType Directory -Path $resourcesDir
    }

    # Download the init_db.py script
    Invoke-WebRequest -Uri "https://raw.githubusercontent.com/ethanreddick/tax-prep-tracker/main/init_db.py" -OutFile "$resourcesDir\init_db.py"

    # Verify that the Python script was downloaded
    if (Test-Path "$resourcesDir\init_db.py") {
        Log-Message "init_db.py script downloaded successfully."
    } else {
        Log-Message "init_db.py script download failed."
        exit 1
    }

    # Creating a temporary file for credentials
    $credsFile = "$resourcesDir\creds.json"
    $creds = @{
        "username" = $username
        "password" = $password
    }
    $creds | ConvertTo-Json | Set-Content -Path $credsFile

    # Running the database initialization script
    $pythonExe = "$env:USERPROFILE\tax_prep_venv\Scripts\python.exe"
    $initDbScript = "$resourcesDir\init_db.py"
    
    # Use an array to pass arguments to the Python script
    $args = @("--creds", "$credsFile")

    Log-Message "Executing the Python script..."
    Log-Message "Command: $pythonExe $initDbScript $args"

    # Activate the virtual environment and run the script
    & "$env:USERPROFILE\tax_prep_venv\Scripts\Activate.ps1"
    & $pythonExe $initDbScript @args *>&1 | Tee-Object -FilePath "$env:TEMP\python_script_output.log"

    if ($LASTEXITCODE -ne 0) {
        Log-Message "Python script execution failed with exit code $LASTEXITCODE."
    } else {
        Log-Message "Python script executed successfully."
    }
}

# Main script execution
Check-AndInstallNode
Check-AndInstallPdfkit
Check-AndInstallElectronUpdater
Check-AndInstallPython
Check-AndInstallMySQL
Check-AndInstallNodeModules
Setup-VirtualEnvironment
Run-DatabaseInitScript

Log-Message "Setup complete. Press Enter to exit..."
Read-Host
