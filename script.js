// ==================== GLOBAL VARIABLES ====================
let donations = JSON.parse(localStorage.getItem("donations")) || [];
let ngoRequests = JSON.parse(localStorage.getItem("ngoRequests")) || [];

// ==================== RANDOM QUOTES ====================
const quotes = [
  "Your surplus can change a life!",
  "Sharing is caring.",
  "Every little help counts.",
  "Be the reason someone smiles today."
];
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("#randomQuote").forEach(el => {
    el.innerText = quotes[Math.floor(Math.random() * quotes.length)];
  });
});



// ==================== TOAST ====================
function showToast(message, color = "#2ecc71") {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.style.background = color;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ==================== DONOR PAGE: SUBMIT DONATION ====================
const donorForm = document.getElementById("donorForm");
if (donorForm) {
  donorForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const data = {
      name: document.getElementById("name").value,
      itemType: document.getElementById("itemType").value,
      quantity: document.getElementById("quantity").value,
      location: document.getElementById("location").value,
      expiryDate: document.getElementById("expiryDate").value,
      notes: document.getElementById("notes").value,
      status: "Available"
    };
    donations.push(data);
    localStorage.setItem("donations", JSON.stringify(donations));
    showToast("✅ Donation Submitted!");
    this.reset();
  });
}

// ==================== NGO PAGE: SUBMIT REQUEST ====================
const requestForm = document.getElementById("requestForm");
if (requestForm) {
  requestForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const newRequest = {
      id: Date.now(),
      ngoName: document.getElementById("ngoName").value.trim(),
      itemNeeded: document.getElementById("itemNeeded").value.trim(),
      quantityNeeded: document.getElementById("quantityNeeded").value.trim(),
      details: document.getElementById("details").value.trim(),
      donated: false
    };

    ngoRequests.push(newRequest);
    localStorage.setItem("ngoRequests", JSON.stringify(ngoRequests));
    showToast("✅ Request submitted successfully!");
    e.target.reset();
  });
}

// ==================== DONOR PAGE: SHOW NGO REQUESTS ====================
const ngoRequestsList = document.getElementById("ngoRequestsList");
if (ngoRequestsList) renderNgoRequests();

function renderNgoRequests() {
  ngoRequests = JSON.parse(localStorage.getItem("ngoRequests")) || [];
  if (ngoRequests.length === 0) {
    ngoRequestsList.innerHTML = "<li>No NGO requests yet.</li>";
    return;
  }

  ngoRequestsList.innerHTML = ngoRequests.map(req => `
    <li class="${req.donated ? 'donated' : ''}">
      <strong>${req.ngoName}</strong> needs <b>${req.itemNeeded}</b> (${req.quantityNeeded})
      ${req.details ? `<br><small>${req.details}</small>` : ''}
      <br>
      ${
        req.donated
          ? '<span class="donated-label">✅ Donated</span>'
          : `<button class="btn-donate" data-id="${req.id}">Donate</button>`
      }
    </li>
  `).join('');
}

if (ngoRequestsList) {
  ngoRequestsList.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-donate")) {
      const id = e.target.getAttribute("data-id");
      ngoRequests = ngoRequests.map(req =>
        req.id == id ? { ...req, donated: true } : req
      );
      localStorage.setItem("ngoRequests", JSON.stringify(ngoRequests));
      renderNgoRequests();
      showToast("🎉 Thank you! The item has been marked as donated.", "#3498db");
    }
  });
}

// ==================== NGO PAGE: DISPLAY DONATIONS ====================
const donationList = document.getElementById("donationList");
if (donationList) renderDonations();

function renderDonations(list = donations) {
  donationList.innerHTML = "";
  if (list.length === 0) {
    donationList.innerHTML = "<p>No donations found.</p>";
    return;
  }
  list.forEach((donation, index) => {
    const badgeClass = "badge-" + donation.itemType.replace(/\s/g, "");
    const card = document.createElement("div");
    card.className = "donation-card";
    card.innerHTML = `
      <span class="badge ${badgeClass}">${donation.itemType}</span>
      <h3>${donation.itemType} (${donation.quantity})</h3>
      <p><strong>Donor:</strong> ${donation.name}</p>
      <p><strong>Location:</strong> ${donation.location}</p>
      ${donation.expiryDate ? `<p><strong>Expiry:</strong> ${donation.expiryDate}</p>` : ""}
      ${donation.notes ? `<p><strong>Notes:</strong> ${donation.notes}</p>` : ""}
      <p><strong>Status:</strong> <span id="status-${index}">${donation.status}</span></p>
      ${donation.status === "Available" ? `<button class="btn-claim" onclick="claimDonation(${index})">Claim</button>` : ""}
    `;
    donationList.appendChild(card);
  });
}

// ==================== CLAIM DONATION (NGO ACTION) ====================
function claimDonation(index) {
  donations[index].status = "Claimed";
  localStorage.setItem("donations", JSON.stringify(donations));
  renderDonations();
  updateDashboard();
  showToast("🎉 Donation Claimed!", "#3498db");
}

// ==================== SEARCH & SORT ====================
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", function () {
    const q = this.value.toLowerCase();
    const filtered = donations.filter(d =>
      d.itemType.toLowerCase().includes(q) ||
      d.location.toLowerCase().includes(q)
    );
    renderDonations(filtered);
  });
}

const sortSelect = document.getElementById("sortSelect");
if (sortSelect) {
  sortSelect.addEventListener("change", function () {
    const val = this.value;
    let sorted = [...donations];
    if (val === "expiry") sorted.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
    if (val === "quantity") sorted.sort((a, b) => parseInt(b.quantity) - parseInt(a.quantity));
    renderDonations(sorted);
  });
}

// ==================== DASHBOARD METRICS ====================
function updateDashboard() {
  donations = JSON.parse(localStorage.getItem("donations")) || [];
  const total = donations.length;
  const claimed = donations.filter(d => d.status === "Claimed").length;
  const available = total - claimed;
  const latest = total > 0 ? `${donations[total - 1].itemType} by ${donations[total - 1].name}` : "None";

  if (document.getElementById("totalDonations"))
    document.getElementById("totalDonations").innerText = total;
  if (document.getElementById("claimedDonations"))
    document.getElementById("claimedDonations").innerText = claimed;
  if (document.getElementById("availableDonations"))
    document.getElementById("availableDonations").innerText = available;
  if (document.getElementById("latestDonation"))
    document.getElementById("latestDonation").innerText = latest;

  const progressContainer = document.getElementById("progressContainer");
  const claimedPercent = total === 0 ? 0 : (claimed / total) * 100;
  if (progressContainer)
    progressContainer.querySelector(".progress-fill").style.width = claimedPercent + "%";
  if (document.getElementById("claimedPercent"))
    document.getElementById("claimedPercent").innerText = Math.round(claimedPercent) + "%";
}
updateDashboard();