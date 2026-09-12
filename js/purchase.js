// Purchase Management Logic

let purchaseData = [];
let purchaseItems = [];
let selectedSupplier = null;

let inventoryItems = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Initialize date filters
    flatpickr("#dateFilter", {
        mode: "range",
        dateFormat: "d-m-Y",
        onChange: function(selectedDates, dateStr, instance) {
            filterPurchases();
        }
    });

    flatpickr("#billDate", {
        dateFormat: "d-m-Y",
        defaultDate: "today"
    });

    if(typeof SGD !== 'undefined' && SGD.api) {
        try {
            const res = await SGD.api('getItems', { activeOnly: true });
            inventoryItems = res.data || [];
        } catch (e) {
            console.error("Failed to load items", e);
        }
    }

    loadPurchases();
});

async function loadPurchases() {
    try {
        SGD.showLoading();
        const res = await SGD.api('getPurchases');
        purchaseData = res.data || [];
        renderPurchases();
        updatePurchaseStats();
        SGD.paginate('purchase', purchaseData);
    } catch (error) {
        SGD.showToast('Error loading purchases', 'danger');
    } finally {
        SGD.hideLoading();
    }
}

function updatePurchaseStats() {
    let totalPurchases = 0;
    let totalPaid = 0;
    
    purchaseData.forEach(p => {
        if (p.status !== 'Cancelled' && p.Status !== 'Cancelled') {
            const total = parseFloat(p.total !== undefined ? p.total : (p.TotalAmount || p.GrandTotal || 0));
            const paid = parseFloat(p.paid !== undefined ? p.paid : (p.AmountPaid || 0));
            totalPurchases += total;
            totalPaid += paid;
        }
    });

    document.getElementById('statTotalPurchases').textContent = `${SGD.formatCurrency(totalPurchases)}`;
    document.getElementById('statTotalBills').textContent = purchaseData.length;
    document.getElementById('statPaid').textContent = `${SGD.formatCurrency(totalPaid)}`;
    document.getElementById('statPending').textContent = `${SGD.formatCurrency(totalPurchases - totalPaid)}`;
}

function renderPurchases(data = purchaseData) {
    const tbody = document.getElementById('purchaseTableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center text-muted">No purchases found</td></tr>';
        return;
    }

    data.forEach(p => {
        const id = p.id || p.PurchaseID;
        const billNo = p.billNo || p.BillNo || '-';
        let rawDate = p.date || p.BillDate || p.Date || '';
        const dateStr = SGD.formatDate(rawDate);
        const supplier = p.supplier || p.PartyName || p.SupplierName || '';
        const total = parseFloat(p.total !== undefined ? p.total : (p.TotalAmount || p.GrandTotal || 0));
        const paid = parseFloat(p.paid !== undefined ? p.paid : (p.AmountPaid || 0));
        const status = p.status || p.PaymentStatus || p.Status || 'Unpaid';

        let statusBadge = '';
        if (status === 'Paid') statusBadge = '<span class="badge bg-success">Paid</span>';
        else if (status === 'Partial') statusBadge = '<span class="badge bg-warning text-dark">Partial</span>';
        else if (status === 'Unpaid') statusBadge = '<span class="badge bg-danger">Unpaid</span>';
        else statusBadge = '<span class="badge bg-secondary">Cancelled</span>';

        const balance = total - paid;

        const row = `
            <tr>
                <td>${id}</td>
                <td>${billNo}</td>
                <td>${dateStr}</td>
                <td>${supplier}</td>
                <td>${SGD.formatCurrency(total)}</td>
                <td class="text-success">${SGD.formatCurrency(paid)}</td>
                <td class="text-danger">${SGD.formatCurrency(balance)}</td>
                <td>${statusBadge}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary" title="View" onclick="viewPurchase('${id}')"><i class="bi bi-eye"></i></button>
                    <button class="btn btn-sm btn-outline-danger" title="Cancel" onclick="cancelPurchase('${id}')"><i class="bi bi-x-circle"></i></button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

SGD.initPagination('purchase', renderPurchases, { containerId: 'purchasePaginationControls' });

function filterPurchases() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const dateRange = document.getElementById('dateFilter').value;
    
    let filtered = purchaseData.filter(p => {
        const matchesSearch = p.billNo.toLowerCase().includes(search) || p.supplier.toLowerCase().includes(search);
        return matchesSearch;
    });

    SGD.paginate('purchase', filtered);
}

async function openNewPurchase() {
    document.getElementById('purchaseForm').reset();
    purchaseItems = [];
    document.getElementById('itemsTableBody').innerHTML = '';
    addItemRow();
    calculatePurchaseTotals();
    
    await loadSupplierDropdown();
    
    const modal = new bootstrap.Modal(document.getElementById('newPurchaseModal'));
    modal.show();
}

async function loadSupplierDropdown() {
    try {
        const select = document.getElementById('supplierSelect');
        select.innerHTML = '<option value="">Select Supplier...</option>';

        let suppliers = [];
        if(typeof SGD !== 'undefined' && SGD.api) {
            const res = await SGD.api('getParties', { type: 'Supplier', activeOnly: true });
            suppliers = res.data || [];
        } else {
            // Mock data fallback
            suppliers = [
                { id: 'S1', name: 'ABC Corp' },
                { id: 'S2', name: 'XYZ Traders' }
            ];
        }
        
        suppliers.forEach(s => {
            const id = s.id || s.PartyID;
            const name = s.name || s.PartyName || '';
            select.innerHTML += `<option value="${id}">${name}</option>`;
        });
    } catch (e) {
        console.error(e);
    }
}

function selectSupplier(id) {
    if (!id) return;
    // In real app, fetch supplier details and might populate hidden fields
}

function addItemRow() {
    const index = purchaseItems.length;
    purchaseItems.push({ id: '', hsn: '', qty: 1, unit: 'PCS', rate: 0, gst: 18, taxAmt: 0, total: 0 });
    
    let itemOptions = '<option value="">Select Item</option>';
    inventoryItems.forEach(i => {
        const id = i.id || i.ItemID;
        const itemName = i.itemName || i.ItemName || '';
        itemOptions += `<option value="${id}">${itemName}</option>`;
    });

    const tbody = document.getElementById('itemsTableBody');
    const tr = document.createElement('tr');
    tr.id = `row-${index}`;
    tr.innerHTML = `
        <td><select class="form-select form-select-sm" onchange="selectPurchaseItem(${index}, this.value)">${itemOptions}</select></td>
        <td><input type="text" class="form-control form-control-sm" id="hsn-${index}" readonly></td>
        <td><input type="number" class="form-control form-control-sm" id="qty-${index}" value="1" oninput="calculatePurchaseRowTotals(${index})"></td>
        <td><input type="text" class="form-control form-control-sm" id="unit-${index}" readonly></td>
        <td><input type="number" class="form-control form-control-sm" id="rate-${index}" value="0" oninput="calculatePurchaseRowTotals(${index})"></td>
        <td><input type="number" class="form-control form-control-sm" id="gst-${index}" value="18" readonly></td>
        <td><input type="text" class="form-control form-control-sm bg-light" id="tax-${index}" readonly></td>
        <td><input type="text" class="form-control form-control-sm bg-light" id="total-${index}" readonly></td>
        <td><button type="button" class="btn btn-sm btn-outline-danger" onclick="removeItemRow(${index})"><i class="bi bi-trash"></i></button></td>
    `;
    tbody.appendChild(tr);
}

function removeItemRow(index) {
    const tr = document.getElementById(`row-${index}`);
    if (tr) {
        tr.remove();
        purchaseItems[index] = null; // Mark as removed
        calculatePurchaseTotals();
    }
}

function selectPurchaseItem(index, itemId) {
    if (!itemId) return;
    const item = inventoryItems.find(i => (i.id || i.ItemID) == itemId);
    if (item) {
        document.getElementById(`hsn-${index}`).value = item.hsn || item.HSNCode || '';
        document.getElementById(`unit-${index}`).value = item.unit || item.Unit || '';
        document.getElementById(`rate-${index}`).value = item.purchasePrice !== undefined ? item.purchasePrice : (item.PurchasePrice || 0);
        document.getElementById(`gst-${index}`).value = item.gst !== undefined ? item.gst : (item.GSTPercent || 0);
        calculatePurchaseRowTotals(index);
    }
}

function calculatePurchaseRowTotals(index) {
    const qty = parseFloat(document.getElementById(`qty-${index}`).value) || 0;
    const rate = parseFloat(document.getElementById(`rate-${index}`).value) || 0;
    const gst = parseFloat(document.getElementById(`gst-${index}`).value) || 0;
    
    const baseTotal = qty * rate;
    const taxAmt = (baseTotal * gst) / 100;
    const total = baseTotal + taxAmt;
    
    document.getElementById(`tax-${index}`).value = taxAmt.toFixed(2);
    document.getElementById(`total-${index}`).value = total.toFixed(2);
    
    if (purchaseItems[index]) {
        purchaseItems[index].qty = qty;
        purchaseItems[index].rate = rate;
        purchaseItems[index].taxAmt = taxAmt;
        purchaseItems[index].total = total;
    }
    
    calculatePurchaseTotals();
}

function calculatePurchaseTotals() {
    let subTotal = 0;
    let totalTax = 0;
    let grandTotal = 0;
    
    purchaseItems.forEach((item, index) => {
        if (item) {
            const qty = parseFloat(document.getElementById(`qty-${index}`).value) || 0;
            const rate = parseFloat(document.getElementById(`rate-${index}`).value) || 0;
            subTotal += (qty * rate);
            totalTax += parseFloat(document.getElementById(`tax-${index}`).value) || 0;
        }
    });
    
    grandTotal = subTotal + totalTax;
    
    document.getElementById('subTotal').innerText = SGD.formatCurrency(subTotal);
    document.getElementById('totalTax').innerText = SGD.formatCurrency(totalTax);
    document.getElementById('grandTotal').innerText = SGD.formatCurrency(grandTotal);
    
    const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;
    const balanceDue = grandTotal - amountPaid;
    document.getElementById('balanceDue').innerText = SGD.formatCurrency(balanceDue);
}

async function savePurchase() {
    const form = document.getElementById('purchaseForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const supplierId = document.getElementById('supplierSelect').value;
    if (!supplierId) {
        SGD.showToast("Please select a supplier", "danger");
        return;
    }
    
    // Build items array
    const items = [];
    purchaseItems.forEach((item, index) => {
        if (!item) return; // skipped removed rows
        const selectEl = document.getElementById(`row-${index}`).querySelector('select');
        const itemId = selectEl.value;
        if (!itemId) return;
        
        const invItem = inventoryItems.find(i => (i.id || i.ItemID) == itemId);
        if (!invItem) return;
        
        items.push({
            ItemID: itemId,
            ItemName: invItem.itemName || invItem.ItemName || '',
            HSNCode: document.getElementById(`hsn-${index}`).value,
            Quantity: parseFloat(document.getElementById(`qty-${index}`).value) || 0,
            Unit: document.getElementById(`unit-${index}`).value,
            Rate: parseFloat(document.getElementById(`rate-${index}`).value) || 0,
            GSTPercent: parseFloat(document.getElementById(`gst-${index}`).value) || 0
        });
    });
    
    if (items.length === 0) {
        SGD.showToast("Please add at least one item.", "danger");
        return;
    }
    
    // Look up supplier name
    let supplierName = '';
    if (typeof SGD !== 'undefined' && SGD.api) {
        // Find from dropdown options text
        const sel = document.getElementById('supplierSelect');
        supplierName = sel.options[sel.selectedIndex].text;
    }
    
    const purchaseData = {
        billNo: document.getElementById('billNo').value,
        billDate: document.getElementById('billDate').value,
        partyId: supplierId,
        partyName: supplierName,
        amountPaid: parseFloat(document.getElementById('amountPaid').value) || 0,
        paymentMode: document.getElementById('paymentMode').value,
        notes: document.getElementById('purchaseNotes').value,
        items: items
    };

    try {
        if(typeof SGD !== 'undefined' && SGD.api) {
            SGD.showLoading();
            await SGD.api('createPurchase', purchaseData);
            SGD.showToast('Purchase saved successfully', 'success');
            const modal = bootstrap.Modal.getInstance(document.getElementById('newPurchaseModal'));
            modal.hide();
            loadPurchases();
        } else {
            // Mock Save
            alert("Purchase saved (Mock)");
            const modal = bootstrap.Modal.getInstance(document.getElementById('newPurchaseModal'));
            modal.hide();
        }
    } catch (e) {
        console.error(e);
        SGD.showToast('Error saving purchase', 'danger');
    } finally {
        if(typeof SGD !== 'undefined' && SGD.hideLoading) SGD.hideLoading();
    }
}

function updatePurchaseStats() {
    let totalPurchases = purchaseData.length;
    let totalAmt = 0;
    let paidAmt = 0;
    let unpaidAmt = 0;

    purchaseData.forEach(p => {
        const total = parseFloat(p.total !== undefined ? p.total : (p.TotalAmount || p.GrandTotal || 0));
        const paid = parseFloat(p.paid !== undefined ? p.paid : (p.AmountPaid || 0));
        totalAmt += total;
        paidAmt += paid;
        unpaidAmt += (total - paid);
    });

    document.getElementById('statTotalPurchases').innerText = totalPurchases;
    document.getElementById('statTotalAmount').innerText = SGD.formatCurrency(totalAmt);
    document.getElementById('statPaidAmount').innerText = SGD.formatCurrency(paidAmt);
    document.getElementById('statUnpaidAmount').innerText = SGD.formatCurrency(unpaidAmt);
}

async function viewPurchase(id) {
    const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('viewPurchaseModal'));
    document.getElementById('viewPurchaseContent').innerHTML = `<p>Loading details for ${id}...</p>`;
    modal.show();

    let purchase = purchaseData.find(p => (p.id || p.PurchaseID) == id);
    
    if (typeof SGD !== 'undefined' && SGD.api) {
        try {
            SGD.showLoading();
            const res = await SGD.api('getPurchaseDetails', { purchaseId: id });
            if (res && res.data && res.data.purchase) {
                purchase = { ...res.data.purchase, items: res.data.items };
            }
        } catch (e) {
            console.error(e);
        } finally {
            SGD.hideLoading();
        }
    }

    if (!purchase) {
        document.getElementById('viewPurchaseContent').innerHTML = `<p class="text-danger">Failed to load purchase details.</p>`;
        return;
    }

    const supplierName = purchase.partyName || purchase.PartyName || '-';
    const date = purchase.date || purchase.BillDate || purchase.Date || '-';
    const billNo = purchase.billNo || purchase.BillNo || '-';
    const status = purchase.status || purchase.PaymentStatus || purchase.Status || '-';
    const items = purchase.items || [];

    let itemsHTML = '';
    if (items.length > 0) {
        items.forEach((item, idx) => {
            const name = item.ItemName || item.itemName || '-';
            const qty = item.Quantity || item.qty || 0;
            const rate = parseFloat(item.Rate || item.rate || 0);
            const total = parseFloat(item.TotalAmount || item.total || 0);
            itemsHTML += `
            <tr>
                <td>${idx + 1}</td>
                <td>${name}</td>
                <td>${qty}</td>
                <td>${rate.toFixed(2)}</td>
                <td class="text-end">${total.toFixed(2)}</td>
            </tr>`;
        });
    } else {
        itemsHTML = `<tr><td colspan="5" class="text-center">No items found</td></tr>`;
    }

    const subTotal = parseFloat(purchase.SubTotal || purchase.subTotal || 0);
    const taxAmt = parseFloat(purchase.TaxAmount || purchase.totalTax || 0);
    const grandTotal = parseFloat(purchase.TotalAmount || purchase.grandTotal || purchase.total || 0);

    const html = `
    <div class="row mb-3">
        <div class="col-sm-6">
            <strong>Supplier:</strong> ${supplierName}<br>
            <strong>Bill No:</strong> ${billNo}
        </div>
        <div class="col-sm-6 text-sm-end">
            <strong>Date:</strong> ${date}<br>
            <strong>Status:</strong> <span class="badge bg-${status === 'Paid' ? 'success' : 'danger'}">${status}</span>
        </div>
    </div>
    <div class="table-responsive">
        <table class="table table-bordered table-sm">
            <thead class="table-light">
                <tr>
                    <th>Sr</th>
                    <th>Item</th>
                    <th>Qty</th>
                    <th>Rate</th>
                    <th class="text-end">Total</th>
                </tr>
            </thead>
            <tbody>
                ${itemsHTML}
            </tbody>
            <tfoot>
                <tr><td colspan="4" class="text-end fw-bold">Sub Total:</td><td class="text-end">${subTotal.toFixed(2)}</td></tr>
                <tr><td colspan="4" class="text-end fw-bold">Tax:</td><td class="text-end">${taxAmt.toFixed(2)}</td></tr>
                <tr class="table-light"><td colspan="4" class="text-end fw-bold">Grand Total:</td><td class="text-end fw-bold">${grandTotal.toFixed(2)}</td></tr>
            </tfoot>
        </table>
    </div>`;

    document.getElementById('viewPurchaseContent').innerHTML = html;
}

async function cancelPurchase(id) {
    if (confirm('Are you sure you want to cancel this purchase?')) {
        try {
            if (typeof SGD !== 'undefined' && SGD.api) {
                SGD.showLoading();
                await SGD.api('cancelPurchase', { purchaseId: id });
                SGD.showToast(`Purchase ${id} cancelled`, 'success');
                loadPurchases();
            } else {
                SGD.showToast(`Purchase ${id} cancelled (Mock)`, 'success');
            }
        } catch (e) {
            console.error(e);
            SGD.showToast('Error cancelling purchase', 'danger');
        } finally {
            if(typeof SGD !== 'undefined' && SGD.hideLoading) SGD.hideLoading();
        }
    }
}
