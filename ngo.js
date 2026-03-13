// ----------- Load Data ----------
let donations = JSON.parse(localStorage.getItem("donations")) || [];
let ngoRequests = JSON.parse(localStorage.getItem("ngoRequests")) || [];

// ----------- Toast ----------
function showToast(message, color = "#27ae60") {
  let toast = document.createElement("div");
  toast.className = "toast";
  toast.style.background = color;
  toast.innerText = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2000);
}

// ----------- NGO Form ----------
const ngoForm = document.getElementById("ngoForm");
if (ngoForm) {
  ngoForm.addEventListener("submit", e => {
    e.preventDefault();
    const req = {
      id: Date.now(),
      ngoName: document.getElementById("ngoName").value,
      itemType: document.getElementById("requestItem").value,
      quantity: document.getElementById("requestQuantity").value,
      location: document.getElementById("requestLocation").value,
      notes: document.getElementById("requestNotes").value,
      status: "Pending"
    };
    ngoRequests.push(req);
    localStorage.setItem("ngoRequests", JSON.stringify(ngoRequests));
    showToast("✅ Request submitted!");
    ngoForm.reset();
    renderRequests();
  });
}

// ----------- Render Donations and Requests ----------
function renderRequests() {
  const container = document.getElementById("ngoRequestsList");
  if (!container) return;
  container.innerHTML = "";

  let updatedRequests = JSON.parse(localStorage.getItem("ngoRequests")) || [];

  if (updatedRequests.length === 0) {
    container.innerHTML = "<p>No donations or requests yet.</p>";
    return;
  }

  updatedRequests.forEach(req => {
    const card = document.createElement("div");
    card.className = "donation-card";

    let btnHTML = "";
    if (req.status === "Pending") {
      btnHTML = `<button class="btn-submit claim-btn" data-id="${req.id}">Claim</button>`;
    } else if (req.status === "Accepted") {
      btnHTML = `<button class="btn-submit receive-btn" data-id="${req.id}">Mark as Received</button>`;
    }

    card.innerHTML = `
      <h3>${req.itemType} (${req.quantity})</h3>
      <p><strong>NGO:</strong> ${req.ngoName}</p>
      <p><strong>Location:</strong> ${req.location}</p>
      <p><strong>Status:</strong> ${req.status}</p>
      ${btnHTML}
    `;
    container.appendChild(card);
  });

  document.querySelectorAll(".claim-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.dataset.id;
      let list = JSON.parse(localStorage.getItem("ngoRequests")) || [];
      const req = list.find(r => r.id == id);
      if (req) {
        req.status = "Claimed";
        localStorage.setItem("ngoRequests", JSON.stringify(list));
        showToast("✅ Claimed!");
        renderRequests();
      }
    });
  });

  document.querySelectorAll(".receive-btn").forEach(btn => {
    btn.addEventListener("click", e => {
      const id = e.target.dataset.id;
      let list = JSON.parse(localStorage.getItem("ngoRequests")) || [];
      const req = list.find(r => r.id == id);
      if (req) {
        req.status = "Received";
        showToast("🎉 Congratulations!");
        setTimeout(() => {
          list = list.filter(r => r.id != id);
          localStorage.setItem("ngoRequests", JSON.stringify(list));
          renderRequests();
        }, 2000);
      }
    });
  });
}

// ----------- Back Button ----------
document.getElementById("ngoBackBtn")?.addEventListener("click", () => {
  window.history.back();
});

renderRequests();
