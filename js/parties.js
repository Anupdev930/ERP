// Parties Management Logic

let partiesData = [];

window.initParties = function () {
  populateStateDropdown();
  loadParties();
};

const IN_STATES = [
  { name: "Andhra Pradesh", code: "37" },
  { name: "Arunachal Pradesh", code: "12" },
  { name: "Assam", code: "18" },
  { name: "Bihar", code: "10" },
  { name: "Chhattisgarh", code: "22" },
  { name: "Goa", code: "30" },
  { name: "Gujarat", code: "24" },
  { name: "Haryana", code: "06" },
  { name: "Himachal Pradesh", code: "02" },
  { name: "Jharkhand", code: "20" },
  { name: "Karnataka", code: "29" },
  { name: "Kerala", code: "32" },
  { name: "Madhya Pradesh", code: "23" },
  { name: "Maharashtra", code: "27" },
  { name: "Manipur", code: "14" },
  { name: "Meghalaya", code: "17" },
  { name: "Mizoram", code: "15" },
  { name: "Nagaland", code: "13" },
  { name: "Odisha", code: "21" },
  { name: "Punjab", code: "03" },
  { name: "Rajasthan", code: "08" },
  { name: "Sikkim", code: "11" },
  { name: "Tamil Nadu", code: "33" },
  { name: "Telangana", code: "36" },
  { name: "Tripura", code: "16" },
  { name: "Uttar Pradesh", code: "09" },
  { name: "Uttarakhand", code: "05" },
  { name: "West Bengal", code: "19" },
  { name: "Andaman and Nicobar Islands", code: "35" },
  { name: "Chandigarh", code: "04" },
  { name: "Dadra and Nagar Haveli and Daman and Diu", code: "26" },
  { name: "Delhi", code: "07" },
  { name: "Jammu and Kashmir", code: "01" },
  { name: "Ladakh", code: "38" },
  { name: "Lakshadweep", code: "31" },
  { name: "Puducherry", code: "34" },
];
window.IN_STATES = IN_STATES;

function populateStateDropdown() {
  const select = document.getElementById("state");
  if (!select) return;
  IN_STATES.forEach((state) => {
    const option = document.createElement("option");
    option.value = state.name;
    option.textContent = state.name;
    option.dataset.code = state.code;
    select.appendChild(option);
  });
}

function onStateChange() {
  const select = document.getElementById("state");
  const selectedOption = select.options[select.selectedIndex];
  document.getElementById("stateCode").value =
    selectedOption.dataset.code || "";
}

async function loadParties() {
  try {
    SGD.showLoading();
    const res = await SGD.api("getParties");
    partiesData = res.data || [];
    renderParties();
    updatePartyStats();
  } catch (e) {
    SGD.showToast("Error loading parties", "danger");
  } finally {
    SGD.hideLoading();
  }
}

function renderParties(data = partiesData) {
  const tbody = document.getElementById("partiesTableBody");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="9" class="text-center text-muted">No parties found</td></tr>';
    return;
  }

  data.forEach((p) => {
    const id = p.id || p.PartyID;
    const code = p.code || p.PartyID || "-";
    const name = p.name || p.PartyName || "";
    const type = p.type || p.PartyType || "Customer";
    const gstin = p.gstin || p.GSTIN || "-";
    const phone = p.phone || p.Phone || "";
    const city = p.city || p.City || "";
    const currentBalance = parseFloat(
      p.balance !== undefined ? p.balance : p.CurrentBalance || 0,
    );
    const balanceType = p.balanceType || p.BalanceType || "Dr";
    const status = p.status || p.Status || "Active";

    let typeBadge = "";
    if (type === "Customer")
      typeBadge = '<span class="badge bg-primary">Customer</span>';
    else if (type === "Supplier")
      typeBadge =
        '<span class="badge bg-purple" style="background-color:#6f42c1;">Supplier</span>';
    else typeBadge = '<span class="badge bg-info text-dark">Both</span>';

    let isDr = balanceType === "Dr" || currentBalance >= 0;
    let balStr = `<span class="text-${isDr ? "success" : "danger"} fw-bold">${SGD.formatCurrency(Math.abs(currentBalance))} ${balanceType}</span>`;
    let statusStr =
      status.toLowerCase() === "active"
        ? '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Active</span>'
        : '<span class="text-danger"><i class="bi bi-x-circle-fill"></i> Inactive</span>';

    const row = `
            <tr>
                <td data-label="Code" class="cell-detail">${code}</td>
                <td data-label="Party Name"><span class="fw-medium">${name}</span></td>
                <td data-label="Type">${typeBadge}</td>
                <td data-label="GSTIN" class="cell-detail">${gstin}</td>
                <td data-label="Phone">${phone ? `<a href="tel:${phone}" class="text-decoration-none"><i class="bi bi-telephone me-1"></i>${phone}</a>` : "-"}</td>
                <td data-label="City" class="cell-detail">${city}</td>
                <td data-label="Balance">${balStr}</td>
                <td data-label="Status" class="cell-detail">${statusStr}</td>
                <td data-label="Actions" class="text-end">
                    <button type="button" class="btn btn-sm btn-outline-secondary d-md-none me-1 mobile-show-details-btn" onclick="SGD.toggleRowDetails(this)"><i class="bi bi-chevron-down"></i> Details</button>
                    <button class="btn btn-sm btn-outline-info me-1" onclick="viewPartyLedger('${id}')" title="Ledger"><i class="bi bi-journal-text"></i></button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditPartyModal('${id}')" title="Edit"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteParty('${id}')" title="Delete"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    tbody.innerHTML += row;
  });
}

SGD.initPagination("parties", renderParties, {
  containerId: "partiesPaginationControls",
});

function filterParties() {
  const q = document.getElementById("searchPartyInput").value.toLowerCase();
  const type = document.getElementById("filterPartyType").value.toLowerCase();

  let filtered = partiesData.filter((p) => {
    const name = (p.name || p.PartyName || "").toLowerCase();
    const pType = (p.type || p.PartyType || "").toLowerCase();

    const matchesQ = name.includes(q);
    const matchesType = type === "" || pType === type;

    return matchesQ && matchesType;
  });

  SGD.paginate("parties", filtered);
}

function openAddPartyModal() {
  document.getElementById("partyForm").reset();
  document.getElementById("partyId").value = "";
  document.getElementById("partyModalTitle").innerText = "Add New Party";
  const modal = new bootstrap.Modal(document.getElementById("partyModal"));
  modal.show();
}

function openEditPartyModal(id) {
  const p = partiesData.find((x) => (x.id || x.PartyID) == id);
  if (!p) return;

  document.getElementById("partyForm").reset();
  document.getElementById("partyId").value = p.id || p.PartyID;
  document.getElementById("partyName").value = p.name || p.PartyName || "";
  document.getElementById("partyType").value =
    p.type || p.PartyType || "Customer";
  document.getElementById("phone").value = p.phone || p.Phone || "";
  document.getElementById("email").value = p.email || p.Email || "";
  document.getElementById("address").value = p.address || p.Address || "";
  document.getElementById("city").value = p.city || p.City || "";
  if (document.getElementById("state")) document.getElementById("state").value = p.state || p.State || "";
  if (document.getElementById("stateCode")) document.getElementById("stateCode").value = p.stateCode || p.StateCode || "";
  if (document.getElementById("pinCode")) document.getElementById("pinCode").value = p.pinCode || p.PinCode || "";
  document.getElementById("gstin").value = p.gstin || p.GSTIN || "";
  if (document.getElementById("openingBalance")) document.getElementById("openingBalance").value = p.openingBalance || p.OpeningBalance || 0;
  if (document.getElementById("balanceType")) document.getElementById("balanceType").value = p.balanceType || p.BalanceType || "Dr";

  document.getElementById("partyModalTitle").innerText = "Edit Party";
  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById("partyModal"));
  modal.show();
}

async function saveParty() {
  const form = document.getElementById("partyForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const partyData = {
    PartyID: document.getElementById("partyId").value || null,
    PartyName: document.getElementById("partyName").value,
    PartyType: document.getElementById("partyType").value,
    Phone: document.getElementById("phone").value,
    Email: document.getElementById("email").value,
    Address: document.getElementById("address").value,
    City: document.getElementById("city").value,
    State: document.getElementById("state").value,
    StateCode: document.getElementById("stateCode")
      ? document.getElementById("stateCode").value
      : "",
    PinCode: document.getElementById("pinCode").value,
    GSTIN: document.getElementById("gstin").value,
    OpeningBalance:
      parseFloat(document.getElementById("openingBalance").value) || 0,
    BalanceType: document.getElementById("balanceType").value,

    // Lowercase backups for mock/demo compatibility
    id: document.getElementById("partyId").value || null,
    name: document.getElementById("partyName").value,
    type: document.getElementById("partyType").value,
  };

  try {
    SGD.showLoading();
    await SGD.api("saveParty", partyData);
    SGD.hideLoading();
    const modalEl = document.getElementById("partyModal");
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
    SGD.showToast("Party saved successfully", "success");
    loadParties();
  } catch (e) {
    console.error(e);
    SGD.hideLoading();
    SGD.showToast("Error saving party: " + (e.message || e), "danger");
  }
}

async function deleteParty(id) {
  if (confirm("Are you sure you want to delete this party?")) {
    try {
      SGD.showLoading();
      await SGD.api("deleteParty", { id: id, PartyID: id });
      SGD.hideLoading();
      SGD.showToast("Party deleted successfully", "success");
      loadParties();
    } catch (e) {
      console.error(e);
      SGD.hideLoading();
      SGD.showToast("Error deleting party", "danger");
    }
  }
}

function updatePartyStats() {
  let customers = 0;
  let suppliers = 0;
  let outstanding = 0; // Total receivables (Dr balance)

  partiesData.forEach((p) => {
    const pType = (p.PartyType || p.type || "").toLowerCase();
    const bal = parseFloat(p.CurrentBalance !== undefined ? p.CurrentBalance : (p.balance || 0));
    const balType = p.BalanceType || p.balanceType || "Dr";

    if (pType === "customer" || pType === "both" || pType === "") customers++;
    if (pType === "supplier" || pType === "both") suppliers++;
    if (balType === "Dr" && bal > 0) outstanding += bal;
  });

  const totalEl = document.getElementById("statTotalParties");
  const custEl  = document.getElementById("statCustomers");
  const suppEl  = document.getElementById("statSuppliers");
  const outEl   = document.getElementById("statOutstanding");

  if (totalEl) totalEl.innerText = partiesData.length;
  if (custEl)  custEl.innerText  = customers;
  if (suppEl)  suppEl.innerText  = suppliers;
  if (outEl)   outEl.innerText   = SGD.formatCurrency(outstanding);
}

// ── Ledger Logic ──────────────────────────────────────────────────────────
let currentLedgerParty = null;

async function viewPartyLedger(id) {
  const p = partiesData.find((x) => (x.id || x.PartyID) == id);
  if (!p) {
    console.error("Party not found with id:", id);
    return;
  }
  currentLedgerParty = p;

  const partyName = p.PartyName || p.name || "Party";
  const nameEl = document.getElementById("ledgerPartyName");
  if (nameEl) nameEl.innerText = partyName;

  // Initialize flatpickr for date range
  if (typeof flatpickr !== "undefined") {
    flatpickr("#ledgerDateFilter", {
      mode: "range",
      dateFormat: "d-m-Y",
      defaultDate: [new Date(new Date().getFullYear(), new Date().getMonth(), 1), new Date()],
    });
  }

  const modalEl = document.getElementById("ledgerModal");
  if (modalEl) {
    const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
    modal.show();
  }

  await loadPartyLedger(p);
}

async function loadPartyLedger(party, dateRangeStr) {
  const tbody = document.getElementById("ledgerTableBody");
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted"><span class="spinner-border spinner-border-sm me-2"></span>Loading ledger records...</td></tr>';
  }

  try {
    const pName = (party.PartyName || party.name || "").toLowerCase();
    const res = await SGD.api("getReportData", { reportType: "ledger" });
    const data = res && res.data ? res.data : {};
    const sales = data.sales || [];
    const purchases = data.purchases || [];

    // Parse date filter if specified
    let fromDate = null, toDate = null;
    const filterInput = dateRangeStr || document.getElementById("ledgerDateFilter")?.value || "";
    if (filterInput.includes("to")) {
      const parts = filterInput.split("to").map(s => s.trim());
      if (parts[0]) fromDate = _parseDateInput(parts[0]);
      if (parts[1]) toDate   = _parseDateInput(parts[1]);
    }

    const txList = [];

    // Opening balance entry if exists
    const openBal = parseFloat(party.OpeningBalance || 0);
    const openType = party.BalanceType || "Dr";
    if (openBal > 0) {
      txList.push({
        date: "Opening",
        particulars: "Opening Balance",
        dr: openType === "Dr" ? openBal : 0,
        cr: openType === "Cr" ? openBal : 0,
        isOpening: true,
      });
    }

    // Sales transactions
    sales.forEach(s => {
      const sParty = (s.PartyName || s.customer || "").toLowerCase();
      if (sParty === pName) {
        const d = s.InvoiceDate || s.date;
        if (_inRange(d, fromDate, toDate)) {
          const tot = parseFloat(s.TotalAmount || s.total || 0);
          const paid = parseFloat(s.AmountPaid || s.paid || 0);
          txList.push({
            date: d,
            particulars: `Tax Invoice #${s.InvoiceNo || s.invoiceNo || "-"}`,
            dr: tot,
            cr: paid,
          });
        }
      }
    });

    // Purchase transactions
    purchases.forEach(p => {
      const pParty = (p.PartyName || p.supplier || "").toLowerCase();
      if (pParty === pName) {
        const d = p.BillDate || p.date;
        if (_inRange(d, fromDate, toDate)) {
          const tot = parseFloat(p.TotalAmount || p.total || 0);
          const paid = parseFloat(p.AmountPaid || p.paid || 0);
          txList.push({
            date: d,
            particulars: `Purchase Bill #${p.BillNo || p.billNo || "-"}`,
            dr: paid,
            cr: tot,
          });
        }
      }
    });

    // Sort chronologically (keep Opening at beginning)
    txList.sort((a, b) => {
      if (a.isOpening) return -1;
      if (b.isOpening) return 1;
      return (new Date(a.date) || 0) - (new Date(b.date) || 0);
    });

    if (!tbody) return;
    tbody.innerHTML = "";

    if (txList.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted"><i class="bi bi-inbox me-2"></i>No ledger entries found for this party.</td></tr>';
      document.getElementById("ledgerClosingBalance").innerText = "₹ 0.00";
      return;
    }

    let runningBalance = 0;
    txList.forEach((e) => {
      runningBalance += (e.dr - e.cr);
      const isDr = runningBalance >= 0;
      const balStr = SGD.formatCurrency(Math.abs(runningBalance)) + (isDr ? " Dr" : " Cr");
      const dateFormatted = e.isOpening ? "—" : (SGD.formatDate ? SGD.formatDate(e.date) : e.date);

      const tr = `
        <tr>
          <td>${dateFormatted}</td>
          <td class="fw-medium">${e.particulars}</td>
          <td class="text-end text-success">${e.dr > 0 ? SGD.formatCurrency(e.dr) : "-"}</td>
          <td class="text-end text-danger">${e.cr > 0 ? SGD.formatCurrency(e.cr) : "-"}</td>
          <td class="text-end fw-bold" style="color:${isDr ? '#2e7d32' : '#c62828'}">${balStr}</td>
        </tr>
      `;
      tbody.innerHTML += tr;
    });

    const isFinalDr = runningBalance >= 0;
    const finalBalStr = SGD.formatCurrency(Math.abs(runningBalance)) + (isFinalDr ? " Dr" : " Cr");
    const closingEl = document.getElementById("ledgerClosingBalance");
    if (closingEl) {
      closingEl.innerText = finalBalStr;
      closingEl.style.color = isFinalDr ? "#2e7d32" : "#c62828";
    }
  } catch (err) {
    console.error("Error loading party ledger:", err);
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger py-3">Error loading ledger data. Please try again.</td></tr>';
    }
  }
}

function refreshLedger() {
  if (currentLedgerParty) {
    loadPartyLedger(currentLedgerParty);
  }
}

function openPartyInReportsLedger() {
  if (!currentLedgerParty) return;
  const pName = currentLedgerParty.PartyName || currentLedgerParty.name;
  const modalEl = document.getElementById("ledgerModal");
  if (modalEl) {
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  }
  // Navigate to reports view and select ledger report
  SGD.navigate("reports");
  setTimeout(() => {
    if (typeof selectReport === "function") {
      selectReport("ledger");
      setTimeout(() => {
        const sel = document.getElementById("reportParty");
        if (sel) {
          sel.value = pName;
          if (typeof generateReport === "function") generateReport();
        }
      }, 200);
    }
  }, 100);
}

function printPartyStatement() {
  window.print();
}

function _parseDateInput(str) {
  if (!str) return null;
  const parts = str.split("-");
  if (parts.length === 3) return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  return new Date(str);
}

function _inRange(dateStr, from, to) {
  if (!from && !to) return true;
  const d = new Date(dateStr);
  if (isNaN(d)) return true;
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

