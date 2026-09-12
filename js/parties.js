// Parties Management Logic

let partiesData = [];

document.addEventListener('DOMContentLoaded', () => {
    populateStateDropdown();
    loadParties();
});

const IN_STATES = [
    { name: "Andhra Pradesh", code: "37" }, { name: "Arunachal Pradesh", code: "12" },
    { name: "Assam", code: "18" }, { name: "Bihar", code: "10" },
    { name: "Chhattisgarh", code: "22" }, { name: "Goa", code: "30" },
    { name: "Gujarat", code: "24" }, { name: "Haryana", code: "06" },
    { name: "Himachal Pradesh", code: "02" }, { name: "Jharkhand", code: "20" },
    { name: "Karnataka", code: "29" }, { name: "Kerala", code: "32" },
    { name: "Madhya Pradesh", code: "23" }, { name: "Maharashtra", code: "27" },
    { name: "Manipur", code: "14" }, { name: "Meghalaya", code: "17" },
    { name: "Mizoram", code: "15" }, { name: "Nagaland", code: "13" },
    { name: "Odisha", code: "21" }, { name: "Punjab", code: "03" },
    { name: "Rajasthan", code: "08" }, { name: "Sikkim", code: "11" },
    { name: "Tamil Nadu", code: "33" }, { name: "Telangana", code: "36" },
    { name: "Tripura", code: "16" }, { name: "Uttar Pradesh", code: "09" },
    { name: "Uttarakhand", code: "05" }, { name: "West Bengal", code: "19" },
    { name: "Andaman and Nicobar Islands", code: "35" }, { name: "Chandigarh", code: "04" },
    { name: "Dadra and Nagar Haveli and Daman and Diu", code: "26" }, { name: "Delhi", code: "07" },
    { name: "Jammu and Kashmir", code: "01" }, { name: "Ladakh", code: "38" },
    { name: "Lakshadweep", code: "31" }, { name: "Puducherry", code: "34" }
];

function populateStateDropdown() {
    const select = document.getElementById('state');
    if (!select) return;
    IN_STATES.forEach(state => {
        const option = document.createElement('option');
        option.value = state.name;
        option.textContent = state.name;
        option.dataset.code = state.code;
        select.appendChild(option);
    });
}

function onStateChange() {
    const select = document.getElementById('state');
    const selectedOption = select.options[select.selectedIndex];
    document.getElementById('stateCode').value = selectedOption.dataset.code || '';
}

async function loadParties() {
    try {
        SGD.showLoading();
        const res = await SGD.api('getParties');
        partiesData = res.data || [];
        renderParties();
        updatePartyStats();
    } catch (e) {
        SGD.showToast('Error loading parties', 'danger');
    } finally {
        SGD.hideLoading();
    }
}

function renderParties(data = partiesData) {
    const tbody = document.getElementById('partiesTableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No parties found</td></tr>';
        return;
    }

    data.forEach(p => {
        const id = p.id || p.PartyID;
        const code = p.code || p.PartyID || '-';
        const name = p.name || p.PartyName || '';
        const type = p.type || p.PartyType || 'Customer';
        const gstin = p.gstin || p.GSTIN || '-';
        const phone = p.phone || p.Phone || '';
        const city = p.city || p.City || '';
        const currentBalance = parseFloat(p.balance !== undefined ? p.balance : (p.CurrentBalance || 0));
        const balanceType = p.balanceType || p.BalanceType || 'Dr';
        const status = p.status || p.Status || 'Active';

        let typeBadge = '';
        if (type === 'Customer') typeBadge = '<span class="badge bg-primary">Customer</span>';
        else if (type === 'Supplier') typeBadge = '<span class="badge bg-purple" style="background-color:#6f42c1;">Supplier</span>';
        else typeBadge = '<span class="badge bg-info text-dark">Both</span>';

        let isDr = balanceType === 'Dr' || currentBalance >= 0;
        let balStr = `<span class="text-${isDr ? 'success' : 'danger'} fw-bold">${SGD.formatCurrency(Math.abs(currentBalance))} ${balanceType}</span>`;
        let statusStr = (status.toLowerCase() === 'active') ? '<span class="text-success"><i class="bi bi-check-circle-fill"></i> Active</span>' : '<span class="text-danger"><i class="bi bi-x-circle-fill"></i> Inactive</span>';

        const row = `
            <tr>
                <td>${code}</td>
                <td><span class="fw-medium">${name}</span></td>
                <td>${typeBadge}</td>
                <td>${gstin}</td>
                <td>${phone}</td>
                <td>${city}</td>
                <td>${balStr}</td>
                <td>${statusStr}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-info me-1" onclick="viewPartyLedger('${id}')" title="Ledger"><i class="bi bi-journal-text"></i></button>
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditPartyModal('${id}')" title="Edit"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteParty('${id}')" title="Delete"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

SGD.initPagination('parties', renderParties, { containerId: 'partiesPaginationControls' });

function filterParties() {
    const q = document.getElementById('searchPartyInput').value.toLowerCase();
    const type = document.getElementById('filterPartyType').value.toLowerCase();
    
    let filtered = partiesData.filter(p => {
        const name = (p.name || p.PartyName || '').toLowerCase();
        const pType = (p.type || p.PartyType || '').toLowerCase();
        
        const matchesQ = name.includes(q);
        const matchesType = type === '' || pType === type;
        
        return matchesQ && matchesType;
    });
    
    SGD.paginate('parties', filtered);
}

function openAddPartyModal() {
    document.getElementById('partyForm').reset();
    document.getElementById('partyId').value = '';
    document.getElementById('partyModalTitle').innerText = 'Add New Party';
    const modal = new bootstrap.Modal(document.getElementById('partyModal'));
    modal.show();
}

function openEditPartyModal(id) {
    const p = partiesData.find(x => (x.id || x.PartyID) == id);
    if (!p) return;
    
    document.getElementById('partyForm').reset();
    document.getElementById('partyId').value = p.id || p.PartyID;
    document.getElementById('partyName').value = p.name || p.PartyName || '';
    document.getElementById('partyType').value = p.type || p.PartyType || 'Customer';
    document.getElementById('phone').value = p.phone || p.Phone || '';
    document.getElementById('city').value = p.city || p.City || '';
    document.getElementById('gstin').value = p.gstin || p.GSTIN || '';
    // Set other fields...
    
    document.getElementById('partyModalTitle').innerText = 'Edit Party';
    const modal = new bootstrap.Modal(document.getElementById('partyModal'));
    modal.show();
}

async function saveParty() {
    const form = document.getElementById('partyForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const partyData = {
        PartyID: document.getElementById('partyId').value || null,
        PartyName: document.getElementById('partyName').value,
        PartyType: document.getElementById('partyType').value,
        Phone: document.getElementById('phone').value,
        Email: document.getElementById('email').value,
        Address: document.getElementById('address').value,
        City: document.getElementById('city').value,
        State: document.getElementById('state').value,
        StateCode: document.getElementById('stateCode') ? document.getElementById('stateCode').value : '',
        PinCode: document.getElementById('pinCode').value,
        GSTIN: document.getElementById('gstin').value,
        OpeningBalance: parseFloat(document.getElementById('openingBalance').value) || 0,
        BalanceType: document.getElementById('balanceType').value,
        
        // Lowercase backups for mock/demo compatibility
        id: document.getElementById('partyId').value || null,
        name: document.getElementById('partyName').value,
        type: document.getElementById('partyType').value
    };

    try {
        if (typeof SGD !== 'undefined' && SGD.api) {
            SGD.showLoading();
            await SGD.api('saveParty', partyData);
            SGD.hideLoading();
            const modal = bootstrap.Modal.getInstance(document.getElementById('partyModal'));
            modal.hide();
            SGD.showToast('Party saved successfully', 'success');
            loadParties();
        } else {
            // Mock Save
            SGD.showLoading();
            setTimeout(() => {
                SGD.hideLoading();
                const modal = bootstrap.Modal.getInstance(document.getElementById('partyModal'));
                modal.hide();
                SGD.showToast('Party saved successfully', 'success');
                loadParties();
            }, 1000);
        }
    } catch (e) {
        console.error(e);
        SGD.hideLoading();
        SGD.showToast('Error saving party', 'danger');
    }
}

function deleteParty(id) {
    if (confirm('Are you sure you want to delete this party?')) {
        SGD.showToast(`Party deleted`, 'success');
        // Reload parties
    }
}

function updatePartyStats() {
    let customers = 0;
    let suppliers = 0;
    let outstanding = 0; // Only positive balance (Receivable)

    partiesData.forEach(p => {
        if (p.type === 'Customer' || p.type === 'Both') customers++;
        if (p.type === 'Supplier' || p.type === 'Both') suppliers++;
        if (p.balance > 0) outstanding += p.balance;
    });

    document.getElementById('statTotalParties').innerText = partiesData.length;
    document.getElementById('statCustomers').innerText = customers;
    document.getElementById('statSuppliers').innerText = suppliers;
    document.getElementById('statOutstanding').innerText = SGD.formatCurrency(outstanding);
}

// Ledger logic
function viewPartyLedger(id) {
    const p = partiesData.find(x => x.id === id);
    if (!p) return;
    
    document.getElementById('ledgerPartyName').innerText = p.name;
    
    flatpickr("#ledgerDateFilter", {
        mode: "range",
        dateFormat: "d-m-Y"
    });
    
    loadPartyLedger(id, null, null);
    
    const modal = new bootstrap.Modal(document.getElementById('ledgerModal'));
    modal.show();
}

function loadPartyLedger(id, dateFrom, dateTo) {
    // Mock data
    const entries = [
        { date: '01-09-2023', particulars: 'Opening Balance', dr: 5000, cr: 0 },
        { date: '05-09-2023', particulars: 'Invoice #INV-100', dr: 2000, cr: 0 },
        { date: '10-09-2023', particulars: 'Receipt (Cash)', dr: 0, cr: 3000 }
    ];
    
    const tbody = document.getElementById('ledgerTableBody');
    tbody.innerHTML = '';
    
    let runningBalance = 0;
    
    entries.forEach(e => {
        runningBalance += (e.dr - e.cr);
        const balStr = Math.abs(runningBalance).toFixed(2) + (runningBalance >= 0 ? ' Dr' : ' Cr');
        
        const tr = `
            <tr>
                <td>${e.date}</td>
                <td>${e.particulars}</td>
                <td class="text-end text-success">${e.dr > 0 ? e.dr.toFixed(2) : ''}</td>
                <td class="text-end text-danger">${e.cr > 0 ? e.cr.toFixed(2) : ''}</td>
                <td class="text-end fw-bold">${balStr}</td>
            </tr>
        `;
        tbody.innerHTML += tr;
    });
    
    const finalBalStr = SGD.formatCurrency(Math.abs(runningBalance)) + (runningBalance >= 0 ? ' Dr' : ' Cr');
    document.getElementById('ledgerClosingBalance').innerText = finalBalStr;
}

function refreshLedger() {
    // get dates and load
}

function printPartyStatement() {
    window.print();
}
