// Manage Client
// Show the add client form
function addClient() {
  const formHtml = `
        <form id="addClientForm">
            <h2>Add Client</h2>
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name">
            </div>
            <div class="form-group">
                <label for="ssn">SSN:</label>
                <input type="text" id="ssn" name="ssn">
            </div>
            <div class="form-group">
                <label for="address">Address:</label>
                <input type="text" id="address" name="address">
            </div>
            <div class="form-group">
                <label for="bank">Bank:</label>
                <input type="text" id="bank" name="bank">
            </div>
            <button type="button" class="action-btn" onclick="submitAddClient()">Add Client</button>
            <div id="success-message"></div>
            <div id="error-message" onclick="showErrorDetails()"></div>
        </form>`;
  document.getElementById("mainContent").innerHTML = formHtml;
}

// Show the update client form and load clients
function updateClient() {
  const formHtml = `
        <div id="updateClientForm">
            <h2>Update Client</h2>
            <div class="form-group">
                <label for="clientSelect">Select Client:</label>
                <select id="clientSelect" onchange="loadClientData()"></select>
            </div>
            <div class="form-group">
                <label for="updateName">Name:</label>
                <input type="text" id="updateName">
            </div>
            <div class="form-group">
                <label for="updateSSN">SSN:</label>
                <input type="text" id="updateSSN">
            </div>
            <div class="form-group">
                <label for="updateAddress">Address:</label>
                <input type="text" id="updateAddress">
            </div>
            <div class="form-group">
                <label for="updateBank">Bank:</label>
                <input type="text" id="updateBank">
            </div>
            <button type="button" class="action-btn" onclick="submitUpdateClient()">Save Changes</button>
        </div>`;
  document.getElementById("mainContent").innerHTML = formHtml;
  loadClients("clientSelect");
}

// Show the remove client form and load clients
function removeClient() {
  const formHtml = `
        <div id="removeClientForm">
            <h2>Remove Client</h2>
            <div class="form-group">
                <label for="removeClientSelect">Select Client:</label>
                <select id="removeClientSelect"></select>
            </div>
            <button type="button" class="action-btn" onclick="submitRemoveClient()">Remove Client</button>
        </div>`;
  document.getElementById("mainContent").innerHTML = formHtml;
  loadClients("removeClientSelect");
}

// Load clients into a select element
function loadClients(selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = ""; // Clear existing options
  // Fetch clients from the database
  fetchClients().then((clients) => {
    clients.forEach((client) => {
      let option = new Option(client.name, client.id);
      select.add(option);
    });
  });
}

// Example fetchClients function
async function fetchClients() {
  // This should actually call your main process to fetch from DB
  return [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Doe" },
  ];
}

// Add a new client to the database
function submitAddClient() {
  let client = {
    name: document.getElementById("name").value,
    ssn: document.getElementById("ssn").value,
    address: document.getElementById("address").value,
    bank: document.getElementById("bank").value,
  };

  // Call your main process to add the client to the database
  // Assuming this is an async function, handle the response
  addClientToDatabase(client)
    .then((response) => {
      document.getElementById("success-message").textContent =
        `${client.name} was successfully added to the database.`;
      document.getElementById("success-message").style.display = "block";
      document.getElementById("error-message").style.display = "none";
    })
    .catch((error) => {
      document.getElementById("error-message").textContent =
        "There was an error adding the client to the database, click here for details.";
      document.getElementById("error-message").style.display = "block";
      document.getElementById("success-message").style.display = "none";
      // Store error details to show later if needed
      window.lastError = error;
    });
}

// Function to add client to database (stub for demonstration)
async function addClientToDatabase(client) {
  // Replace with actual database call
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (client.name && client.ssn) {
        resolve("Success");
      } else {
        reject("Error: Missing required fields.");
      }
    }, 1000);
  });
}

// Function to show error details
function showErrorDetails() {
  alert(window.lastError || "No error details available.");
}

// Update client details in the database
function submitUpdateClient() {
  let client = {
    id: document.getElementById("clientSelect").value,
    name: document.getElementById("updateName").value,
    ssn: document.getElementById("updateSSN").value,
    address: document.getElementById("updateAddress").value,
    bank: document.getElementById("updateBank").value,
  };
  // Call your main process to update the client in the database
}

// Remove a client from the database
function submitRemoveClient() {
  let clientId = document.getElementById("removeClientSelect").value;
  // Call your main process to remove the client from the database
}

// Manage Account
function addAccount() {
  document.getElementById("mainContent").innerHTML = "<h1>Add Account</h1>";
}

function updateAccount() {
  document.getElementById("mainContent").innerHTML = "<h1>Update Account</h1>";
}

function removeAccount() {
  document.getElementById("mainContent").innerHTML = "<h1>Remove Account</h1>";
}

// Manage Transaction
function addTransaction() {
  document.getElementById("mainContent").innerHTML = "<h1>Add Transaction</h1>";
}

function updateTransaction() {
  document.getElementById("mainContent").innerHTML =
    "<h1>Update Transaction</h1>";
}

function removeTransaction() {
  document.getElementById("mainContent").innerHTML =
    "<h1>Remove Transaction</h1>";
}

function showBalanceSheet() {
  document.getElementById("mainContent").innerHTML = "<h1>Balance Sheet</h1>";
  // Further implementation needed
}

function showIncomeStatement() {
  document.getElementById("mainContent").innerHTML =
    "<h1>Income Statement</h1>";
  // Further implementation needed
}

function showTrialBalance() {
  document.getElementById("mainContent").innerHTML = "<h1>Trial Balance</h1>";
  // Further implementation needed
}
