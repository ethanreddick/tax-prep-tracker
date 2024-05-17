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
        <select id="clientSelect">
            <option value="" disabled selected>Select Client</option>
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
            <option value="" disabled selected>Select Client</option>
        </select>
        <button type="button" class="action-btn" onclick="submitRemoveClient()">Remove Client</button>
        <p id="removeClientMessage" style="color: darkgreen;"></p>
    </form>
`;

// Add Account Form
const addAccountFormHTML = `
    <form id="addAccountForm">
        <h2>Add Account</h2>
        <div class="form-group">
            <label for="description">Description:</label>
            <input type="text" id="description" name="description">
        </div>
        <div class="form-group">
            <label for="accountClass">Class:</label>
            <select id="accountClass" name="accountClass">
                <option value="" disabled selected>Select Class</option>
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Revenue">Revenue</option>
                <option value="Expense">Expense</option>
            </select>
        </div>
        <div class="form-group">
            <label for="statementType">Statement:</label>
            <select id="statementType" name="statementType">
                <option value="" disabled selected>Select Statement</option>
                <option value="Balance Sheet">Balance Sheet</option>
                <option value="Income Statement">Income Statement</option>
                <option value="Cash Flow Statement">Cash Flow Statement</option>
            </select>
        </div>
        <div class="form-group">
            <label for="accountBalance">Balance:</label>
            <input type="number" id="accountBalance" name="accountBalance" step="0.01">
        </div>
        <button type="button" class="action-btn" onclick="submitAddAccount()">Add Account</button>
        <p id="addAccountMessage" style="color: darkgreen;"></p>
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
    .addEventListener("click", () => {
      updateMainContent(addAccountFormHTML);
    });
  // Update accounts and remove accounts listeners can be added here similarly

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

// Ensure that the DOM is fully loaded before adding event listeners
document.addEventListener("DOMContentLoaded", addEventListeners);

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
      const messageElement = document.getElementById("addClientMessage");
      if (messageElement) {
        messageElement.innerText = `${client.name} was successfully added to the database.`;
      }

      // Change button text to "Add Another Client"
      const addButton = document.querySelector("#addClientForm button");
      if (addButton) {
        addButton.innerText = "Add Another Client";
        addButton.onclick = clearFields; // Set onclick to clear fields
      }
    })
    .catch((error) => {
      const messageElement = document.getElementById("addClientMessage");
      if (messageElement) {
        messageElement.innerText =
          "There was an error adding the client to the database, click here for details.";
        messageElement.style.color = "red";
        messageElement.onclick = () => alert(error.message);
      }
    });
}

function clearFields() {
  // Clear input fields
  document.getElementById("name").value = "";
  document.getElementById("ssn").value = "";
  document.getElementById("address").value = "";
  document.getElementById("bank").value = "";

  // Change button text back to "Add Client"
  const addButton = document.querySelector("#addClientForm button");
  if (addButton) {
    addButton.innerText = "Add Client";
    addButton.onclick = submitAddClient; // Reset onclick to submitAddClient
  }

  // Clear the message element
  const messageElement = document.getElementById("addClientMessage");
  if (messageElement) {
    messageElement.innerText = "";
    messageElement.style.color = "darkgreen"; // Reset message color
  }
}

// Load clients into a select element
function loadClients(selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = ""; // Clear existing options

  // Add a placeholder option
  let placeholderOption = new Option("Select Client", "", true, true);
  placeholderOption.disabled = true;
  select.add(placeholderOption);

  // Fetch clients from the database
  window.electronAPI.fetchClients().then((clients) => {
    clients.forEach((client) => {
      let option = new Option(client.name, client.client_id);
      select.add(option);
    });

    // Add an event listener to load client data when a new client is selected
    select.addEventListener("change", (event) => {
      const clientId = event.target.value;
      loadClientData(clientId);
    });
  });
}

// Load the selected client's data into the form fields
function loadClientData(clientId) {
  window.electronAPI.fetchClient(clientId).then((client) => {
    document.getElementById("updateName").value = client.name;
    document.getElementById("updateSSN").value = client.ssn;
    document.getElementById("updateAddress").value = client.address;
    document.getElementById("updateBank").value = client.bank;
  });
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
  const clientSelect = document.getElementById("removeClientSelect");
  const clientId = clientSelect.value;
  const clientName = clientSelect.options[clientSelect.selectedIndex].text;

  window.electronAPI
    .removeClient(clientId)
    .then((response) => {
      const messageElement = document.getElementById("removeClientMessage");
      if (messageElement) {
        messageElement.innerText = `${clientName} was successfully removed from the database.`;
      }

      // Refresh the client list after removal
      loadClients("removeClientSelect");
    })
    .catch((error) => {
      const messageElement = document.getElementById("removeClientMessage");
      if (messageElement) {
        messageElement.innerText =
          "There was an error removing the client from the database, click here for details.";
        messageElement.style.color = "red";
        messageElement.onclick = () => alert(error.message);
      }
    });
}

// Manage Account
function submitAddAccount() {
  let account = {
    description: document.getElementById("description").value,
    accountClass: document.getElementById("accountClass").value,
    statementType: document.getElementById("statementType").value,
    accountBalance: parseFloat(document.getElementById("accountBalance").value),
  };

  window.electronAPI
    .addAccount(account)
    .then((response) => {
      const messageElement = document.getElementById("addAccountMessage");
      if (messageElement) {
        messageElement.innerText = `${account.description} was successfully added to the database.`;
      }

      // Change button text to "Add Another Account"
      const addButton = document.querySelector("#addAccountForm button");
      if (addButton) {
        addButton.innerText = "Add Another Account";
        addButton.onclick = clearAccountFields; // Set onclick to clear fields
      }
    })
    .catch((error) => {
      const messageElement = document.getElementById("addAccountMessage");
      if (messageElement) {
        messageElement.innerText =
          "There was an error adding the account to the database, click here for details.";
        messageElement.style.color = "red";
        messageElement.onclick = () => alert(error.message);
      }
    });
}

function clearAccountFields() {
  // Clear input fields
  document.getElementById("description").value = "";
  document.getElementById("accountClass").value = "";
  document.getElementById("statementType").value = "";
  document.getElementById("accountBalance").value = "";

  // Change button text back to "Add Account"
  const addButton = document.querySelector("#addAccountForm button");
  if (addButton) {
    addButton.innerText = "Add Account";
    addButton.onclick = submitAddAccount; // Reset onclick to submitAddAccount
  }

  // Clear the message element
  const messageElement = document.getElementById("addAccountMessage");
  if (messageElement) {
    messageElement.innerText = "";
    messageElement.style.color = "darkgreen"; // Reset message color
  }
}

function addAccount() {
  updateMainContent(addAccountFormHTML);
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
