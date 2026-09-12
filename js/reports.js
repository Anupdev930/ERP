// Reports Logic

let currentReportType = '';

document.addEventListener('DOMContentLoaded', () => {
    flatpickr("#reportDateRange", {
        mode: "range",
        dateFormat: "d-m-Y",
        defaultDate: ["today", "today"]
    });
});

function selectReport(type) {
    currentReportType = type;
    
    // Hide selection, show display
    document.getElementById('reportSelectionArea').style.display = 'none';
    document.getElementById('reportDisplayArea').style.display = 'block';
    
    // Reset secondary container
    document.getElementById('secondaryReportContainer').style.display = 'none';
    
    // Update title and filters based on type
    const titleEl = document.getElementById('currentReportTitle');
    const partyFilter = document.getElementById('partyFilterCol');
    const itemFilter = document.getElementById('itemFilterCol');
    
    partyFilter.style.display = 'none';
    itemFilter.style.display = 'none';
    
    if (type === 'sales') {
        titleEl.innerText = 'Sales Report';
        partyFilter.style.display = 'block';
    } else if (type === 'purchase') {
        titleEl.innerText = 'Purchase Report';
        partyFilter.style.display = 'block';
    } else if (type === 'stock') {
        titleEl.innerText = 'Stock / Inventory Report';
        itemFilter.style.display = 'block';
    } else if (type === 'outstanding') {
        titleEl.innerText = 'Outstanding Report';
    } else if (type === 'gst') {
        titleEl.innerText = 'GST Summary Report';
    } else if (type === 'pnl') {
        titleEl.innerText = 'Profit & Loss Statement';
    }
    
    // Auto generate with default filters
    generateReport();
}

function backToReportSelection() {
    document.getElementById('reportDisplayArea').style.display = 'none';
    document.getElementById('reportSelectionArea').style.display = 'block';
}

async function generateReport() {
    SGD.showLoading();
    try {
        let res;
        if (typeof SGD !== 'undefined' && SGD.api) {
            res = await SGD.api('getReportData', { reportType: currentReportType });
        }
        
        const data = res && res.data ? res.data : {};
        
        if (currentReportType === 'sales') renderSalesReport(data.sales || []);
        else if (currentReportType === 'purchase') renderPurchaseReport(data.purchases || []);
        else if (currentReportType === 'stock') renderStockReport(data.items || []);
        else if (currentReportType === 'outstanding') renderOutstandingReport(data.parties || []);
        else if (currentReportType === 'gst') renderGSTReport(data.sales || [], data.purchases || []);
        else if (currentReportType === 'pnl') renderProfitLoss(data.sales || [], data.purchases || []);
        
    } catch (e) {
        console.error(e);
        SGD.showToast('Error generating report', 'danger');
    } finally {
        SGD.hideLoading();
    }
}

function renderSalesReport(sales) {
    let totalSales = 0, taxCollected = 0, amtReceived = 0, outstanding = 0;
    let rowsHTML = '';
    
    sales.forEach(s => {
        const total = parseFloat(s.TotalAmount || s.total || 0);
        const sub = parseFloat(s.SubTotal || s.subTotal || 0);
        const tax = parseFloat(s.TaxAmount || s.taxAmount || 0);
        const paid = parseFloat(s.AmountPaid || s.paid || 0);
        
        totalSales += total;
        taxCollected += tax;
        amtReceived += paid;
        outstanding += (total - paid);
        
        const date = s.InvoiceDate || s.date ? SGD.formatDate(s.InvoiceDate || s.date) : '-';
        const invNo = s.InvoiceNo || s.invoiceNo || '-';
        const customer = s.PartyName || s.customer || '-';
        
        rowsHTML += `<tr>
            <td>${date}</td>
            <td>${invNo}</td>
            <td>${customer}</td>
            <td class="text-end">${SGD.formatCurrency(sub)}</td>
            <td class="text-end">${SGD.formatCurrency(tax)}</td>
            <td class="text-end">${SGD.formatCurrency(total)}</td>
        </tr>`;
    });
    
    updateReportSummary([
        { title: 'Total Sales', value: SGD.formatCurrency(totalSales), color: 'primary' },
        { title: 'Tax Collected', value: SGD.formatCurrency(taxCollected), color: 'info' },
        { title: 'Amount Received', value: SGD.formatCurrency(amtReceived), color: 'success' },
        { title: 'Outstanding', value: SGD.formatCurrency(outstanding), color: 'warning' }
    ]);
    
    const container = document.getElementById('reportTableContainer');
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-bordered table-sm table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Date</th>
                        <th>Invoice No</th>
                        <th>Customer</th>
                        <th class="text-end">Taxable Value</th>
                        <th class="text-end">Tax</th>
                        <th class="text-end">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML || '<tr><td colspan="6" class="text-center text-muted">No sales found</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function renderPurchaseReport(purchases) {
    let totalPurchases = 0, taxPaid = 0, amtPaid = 0, outstanding = 0;
    let rowsHTML = '';
    
    purchases.forEach(p => {
        const total = parseFloat(p.TotalAmount || p.total || 0);
        const sub = parseFloat(p.SubTotal || p.subTotal || 0);
        const tax = parseFloat(p.TaxAmount || p.taxAmount || 0);
        const paid = parseFloat(p.AmountPaid || p.paid || 0);
        
        totalPurchases += total;
        taxPaid += tax;
        amtPaid += paid;
        outstanding += (total - paid);
        
        const date = p.BillDate || p.date ? SGD.formatDate(p.BillDate || p.date) : '-';
        const billNo = p.BillNo || p.billNo || '-';
        const supplier = p.PartyName || p.supplier || '-';
        
        rowsHTML += `<tr>
            <td>${date}</td>
            <td>${billNo}</td>
            <td>${supplier}</td>
            <td class="text-end">${SGD.formatCurrency(sub)}</td>
            <td class="text-end">${SGD.formatCurrency(tax)}</td>
            <td class="text-end">${SGD.formatCurrency(total)}</td>
        </tr>`;
    });

    updateReportSummary([
        { title: 'Total Purchases', value: SGD.formatCurrency(totalPurchases), color: 'primary' },
        { title: 'Tax Paid', value: SGD.formatCurrency(taxPaid), color: 'info' },
        { title: 'Amount Paid', value: SGD.formatCurrency(amtPaid), color: 'success' },
        { title: 'Outstanding', value: SGD.formatCurrency(outstanding), color: 'danger' }
    ]);
    
    const container = document.getElementById('reportTableContainer');
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-bordered table-sm table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Date</th>
                        <th>Bill No</th>
                        <th>Supplier</th>
                        <th class="text-end">Taxable Value</th>
                        <th class="text-end">Tax</th>
                        <th class="text-end">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML || '<tr><td colspan="6" class="text-center text-muted">No purchases found</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function renderStockReport(items) {
    let totalItems = 0, costValue = 0, sellValue = 0;
    let rowsHTML = '';
    
    items.forEach(i => {
        if (i.Status === 'Inactive' || i.status === 'Inactive') return;
        totalItems++;
        
        const stock = parseFloat(i.CurrentStock || i.stock || 0);
        const cost = parseFloat(i.PurchasePrice || i.purchasePrice || 0);
        const sell = parseFloat(i.SellingPrice || i.sellingPrice || 0);
        
        costValue += (stock * cost);
        sellValue += (stock * sell);
        
        const code = i.ItemID || i.id || '-';
        const name = i.ItemName || i.itemName || '-';
        const cat = i.Category || i.category || '-';
        
        rowsHTML += `<tr>
            <td>${code}</td>
            <td>${name}</td>
            <td>${cat}</td>
            <td class="text-end">${stock}</td>
            <td class="text-end">${SGD.formatCurrency(cost)}</td>
            <td class="text-end">${SGD.formatCurrency(stock * cost)}</td>
        </tr>`;
    });

    updateReportSummary([
        { title: 'Total Active Items', value: totalItems, color: 'primary' },
        { title: 'Stock Value (Cost)', value: SGD.formatCurrency(costValue), color: 'info' },
        { title: 'Stock Value (Selling)', value: SGD.formatCurrency(sellValue), color: 'success' }
    ]);
    
    const container = document.getElementById('reportTableContainer');
    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-bordered table-sm table-hover align-middle">
                <thead class="table-light">
                    <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th class="text-end">Current Stock</th>
                        <th class="text-end">Avg Cost</th>
                        <th class="text-end">Total Value</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHTML || '<tr><td colspan="6" class="text-center text-muted">No items found</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function renderOutstandingReport(parties) {
    let totalRec = 0, totalPay = 0;
    let recHTML = '', payHTML = '';
    
    parties.forEach(p => {
        const bal = parseFloat(p.CurrentBalance || p.balance || 0);
        const type = p.BalanceType || p.balanceType;
        const name = p.PartyName || p.name || '-';
        const pType = p.PartyType || p.type || '-';
        const phone = p.Phone || p.phone || '-';
        
        if (bal > 0) {
            if (type === 'Dr') {
                totalRec += bal;
                recHTML += `<tr><td>${name}</td><td>${pType}</td><td>${phone}</td><td class="text-end">${SGD.formatCurrency(bal)}</td></tr>`;
            } else if (type === 'Cr') {
                totalPay += bal;
                payHTML += `<tr><td>${name}</td><td>${pType}</td><td>${phone}</td><td class="text-end">${SGD.formatCurrency(bal)}</td></tr>`;
            }
        }
    });

    const net = totalRec - totalPay;
    const netText = SGD.formatCurrency(Math.abs(net)) + (net >= 0 ? ' (Dr)' : ' (Cr)');

    updateReportSummary([
        { title: 'Total Receivable', value: SGD.formatCurrency(totalRec), color: 'success' },
        { title: 'Total Payable', value: SGD.formatCurrency(totalPay), color: 'danger' },
        { title: 'Net Position', value: netText, color: 'primary' }
    ]);
    
    const container = document.getElementById('reportTableContainer');
    container.innerHTML = `
        <h5>Receivables (Due from Customers)</h5>
        <div class="table-responsive mb-4">
            <table class="table table-bordered table-sm table-hover align-middle">
                <thead class="table-light"><tr><th>Party Name</th><th>Type</th><th>Contact</th><th class="text-end">Amount Due</th></tr></thead>
                <tbody>${recHTML || '<tr><td colspan="4" class="text-center text-muted">No receivables</td></tr>'}</tbody>
            </table>
        </div>
    `;
    
    const secContainer = document.getElementById('secondaryReportContainer');
    secContainer.style.display = 'block';
    document.getElementById('secondaryReportTitle').innerText = 'Payables (Due to Suppliers)';
    document.getElementById('secondaryReportTableContainer').innerHTML = `
        <div class="table-responsive">
            <table class="table table-bordered table-sm table-hover align-middle">
                <thead class="table-light"><tr><th>Party Name</th><th>Type</th><th>Contact</th><th class="text-end">Amount Payable</th></tr></thead>
                <tbody>${payHTML || '<tr><td colspan="4" class="text-center text-muted">No payables</td></tr>'}</tbody>
            </table>
        </div>
    `;
}

function renderGSTReport(sales, purchases) {
    let salesTaxable = 0, salesCGST = 0, salesSGST = 0, salesIGST = 0;
    let purTaxable = 0, purCGST = 0, purSGST = 0, purIGST = 0;
    
    sales.forEach(s => {
        salesTaxable += parseFloat(s.TaxableAmount || s.taxableAmount || 0);
        salesCGST += parseFloat(s.CGSTAmount || s.cgstAmount || 0);
        salesSGST += parseFloat(s.SGSTAmount || s.sgstAmount || 0);
        salesIGST += parseFloat(s.IGSTAmount || s.igstAmount || 0);
    });
    
    purchases.forEach(p => {
        purTaxable += parseFloat(p.SubTotal || p.subTotal || 0);
        purCGST += parseFloat(p.CGSTAmount || p.cgstAmount || 0);
        purSGST += parseFloat(p.SGSTAmount || p.sgstAmount || 0);
        purIGST += parseFloat(p.IGSTAmount || p.igstAmount || 0);
    });

    updateReportSummary([
        { title: 'Total Sales Taxable', value: SGD.formatCurrency(salesTaxable), color: 'primary' },
        { title: 'Sales Tax (CGST+SGST)', value: SGD.formatCurrency(salesCGST + salesSGST), color: 'info' },
        { title: 'Sales IGST', value: SGD.formatCurrency(salesIGST), color: 'info' },
        { title: 'Total Output GST', value: SGD.formatCurrency(salesCGST + salesSGST + salesIGST), color: 'success' }
    ]);
    
    const container = document.getElementById('reportTableContainer');
    container.innerHTML = `
        <h5>GST Output (Sales)</h5>
        <div class="table-responsive mb-4">
            <table class="table table-bordered table-sm">
                <thead class="table-light"><tr><th>Taxable Amount</th><th>CGST</th><th>SGST</th><th>IGST</th><th>Total Tax</th></tr></thead>
                <tbody><tr>
                    <td>${SGD.formatCurrency(salesTaxable)}</td>
                    <td>${SGD.formatCurrency(salesCGST)}</td>
                    <td>${SGD.formatCurrency(salesSGST)}</td>
                    <td>${SGD.formatCurrency(salesIGST)}</td>
                    <td class="fw-bold">${SGD.formatCurrency(salesCGST + salesSGST + salesIGST)}</td>
                </tr></tbody>
            </table>
        </div>
    `;
    
    const secContainer = document.getElementById('secondaryReportContainer');
    secContainer.style.display = 'block';
    document.getElementById('secondaryReportTitle').innerText = 'GST Input (Purchases)';
    document.getElementById('secondaryReportTableContainer').innerHTML = `
        <div class="table-responsive mb-4">
            <table class="table table-bordered table-sm">
                <thead class="table-light"><tr><th>Taxable Amount</th><th>CGST</th><th>SGST</th><th>IGST</th><th>Total Tax</th></tr></thead>
                <tbody><tr>
                    <td>${SGD.formatCurrency(purTaxable)}</td>
                    <td>${SGD.formatCurrency(purCGST)}</td>
                    <td>${SGD.formatCurrency(purSGST)}</td>
                    <td>${SGD.formatCurrency(purIGST)}</td>
                    <td class="fw-bold">${SGD.formatCurrency(purCGST + purSGST + purIGST)}</td>
                </tr></tbody>
            </table>
        </div>
        <div class="alert alert-info">
            <strong>Net GST Payable:</strong> ${SGD.formatCurrency((salesCGST + salesSGST + salesIGST) - (purCGST + purSGST + purIGST))}
        </div>
    `;
}

function renderProfitLoss(sales, purchases) {
    let revenue = 0, cogs = 0;
    
    sales.forEach(s => { revenue += parseFloat(s.TaxableAmount || s.taxableAmount || 0); });
    purchases.forEach(p => { cogs += parseFloat(p.SubTotal || p.subTotal || 0); });
    
    const grossProfit = revenue - cogs;
    
    updateReportSummary([
        { title: 'Revenue (Taxable Sales)', value: SGD.formatCurrency(revenue), color: 'success' },
        { title: 'Cost of Goods (Purchases)', value: SGD.formatCurrency(cogs), color: 'danger' },
        { title: 'Expenses', value: '₹ 0.00', color: 'warning' },
        { title: 'Net Profit', value: SGD.formatCurrency(grossProfit), color: 'primary' }
    ]);
    
    const container = document.getElementById('reportTableContainer');
    container.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-8">
                <table class="table table-bordered table-sm">
                    <tbody>
                        <tr><td class="fw-bold">Total Sales Revenue</td><td class="text-end text-success fw-bold">${SGD.formatCurrency(revenue)}</td></tr>
                        <tr><td class="fw-bold">Less: Cost of Goods Sold</td><td class="text-end text-danger">${SGD.formatCurrency(cogs)}</td></tr>
                        <tr class="table-light"><td class="fw-bold fs-5">Gross Profit</td><td class="text-end fw-bold fs-5">${SGD.formatCurrency(grossProfit)}</td></tr>
                    </tbody>
                </table>
                <p class="text-muted small text-center mt-3">Note: This is a simplified P&L based purely on purchase and sales data. Expense tracking requires a separate module.</p>
            </div>
        </div>
    `;
}

function updateReportSummary(cards) {
    const colorMap = {
        'primary': 'stat-card-blue',
        'info': 'stat-card-cyan',
        'success': 'stat-card-green',
        'danger': 'stat-card-red',
        'warning': 'stat-card-orange',
        'purple': 'stat-card-purple'
    };
    const iconMap = {
        'primary': 'bi-graph-up',
        'info': 'bi-info-circle',
        'success': 'bi-check-circle',
        'danger': 'bi-exclamation-circle',
        'warning': 'bi-exclamation-triangle',
        'purple': 'bi-box-seam'
    };
    const container = document.getElementById('reportSummaryCards');
    container.innerHTML = '';
    cards.forEach(c => {
        const cardClass = colorMap[c.color] || 'stat-card-blue';
        const iconClass = iconMap[c.color] || 'bi-bar-chart';
        container.innerHTML += `
            <div class="col-md-3 mb-3">
                <div class="stat-card ${cardClass}">
                    <div class="stat-icon-wrapper">
                        <i class="bi ${iconClass}"></i>
                    </div>
                    <div class="stat-details">
                        <div class="stat-value" style="font-size:20px;">${c.value}</div>
                        <div class="stat-title">${c.title}</div>
                    </div>
                </div>
            </div>
        `;
    });
}

function exportToCSV() {
    SGD.showToast('Exporting to CSV...', 'info');
    // Implement CSV generation and download
}

function printReport() {
    window.print();
}
