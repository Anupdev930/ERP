/**
 * Sales and Invoicing JavaScript
 */

let salesData = [];
let partiesData = [];
let inventoryItems = [];
let currentInvoiceSaleId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize flatpickr
    flatpickr(".flatpickr-date", {
        dateFormat: "d-m-Y",
        defaultDate: new Date()
    });
    
    flatpickr("#dateRangeFilter", {
        mode: "range",
        dateFormat: "d-m-Y",
        onChange: filterSales
    });

    // Event Listeners
    document.getElementById('searchSaleInput')?.addEventListener('input', filterSales);
    document.getElementById('filterSaleStatus')?.addEventListener('change', filterSales);

    // Initial loads
    loadSales();
    loadDependencies();
});

async function loadDependencies() {
    try {
        if(typeof SGD !== 'undefined' && SGD.api) {
            const [pRes, iRes] = await Promise.all([
                SGD.api('getParties', { type: 'Customer', activeOnly: true }),
                SGD.api('getItems', { activeOnly: true })
            ]);
            partiesData = pRes.data || [];
            inventoryItems = iRes.data || [];
        } else {
            // Mock data
            partiesData = [
                { id: 1, name: 'Rahul Enterprises', gstin: '19AAECR1234A1Z5', phone: '9876543210', state: 'West Bengal', stateCode: 19, address: 'Kolkata, WB' }
            ];
            inventoryItems = [
                { id: 1, itemName: 'Fluted Panel Oak', hsn: '3925', unit: 'PCS', sellingPrice: 550, gst: 18, stock: 150 },
                { id: 2, itemName: 'UV Marble Sheet', hsn: '3920', unit: 'PCS', sellingPrice: 1600, gst: 18, stock: 20 }
            ];
        }
    } catch(e) {
        console.error("Failed to load dependencies", e);
    }
}

async function loadSales() {
    try {
        if(typeof SGD !== 'undefined' && SGD.api) {
            SGD.showLoading();
            const res = await SGD.api('getSales');
            salesData = res.data || [];
        } else {
            // Mock sales data
            salesData = [
                { id: 1, invoiceNo: 'SGD_0001_26-27', date: '12-09-2026', customerName: 'Rahul Enterprises', totalQty: 10, grandTotal: 6490, amountPaid: 6490, status: 'Paid', items: [] }
            ];
        }
        updateSalesStats();
        SGD.paginate('sales', salesData);
    } catch(e) {
        console.error(e);
    } finally {
        if(typeof SGD !== 'undefined' && SGD.hideLoading) SGD.hideLoading();
    }
}

function updateSalesStats() {
    let sales = 0;
    let paid = 0;
    let unpaid = 0;
    salesData.forEach(s => {
        const total = parseFloat(s.grandTotal !== undefined ? s.grandTotal : (s.TotalAmount || s.GrandTotal || 0));
        const p = parseFloat(s.amountPaid !== undefined ? s.amountPaid : (s.AmountPaid || 0));
        sales += total;
        paid += p;
        unpaid += (total - p);
    });

    document.getElementById('statTotalSales').textContent = `${SGD.formatCurrency(sales)}`;
    document.getElementById('statTotalInvoices').textContent = salesData.length;
    document.getElementById('statPaid').textContent = `${SGD.formatCurrency(paid)}`;
    document.getElementById('statUnpaid').textContent = `${SGD.formatCurrency(unpaid)}`;
}

function renderSalesTable(data) {
    const tbody = document.getElementById('salesTableBody');
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9" class="text-center py-3">No sales found.</td></tr>`;
        return;
    }

    data.forEach(sale => {
        const id = sale.id || sale.SaleID;
        const invoiceNo = sale.invoiceNo || sale.InvoiceNo || '-';
        let rawDate = sale.date || sale.InvoiceDate || sale.Date || '';
        const dateStr = SGD.formatDate(rawDate);
        
        const customerName = sale.customerName || sale.PartyName || sale.CustomerName || '';
        const totalQty = sale.totalQty !== undefined ? sale.totalQty : (sale.TotalQty || '-');
        const grandTotal = parseFloat(sale.grandTotal !== undefined ? sale.grandTotal : (sale.TotalAmount || sale.GrandTotal || 0));
        const amountPaid = parseFloat(sale.amountPaid !== undefined ? sale.amountPaid : (sale.AmountPaid || 0));
        const status = sale.status || sale.PaymentStatus || sale.Status || 'Unpaid';

        let badgeClass = 'bg-success';
        if (status === 'Unpaid') badgeClass = 'bg-danger';
        else if (status === 'Partial') badgeClass = 'bg-warning text-dark';
        else if (status === 'Cancelled') badgeClass = 'bg-secondary text-decoration-line-through';

        const balance = grandTotal - amountPaid;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="fw-bold">${invoiceNo}</td>
            <td>${dateStr}</td>
            <td>${customerName}</td>
            <td class="text-center">${totalQty}</td>
            <td class="text-end fw-medium">${SGD.formatCurrency(grandTotal)}</td>
            <td class="text-end text-success">${SGD.formatCurrency(amountPaid)}</td>
            <td class="text-end text-danger">${SGD.formatCurrency(balance)}</td>
            <td class="text-center"><span class="badge ${badgeClass}">${status}</span></td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-info me-1" title="View/Print" onclick="viewSale('${id}')"><i class="bi bi-eye"></i></button>
                <button class="btn btn-sm btn-outline-danger" title="Cancel Sale" onclick="cancelSale('${id}')"><i class="bi bi-x-circle"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialize pagination
SGD.initPagination('sales', renderSalesTable, { containerId: 'salesPaginationControls' });

function filterSales() {
    const q = document.getElementById('searchSaleInput').value.toLowerCase();
    const stat = document.getElementById('filterSaleStatus').value;
    
    let filtered = salesData.filter(s => {
        const invNo = (s.invoiceNo || s.InvoiceNo || '').toLowerCase();
        const party = (s.customerName || s.PartyName || s.CustomerName || '').toLowerCase();
        const status = s.status || s.PaymentStatus || s.Status || 'Unpaid';
        
        const matchesSearch = invNo.includes(q) || party.includes(q);
        const matchesStat = stat === '' || status === stat;
        return matchesSearch && matchesStat;
    });

    SGD.paginate('sales', filtered);
}

function openNewSale() {
    document.getElementById('salesListView').classList.add('d-none');
    document.getElementById('createSaleView').classList.remove('d-none');
    document.getElementById('pageTitle').textContent = 'New Sale';
    
    // Setup form
    document.getElementById('saleForm').reset();
    document.getElementById('invoiceNo').value = `SGD_${String(salesData.length+1).padStart(4, '0')}_26-27`;
    
    // Load Customer Dropdown
    const custSelect = document.getElementById('customerId');
    custSelect.innerHTML = '<option value="">-- Search Customer --</option>';
    partiesData.forEach(p => {
        const id = p.id || p.PartyID;
        const name = p.name || p.PartyName || '';
        const phone = p.phone || p.Phone || '';
        custSelect.innerHTML += `<option value="${id}">${name} (${phone})</option>`;
    });

    document.getElementById('invoiceItemsBody').innerHTML = '';
    addItemRow();
    calculateInvoiceTotals();
}

function closeNewSale() {
    document.getElementById('createSaleView').classList.add('d-none');
    document.getElementById('salesListView').classList.remove('d-none');
    document.getElementById('pageTitle').textContent = 'Sales';
}

function selectCustomer(id) {
    const box = document.getElementById('customerDetailsBox');
    if (!id) {
        box.innerHTML = '<span class="text-muted">Customer details will appear here...</span>';
        return;
    }
    const customer = partiesData.find(p => (p.id || p.PartyID) == id);
    if(customer) {
        const name = customer.name || customer.PartyName || '';
        const gstin = customer.gstin || customer.GSTIN || 'N/A';
        const address = customer.address || customer.Address || '';
        const state = customer.state || customer.State || '';
        box.innerHTML = `
            <strong>${name}</strong><br>
            GSTIN: ${gstin}<br>
            Address: ${address}, ${state}
        `;
    }
}

function addItemRow() {
    const tbody = document.getElementById('invoiceItemsBody');
    const rowIdx = tbody.children.length;
    
    let itemOptions = '<option value="">Select Item</option>';
    inventoryItems.forEach(i => {
        const id = i.id || i.ItemID;
        const itemName = i.itemName || i.ItemName || '';
        const stock = i.stock !== undefined ? i.stock : (i.CurrentStock || 0);
        itemOptions += `<option value="${id}">${itemName} (Stock: ${stock})</option>`;
    });

    const tr = document.createElement('tr');
    tr.id = `itemRow_${rowIdx}`;
    tr.innerHTML = `
        <td><select class="form-select form-select-sm" id="item_${rowIdx}" onchange="selectItem(${rowIdx}, this.value)">${itemOptions}</select></td>
        <td><input type="text" class="form-control form-control-sm" id="hsn_${rowIdx}" readonly></td>
        <td><input type="number" class="form-control form-control-sm" id="qty_${rowIdx}" value="1" min="1" oninput="calculateRowTotals(${rowIdx})"></td>
        <td><input type="text" class="form-control form-control-sm" id="unit_${rowIdx}" readonly></td>
        <td><input type="number" class="form-control form-control-sm" id="rate_${rowIdx}" value="0" oninput="calculateRowTotals(${rowIdx})"></td>
        <td><input type="number" class="form-control form-control-sm" id="disc_${rowIdx}" value="0" oninput="calculateRowTotals(${rowIdx})"></td>
        <td><input type="number" class="form-control form-control-sm" id="taxable_${rowIdx}" value="0" readonly></td>
        <td>
            <select class="form-select form-select-sm" id="gst_${rowIdx}" onchange="calculateRowTotals(${rowIdx})">
                <option value="0">0%</option><option value="5">5%</option><option value="12">12%</option><option value="18">18%</option><option value="28">28%</option>
            </select>
        </td>
        <td><input type="number" class="form-control form-control-sm fw-bold" id="total_${rowIdx}" value="0" readonly></td>
        <td class="text-center"><button type="button" class="btn btn-sm btn-outline-danger border-0" onclick="removeItemRow(${rowIdx})"><i class="bi bi-trash"></i></button></td>
    `;
    tbody.appendChild(tr);
}

function removeItemRow(idx) {
    const row = document.getElementById(`itemRow_${idx}`);
    if (row) {
        row.remove();
        calculateInvoiceTotals();
    }
}

function selectItem(idx, itemId) {
    if (!itemId) return;
    const item = inventoryItems.find(i => (i.id || i.ItemID) == itemId);
    if (item) {
        document.getElementById(`hsn_${idx}`).value = item.hsn || item.HSNCode || '';
        document.getElementById(`unit_${idx}`).value = item.unit || item.Unit || '';
        document.getElementById(`rate_${idx}`).value = item.sellingPrice !== undefined ? item.sellingPrice : (item.SellingPrice || 0);
        document.getElementById(`gst_${idx}`).value = item.gst !== undefined ? item.gst : (item.GSTPercent || 0);
        calculateRowTotals(idx);
    }
}

function calculateRowTotals(idx) {
    let qty = parseFloat(document.getElementById(`qty_${idx}`).value) || 0;
    
    // Validate against available stock
    const itemId = document.getElementById(`item_${idx}`).value;
    if (itemId) {
        const item = inventoryItems.find(i => (i.id || i.ItemID) == itemId);
        if (item) {
            const stock = parseFloat(item.stock !== undefined ? item.stock : (item.CurrentStock || 0));
            if (qty > stock) {
                if (typeof SGD !== 'undefined' && SGD.showToast) {
                    SGD.showToast(`Only ${stock} items available in stock!`, 'danger');
                } else {
                    alert(`Only ${stock} items available in stock!`);
                }
                qty = stock > 0 ? stock : 1; // Default to 1 if stock is 0 for some reason but block it still
                if(qty > stock && stock === 0) qty = 0;
                document.getElementById(`qty_${idx}`).value = qty;
            }
        }
    }

    const rate = parseFloat(document.getElementById(`rate_${idx}`).value) || 0;
    const discPct = parseFloat(document.getElementById(`disc_${idx}`).value) || 0;
    const gstPct = parseFloat(document.getElementById(`gst_${idx}`).value) || 0;

    let baseAmount = qty * rate;
    let discountAmt = baseAmount * (discPct / 100);
    let taxable = baseAmount - discountAmt;
    let gstAmt = taxable * (gstPct / 100);
    let total = taxable + gstAmt;

    document.getElementById(`taxable_${idx}`).value = taxable.toFixed(2);
    document.getElementById(`total_${idx}`).value = total.toFixed(2);

    calculateInvoiceTotals();
}

function calculateInvoiceTotals() {
    let subTotal = 0;
    let overallDiscPct = parseFloat(document.getElementById('overallDiscount').value) || 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    
    const tbody = document.getElementById('invoiceItemsBody');
    const rows = tbody.querySelectorAll('tr');

    rows.forEach(row => {
        const idx = row.id.split('_')[1];
        const rowTaxable = parseFloat(document.getElementById(`taxable_${idx}`).value) || 0;
        const gstPct = parseFloat(document.getElementById(`gst_${idx}`).value) || 0;
        
        subTotal += rowTaxable; // before overall discount
        
        let rowDisc = rowTaxable * (overallDiscPct / 100);
        let finalRowTaxable = rowTaxable - rowDisc;
        
        let cgst = finalRowTaxable * ((gstPct/2) / 100);
        let sgst = finalRowTaxable * ((gstPct/2) / 100);
        
        totalTaxable += finalRowTaxable;
        totalCGST += cgst;
        totalSGST += sgst;
    });

    let exactGrandTotal = totalTaxable + totalCGST + totalSGST;
    let roundedGrandTotal = Math.round(exactGrandTotal);
    let roundOff = roundedGrandTotal - exactGrandTotal;
    
    const amountPaid = parseFloat(document.getElementById('amountPaid').value) || 0;
    const balanceDue = roundedGrandTotal - amountPaid;

    document.getElementById('lblSubTotal').textContent = `${subTotal.toFixed(2)}`;
    document.getElementById('lblTaxableAmount').textContent = `${totalTaxable.toFixed(2)}`;
    document.getElementById('lblTotalCGST').textContent = `${totalCGST.toFixed(2)}`;
    document.getElementById('lblTotalSGST').textContent = `${totalSGST.toFixed(2)}`;
    document.getElementById('lblRoundOff').textContent = `${roundOff.toFixed(2)}`;
    document.getElementById('lblGrandTotal').textContent = `${roundedGrandTotal.toFixed(2)}`;
    document.getElementById('lblBalanceDue').textContent = `${balanceDue.toFixed(2)}`;
}

async function saveSale(printAfter = false) {
    // Basic validation
    const customerId = document.getElementById('customerId').value;
    if (!customerId) {
        alert("Please select a customer.");
        return;
    }

    const customer = partiesData.find(p => (p.id || p.PartyID) == customerId);
    if (!customer) return;

    // Collect Items
    const items = [];
    const tbody = document.getElementById('invoiceItemsBody');
    const rows = tbody.querySelectorAll('tr');
    
    rows.forEach(row => {
        const idx = row.id.split('_')[1];
        const selectEl = document.getElementById(`item_${idx}`);
        const itemId = selectEl.value;
        if (!itemId) return;
        
        const invItem = inventoryItems.find(i => (i.id || i.ItemID) == itemId);
        if (!invItem) return;

        items.push({
            ItemID: itemId,
            ItemName: invItem.itemName || invItem.ItemName || '',
            HSNCode: document.getElementById(`hsn_${idx}`).value,
            Quantity: parseFloat(document.getElementById(`qty_${idx}`).value) || 0,
            Unit: document.getElementById(`unit_${idx}`).value,
            Rate: parseFloat(document.getElementById(`rate_${idx}`).value) || 0,
            DiscountPercent: parseFloat(document.getElementById(`disc_${idx}`).value) || 0,
            GSTPercent: parseFloat(document.getElementById(`gst_${idx}`).value) || 0
        });
    });

    if (items.length === 0) {
        alert("Please add at least one item.");
        return;
    }

    // Collect Data
    const saleData = {
        invoiceDate: document.getElementById('invoiceDate').value,
        dueDate: document.getElementById('dueDate').value,
        partyId: customerId,
        partyName: customer.name || customer.PartyName || '',
        partyGSTIN: customer.gstin || customer.GSTIN || '',
        partyStateCode: customer.state || customer.State || '',
        placeOfSupply: document.getElementById('pos') ? document.getElementById('pos').value : '',
        amountPaid: parseFloat(document.getElementById('amountPaid').value) || 0,
        paymentMode: document.getElementById('paymentMode').value,
        transportVehicleNo: document.getElementById('vehicleNo').value,
        notes: document.getElementById('saleNotes') ? document.getElementById('saleNotes').value : '',
        discountAmount: 0, // Backend takes overall discount amount if we use it, but we calculate it differently. Let's pass 0 for now.
        items: items
    };

    try {
        if(typeof SGD !== 'undefined' && SGD.api) {
            SGD.showLoading();
            const res = await SGD.api('createSale', saleData);
            SGD.showToast('Sale created successfully!', 'success');
            if (printAfter && res.data) {
                viewSale(res.data.saleId || res.data.id);
            }
        } else {
            // Mock Save
            saleData.id = Date.now();
            salesData.push(saleData);
            alert("Sale saved (Mock)");
            if (printAfter) {
                viewSale(saleData.id);
            }
        }
        closeNewSale();
        loadSales();
    } catch(e) {
        console.error(e);
        SGD.showToast('Error saving sale', 'danger');
    } finally {
        if(typeof SGD !== 'undefined' && SGD.hideLoading) SGD.hideLoading();
    }
}

async function viewSale(id) {
    currentInvoiceSaleId = id;
    let sale = salesData.find(s => (s.id || s.SaleID) == id);
    if (!sale) return;

    if (typeof SGD !== 'undefined' && SGD.api) {
        try {
            SGD.showLoading();
            const res = await SGD.api('getSaleDetails', { saleId: id });
            if (res && res.data && res.data.sale) {
                // Backend returns { sale, items }
                sale = { ...res.data.sale, items: res.data.items };
            }
        } catch (e) {
            console.error(e);
        } finally {
            SGD.hideLoading();
        }
    }

    // Use InvoiceGenerator if available
    if (typeof InvoiceGenerator !== 'undefined') {
        const generator = new InvoiceGenerator();
        const html = generator.generate(sale, partiesData, inventoryItems);
        document.getElementById('invoiceDocument').innerHTML = html;
        const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('invoicePreviewModal'));
        modal.show();
    } else {
        alert("Invoice Generator not found!");
    }
}

function printCurrentInvoice() {
    const printContents = document.getElementById('invoiceDocument').innerHTML;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload(); // Quick restore of JS state
}

function downloadCurrentPDF() {
    const element = document.getElementById('invoiceDocument');
    const opt = {
      margin:       0.5,
      filename:     `Invoice_${currentInvoiceSaleId}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
}

async function cancelSale(id) {
    if(confirm("Are you sure you want to cancel this sale?")) {
        try {
            if (typeof SGD !== 'undefined' && SGD.api) {
                SGD.showLoading();
                await SGD.api('cancelSale', { saleId: id });
                SGD.showToast('Sale cancelled successfully', 'success');
                loadSales();
            } else {
                const sale = salesData.find(s => (s.id || s.SaleID) == id);
                if(sale) {
                    sale.status = 'Cancelled';
                    renderSalesTable(salesData);
                    updateSalesStats();
                }
            }
        } catch (e) {
            console.error(e);
            SGD.showToast('Error cancelling sale', 'danger');
        } finally {
            if(typeof SGD !== 'undefined' && SGD.hideLoading) SGD.hideLoading();
        }
    }
}
