const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, "data.json");

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // serve frontend files

// Helper functions
function readData() {
  const raw = fs.readFileSync(DATA_FILE);
  return JSON.parse(raw);
}

function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// --------- ROUTES ---------

// Get all donations
app.get("/api/donations", (req, res) => {
  const data = readData();
  res.json(data.donations);
});

// Add a new donation
app.post("/api/donations", (req, res) => {
  const newDonation = { id: Date.now(), ...req.body, status: "Available" };
  const data = readData();
  data.donations.push(newDonation);
  writeData(data);
  res.json(newDonation);
});

// Get all NGO requests
app.get("/api/ngoRequests", (req, res) => {
  const data = readData();
  res.json(data.ngoRequests);
});

// Add a new NGO request
app.post("/api/ngoRequests", (req, res) => {
  const newRequest = { id: Date.now(), ...req.body, status: "Pending" };
  const data = readData();
  data.ngoRequests.push(newRequest);
  writeData(data);
  res.json(newRequest);
});

// Update donation status (claim by NGO)
app.put("/api/donations/:id/claim", (req, res) => {
  const data = readData();
  const donation = data.donations.find(d => d.id == req.params.id);
  if (donation) {
    donation.status = "Claimed";
    writeData(data);
    res.json({ message: "Donation claimed", donation });
  } else res.status(404).json({ error: "Donation not found" });
});

// Update NGO request status
app.put("/api/ngoRequests/:id/status", (req, res) => {
  const data = readData();
  const request = data.ngoRequests.find(r => r.id == req.params.id);
  if (request) {
    request.status = req.body.status || request.status;
    writeData(data);
    res.json({ message: "Request updated", request });
  } else res.status(404).json({ error: "Request not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
