// Function to update the main content area
function updateMainContent(content) {
  document.getElementById("mainContent").innerHTML = `
    <div class="task-area">
      ${content}
    </div>
  `;
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
        <p id="addClientMessage" style="color: darkgreen; text-align: center;"></p>
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
        <p>This can only be done prior to transactions being made with this client.</p>
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
            <div class="input-wrapper">
                <span class="dollar-sign account-dollar-sign">$</span>
                <input type="number" id="accountBalance" name="accountBalance" step="0.01">
            </div>
        </div>
        <button type="button" class="action-btn" onclick="submitAddAccount()">Add Account</button>
        <p id="addAccountMessage" style="color: darkgreen;"></p>
    </form>
`;

// Update Account Form
const updateAccountFormHTML = `
    <form id="updateAccountForm">
        <h2>Update Account</h2>
        <select id="accountSelect">
            <option value="" selected disabled>Select Account</option>
            <!-- Options will be loaded here -->
        </select>
        <div class="form-group">
            <label for="updateDescription">Description:</label>
            <input type="text" id="updateDescription" name="description">
        </div>
        <div class="form-group">
            <label for="updateClass">Class:</label>
            <select id="updateClass" name="account_class">
                <option value="" selected disabled>Select Class</option>
                <option value="Asset">Asset</option>
                <option value="Liability">Liability</option>
                <option value="Equity">Equity</option>
                <option value="Revenue">Revenue</option>
                <option value="Expense">Expense</option>
            </select>
        </div>
        <div class="form-group">
            <label for="updateStatement">Statement:</label>
            <select id="updateStatement" name="statement_type">
                <option value="" selected disabled>Select Statement</option>
                <option value="Balance Sheet">Balance Sheet</option>
                <option value="Income Statement">Income Statement</option>
                <option value="Cash Flow Statement">Cash Flow Statement</option>
            </select>
        </div>
        <div class="form-group">
            <label for="updateBalance">Balance:</label>
            <div class="input-wrapper">
                <span class="dollar-sign account-dollar-sign">$</span>
                <input type="number" id="updateBalance" name="account_balance" readonly style="background-color: #e0e0e0;">
            </div>
        </div>
        <button type="button" class="action-btn" onclick="submitUpdateAccount()">Update Account</button>
        <p id="updateAccountMessage" style="color: darkgreen;"></p>
    </form>
`;

// Remove Account Form
const removeAccountFormHTML = `
  <form id="removeAccountForm">
    <h2>Remove Account</h2>
    <p>This can only be done prior to transactions being made with this account.</p>
    <select id="removeAccountSelect">
      <option value="" disabled selected>Select Account</option>
    </select>
    <button type="button" class="action-btn" onclick="submitRemoveAccount()">Remove Account</button>
    <p id="removeAccountMessage" style="color: darkgreen;"></p>
  </form>
`;

// Add Transaction Form
const addTransactionFormHTML = `
    <form id="addTransactionForm">
        <h2>Add Transaction</h2>
        <div class="form-group">
            <label for="transactionClient">Client:</label>
            <select id="transactionClient" name="transactionClient">
                <option value="" disabled selected>Select Client</option>
            </select>
        </div>
        <div class="form-group">
            <label for="transactionDescription">Description:</label>
            <input type="text" id="transactionDescription" name="transactionDescription">
        </div>
        <div class="form-group">
            <label for="transactionDate">Date:</label>
            <input type="date" id="transactionDate" name="transactionDate">
        </div>
        <div id="transactionLines">
            <div class="transaction-line">
                <select class="transactionAccount" name="transactionAccount">
                    <option value="" disabled selected>Select Account</option>
                </select>
                <select class="transactionType" name="transactionType">
                    <option value="Debit" selected>Debit</option>
                    <option value="Credit">Credit</option>
                </select>
                <div class="input-wrapper">
                    <span class="dollar-sign transaction-dollar-sign">$</span>
                    <input type="number" class="transactionAmount" name="transactionAmount" placeholder="Amount" step="0.01">
                </div>
            </div>
            <div class="transaction-line">
                <select class="transactionAccount" name="transactionAccount">
                    <option value="" disabled selected>Select Account</option>
                </select>
                <select class="transactionType" name="transactionType">
                    <option value="Debit">Debit</option>
                    <option value="Credit" selected>Credit</option>
                </select>
                <div class="input-wrapper">
                    <span class="dollar-sign transaction-dollar-sign">$</span>
                    <input type="number" class="transactionAmount" name="transactionAmount" placeholder="Amount" step="0.01">
                </div>
            </div>
        </div>
        <button type="button" class="action-btn" onclick="addTransactionLine()">+ Add Account</button>
        <div class="submit-container">
            <button type="button" class="action-btn" onclick="submitAddTransaction()">Submit Transaction</button>
            <p id="netAmount" style="text-align: right;">Net: $0.00</p>
        </div>
        <p id="addTransactionMessage" style="color: darkgreen;"></p>
    </form>
`;

// Manage Transactions Page
const manageTransactionsHTML = `
  <form id="manageTransactionForm">
    <h2>Manage Transactions</h2>
    <div class="search-bar">
      <span class="search-icon">&#128269;</span> <!-- Unicode for spyglass icon -->
      <input type="text" id="searchTransactions" placeholder="Search Transactions">
    </div>
    <div class="transaction-list">
      <div class="transaction-header">
        <span id="transactionDateHeader" class="sortable">Date</span>
        <span id="transactionDescriptionHeader">Description</span>
      </div>
      <div id="transactionItems">
        <!-- Transactions will be loaded here -->
      </div>
    </div>
    <div class="pagination">
      <button id="prevPage" onclick="prevPage()">&#8249;</button>
      <span id="pageInfo">Page 1 of 1</span>
      <button id="nextPage" onclick="nextPage()">&#8250;</button>
    </div>
  </form>
`;

// Add the "Generate Report" page content
const generateReportHTML = `
  <form id="generateReportForm">
    <h2 class="task-title">Generate Report</h2>
    <div class="form-group">
      <label for="reportType">Report Type:</label>
      <select id="reportType">
        <option value="balanceSheet">Balance Sheet</option>
        <option value="incomeStatement">Income Statement</option>
        <option value="trialBalance">Trial Balance</option>
      </select>
    </div>
    <div class="form-group">
      <label for="reportPath">Save to Path:</label>
      <input type="text" id="reportPath" placeholder="Enter file path">
      <button type="button" class="browse-btn" onclick="openDirectoryDialog()">Browse</button>
    </div>
    <button type="button" class="action-btn" onclick="generateReport()">Generate</button>
    <p id="generateReportMessage" style="color: darkgreen;"></p>
  </form>
`;

// Event listener to load Manage Transactions page
function manageTransactions() {
  updateMainContent(manageTransactionsHTML);
  loadTransactions();
  document
    .getElementById("transactionDateHeader")
    .addEventListener("click", sortTransactionsByDate);

  // Add event listener for real-time search
  document
    .getElementById("searchTransactions")
    .addEventListener("input", (event) => {
      filterTransactions(event.target.value);
    });
}

function filterTransactions(query) {
  const filteredTransactions = transactions.filter((transaction) =>
    transaction.description.toLowerCase().includes(query.toLowerCase()),
  );
  displayTransactions(filteredTransactions);
}

let transactions = [];
let currentPage = 1;
const itemsPerPage = 10;

function loadTransactions() {
  window.electronAPI.fetchTransactionDetails().then((data) => {
    console.log("Fetched transactions:", data); // Debug log
    transactions = data;
    displayTransactions();
  });
}

// Utility function to format the date
function formatDate(date, options = {}) {
  const defaultOptions = {
    fullDate: false,
  };

  const { fullDate } = { ...defaultOptions, ...options };
  const optionsConfig = fullDate
    ? { weekday: "long", year: "numeric", month: "long", day: "numeric" }
    : { year: "numeric", month: "short", day: "numeric" };

  return date.toLocaleDateString("en-US", optionsConfig);
}

function createTransactionItem(transaction) {
  const transactionItem = document.createElement("div");
  transactionItem.classList.add("transaction-item");

  const transactionDate = document.createElement("span");
  transactionDate.textContent = formatDate(
    new Date(transaction.transaction_date),
  );

  const transactionDescription = document.createElement("span");
  transactionDescription.textContent = transaction.description;

  const expandArrow = document.createElement("span");
  expandArrow.classList.add("expand-arrow");
  expandArrow.innerHTML = "&#x002B;"; // Downward arrow

  expandArrow.addEventListener("click", () => {
    const transactionDetails = transactionItem.nextElementSibling;
    if (transactionDetails.classList.contains("active")) {
      transactionDetails.classList.remove("active");
      transactionItem.classList.remove("expanded");
      expandArrow.innerHTML = "&#x002B;"; // Downward arrow
    } else {
      transactionDetails.classList.add("active");
      transactionItem.classList.add("expanded");
      expandArrow.innerHTML = "&#x2212;"; // Upward arrow
    }
  });

  transactionItem.appendChild(transactionDate);
  transactionItem.appendChild(transactionDescription);
  transactionItem.appendChild(expandArrow);

  const transactionDetails = document.createElement("div");
  transactionDetails.classList.add("transaction-details");

  const clientName = document.createElement("span");
  clientName.classList.add("client-name");
  clientName.textContent = `Client: ${transaction.client_name}`;
  transactionDetails.appendChild(clientName);

  const accountDetails = document.createElement("div");
  accountDetails.classList.add("account-details");

  transaction.accounts.forEach((account) => {
    const accountDetail = document.createElement("span");
    const amount =
      account.type === "Debit"
        ? `($${account.amount.toFixed(2)})`
        : `$${account.amount.toFixed(2)}`;
    accountDetail.textContent = `${account.description}: ${amount}`;
    accountDetails.appendChild(accountDetail);
  });

  transactionDetails.appendChild(accountDetails);

  const removeButton = document.createElement("button");
  removeButton.classList.add("remove-btn");
  removeButton.textContent = "Delete";
  removeButton.addEventListener("click", () =>
    deleteTransaction(transaction.transaction_id),
  );
  transactionDetails.appendChild(removeButton);

  return { transactionItem, transactionDetails };
}

function displayTransactions(transactionsToRender = transactions) {
  const transactionItems = document.getElementById("transactionItems");
  transactionItems.innerHTML = ""; // Clear existing transactions

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedTransactions = transactionsToRender.slice(start, end);

  paginatedTransactions.forEach((transaction) => {
    const { transactionItem, transactionDetails } =
      createTransactionItem(transaction);
    transactionItems.appendChild(transactionItem);
    transactionItems.appendChild(transactionDetails);
  });

  updatePagination(transactionsToRender);
}

function reloadManageTransactions() {
  manageTransactions();
}

function deleteTransaction(transactionId) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    window.electronAPI.deleteTransaction(transactionId).then((response) => {
      if (response.success) {
        alert("Transaction deleted successfully.");
        reloadManageTransactions(); // Reload the transactions page
      } else {
        alert("Failed to delete transaction: " + response.message);
      }
    });
    reloadManageTransactions();
  } else {
    reloadManageTransactions(); // Reload the transactions page on cancel
  }
}

function updatePagination(transactionsToRender = transactions) {
  const pageInfo = document.getElementById("pageInfo");
  const totalPages = Math.ceil(transactionsToRender.length / itemsPerPage);
  pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;

  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

function prevPage() {
  if (currentPage > 1) {
    currentPage--;
    displayTransactions();
  }
}

function nextPage() {
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    displayTransactions();
  }
}

let sortAscending = true; // Variable to track sorting order

function sortTransactionsByDate() {
  transactions.sort((a, b) => {
    const dateA = new Date(a.transaction_date);
    const dateB = new Date(b.transaction_date);
    return sortAscending ? dateA - dateB : dateB - dateA;
  });
  sortAscending = !sortAscending; // Toggle the sorting order
  displayTransactions();
}

// Add Event Listeners to the buttons
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

  document
    .getElementById("accounts-box")
    .querySelector("button:nth-child(3)")
    .addEventListener("click", () => {
      updateMainContent(updateAccountFormHTML);
      loadAccounts("accountSelect");
    });

  document
    .getElementById("accounts-box")
    .querySelector("button:nth-child(4)")
    .addEventListener("click", () => {
      updateMainContent(removeAccountFormHTML);
      loadAccounts("removeAccountSelect");
    });

  document
    .getElementById("transactions-box")
    .querySelector("button:nth-child(2)")
    .addEventListener("click", () => {
      updateMainContent(addTransactionFormHTML);
      loadClientsForTransaction();
      loadAccountsForTransactionLines();
    });
  document
    .getElementById("transactions-box")
    .querySelector("button:nth-child(3)")
    .addEventListener("click", manageTransactions);
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

// Function to validate client data
function validateClientData(client) {
  const nameRegex = /^[^\d]*$/; // No numbers
  const ssnRegex = /^\d{3}-\d{2}-\d{4}$/; // SSN format ###-##-####
  let errorMessage = "";

  if (!nameRegex.test(client.name)) {
    errorMessage = "Client names should not contain numbers.";
  } else if (!ssnRegex.test(client.ssn)) {
    errorMessage = "Client SSN's should be written in the format ###-##-####.";
  }

  return errorMessage;
}

// Add a new client to the database
function submitAddClient() {
  let client = {
    name: document.getElementById("name").value,
    ssn: document.getElementById("ssn").value,
    address: document.getElementById("address").value,
    bank: document.getElementById("bank").value,
  };

  const validationError = validateClientData(client);
  const messageElement = document.getElementById("addClientMessage");
  if (validationError) {
    messageElement.innerText = validationError;
    messageElement.style.color = "red";
    return;
  }

  window.electronAPI
    .addClient(client)
    .then((response) => {
      messageElement.innerText = `${client.name} was successfully added to the database.`;
      messageElement.style.color = "darkgreen";

      const addButton = document.querySelector("#addClientForm button");
      if (addButton) {
        addButton.innerText = "Add Another Client";
        addButton.onclick = clearFields;
      }
    })
    .catch((error) => {
      messageElement.innerText =
        "There was an error adding the client to the database, click here for details.";
      messageElement.style.color = "red";
      messageElement.onclick = () => alert(error.message);
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

// Function to validate account data
function validateAccountData(account) {
  let errorMessage = "";

  if (isNaN(account.accountBalance)) {
    errorMessage = "Account balances must be a numeric value.";
  }

  return errorMessage;
}

// Function to submit add account form
function submitAddAccount() {
  let account = {
    description: document.getElementById("description").value,
    accountClass: document.getElementById("accountClass").value,
    statementType: document.getElementById("statementType").value,
    accountBalance: parseFloat(document.getElementById("accountBalance").value),
  };

  const validationError = validateAccountData(account);
  const messageElement = document.getElementById("addAccountMessage");
  if (validationError) {
    messageElement.innerText = validationError;
    messageElement.style.color = "red";
    return;
  }

  window.electronAPI
    .addAccount(account)
    .then((response) => {
      messageElement.innerText = `${account.description} was successfully added to the database.`;
      messageElement.style.color = "darkgreen";

      const addButton = document.querySelector("#addAccountForm button");
      if (addButton) {
        addButton.innerText = "Add Another Account";
        addButton.onclick = clearAccountFields;
      }
    })
    .catch((error) => {
      messageElement.innerText =
        "There was an error adding the account to the database, click here for details.";
      messageElement.style.color = "red";
      messageElement.onclick = () => alert(error.message);
    });
}

// Update account details in the database
function submitUpdateAccount() {
  let account = {
    id: document.getElementById("accountSelect").value,
    description: document.getElementById("updateDescription").value,
    account_class: document.getElementById("updateClass").value,
    statement_type: document.getElementById("updateStatement").value,
    account_balance: parseFloat(document.getElementById("updateBalance").value),
  };

  window.electronAPI
    .updateAccount(account)
    .then((response) => {
      document.getElementById("updateAccountMessage").innerText =
        `${account.description} was successfully updated in the database.`;
    })
    .catch((error) => {
      document.getElementById("updateAccountMessage").innerText =
        "There was an error updating the account in the database, click here for details.";
      document.getElementById("updateAccountMessage").style.color = "red";
      document.getElementById("updateAccountMessage").onclick = () =>
        alert(error.message);
    });
}

// Load accounts into a select element
function loadAccounts(selectId) {
  const select = document.getElementById(selectId);
  select.innerHTML = ""; // Clear existing options

  // Add a placeholder option
  let placeholderOption = new Option("Select Account", "", true, true);
  placeholderOption.disabled = true;
  select.add(placeholderOption);

  // Fetch accounts from the database
  window.electronAPI.fetchAccounts().then((accounts) => {
    accounts.forEach((account) => {
      let option = new Option(account.description, account.account_id);
      select.add(option);
    });

    // Add event listener to load account data when a new account is selected
    select.addEventListener("change", (event) => {
      const accountId = event.target.value;
      loadAccountData(accountId);
    });
  });
}

// Remove an account from the database
function submitRemoveAccount() {
  const accountSelect = document.getElementById("removeAccountSelect");
  const accountId = accountSelect.value;
  const accountDescription =
    accountSelect.options[accountSelect.selectedIndex].text;

  window.electronAPI
    .removeAccount(accountId)
    .then((response) => {
      const messageElement = document.getElementById("removeAccountMessage");
      if (messageElement) {
        messageElement.innerText = `${accountDescription} was successfully removed from the database.`;
      }

      // Refresh the account list after removal
      loadAccounts("removeAccountSelect");
    })
    .catch((error) => {
      const messageElement = document.getElementById("removeAccountMessage");
      if (messageElement) {
        messageElement.innerText =
          "There was an error removing the account from the database, click here for details.";
        messageElement.style.color = "red";
        messageElement.onclick = () => alert(error.message);
      }
    });
}

// Load the selected account's data into the form fields
function loadAccountData(accountId) {
  window.electronAPI.fetchAccount(accountId).then((account) => {
    document.getElementById("updateDescription").value = account.description;
    document.getElementById("updateClass").value = account.account_class;
    document.getElementById("updateStatement").value = account.statement_type;
    document.getElementById("updateBalance").value = account.account_balance;
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

// Function to add a new transaction line
function addTransactionLine() {
  const transactionLinesDiv = document.getElementById("transactionLines");

  // Preserve the current values of the account dropdowns and amounts
  const currentLines = Array.from(
    document.getElementsByClassName("transaction-line"),
  ).map((line) => {
    return {
      account_id: line.querySelector(".transactionAccount").value,
      type: line.querySelector(".transactionType").value,
      amount: line.querySelector(".transactionAmount").value,
    };
  });

  // Add new transaction line
  const newLineHTML = `
    <div class="transaction-line">
      <select class="transactionAccount" name="transactionAccount">
        <option value="" disabled selected>Select Account</option>
        <!-- Populate options with accounts fetched from the database -->
      </select>
      <select class="transactionType" name="transactionType">
        <option value="Debit" selected>Debit</option>
        <option value="Credit">Credit</option>
      </select>
      <div class="input-wrapper">
        <span class="dollar-sign transaction-dollar-sign">$</span>
        <input type="number" class="transactionAmount" name="transactionAmount" placeholder="Amount" step="0.01">
      </div>
    </div>
  `;
  transactionLinesDiv.insertAdjacentHTML("beforeend", newLineHTML);

  // Populate account dropdowns with options only for the newly added line
  const newDropdown = transactionLinesDiv.lastElementChild.querySelector(
    ".transactionAccount",
  );
  window.electronAPI.fetchAccounts().then((accounts) => {
    accounts.forEach((account) => {
      let option = new Option(account.description, account.account_id);
      newDropdown.add(option);
    });

    // Restore the previously selected values for existing lines
    currentLines.forEach((line, index) => {
      const currentLine =
        document.getElementsByClassName("transaction-line")[index];
      currentLine.querySelector(".transactionAccount").value = line.account_id;
      currentLine.querySelector(".transactionType").value = line.type;
      currentLine.querySelector(".transactionAmount").value = line.amount;
    });
  });
}

// Function to remove a transaction line
function removeTransactionLine(button) {
  button.parentElement.remove();
  updateNetAmount();
}

// Function to handle viewing transaction history
function viewTransactionHistory() {
  updateMainContent(viewTransactionHistoryHTML);
  loadTransactionHistory();
}

// Add the transaction history HTML form
const viewTransactionHistoryHTML = `
  <div id="transactionHistory">
    <h2>Transaction History</h2>
    <table id="transactionHistoryTable">
      <thead>
        <tr>
          <th>Transaction ID</th>
          <th>Client</th>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        <!-- Rows will be loaded here -->
      </tbody>
    </table>
  </div>
`;

// Toggle transaction details visibility
function toggleTransactionDetails(element, transactionId) {
  const detailsElement = document.getElementById(`details-${transactionId}`);
  if (detailsElement) {
    detailsElement.classList.toggle("active");
    element.innerHTML = detailsElement.classList.contains("active")
      ? "&#9652;"
      : "&#9662;";
  }
}

function loadTransactionDetails(transactionId, container) {
  window.electronAPI.fetchTransactionDetails(transactionId).then((details) => {
    container.innerHTML = `
      <span>Client: ${details.client_name}</span>
      ${details.accounts
        .map(
          (account) =>
            `<span>${account.description}: $${account.amount.toFixed(
              2,
            )} ${account.type === "Debit" ? "(Debited)" : ""}</span>`,
        )
        .join("")}
      <button class="remove-btn" onclick="removeTransaction(${transactionId})">Remove</button>
    `;
  });
}

// Function to load transaction history
function loadTransactionHistory() {
  window.electronAPI.fetchTransactionHistory().then((transactions) => {
    const tableBody = document
      .getElementById("transactionHistoryTable")
      .querySelector("tbody");
    tableBody.innerHTML = ""; // Clear existing rows

    transactions.forEach((transaction) => {
      const row = tableBody.insertRow();

      row.insertCell(0).innerText = transaction.transaction_id;
      row.insertCell(1).innerText = transaction.client_name; // Ensure this field is included in the fetched data
      row.insertCell(2).innerText = transaction.transaction_date;
      row.insertCell(3).innerText = transaction.description;
      row.insertCell(4).innerText = transaction.amount;

      const expandArrow = document.createElement("span");
      expandArrow.classList.add("expand-arrow");
      expandArrow.innerHTML = "&#x002B;"; // Down arrow
      expandArrow.addEventListener("click", () =>
        toggleTransactionDetails(transaction.transaction_id, expandArrow),
      );
      row.appendChild(expandArrow);
    });
  });
}

// Function to load clients into the transaction client dropdown
function loadClientsForTransaction() {
  const clientSelect = document.getElementById("transactionClient");
  clientSelect.innerHTML = ""; // Clear existing options

  // Add a placeholder option
  let placeholderOption = new Option("Select Client", "", true, true);
  placeholderOption.disabled = true;
  clientSelect.add(placeholderOption);

  // Fetch clients from the database
  window.electronAPI.fetchClients().then((clients) => {
    clients.forEach((client) => {
      let option = new Option(client.name, client.client_id);
      clientSelect.add(option);
    });
  });
}

// Function to load accounts into each transaction account dropdown
function loadAccountsForTransactionLines() {
  const accountSelects = document.querySelectorAll(".transactionAccount");
  accountSelects.forEach((select) => {
    select.innerHTML = ""; // Clear existing options

    // Add a placeholder option
    let placeholderOption = new Option("Select Account", "", true, true);
    placeholderOption.disabled = true;
    select.add(placeholderOption);

    // Fetch accounts from the database
    window.electronAPI.fetchAccounts().then((accounts) => {
      accounts.forEach((account) => {
        let option = new Option(account.description, account.account_id);
        select.add(option);
      });
    });
  });
}

// Function to submit a new transaction
function submitAddTransaction() {
  const client_id = document.getElementById("transactionClient").value;
  const description = document.getElementById("transactionDescription").value;
  const date = document.getElementById("transactionDate").value;

  // Check if the date field is empty
  if (!date) {
    const messageElement = document.getElementById("addTransactionMessage");
    if (messageElement) {
      messageElement.innerText = "Please specify a date for this transaction.";
      messageElement.style.color = "red";
    }
    return; // Exit the function early if date is not specified
  }

  const transactionLines = Array.from(
    document.getElementsByClassName("transaction-line"),
  ).map((line) => {
    const account_id = line.querySelector(".transactionAccount").value;
    const type = line.querySelector(".transactionType").value;
    const amount = parseFloat(line.querySelector(".transactionAmount").value);
    return { account_id, type, amount };
  });

  // Calculate the net amount
  const netAmount = transactionLines.reduce((net, line) => {
    return net + (line.type === "Debit" ? -line.amount : line.amount);
  }, 0);

  // Check if the net amount is 0
  if (netAmount !== 0) {
    const messageElement = document.getElementById("addTransactionMessage");
    if (messageElement) {
      messageElement.innerText = "Please ensure debits equal credits.";
      messageElement.style.color = "red";
    }
    return; // Exit the function early if net amount is not 0
  }

  const transaction = {
    client_id,
    description,
    date,
    lines: transactionLines,
  };

  window.electronAPI
    .addTransaction(transaction)
    .then(() => {
      const messageElement = document.getElementById("addTransactionMessage");
      if (messageElement) {
        messageElement.innerText =
          "Transaction was successfully added to the database.";
        messageElement.style.color = "darkgreen"; // Reset message color to green
      }

      // Change button text to "Submit Another Transaction"
      const submitButton = document.querySelector(
        "#addTransactionForm .submit-container button.action-btn",
      );
      if (submitButton) {
        submitButton.innerText = "Submit Another Transaction";
        submitButton.onclick = loadAddTransactionPage; // Set onclick to loadAddTransactionPage
      }
    })
    .catch((error) => {
      const messageElement = document.getElementById("addTransactionMessage");
      if (messageElement) {
        messageElement.innerText =
          "There was an error adding the transaction to the database, click here for details.";
        messageElement.style.color = "red";
        messageElement.onclick = () => alert(error.message);
      }
    });
}

// Function to load the "Add Transaction" page
function loadAddTransactionPage() {
  updateMainContent(addTransactionFormHTML);
  loadClientsForTransaction();
  loadAccountsForTransactionLines();
  updateNetAmount(); // Ensure the net amount is updated correctly
}

// Function to update the net amount
function updateNetAmount() {
  const transactionLines = document.querySelectorAll(".transaction-line");
  let netAmount = 0;

  transactionLines.forEach((line) => {
    const type = line.querySelector(".transactionType").value;
    const amount =
      parseFloat(line.querySelector(".transactionAmount").value) || 0;
    netAmount += type === "Debit" ? -amount : amount;
  });

  const netAmountElement = document.getElementById("netAmount");
  netAmountElement.innerText = `Net: $${netAmount.toFixed(2)}`;

  if (netAmount === 0) {
    netAmountElement.style.color = "darkgreen";
  } else {
    netAmountElement.style.color = "black";
  }
}

// Add event listener to update net amount when transaction amount or type changes
document.addEventListener("change", (event) => {
  if (
    event.target.classList.contains("transactionAmount") ||
    event.target.classList.contains("transactionType")
  ) {
    updateNetAmount();
  }
});

function showGenerateReport() {
  updateMainContent(generateReportHTML);
}

// Function to fetch account data
function fetchAccountData() {
  return window.electronAPI.fetchAccounts().then((accounts) => {
    const assetAccounts = accounts.filter(
      (account) => account.account_class === "Asset",
    );
    const liabilityAccounts = accounts.filter(
      (account) => account.account_class === "Liability",
    );
    const equityAccounts = accounts.filter(
      (account) => account.account_class === "Equity",
    );
    const revenueAccounts = accounts.filter(
      (account) => account.account_class === "Revenue",
    );
    const expenseAccounts = accounts.filter(
      (account) => account.account_class === "Expense",
    );

    const totalAssets = assetAccounts.reduce(
      (sum, account) => sum + account.account_balance,
      0,
    );
    const totalLiabilities = liabilityAccounts.reduce(
      (sum, account) => sum + account.account_balance,
      0,
    );
    const totalEquity = equityAccounts.reduce(
      (sum, account) => sum + account.account_balance,
      0,
    );
    const totalRevenue = revenueAccounts.reduce(
      (sum, account) => sum + account.account_balance,
      0,
    );
    const totalExpenses = expenseAccounts.reduce(
      (sum, account) => sum + account.account_balance,
      0,
    );

    // Create trial balance data
    const trialBalanceData = accounts.map((account) => {
      const total_debit =
        account.account_class === "Expense" || account.account_class === "Asset"
          ? account.account_balance
          : 0;
      const total_credit =
        account.account_class === "Revenue" ||
        account.account_class === "Liability" ||
        account.account_class === "Equity"
          ? account.account_balance
          : 0;
      return {
        description: account.description,
        total_debit,
        total_credit,
      };
    });

    return {
      assetAccounts,
      liabilityAccounts,
      equityAccounts,
      revenueAccounts,
      expenseAccounts,
      totalAssets,
      totalLiabilities,
      totalEquity,
      totalRevenue,
      totalExpenses,
      trialBalanceData,
    };
  });
}

const PDFDocument = require("pdfkit");
const fs = require("fs");

function generatePDFReport(filePath, content) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("Balance Sheet", { align: "center" });
  doc.moveDown();

  content.split("\n").forEach((line) => {
    doc.fontSize(12).text(line);
  });

  doc.end();
}

// Function to generate report
function generateReport() {
  const reportType = document.getElementById("reportType").value;
  let reportPath = document.getElementById("reportPath").value;

  const currentDate = formatDate(new Date());

  const defaultFileNames = {
    balanceSheet: `BalanceSheet${currentDate}.pdf`,
    incomeStatement: `IncomeStatement${currentDate}.pdf`,
    trialBalance: `TrialBalance${currentDate}.pdf`,
  };

  if (!reportPath.toLowerCase().endsWith(".pdf")) {
    if (!reportPath.endsWith("/")) {
      reportPath += "/";
    }
    reportPath += defaultFileNames[reportType];
  }

  let fetchDataPromise;
  if (reportType === "balanceSheet" || reportType === "incomeStatement") {
    fetchDataPromise = fetchAccountData();
  } else if (reportType === "trialBalance") {
    fetchDataPromise = window.electronAPI.fetchTrialBalanceData();
  }

  fetchDataPromise.then((data) => {
    console.log("Fetched data for report: ", data);

    const reportData = {
      ...data,
      reportType,
      trialBalanceData: data, // Add this line to ensure trialBalanceData is correctly passed
    };

    window.electronAPI
      .generatePdfReport(reportPath, reportData, reportType)
      .then((message) => {
        const messageElement = document.getElementById("generateReportMessage");
        if (messageElement) {
          messageElement.innerText = message;
          messageElement.style.color = "darkgreen";
        }
      })
      .catch((error) => {
        const messageElement = document.getElementById("generateReportMessage");
        if (messageElement) {
          messageElement.innerText =
            "Error generating report. Click here for details.";
          messageElement.style.color = "red";
          messageElement.onclick = () => alert(error.message);
        }
      });
  });
}

// Function to open directory dialog and select a path
function openDirectoryDialog() {
  window.electronAPI.openDirectoryDialog().then((selectedPath) => {
    document.getElementById("reportPath").value = selectedPath;
  });
}

function saveReportToFile(filePath, content) {
  const fs = require("fs");
  fs.writeFile(filePath, content, (err) => {
    if (err) {
      console.error("Error saving report:", err);
    } else {
      console.log("Report saved successfully.");
    }
  });
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
