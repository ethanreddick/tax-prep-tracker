// Function to update the main content area
function updateMainContent(content) {
  document.getElementById("mainContent").innerHTML = content;
}

// Add Client Form
const addClientFormHTML = `
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
        <p id="addClientMessage" style="color: darkgreen;"></p>
    </form>
`;

// Update Client Form
const updateClientFormHTML = `
    <form id="updateClientForm">
        <h2>Update Client</h2>
        <select id="clientSelect" onchange="loadClientData(this.value)">
            <option value="" disabled selected>Select Client</option>
            <!-- Options will be loaded here -->
        </select>
        <div class="form-group">
            <label for="updateName">Name:</label>
            <input type="text" id="updateName" name="name">
        </div>
        <div class="form-group">
            <label for="updateSSN">SSN:</label>
            <input type="text" id="updateSSN" name="ssn">
        </div>
        <div class="form-group">
            <label for="updateAddress">Address:</label>
            <input type="text" id="updateAddress" name="address">
        </div>
        <div class="form-group">
            <label for="updateBank">Bank:</label>
            <input type="text" id="updateBank" name="bank">
        </div>
        <button type="button" class="action-btn" onclick="submitUpdateClient()">Save Changes</button>
        <p id="updateClientMessage" style="color: darkgreen;"></p>
    </form>
`;

// Remove Client Form
const removeClientFormHTML = `
    <form id="removeClientForm">
        <h2>Remove Client</h2>
        <select id="removeClientSelect">
            <!-- Options will be loaded here -->
        </select>
        <button type="button" class="action-btn" onclick="submitRemoveClient()">Remove Client</button>
        <p id="removeClientMessage" style="color: darkgreen;"></p>
    </form>
`;

// Event listeners for the buttons
function addEventListeners() {
  document
    .getElementById("clients-box")
    .querySelector("button:nth-child(2)")
    .addEventListener("click", () => {
      updateMainContent(addClientFormHTML);
    });

  document
    .getElementById("clients-box")
    .querySelector("button:nth-child(3)")
    .addEventListener("click", () => {
      updateMainContent(updateClientFormHTML);
      loadClients("clientSelect");
    });

  document
    .getElementById("clients-box")
    .querySelector("button:nth-child(4)")
    .addEventListener("click", () => {
      updateMainContent(removeClientFormHTML);
      loadClients("removeClientSelect");
    });

  document
    .getElementById("accounts-box")
    .querySelector("button:nth-child(2)")
    .addEventListener("click", addAccount);
  document
    .getElementById("accounts-box")
    .querySelector("button:nth-child(3)")
    .addEventListener("click", updateAccount);
  document
    .getElementById("accounts-box")
    .querySelector("button:nth-child(4)")
    .addEventListener("click", removeAccount);

  document
    .getElementById("transactions-box")
    .querySelector("button:nth-child(2)")
    .addEventListener("click", addTransaction);
  document
    .getElementById("transactions-box")
    .querySelector("button:nth-child(3)")
    .addEventListener("click", updateTransaction);
  document
    .getElementById("transactions-box")
    .querySelector("button:nth-child(4)")
    .addEventListener("click", removeTransaction);

  document
    .getElementById("reports-box")
    .querySelector("button:nth-child(2)")
    .addEventListener("click", showBalanceSheet);
  document
    .getElementById("reports-box")
    .querySelector("button:nth-child(3)")
    .addEventListener("click", showIncomeStatement);
  document
    .getElementById("reports-box")
    .querySelector("button:nth-child(4)")
    .addEventListener("click", showTrialBalance);
}

// Add a new client to the database
function submitAddClient() {
  let client = {
    name: document.getElementById("name").value,
    ssn: document.getElementById("ssn").value,
    address: document.getElementById("address").value,
    bank: document.getElementById("bank").value,
  };

  window.electronAPI
    .addClient(client)
    .then((response) => {
      document.getElementById("addClientMessage").innerText =
        `${client.name} was successfully added to the database.`;
      document.querySelector("#addClientForm button").innerText =
        "Add Another Client";
      document.querySelector("#addClientForm button").onclick =
        resetAddClientForm;
    })
    .catch((error) => {
      document.getElementById("addClientMessage").innerText =
        "There was an error adding the client to the database, click here for details.";
      document.getElementById("addClientMessage").style.color = "red";
      document.getElementById("addClientMessage").onclick = () =>
        alert(error.message);
    });
}

// Reset the add client form
function resetAddClientForm() {
  document.getElementById("name").value = "";
  document.getElementById("ssn").value = "";
  document.getElementById("address").value = "";
  document.getElementById("bank").value = "";
  document.querySelector("#addClientForm button").innerText = "Add Client";
  document.querySelector("#addClientForm button").onclick = submitAddClient;
  document.getElementById("addClientMessage").innerText = "";
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

  window.electronAPI
    .updateClient(client)
    .then((response) => {
      document.getElementById("updateClientMessage").innerText =
        `${client.name} was successfully updated in the database.`;
    })
    .catch((error) => {
      document.getElementById("updateClientMessage").innerText =
        "There was an error updating the client in the database, click here for details.";
      document.getElementById("updateClientMessage").style.color = "red";
      document.getElementById("updateClientMessage").onclick = () =>
        alert(error.message);
    });
}

// Remove a client from the database
function submitRemoveClient() {
  let clientId = document.getElementById("removeClientSelect").value;

  window.electronAPI
    .removeClient(clientId)
    .then((response) => {
      document.getElementById("removeClientMessage").innerText =
        `Client was successfully removed from the database.`;
    })
    .catch((error) => {
      document.getElementById("removeClientMessage").innerText =
        "There was an error removing the client from the database, click here for details.";
      document.getElementById("removeClientMessage").style.color = "red";
      document.getElementById("removeClientMessage").onclick = () =>
        alert(error.message);
    });
}

// Load clients into a select element
function loadClients(selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML =
    "<option value='' disabled selected>Select Client</option>";
  // Fetch clients from the database
  window.electronAPI.fetchClients().then((clients) => {
    clients.forEach((client) => {
      let option = new Option(client.name, client.client_id);
      select.add(option);
    });
  });
}

// Load the selected client's data into the form fields
function loadClientData(clientId) {
  if (!clientId) return;
  window.electronAPI.fetchClient(clientId).then((client) => {
    document.getElementById("updateName").value = client.name;
    document.getElementById("updateSSN").value = client.ssn;
    document.getElementById("updateAddress").value = client.address;
    document.getElementById("updateBank").value = client.bank;
  });
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

// Ensure that the DOM is fully loaded before adding event listeners
document.addEventListener("DOMContentLoaded", addEventListeners);
