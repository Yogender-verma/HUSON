// ----------- Load existing data -----------
let ngoRequests = JSON.parse(localStorage.getItem("ngoRequests")) || [];
let donorDonations = JSON.parse(localStorage.getItem("donorDonations")) || [];

// ----------- DOM Elements -----------
const donorForm = document.getElementById("donorForm");
const ngoRequestsContainer = document.getElementById("ngoRequests");
const backBtn = document.getElementById("backBtn");
const darkToggle = document.getElementById("darkToggle");

// ----------- Toast ----------
function showToast(msg, color = "#27ae60") {
  const t = document.createElement("div");
  t.className = "toast";
  t.style.background = color;
  t.innerText = msg;
  document.body.appendChild(t);
  setTimeout(() => t.classList.add("show"), 100);
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, 2000);
}

// ----------- Dark Mode -----------
document.addEventListener("DOMContentLoaded", () => {
  if (localStorage.getItem("huson-dark-mode") === "true")
    document.body.classList.add("dark-mode");
  renderRequests();
});

darkToggle?.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "huson-dark-mode",
    document.body.classList.contains("dark-mode")
  );
});

// ----------- Submit Donation Form -----------
if (donorForm) {
  donorForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const donation = {
      id: Date.now(),
      name: document.getElementById("name").value,
      itemType: document.getElementById("itemType").value,
      quantity: document.getElementById("quantity").value,
      location: document.getElementById("location").value || "Not specified",
      expiryDate: document.getElementById("expiryDate").value,
      notes: document.getElementById("notes").value,
      date: new Date().toLocaleString(),
      status: "available",
    };

    donorDonations.push(donation);
    localStorage.setItem("donorDonations", JSON.stringify(donorDonations));

    showToast("✅ Donation Submitted!");
    donorForm.reset();

    renderRequests();
  });
}

// ----------- Render NGO Requests -----------
function renderRequests() {
  if (!ngoRequestsContainer) return;
  ngoRequestsContainer.innerHTML = "";

  ngoRequests = JSON.parse(localStorage.getItem("ngoRequests")) || [];
  if (ngoRequests.length === 0) {
    ngoRequestsContainer.innerHTML = "<p>No NGO requests available.</p>";
    return;
  }

  ngoRequests.forEach((req) => {
    const card = document.createElement("div");
    card.className = "donation-card";
    card.innerHTML = `
      <h3>${req.itemType} (${req.quantity})</h3>
      <p><strong>NGO:</strong> ${req.ngoName}</p>
      <p><strong>Location:</strong> ${req.location}</p>
      <p><small>${req.date}</small></p>
      <button class="btn-submit donate-btn" data-id="${req.id}">Donate</button>
    `;
    ngoRequestsContainer.appendChild(card);
  });

  // Handle donation acceptance
  document.querySelectorAll(".donate-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const reqs = JSON.parse(localStorage.getItem("ngoRequests")) || [];
      const req = reqs.find((r) => r.id == id);
      if (req) {
        req.status = "donated";
        localStorage.setItem("ngoRequests", JSON.stringify(reqs));
        showToast("🎁 Thank you for donating!");
        btn.parentElement.remove();
      }
    });
  });
}

// ----------- Back Button -----------
backBtn?.addEventListener("click", () => history.back());