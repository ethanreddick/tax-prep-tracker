const { app, BrowserWindow } = require("electron");
const db = require("./database");

// Query the database
db.executeQuery("SELECT * FROM yourTable", (error, results) => {
  if (error) {
    console.error("Database query error:", error);
    return;
  }
  console.log("Database query results:", results);
});

// Remember to close the connection when you're done
db.closeConnection();

function createWindow() {
  // Create the browser window.
  let win = new BrowserWindow({
    width: 1200,
    height: 900,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  win.loadFile("renderer/index.html");
}

app.on("ready", createWindow);
