/**
 * SGD ERP — Comprehensive Reports & Analytics Module
 * Supports 10 Industrial ERP Reports:
 * 1. Sales Report
 * 2. Purchase Report
 * 3. Stock / Inventory Report
 * 4. Outstanding Report (Receivables & Payables)
 * 5. GST Summary Report (Output vs Input GST)
 * 6. Profit & Loss Statement
 * 7. Party Ledger (Statement of Account)
 * 8. Low Stock Alert
 * 9. Day Book (Daily Chronological Summary)
 * 10. HSN Tax Summary (HSN-wise breakdown)
 *
 * Features:
 * - From & To Date Range with interactive date pickers & Quick Range selectors
 * - Live Party & Item search filters
 * - Export to Excel (.xlsx via SheetJS, with fallback to XML .xls)
 * - Export to CSV (with UTF-8 BOM for Excel compatibility)
 * - Industrial Table formatting with right-aligned currency, badges & summary footers
 */

// ── State ──────────────────────────────────────────────────────────────────
let currentReportType = "";
let currentReportData = []; // Flat array of objects for Excel/CSV export
let secondaryReportData = [];

// ── Date Parser & Range Helper ─────────────────────────────────────────────
function parseAnyDate(val) {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val) ? null : val;
  const s = String(val).trim();
  if (!s) return null;

  // DD-MM-YYYY or DD/MM/YYYY or DD.MM.YYYY or DD MM YYYY
  const dmy = s.match(/^(\d{1,2})[-\/\. ](\d{1,2})[-\/\. ](\d{4})/);
  if (dmy) {
    const day = parseInt(dmy[1], 10);
    const month = parseInt(dmy[2], 10) - 1;
    const year = parseInt(dmy[3], 10);
    return new Date(year, month, day);
  }

  // YYYY-MM-DD or YYYY/MM/DD
  const ymd = s.match(/^(\d{4})[-\/\. ](\d{1,2})[-\/\. ](\d{1,2})/);
  if (ymd) {
    const year = parseInt(ymd[1], 10);
    const month = parseInt(ymd[2], 10) - 1;
    const day = parseInt(ymd[3], 10);
    return new Date(year, month, day);
  }

  // Standard date parsing (ISO 8601 etc.)
  const d = new Date(s);
  return isNaN(d) ? null : d;
}

function _inRange(dateVal, fromDate, toDate) {
  if (!fromDate && !toDate) return true;
  const d = parseAnyDate(dateVal);
  if (!d) return true; // Keep record if date is unparseable

  if (fromDate) {
    const start = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate(), 0, 0, 0, 0);
    if (d < start) return false;
  }
  if (toDate) {
    const end = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate(), 23, 59, 59, 999);
    if (d > end) return false;
  }
  return true;
}

// ── Initialization ─────────────────────────────────────────────────────────
window.initReports = function () {
  if (typeof flatpickr !== "undefined") {
    flatpickr("#reportDateFrom", {
      dateFormat: "d-m-Y",
      defaultDate: "today",
      allowInput: true,
    });
    flatpickr("#reportDateTo", {
      dateFormat: "d-m-Y",
      defaultDate: "today",
      allowInput: true,
    });
  }
  // Default range: This Month
  setQuickRange("month");
};

// ── Quick Range Helpers ────────────────────────────────────────────────────
window.setQuickRange = function (range) {
  const fmt = (d) => {
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    return `${dd}-${mm}-${yy}`;
  };

  const today = new Date();
  let from = new Date(today);
  let to = new Date(today);

  if (range === "today") {
    // Both are today
  } else if (range === "week") {
    const day = today.getDay() || 7;
    from.setDate(today.getDate() - day + 1);
  } else if (range === "month") {
    from = new Date(today.getFullYear(), today.getMonth(), 1);
  } else if (range === "quarter") {
    const q = Math.floor(today.getMonth() / 3);
    from = new Date(today.getFullYear(), q * 3, 1);
  } else if (range === "year") {
    from = new Date(today.getFullYear(), 0, 1);
  }

  const fromEl = document.getElementById("reportDateFrom");
  const toEl   = document.getElementById("reportDateTo");

  if (fromEl && fromEl._flatpickr) {
    fromEl._flatpickr.setDate(from);
    toEl._flatpickr.setDate(to);
  } else if (fromEl) {
    fromEl.value = fmt(from);
    if (toEl) toEl.value = fmt(to);
  }
};

// ── Report Configuration ───────────────────────────────────────────────────
const REPORT_CONFIG = {
  sales:       { title: "Sales Report",            subtitle: "Invoices, taxable values, tax collected & outstanding", party: true,  item: false, dateRequired: true },
  purchase:    { title: "Purchase Report",         subtitle: "Bills, taxable values, tax paid & supplier balances",   party: true,  item: false, dateRequired: true },
  stock:       { title: "Stock / Inventory Report",subtitle: "Current inventory valuation, stock units & profit",      party: false, item: true,  dateRequired: false },
  outstanding: { title: "Outstanding Report",      subtitle: "Consolidated Receivables (Customers) & Payables (Suppliers)", party: false, item: false, dateRequired: false },
  gst:         { title: "GST Summary Report",      subtitle: "GSTR-1 Output Tax vs GSTR-3B Input Tax Credit",          party: false, item: false, dateRequired: true },
  pnl:         { title: "Profit & Loss Statement", subtitle: "Revenues, cost of goods sold, gross & net margins",      party: false, item: false, dateRequired: true },
  ledger:      { title: "Party Statement / Ledger",subtitle: "Chronological ledger transactions for any selected party", party: true,  item: false, dateRequired: true },
  lowstock:    { title: "Low Stock Alert Report",  subtitle: "Items below minimum stock threshold needing reorder",   party: false, item: false, dateRequired: false },
  daybook:     { title: "Day Book (Daily Summary)",subtitle: "Chronological daily log of sales, purchases & cash flows", party: false, item: false, dateRequired: true },
  hsn:         { title: "HSN / SAC Tax Summary",   subtitle: "HSN-wise breakdown of sales, taxable values & GST slabs", party: false, item: false, dateRequired: true },
};

window.selectReport = function (type) {
  currentReportType = type;
  const cfg = REPORT_CONFIG[type] || {};

  document.getElementById("reportSelectionArea").style.display = "none";
  document.getElementById("reportDisplayArea").style.display = "block";
  document.getElementById("secondaryReportContainer").style.display = "none";

  document.getElementById("currentReportTitle").textContent = cfg.title || "Report";
  document.getElementById("currentReportSubtitle").textContent = cfg.subtitle || "";

  // Adjust visible filters based on report type
  const partyCol = document.getElementById("partyFilterCol");
  const itemCol  = document.getElementById("itemFilterCol");
  const dateFrom = document.getElementById("dateFromCol");
  const dateTo   = document.getElementById("dateToCol");

  partyCol.style.display = cfg.party ? "" : "none";
  itemCol.style.display  = cfg.item  ? "" : "none";
  dateFrom.style.display = cfg.dateRequired !== false ? "" : "none";
  dateTo.style.display   = cfg.dateRequired !== false ? "" : "none";

  if (cfg.party) _loadPartyDropdown();

  generateReport();
};

async function _loadPartyDropdown() {
  try {
    const sel = document.getElementById("reportParty");
    if (!sel || sel.options.length > 1) return;
    const res = await SGD.api("getParties");
    const parties = (res && res.data) ? res.data : [];
    sel.innerHTML = `<option value="">All Parties</option>` +
      parties.map(p => {
        const n = p.PartyName || p.name || "";
        return `<option value="${n}">${n}</option>`;
      }).join("");
  } catch (e) {
    // Non-blocking
  }
}

window.backToReportSelection = function () {
  document.getElementById("reportDisplayArea").style.display = "none";
  document.getElementById("reportSelectionArea").style.display = "block";
  currentReportData = [];
  secondaryReportData = [];
};

function _getFilters() {
  const fromStr = document.getElementById("reportDateFrom")?.value || "";
  const toStr   = document.getElementById("reportDateTo")?.value   || "";
  const party   = document.getElementById("reportParty")?.value    || "";
  const item    = document.getElementById("reportItem")?.value?.toLowerCase() || "";

  const from = parseAnyDate(fromStr);
  const to   = parseAnyDate(toStr);

  return { from, to, party, item, fromStr, toStr };
}

// ── Main Generate Dispatcher ───────────────────────────────────────────────
window.generateReport = async function () {
  SGD.showLoading();
  try {
    const filters = _getFilters();
    let res = await SGD.api("getReportData", { reportType: currentReportType });
    const data = res && res.data ? res.data : {};

    switch (currentReportType) {
      case "sales":
        renderSalesReport(data.sales || [], filters);
        break;
      case "purchase":
        renderPurchaseReport(data.purchases || [], filters);
        break;
      case "stock":
        renderStockReport(data.items || [], filters);
        break;
      case "outstanding":
        renderOutstandingReport(data.parties || []);
        break;
      case "gst":
        renderGSTReport(data.sales || [], data.purchases || [], filters);
        break;
      case "pnl":
        renderProfitLoss(data.sales || [], data.purchases || [], filters);
        break;
      case "ledger":
        renderLedgerReport(data.sales || [], data.purchases || [], filters);
        break;
      case "lowstock":
        renderLowStockReport(data.items || []);
        break;
      case "daybook":
        renderDayBookReport(data.sales || [], data.purchases || [], filters);
        break;
      case "hsn":
        renderHsnReport(data.sales || [], filters);
        break;
      default:
        renderSalesReport(data.sales || [], filters);
    }
  } catch (e) {
    console.error(e);
    SGD.showToast("Error generating report: " + e.message, "danger");
  } finally {
    SGD.hideLoading();
  }
};

// ── 1. Sales Report ────────────────────────────────────────────────────────
function renderSalesReport(all, filters) {
  const rows = all.filter(s => {
    const d = s.InvoiceDate || s.date || "";
    if (!_inRange(d, filters.from, filters.to)) return false;
    if (filters.party) {
      const name = (s.PartyName || s.customer || "").toLowerCase();
      if (!name.includes(filters.party.toLowerCase())) return false;
    }
    return true;
  });

  let totSales = 0, totSub = 0, totTax = 0, totPaid = 0, totOut = 0;
  const tableRows = rows.map(s => {
    const total = parseFloat(s.TotalAmount || s.total || 0);
    const sub   = parseFloat(s.SubTotal || s.subTotal || s.TaxableAmount || s.taxableAmount || 0);
    const tax   = parseFloat(s.TaxAmount || s.taxAmount || (s.CGSTAmount||0) + (s.SGSTAmount||0) + (s.IGSTAmount||0) || 0);
    const paid  = parseFloat(s.AmountPaid || s.paid || 0);
    const disc  = parseFloat(s.DiscountAmount || s.discountAmount || 0);

    totSales += total; totSub += sub; totTax += tax; totPaid += paid; totOut += (total - paid);

    const status = s.PaymentStatus || s.paymentStatus || "Partial";
    const statusCls = status === "Paid" ? "badge-paid" : status === "Unpaid" ? "badge-unpaid" : "badge-partial";
    const dateFormatted = SGD.formatDate ? SGD.formatDate(s.InvoiceDate || s.date) : (s.InvoiceDate || s.date || "-");

    return {
      _row: `<tr>
        <td>${dateFormatted}</td>
        <td class="fw-bold" style="color:#0d2157">${s.InvoiceNo || s.invoiceNo || "-"}</td>
        <td>${s.PartyName || s.customer || "-"}</td>
        <td class="text-end">${SGD.formatCurrency(sub)}</td>
        <td class="text-end">${disc > 0 ? SGD.formatCurrency(disc) : "-"}</td>
        <td class="text-end">${SGD.formatCurrency(tax)}</td>
        <td class="text-end fw-bold" style="color:#0d2157">${SGD.formatCurrency(total)}</td>
        <td class="text-end text-success">${SGD.formatCurrency(paid)}</td>
        <td class="text-end text-danger">${SGD.formatCurrency(total - paid)}</td>
        <td><span class="erp-badge ${statusCls}">${status}</span></td>
      </tr>`,
      Date: dateFormatted,
      "Invoice No": s.InvoiceNo || s.invoiceNo,
      Customer: s.PartyName || s.customer,
      "Taxable (₹)": sub,
      "Discount (₹)": disc,
      "Tax (₹)": tax,
      "Total Amount (₹)": total,
      "Amount Paid (₹)": paid,
      "Outstanding (₹)": total - paid,
      Status: status,
    };
  });

  currentReportData = tableRows;
  _setRowCount(rows.length);

  updateReportSummary([
    { title: "Total Sales",     value: SGD.formatCurrency(totSales), color: "primary" },
    { title: "Tax Collected",   value: SGD.formatCurrency(totTax),   color: "info"    },
    { title: "Amount Received", value: SGD.formatCurrency(totPaid),  color: "success" },
    { title: "Outstanding",     value: SGD.formatCurrency(totOut),   color: "warning" },
  ]);

  document.getElementById("reportTableTitle").innerHTML = '<i class="bi bi-graph-up-arrow me-2"></i>Sales Report';
  _renderTable(
    ["Date","Invoice No","Customer","Taxable (₹)","Discount (₹)","Tax (₹)","Total (₹)","Paid (₹)","Outstanding (₹)","Status"],
    tableRows.map(r => r._row),
    "reportTableContainer",
    `<tr class="erp-table-footer-row">
      <td colspan="3" class="fw-bold">TOTAL (${rows.length} invoices)</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totSub)}</td>
      <td></td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totTax)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totSales)}</td>
      <td class="text-end fw-bold text-success">${SGD.formatCurrency(totPaid)}</td>
      <td class="text-end fw-bold text-danger">${SGD.formatCurrency(totOut)}</td>
      <td></td>
    </tr>`
  );
}

// ── 2. Purchase Report ─────────────────────────────────────────────────────
function renderPurchaseReport(all, filters) {
  const rows = all.filter(p => {
    const d = p.BillDate || p.date || "";
    if (!_inRange(d, filters.from, filters.to)) return false;
    if (filters.party) {
      const name = (p.PartyName || p.supplier || "").toLowerCase();
      if (!name.includes(filters.party.toLowerCase())) return false;
    }
    return true;
  });

  let totPur = 0, totSub = 0, totTax = 0, totPaid = 0, totOut = 0;
  const tableRows = rows.map(p => {
    const total = parseFloat(p.TotalAmount || p.total || 0);
    const sub   = parseFloat(p.SubTotal || p.subTotal || 0);
    const tax   = parseFloat(p.TaxAmount || p.taxAmount || (p.CGSTAmount||0) + (p.SGSTAmount||0) + (p.IGSTAmount||0) || 0);
    const paid  = parseFloat(p.AmountPaid || p.paid || 0);

    totPur += total; totSub += sub; totTax += tax; totPaid += paid; totOut += (total - paid);

    const status = p.PaymentStatus || p.paymentStatus || "Partial";
    const statusCls = status === "Paid" ? "badge-paid" : status === "Unpaid" ? "badge-unpaid" : "badge-partial";
    const dateFormatted = SGD.formatDate ? SGD.formatDate(p.BillDate || p.date) : (p.BillDate || p.date || "-");

    return {
      _row: `<tr>
        <td>${dateFormatted}</td>
        <td class="fw-bold" style="color:#0d2157">${p.BillNo || p.billNo || "-"}</td>
        <td>${p.PartyName || p.supplier || "-"}</td>
        <td class="text-end">${SGD.formatCurrency(sub)}</td>
        <td class="text-end">${SGD.formatCurrency(tax)}</td>
        <td class="text-end fw-bold" style="color:#0d2157">${SGD.formatCurrency(total)}</td>
        <td class="text-end text-success">${SGD.formatCurrency(paid)}</td>
        <td class="text-end text-danger">${SGD.formatCurrency(total - paid)}</td>
        <td><span class="erp-badge ${statusCls}">${status}</span></td>
      </tr>`,
      Date: dateFormatted,
      "Bill No": p.BillNo || p.billNo,
      Supplier: p.PartyName || p.supplier,
      "Taxable (₹)": sub,
      "Tax (₹)": tax,
      "Total Amount (₹)": total,
      "Amount Paid (₹)": paid,
      "Outstanding (₹)": total - paid,
      Status: status,
    };
  });

  currentReportData = tableRows;
  _setRowCount(rows.length);

  updateReportSummary([
    { title: "Total Purchases", value: SGD.formatCurrency(totPur),  color: "primary" },
    { title: "Tax Paid (ITC)",  value: SGD.formatCurrency(totTax),  color: "info"    },
    { title: "Amount Paid",     value: SGD.formatCurrency(totPaid), color: "success" },
    { title: "Outstanding",     value: SGD.formatCurrency(totOut),  color: "danger"  },
  ]);

  document.getElementById("reportTableTitle").innerHTML = '<i class="bi bi-cart3 me-2"></i>Purchase Report';
  _renderTable(
    ["Date","Bill No","Supplier","Taxable (₹)","Tax (₹)","Total (₹)","Paid (₹)","Outstanding (₹)","Status"],
    tableRows.map(r => r._row),
    "reportTableContainer",
    `<tr class="erp-table-footer-row">
      <td colspan="3" class="fw-bold">TOTAL (${rows.length} bills)</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totSub)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totTax)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totPur)}</td>
      <td class="text-end fw-bold text-success">${SGD.formatCurrency(totPaid)}</td>
      <td class="text-end fw-bold text-danger">${SGD.formatCurrency(totOut)}</td>
      <td></td>
    </tr>`
  );
}

// ── 3. Stock Report ────────────────────────────────────────────────────────
function renderStockReport(all, filters) {
  let filtered = all.filter(i => i.Status !== "Inactive" && i.status !== "Inactive");
  if (filters.item) {
    filtered = filtered.filter(i =>
      (i.ItemName || i.itemName || "").toLowerCase().includes(filters.item) ||
      (i.Category || i.category || "").toLowerCase().includes(filters.item) ||
      (i.ItemID || i.id || "").toLowerCase().includes(filters.item)
    );
  }

  let totItems = 0, costVal = 0, sellVal = 0, totalUnits = 0;
  const tableRows = filtered.map(i => {
    const stock = parseFloat(i.CurrentStock || i.stock || i.currentStock || 0);
    const cost  = parseFloat(i.PurchasePrice || i.purchasePrice || i.costPrice || 0);
    const sell  = parseFloat(i.SellingPrice  || i.sellingPrice  || 0);
    const min   = parseFloat(i.MinStock || i.minStock || 0);

    totItems++;
    totalUnits += stock;
    costVal += (stock * cost);
    sellVal += (stock * sell);

    const isLow = stock <= min;
    return {
      _row: `<tr${isLow ? ' style="background:#fff8f5"' : ""}>
        <td class="fw-bold" style="color:#0d2157">${i.ItemID || i.id || "-"}</td>
        <td class="fw-bold">${i.ItemName || i.itemName || "-"}</td>
        <td>${i.Category || i.category || "-"}</td>
        <td>${i.Unit || i.unit || "PCS"}</td>
        <td class="text-end fw-bold" style="color:${isLow ? "#c62828" : "#0d2157"}">${stock}</td>
        <td class="text-end text-muted">${min}</td>
        <td class="text-end">${SGD.formatCurrency(cost)}</td>
        <td class="text-end fw-bold">${SGD.formatCurrency(stock * cost)}</td>
        <td class="text-end">${SGD.formatCurrency(sell)}</td>
        <td>${isLow ? '<span class="erp-badge badge-unpaid">LOW</span>' : '<span class="erp-badge badge-paid">OK</span>'}</td>
      </tr>`,
      "Item Code": i.ItemID || i.id,
      "Item Name": i.ItemName || i.itemName,
      Category: i.Category || i.category,
      Unit: i.Unit || i.unit,
      "Current Stock": stock,
      "Min Stock": min,
      "Cost Price (₹)": cost,
      "Stock Value (₹)": stock * cost,
      "Selling Price (₹)": sell,
      Status: stock <= min ? "Low" : "OK",
    };
  });

  currentReportData = tableRows;
  _setRowCount(filtered.length);

  updateReportSummary([
    { title: "Total Items",           value: totItems,                      color: "primary" },
    { title: "Total Units in Stock",  value: totalUnits.toLocaleString(),   color: "info"    },
    { title: "Stock Valuation (Cost)",value: SGD.formatCurrency(costVal),  color: "success" },
    { title: "Potential Profit",      value: SGD.formatCurrency(sellVal - costVal), color: "purple" },
  ]);

  document.getElementById("reportTableTitle").innerHTML = '<i class="bi bi-box-seam me-2"></i>Stock Valuation &amp; Inventory Report';
  _renderTable(
    ["Item Code","Item Name","Category","Unit","Current Stock","Min Stock","Cost Price (₹)","Stock Value (₹)","Selling Price (₹)","Status"],
    tableRows.map(r => r._row),
    "reportTableContainer",
    `<tr class="erp-table-footer-row">
      <td colspan="4" class="fw-bold">TOTAL VALUATION</td>
      <td class="text-end fw-bold">${totalUnits}</td>
      <td></td>
      <td></td>
      <td class="text-end fw-bold">${SGD.formatCurrency(costVal)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(sellVal)}</td>
      <td></td>
    </tr>`
  );
}

// ── 4. Outstanding Report ──────────────────────────────────────────────────
function renderOutstandingReport(parties) {
  let recRows = [], payRows = [], totRec = 0, totPay = 0;

  parties.forEach(p => {
    const bal  = parseFloat(p.CurrentBalance || p.balance || p.currentBalance || 0);
    const type = p.BalanceType || p.balanceType;
    const name = p.PartyName || p.name || "-";
    const phone= p.Phone || p.phone || "-";
    const gstin= p.GSTIN || p.gstin || "-";
    const pType= p.PartyType || p.type || "-";

    if (bal <= 0) return;

    if (type === "Dr") {
      totRec += bal;
      recRows.push({
        _row: `<tr>
          <td class="fw-bold" style="color:#0d2157">${name}</td>
          <td><span class="erp-badge badge-primary">${pType}</span></td>
          <td>${gstin}</td>
          <td>${phone}</td>
          <td class="text-end text-success fw-bold">${SGD.formatCurrency(bal)}</td>
        </tr>`,
        "Party Name": name, "Party Type": pType, GSTIN: gstin, Contact: phone, "Amount Due (₹)": bal,
      });
    } else if (type === "Cr") {
      totPay += bal;
      payRows.push({
        _row: `<tr>
          <td class="fw-bold" style="color:#0d2157">${name}</td>
          <td><span class="erp-badge badge-secondary">${pType}</span></td>
          <td>${gstin}</td>
          <td>${phone}</td>
          <td class="text-end text-danger fw-bold">${SGD.formatCurrency(bal)}</td>
        </tr>`,
        "Party Name": name, "Party Type": pType, GSTIN: gstin, Contact: phone, "Amount Payable (₹)": bal,
      });
    }
  });

  const net = totRec - totPay;
  currentReportData = [...recRows, ...payRows];
  _setRowCount(recRows.length + payRows.length);

  updateReportSummary([
    { title: "Total Receivables", value: SGD.formatCurrency(totRec), color: "success" },
    { title: "Total Payables",    value: SGD.formatCurrency(totPay), color: "danger"  },
    { title: "Net Position",     value: SGD.formatCurrency(Math.abs(net)) + (net >= 0 ? " (Dr)" : " (Cr)"), color: "primary" },
  ]);

  document.getElementById("reportTableTitle").innerHTML = '<i class="bi bi-people me-2"></i>Receivables (Due from Customers)';
  _renderTable(
    ["Party Name","Type","GSTIN","Contact","Amount Due (₹)"],
    recRows.map(r => r._row),
    "reportTableContainer",
    `<tr class="erp-table-footer-row"><td colspan="4" class="fw-bold">TOTAL RECEIVABLE</td><td class="text-end fw-bold text-success">${SGD.formatCurrency(totRec)}</td></tr>`
  );

  const sec = document.getElementById("secondaryReportContainer");
  sec.style.display = "block";
  document.getElementById("secondaryReportTitle").innerHTML = '<i class="bi bi-building me-2"></i>Payables (Due to Suppliers)';
  document.getElementById("secondaryRowCount").textContent = payRows.length + " records";
  secondaryReportData = payRows;
  _renderTable(
    ["Party Name","Type","GSTIN","Contact","Amount Payable (₹)"],
    payRows.map(r => r._row),
    "secondaryReportTableContainer",
    `<tr class="erp-table-footer-row"><td colspan="4" class="fw-bold">TOTAL PAYABLE</td><td class="text-end fw-bold text-danger">${SGD.formatCurrency(totPay)}</td></tr>`
  );
}

// ── 5. GST Report ──────────────────────────────────────────────────────────
function renderGSTReport(sales, purchases, filters) {
  const fSales = sales.filter(s => _inRange(s.InvoiceDate || s.date, filters.from, filters.to));
  const fPur   = purchases.filter(p => _inRange(p.BillDate || p.date, filters.from, filters.to));

  let sTax = 0, sCGST = 0, sSGST = 0, sIGST = 0, sSub = 0;
  let pTax = 0, pCGST = 0, pSGST = 0, pIGST = 0, pSub = 0;

  fSales.forEach(s => {
    sSub  += parseFloat(s.TaxableAmount || s.taxableAmount || s.SubTotal || 0);
    sCGST += parseFloat(s.CGSTAmount || s.cgstAmount || 0);
    sSGST += parseFloat(s.SGSTAmount || s.sgstAmount || 0);
    sIGST += parseFloat(s.IGSTAmount || s.igstAmount || 0);
  });

  fPur.forEach(p => {
    pSub  += parseFloat(p.SubTotal || p.subTotal || p.TaxableAmount || 0);
    pCGST += parseFloat(p.CGSTAmount || p.cgstAmount || 0);
    pSGST += parseFloat(p.SGSTAmount || p.sgstAmount || 0);
    pIGST += parseFloat(p.IGSTAmount || p.igstAmount || 0);
  });

  sTax = sCGST + sSGST + sIGST;
  pTax = pCGST + pSGST + pIGST;
  const netGST = sTax - pTax;

  const salesRows = fSales.map(s => {
    const cgst = parseFloat(s.CGSTAmount || s.cgstAmount || 0);
    const sgst = parseFloat(s.SGSTAmount || s.sgstAmount || 0);
    const igst = parseFloat(s.IGSTAmount || s.igstAmount || 0);
    const sub  = parseFloat(s.TaxableAmount || s.taxableAmount || s.SubTotal || 0);
    const dateFormatted = SGD.formatDate ? SGD.formatDate(s.InvoiceDate || s.date) : (s.InvoiceDate || s.date || "-");

    return {
      _row: `<tr>
        <td>${dateFormatted}</td>
        <td class="fw-bold" style="color:#0d2157">${s.InvoiceNo || s.invoiceNo || "-"}</td>
        <td>${s.PartyName || s.customer || "-"}</td>
        <td class="text-end">${SGD.formatCurrency(sub)}</td>
        <td class="text-end">${SGD.formatCurrency(cgst)}</td>
        <td class="text-end">${SGD.formatCurrency(sgst)}</td>
        <td class="text-end">${SGD.formatCurrency(igst)}</td>
        <td class="text-end fw-bold">${SGD.formatCurrency(cgst + sgst + igst)}</td>
      </tr>`,
      Date: dateFormatted, "Invoice No": s.InvoiceNo || s.invoiceNo,
      Party: s.PartyName || s.customer, "Taxable (₹)": sub,
      "CGST (₹)": cgst, "SGST (₹)": sgst, "IGST (₹)": igst, "Total Output Tax (₹)": cgst + sgst + igst,
    };
  });

  currentReportData = salesRows;
  _setRowCount(salesRows.length);

  updateReportSummary([
    { title: "Output GST (Sales)",    value: SGD.formatCurrency(sTax),  color: "primary" },
    { title: "Input Tax Credit (ITC)",value: SGD.formatCurrency(pTax),  color: "info"    },
    { title: "Net GST Payable",       value: SGD.formatCurrency(netGST > 0 ? netGST : 0), color: "danger"  },
    { title: "ITC Carried Forward",   value: SGD.formatCurrency(netGST < 0 ? Math.abs(netGST) : 0), color: "success" },
  ]);

  document.getElementById("reportTableTitle").innerHTML = '<i class="bi bi-file-earmark-ruled me-2"></i>GSTR-1 Output Tax (Sales)';
  _renderTable(
    ["Date","Invoice No","Customer","Taxable (₹)","CGST (₹)","SGST (₹)","IGST (₹)","Total Tax (₹)"],
    salesRows.map(r => r._row),
    "reportTableContainer",
    `<tr class="erp-table-footer-row">
      <td colspan="3" class="fw-bold">TOTAL OUTPUT TAX</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(sSub)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(sCGST)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(sSGST)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(sIGST)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(sTax)}</td>
    </tr>`
  );

  const purchaseRows = fPur.map(p => {
    const cgst = parseFloat(p.CGSTAmount || p.cgstAmount || 0);
    const sgst = parseFloat(p.SGSTAmount || p.sgstAmount || 0);
    const igst = parseFloat(p.IGSTAmount || p.igstAmount || 0);
    const sub  = parseFloat(p.SubTotal || p.subTotal || 0);
    const dateFormatted = SGD.formatDate ? SGD.formatDate(p.BillDate || p.date) : (p.BillDate || p.date || "-");

    return {
      _row: `<tr>
        <td>${dateFormatted}</td>
        <td class="fw-bold" style="color:#0d2157">${p.BillNo || p.billNo || "-"}</td>
        <td>${p.PartyName || p.supplier || "-"}</td>
        <td class="text-end">${SGD.formatCurrency(sub)}</td>
        <td class="text-end">${SGD.formatCurrency(cgst)}</td>
        <td class="text-end">${SGD.formatCurrency(sgst)}</td>
        <td class="text-end">${SGD.formatCurrency(igst)}</td>
        <td class="text-end fw-bold">${SGD.formatCurrency(cgst + sgst + igst)}</td>
      </tr>`,
    };
  });

  secondaryReportData = purchaseRows;
  const sec = document.getElementById("secondaryReportContainer");
  sec.style.display = "block";
  document.getElementById("secondaryReportTitle").innerHTML = '<i class="bi bi-cart-check me-2"></i>GSTR-3B Input Tax Credit (Purchases)';
  document.getElementById("secondaryRowCount").textContent = fPur.length + " records";
  _renderTable(
    ["Date","Bill No","Supplier","Taxable (₹)","CGST (₹)","SGST (₹)","IGST (₹)","Total Tax (₹)"],
    purchaseRows.map(r => r._row),
    "secondaryReportTableContainer",
    `<tr class="erp-table-footer-row">
      <td colspan="3" class="fw-bold">TOTAL INPUT TAX CREDIT</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(pSub)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(pCGST)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(pSGST)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(pIGST)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(pTax)}</td>
    </tr>
    <tr style="background:${netGST >= 0 ? '#fff3e0' : '#e8f5e9'}">
      <td colspan="7" class="fw-bold">${netGST >= 0 ? "Net GST Cash Liability to Pay" : "Excess Input Tax Credit Available (Refund)"}</td>
      <td class="text-end fw-bold fs-6" style="color:${netGST >= 0 ? '#c62828' : '#2e7d32'}">${SGD.formatCurrency(Math.abs(netGST))}</td>
    </tr>`
  );
}

// ── 6. Profit & Loss ───────────────────────────────────────────────────────
function renderProfitLoss(sales, purchases, filters) {
  const fSales = sales.filter(s => _inRange(s.InvoiceDate || s.date, filters.from, filters.to));
  const fPur   = purchases.filter(p => _inRange(p.BillDate || p.date, filters.from, filters.to));

  let revenue = 0, cogs = 0, totalTax = 0;
  fSales.forEach(s => {
    revenue  += parseFloat(s.TaxableAmount || s.taxableAmount || s.SubTotal || 0);
    totalTax += parseFloat(s.TaxAmount || (s.CGSTAmount||0) + (s.SGSTAmount||0) + (s.IGSTAmount||0) || 0);
  });
  fPur.forEach(p => { cogs += parseFloat(p.SubTotal || p.subTotal || 0); });

  const gross = revenue - cogs;
  const margin = revenue > 0 ? ((gross / revenue) * 100).toFixed(1) : "0.0";

  currentReportData = [
    { LineItem: "Gross Sales Revenue", Amount: revenue },
    { LineItem: "Cost of Goods Sold (Purchases)", Amount: cogs },
    { LineItem: "Gross Profit", Amount: gross },
    { LineItem: "Tax Collected (GST)", Amount: totalTax },
    { LineItem: "Net Operating Profit", Amount: gross },
  ];
  _setRowCount(fSales.length + fPur.length);

  updateReportSummary([
    { title: "Revenue (Sales)",    value: SGD.formatCurrency(revenue), color: "success" },
    { title: "Cost of Goods",      value: SGD.formatCurrency(cogs),    color: "danger"  },
    { title: "Gross Profit",       value: SGD.formatCurrency(gross),   color: gross >= 0 ? "primary" : "warning" },
    { title: "Gross Margin",       value: margin + "%",                 color: "info"    },
  ]);

  document.getElementById("reportTableTitle").innerHTML = '<i class="bi bi-currency-rupee me-2"></i>Profit &amp; Loss Statement';
  const container = document.getElementById("reportTableContainer");
  container.innerHTML = `
    <div class="row justify-content-center py-4">
      <div class="col-md-8">
        <table class="erp-table">
          <thead><tr>
            <th colspan="2" style="text-align:center;font-size:14px;letter-spacing:1px">
              STATEMENT OF PROFIT &amp; LOSS
              <div style="font-size:11px;font-weight:400;opacity:.85">${filters.fromStr || "Beginning"} to ${filters.toStr || "Today"}</div>
            </th>
          </tr></thead>
          <tbody>
            <tr><td class="fw-bold ps-4">Gross Sales Revenue (Taxable)</td><td class="text-end pe-4 fw-bold text-success">${SGD.formatCurrency(revenue)}</td></tr>
            <tr style="background:#f7f9ff"><td class="ps-4"><i class="bi bi-dash me-1 text-danger"></i> Cost of Goods Sold (Purchase Value)</td><td class="text-end pe-4 text-danger">(${SGD.formatCurrency(cogs)})</td></tr>
            <tr style="border-top:2px solid #1565c0"><td class="fw-bold ps-4 py-3">GROSS PROFIT</td><td class="text-end pe-4 fw-bold py-3 fs-6" style="color:${gross>=0?'#2e7d32':'#c62828'}">${SGD.formatCurrency(gross)}</td></tr>
            <tr style="background:#f7f9ff"><td class="ps-4 text-muted">GST Collected on Sales</td><td class="text-end pe-4 text-muted">${SGD.formatCurrency(totalTax)}</td></tr>
            <tr><td class="ps-4 text-muted">Operating Expenses (Admin &amp; Logistics)</td><td class="text-end pe-4 text-muted">₹ 0.00</td></tr>
            <tr style="border-top:2px solid #1565c0;background:linear-gradient(90deg,#f0f4ff,#fff)">
              <td class="fw-bold ps-4 py-3">NET PROFIT / (LOSS)</td>
              <td class="text-end pe-4 fw-bold py-3 fs-5" style="color:${gross>=0?'#2e7d32':'#c62828'}">${SGD.formatCurrency(gross)}</td>
            </tr>
          </tbody>
        </table>
        <p class="text-muted small text-center mt-3">Gross Margin: <strong>${margin}%</strong> | Auto-calculated from recorded sales and purchase bills.</p>
      </div>
    </div>`;
}

// ── 7. Party Ledger ────────────────────────────────────────────────────────
function renderLedgerReport(sales, purchases, filters) {
  const partyFilter = filters.party;
  if (!partyFilter) {
    document.getElementById("reportTableContainer").innerHTML = `
      <div class="text-center py-5 text-warning">
        <i class="bi bi-exclamation-triangle" style="font-size:36px"></i>
        <p class="mt-2 fw-bold">Please select a party from the dropdown above to view their statement.</p>
      </div>`;
    currentReportData = [];
    _setRowCount(0);
    return;
  }

  const allTx = [];

  sales.filter(s => {
    const n = (s.PartyName || s.customer || "").toLowerCase();
    return n === partyFilter.toLowerCase() && _inRange(s.InvoiceDate || s.date, filters.from, filters.to);
  }).forEach(s => {
    const total = parseFloat(s.TotalAmount || s.total || 0);
    const paid  = parseFloat(s.AmountPaid || s.paid || 0);
    allTx.push({
      date: s.InvoiceDate || s.date,
      ref: s.InvoiceNo || s.invoiceNo || "-",
      type: "Sale Invoice",
      debit: total,
      credit: paid,
    });
  });

  purchases.filter(p => {
    const n = (p.PartyName || p.supplier || "").toLowerCase();
    return n === partyFilter.toLowerCase() && _inRange(p.BillDate || p.date, filters.from, filters.to);
  }).forEach(p => {
    const total = parseFloat(p.TotalAmount || p.total || 0);
    const paid  = parseFloat(p.AmountPaid || p.paid || 0);
    allTx.push({
      date: p.BillDate || p.date,
      ref: p.BillNo || p.billNo || "-",
      type: "Purchase Bill",
      debit: paid,
      credit: total,
    });
  });

  allTx.sort((a, b) => (parseAnyDate(a.date) || 0) - (parseAnyDate(b.date) || 0));

  let runningBalance = 0;
  const tableRows = allTx.map(tx => {
    runningBalance += (tx.debit - tx.credit);
    const balStyle = runningBalance >= 0 ? "color:#2e7d32" : "color:#c62828";
    const typeBadge = tx.type === "Sale Invoice"
      ? '<span class="erp-badge badge-paid">Sale</span>'
      : '<span class="erp-badge badge-primary">Purchase</span>';
    const dateFormatted = SGD.formatDate ? SGD.formatDate(tx.date) : tx.date;

    return {
      _row: `<tr>
        <td>${dateFormatted}</td>
        <td class="fw-bold" style="color:#0d2157">${tx.ref}</td>
        <td>${typeBadge}</td>
        <td class="text-end text-success">${tx.debit > 0 ? SGD.formatCurrency(tx.debit) : "-"}</td>
        <td class="text-end text-danger">${tx.credit > 0 ? SGD.formatCurrency(tx.credit) : "-"}</td>
        <td class="text-end fw-bold" style="${balStyle}">${SGD.formatCurrency(Math.abs(runningBalance))} ${runningBalance >= 0 ? "Dr" : "Cr"}</td>
      </tr>`,
      Date: dateFormatted,
      "Voucher Ref": tx.ref,
      Type: tx.type,
      "Debit / Receivable (₹)": tx.debit,
      "Credit / Paid (₹)": tx.credit,
      "Balance (₹)": runningBalance,
      Side: runningBalance >= 0 ? "Dr" : "Cr",
    };
  });

  currentReportData = tableRows;
  _setRowCount(allTx.length);

  updateReportSummary([
    { title: "Party Name",     value: partyFilter,                                   color: "primary" },
    { title: "Transactions",   value: allTx.length,                                  color: "info"    },
    { title: "Closing Balance",value: SGD.formatCurrency(Math.abs(runningBalance)) + (runningBalance >= 0 ? " Dr" : " Cr"), color: runningBalance >= 0 ? "success" : "danger" },
  ]);

  document.getElementById("reportTableTitle").innerHTML = `<i class="bi bi-journal-text me-2"></i>Account Statement — ${partyFilter}`;
  _renderTable(
    ["Date","Reference","Type","Debit (₹)","Credit (₹)","Running Balance"],
    tableRows.map(r => r._row),
    "reportTableContainer",
    `<tr class="erp-table-footer-row">
      <td colspan="3" class="fw-bold">CLOSING BALANCE</td>
      <td class="text-end fw-bold text-success">${SGD.formatCurrency(allTx.reduce((s,t)=>s+t.debit,0))}</td>
      <td class="text-end fw-bold text-danger">${SGD.formatCurrency(allTx.reduce((s,t)=>s+t.credit,0))}</td>
      <td class="text-end fw-bold fs-6" style="${runningBalance >= 0 ? 'color:#2e7d32' : 'color:#c62828'}">${SGD.formatCurrency(Math.abs(runningBalance))} ${runningBalance >= 0 ? "Dr" : "Cr"}</td>
    </tr>`
  );
}

// ── 8. Low Stock Alert ─────────────────────────────────────────────────────
function renderLowStockReport(all) {
  const low = all.filter(i => {
    if (i.Status === "Inactive" || i.status === "Inactive") return false;
    const stock = parseFloat(i.CurrentStock || i.currentStock || i.stock || 0);
    const min   = parseFloat(i.MinStock    || i.minStock    || 0);
    return stock <= min;
  });

  const tableRows = low.map(i => {
    const stock = parseFloat(i.CurrentStock || i.currentStock || i.stock || 0);
    const min   = parseFloat(i.MinStock    || i.minStock    || 0);
    const need  = Math.max(0, min - stock);
    const cost  = parseFloat(i.PurchasePrice || i.purchasePrice || 0);

    return {
      _row: `<tr style="background:#fff8f5">
        <td class="fw-bold" style="color:#0d2157">${i.ItemID || i.id || "-"}</td>
        <td class="fw-bold">${i.ItemName || i.itemName || "-"}</td>
        <td>${i.Category || i.category || "-"}</td>
        <td>${i.Unit || i.unit || "PCS"}</td>
        <td class="text-end text-danger fw-bold fs-6">${stock}</td>
        <td class="text-end text-muted">${min}</td>
        <td class="text-end fw-bold" style="color:#e65100">${need}</td>
        <td class="text-end">${SGD.formatCurrency(cost)}</td>
        <td class="text-end fw-bold">${SGD.formatCurrency(need * cost)}</td>
        <td><span class="erp-badge badge-unpaid">REORDER</span></td>
      </tr>`,
      "Item Code": i.ItemID || i.id,
      "Item Name": i.ItemName || i.itemName,
      Category: i.Category || i.category,
      Unit: i.Unit || i.unit,
      "Current Stock": stock,
      "Min Stock": min,
      "Units Needed": need,
      "Cost Price (₹)": cost,
      "Est. Reorder Cost (₹)": need * cost,
      Status: "Reorder Required",
    };
  });

  currentReportData = tableRows;
  _setRowCount(low.length);

  const totalReorderVal = tableRows.reduce((s, r) => s + (r["Est. Reorder Cost (₹)"] || 0), 0);

  updateReportSummary([
    { title: "Low Stock Items",     value: low.length,                          color: "danger"  },
    { title: "Completely Out of Stock", value: tableRows.filter(r => r["Current Stock"] === 0).length, color: "warning" },
    { title: "Est. Reorder Capital", value: SGD.formatCurrency(totalReorderVal), color: "primary" },
  ]);

  document.getElementById("reportTableTitle").innerHTML = '<i class="bi bi-exclamation-triangle me-2"></i>Low Stock &amp; Reorder List';
  _renderTable(
    ["Item Code","Item Name","Category","Unit","Current Stock","Min Stock","Qty Needed","Cost Price (₹)","Reorder Value (₹)","Action"],
    tableRows.map(r => r._row),
    "reportTableContainer",
    `<tr class="erp-table-footer-row">
      <td colspan="6" class="fw-bold">TOTAL ESTIMATED REORDER INVESTMENT</td>
      <td class="text-end fw-bold" style="color:#e65100">${tableRows.reduce((s,r)=>s+(r["Units Needed"]||0),0)}</td>
      <td></td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totalReorderVal)}</td>
      <td></td>
    </tr>`
  );
}

// ── 9. Day Book (Daily Chronological Summary) ──────────────────────────────
function renderDayBookReport(sales, purchases, filters) {
  const events = [];

  sales.filter(s => _inRange(s.InvoiceDate || s.date, filters.from, filters.to)).forEach(s => {
    const total = parseFloat(s.TotalAmount || s.total || 0);
    const paid  = parseFloat(s.AmountPaid || s.paid || 0);
    events.push({
      date: s.InvoiceDate || s.date,
      voucher: s.InvoiceNo || s.invoiceNo || "-",
      type: "Sale",
      party: s.PartyName || s.customer || "-",
      inflow: paid,
      billed: total,
    });
  });

  purchases.filter(p => _inRange(p.BillDate || p.date, filters.from, filters.to)).forEach(p => {
    const total = parseFloat(p.TotalAmount || p.total || 0);
    const paid  = parseFloat(p.AmountPaid || p.paid || 0);
    events.push({
      date: p.BillDate || p.date,
      voucher: p.BillNo || p.billNo || "-",
      type: "Purchase",
      party: p.PartyName || p.supplier || "-",
      outflow: paid,
      billed: total,
    });
  });

  events.sort((a, b) => (parseAnyDate(a.date) || 0) - (parseAnyDate(b.date) || 0));

  let totBilledSales = 0, totBilledPur = 0, totIn = 0, totOut = 0;
  const tableRows = events.map(e => {
    const isSale = e.type === "Sale";
    const dateFormatted = SGD.formatDate ? SGD.formatDate(e.date) : e.date;
    const typeBadge = isSale
      ? '<span class="erp-badge badge-paid">Sale</span>'
      : '<span class="erp-badge badge-primary">Purchase</span>';

    if (isSale) {
      totBilledSales += e.billed;
      totIn += (e.inflow || 0);
    } else {
      totBilledPur += e.billed;
      totOut += (e.outflow || 0);
    }

    return {
      _row: `<tr>
        <td>${dateFormatted}</td>
        <td class="fw-bold" style="color:#0d2157">${e.voucher}</td>
        <td>${typeBadge}</td>
        <td>${e.party}</td>
        <td class="text-end fw-bold">${SGD.formatCurrency(e.billed)}</td>
        <td class="text-end text-success">${e.inflow ? SGD.formatCurrency(e.inflow) : "-"}</td>
        <td class="text-end text-danger">${e.outflow ? SGD.formatCurrency(e.outflow) : "-"}</td>
      </tr>`,
      Date: dateFormatted,
      "Voucher No": e.voucher,
      Type: e.type,
      Party: e.party,
      "Billed Amount (₹)": e.billed,
      "Cash Inflow (₹)": e.inflow || 0,
      "Cash Outflow (₹)": e.outflow || 0,
    };
  });

  currentReportData = tableRows;
  _setRowCount(events.length);

  const netCashFlow = totIn - totOut;
  updateReportSummary([
    { title: "Total Sales Invoiced",    value: SGD.formatCurrency(totBilledSales), color: "primary" },
    { title: "Purchases Incurred",     value: SGD.formatCurrency(totBilledPur),   color: "danger"  },
    { title: "Cash Collected Inflow",  value: SGD.formatCurrency(totIn),          color: "success" },
    { title: "Net Cash In Hand Flow",  value: SGD.formatCurrency(netCashFlow),    color: netCashFlow >= 0 ? "success" : "danger" },
  ]);

  document.getElementById("reportTableTitle").innerHTML = '<i class="bi bi-calendar2-week me-2"></i>Day Book — Chronological Journal';
  _renderTable(
    ["Date","Voucher No","Type","Party Name","Billed Amount (₹)","Cash Inflow (₹)","Cash Outflow (₹)"],
    tableRows.map(r => r._row),
    "reportTableContainer",
    `<tr class="erp-table-footer-row">
      <td colspan="4" class="fw-bold">DAY BOOK TOTALS (${events.length} entries)</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totBilledSales + totBilledPur)}</td>
      <td class="text-end fw-bold text-success">${SGD.formatCurrency(totIn)}</td>
      <td class="text-end fw-bold text-danger">${SGD.formatCurrency(totOut)}</td>
    </tr>`
  );
}

// ── 10. HSN Tax Summary Report ─────────────────────────────────────────────
function renderHsnReport(sales, filters) {
  const fSales = sales.filter(s => _inRange(s.InvoiceDate || s.date, filters.from, filters.to));

  // Map of HSN codes
  const hsnMap = {};

  fSales.forEach(s => {
    // If sale has line items
    if (Array.isArray(s.items) && s.items.length) {
      s.items.forEach(it => {
        const hsn = it.hsn || it.HSNCode || "Unclassified";
        if (!hsnMap[hsn]) {
          hsnMap[hsn] = { hsn, desc: it.desc || it.itemName || "-", qty: 0, unit: it.unit || "PCS", taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
        }
        const qty  = parseFloat(it.qty || it.Quantity || 0);
        const taxVal = parseFloat(it.taxable || it.taxableValue || it.TaxableValue || 0);
        const cgst   = parseFloat(it.cgst || it.cgstAmount || 0);
        const sgst   = parseFloat(it.sgst || it.sgstAmount || 0);
        const igst   = parseFloat(it.igst || it.igstAmount || 0);
        const tot    = parseFloat(it.total || it.totalAmount || 0);

        hsnMap[hsn].qty     += qty;
        hsnMap[hsn].taxable += taxVal;
        hsnMap[hsn].cgst    += cgst;
        hsnMap[hsn].sgst    += sgst;
        hsnMap[hsn].igst    += igst;
        hsnMap[hsn].total   += tot;
      });
    } else {
      // Invoice level fallback
      const hsn = "3925 / 4814";
      if (!hsnMap[hsn]) {
        hsnMap[hsn] = { hsn, desc: "Interior & Wallpaper", qty: 0, unit: "LOT", taxable: 0, cgst: 0, sgst: 0, igst: 0, total: 0 };
      }
      const taxVal = parseFloat(s.TaxableAmount || s.taxableAmount || s.SubTotal || 0);
      const cgst   = parseFloat(s.CGSTAmount || s.cgstAmount || 0);
      const sgst   = parseFloat(s.SGSTAmount || s.sgstAmount || 0);
      const igst   = parseFloat(s.IGSTAmount || s.igstAmount || 0);
      const tot    = parseFloat(s.TotalAmount || s.total || 0);

      hsnMap[hsn].qty     += 1;
      hsnMap[hsn].taxable += taxVal;
      hsnMap[hsn].cgst    += cgst;
      hsnMap[hsn].sgst    += sgst;
      hsnMap[hsn].igst    += igst;
      hsnMap[hsn].total   += tot;
    }
  });

  const hsnList = Object.values(hsnMap);
  let totTaxable = 0, totCgst = 0, totSgst = 0, totIgst = 0, totVal = 0;

  const tableRows = hsnList.map(h => {
    totTaxable += h.taxable; totCgst += h.cgst; totSgst += h.sgst; totIgst += h.igst; totVal += h.total;
    const totTax = h.cgst + h.sgst + h.igst;

    return {
      _row: `<tr>
        <td class="fw-bold" style="color:#0d2157">${h.hsn}</td>
        <td>${h.desc}</td>
        <td class="text-end">${h.qty} ${h.unit}</td>
        <td class="text-end fw-bold">${SGD.formatCurrency(h.taxable)}</td>
        <td class="text-end">${SGD.formatCurrency(h.cgst)}</td>
        <td class="text-end">${SGD.formatCurrency(h.sgst)}</td>
        <td class="text-end">${SGD.formatCurrency(h.igst)}</td>
        <td class="text-end fw-bold">${SGD.formatCurrency(totTax)}</td>
        <td class="text-end fw-bold" style="color:#0d2157">${SGD.formatCurrency(h.total)}</td>
      </tr>`,
      "HSN / SAC": h.hsn,
      Description: h.desc,
      Quantity: `${h.qty} ${h.unit}`,
      "Taxable (₹)": h.taxable,
      "CGST (₹)": h.cgst,
      "SGST (₹)": h.sgst,
      "IGST (₹)": h.igst,
      "Total Tax (₹)": totTax,
      "Total Invoiced (₹)": h.total,
    };
  });

  currentReportData = tableRows;
  _setRowCount(hsnList.length);

  updateReportSummary([
    { title: "HSN / SAC Slabs",    value: hsnList.length,                           color: "primary" },
    { title: "Total Taxable Value",value: SGD.formatCurrency(totTaxable),           color: "info"    },
    { title: "Total Tax Component",value: SGD.formatCurrency(totCgst + totSgst + totIgst), color: "warning" },
    { title: "Total Invoice Value",value: SGD.formatCurrency(totVal),               color: "success" },
  ]);

  document.getElementById("reportTableTitle").innerHTML = '<i class="bi bi-tags me-2"></i>HSN-wise GST Tax Summary';
  _renderTable(
    ["HSN / SAC","Description","Quantity","Taxable (₹)","CGST (₹)","SGST (₹)","IGST (₹)","Total Tax (₹)","Total (₹)"],
    tableRows.map(r => r._row),
    "reportTableContainer",
    `<tr class="erp-table-footer-row">
      <td colspan="3" class="fw-bold">TOTAL HSN BREAKDOWN</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totTaxable)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totCgst)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totSgst)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totIgst)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totCgst + totSgst + totIgst)}</td>
      <td class="text-end fw-bold">${SGD.formatCurrency(totVal)}</td>
    </tr>`
  );
}

// ── Shared Table Renderer (Desktop Table + Mobile Cards with "Show Details") ─
function _renderTable(headers, rowsHTML, containerId, footerRow = "") {
  const container = document.getElementById(containerId);
  if (!container) return;

  if (!rowsHTML || !rowsHTML.length) {
    container.innerHTML = `
      <div class="text-center py-5 text-muted bg-white rounded-3 shadow-sm p-4">
        <i class="bi bi-inbox" style="font-size:36px;opacity:.3"></i>
        <p class="mt-2 mb-0 fw-medium">No records found for the selected date range and filters.</p>
      </div>`;
    return;
  }

  // 1. Desktop Table View (Hidden on mobile)
  const theads = headers.map(h => {
    const isNum = h.includes("(₹)") || h === "Total" || h === "Balance" || h.includes("Stock") || h.includes("Needed") || h.includes("Quantity");
    return `<th style="${isNum ? 'text-align:right;' : ''}">${h}</th>`;
  }).join("");

  const desktopHtml = `
    <div class="table-responsive d-none d-md-block">
      <table class="erp-table" id="reportDataTable_${containerId}">
        <thead><tr>${theads}</tr></thead>
        <tbody>
          ${rowsHTML.join("")}
        </tbody>
        ${footerRow ? `<tfoot>${footerRow}</tfoot>` : ""}
      </table>
    </div>`;

  // 2. Mobile Native Card View (Hidden on desktop)
  let mobileHtml = "";
  if (Array.isArray(currentReportData) && currentReportData.length > 0) {
    const cards = currentReportData.map((item, idx) => {
      // Find key summary fields
      const title = item["Invoice No"] || item["Bill No"] || item["Item Name"] || item["Party Name"] || item["Particulars"] || item["Component"] || item["HSN / SAC"] || item["Ref / Voucher"] || item["Ref No"] || (item[headers[0]] && item[headers[0]] !== "-" ? item[headers[0]] : `Record #${idx + 1}`);
      const subtitle = item["Date"] || item["Time / Date"] || item["Customer"] || item["Supplier"] || item["Category"] || item["Type"] || "";
      
      let amountVal = "";
      if (item["Total (₹)"] !== undefined) amountVal = SGD.formatCurrency(item["Total (₹)"]);
      else if (item["Total Amount (₹)"] !== undefined) amountVal = SGD.formatCurrency(item["Total Amount (₹)"]);
      else if (item["Balance (₹)"] !== undefined) amountVal = SGD.formatCurrency(item["Balance (₹)"]);
      else if (item["Amount (₹)"] !== undefined) amountVal = SGD.formatCurrency(item["Amount (₹)"]);
      else if (item["Receivable (₹)"] !== undefined && parseFloat(item["Receivable (₹)"]) > 0) amountVal = "Rec: " + SGD.formatCurrency(item["Receivable (₹)"]);
      else if (item["Payable (₹)"] !== undefined && parseFloat(item["Payable (₹)"]) > 0) amountVal = "Pay: " + SGD.formatCurrency(item["Payable (₹)"]);
      else if (item["Current Stock"] !== undefined) amountVal = "Stock: " + item["Current Stock"] + (item["Unit"] ? " " + item["Unit"] : "");
      else if (item["Total Tax (₹)"] !== undefined) amountVal = "Tax: " + SGD.formatCurrency(item["Total Tax (₹)"]);

      // Status badge
      const status = item["Status"] || "";
      let statusBadge = "";
      if (status) {
        const sLower = String(status).toLowerCase();
        let bg = "bg-warning text-dark";
        if (sLower === "paid" || sLower === "ok" || sLower === "active") bg = "bg-success";
        else if (sLower === "unpaid" || sLower === "low" || sLower === "inactive") bg = "bg-danger";
        statusBadge = `<span class="badge ${bg} ms-1" style="font-size:10px;">${status}</span>`;
      }

      // Collect all detailed fields for collapsible section
      const details = [];
      for (const [k, v] of Object.entries(item)) {
        if (k === "_row" || k === "Status") continue;
        if (v === undefined || v === null || v === "") continue;

        let displayVal = v;
        if (k.includes("(₹)") && typeof v === "number") {
          displayVal = SGD.formatCurrency(v);
        }
        details.push(`
          <div class="d-flex justify-content-between py-1 border-bottom border-light">
            <span class="text-muted small">${k}</span>
            <span class="fw-semibold text-end small">${displayVal}</span>
          </div>
        `);
      }

      return `
        <div class="mobile-report-card">
          <div class="d-flex justify-content-between align-items-start mb-1">
            <div class="mobile-report-title me-2">${title}</div>
            <div class="text-end">
              ${amountVal ? `<div class="mobile-report-amount">${amountVal}</div>` : ""}
              ${statusBadge}
            </div>
          </div>
          ${subtitle ? `<div class="mobile-report-subtitle mb-2"><i class="bi bi-tag me-1"></i>${subtitle}</div>` : ""}
          <button type="button" class="btn btn-sm btn-light border w-100 text-muted d-flex justify-content-between align-items-center py-1 px-2 mt-2 mobile-card-toggle" onclick="SGD.toggleMobileDetails(this)">
            <span><i class="bi bi-chevron-down me-1"></i><span class="btn-text">Show Details</span></span>
            <small class="badge bg-secondary bg-opacity-10 text-secondary">${details.length} fields</small>
          </button>
          <div class="mobile-card-details mt-2 pt-2 border-top" style="display:none;">
            ${details.join("")}
          </div>
        </div>
      `;
    }).join("");

    mobileHtml = `
      <div class="mobile-reports-cards d-md-none">
        <div class="d-flex justify-content-between align-items-center mb-2 px-1">
          <span class="text-muted small fw-semibold"><i class="bi bi-card-list me-1"></i>${currentReportData.length} records</span>
          <button type="button" class="btn btn-sm btn-link text-decoration-none p-0 fw-semibold" style="font-size:12px;" onclick="SGD.toggleAllMobileDetails(this)">
            <i class="bi bi-arrows-expand me-1"></i><span class="expand-text">Expand All</span>
          </button>
        </div>
        ${cards}
      </div>
    `;
  }

  container.innerHTML = desktopHtml + mobileHtml;
}

function _setRowCount(n) {
  const el = document.getElementById("reportRowCount");
  if (el) el.textContent = `${n} records`;
}

function updateReportSummary(cards) {
  const colorMap = {
    primary: "stat-card-blue",
    info:    "stat-card-cyan",
    success: "stat-card-green",
    danger:  "stat-card-red",
    warning: "stat-card-orange",
    purple:  "stat-card-purple",
  };
  const iconMap = {
    primary: "bi-graph-up-arrow",
    info:    "bi-info-circle",
    success: "bi-check-circle",
    danger:  "bi-exclamation-circle",
    warning: "bi-exclamation-triangle",
    purple:  "bi-box-seam",
  };
  const container = document.getElementById("reportSummaryCards");
  if (!container) return;

  const colW = cards.length <= 3 ? "col-md-4" : "col-md-3";
  container.innerHTML = cards.map(c => `
    <div class="${colW} col-sm-6">
      <div class="stat-card ${colorMap[c.color] || "stat-card-blue"}">
        <div class="stat-icon-wrapper"><i class="bi ${iconMap[c.color] || "bi-bar-chart"}"></i></div>
        <div class="stat-details">
          <div class="stat-value" style="font-size:19px">${c.value}</div>
          <div class="stat-title">${c.title}</div>
        </div>
      </div>
    </div>`).join("");
}

// ── Export to Excel (.xlsx / .xls) ─────────────────────────────────────────
window.exportToExcel = function () {
  if (!currentReportData || !currentReportData.length) {
    SGD.showToast("No data to export. Please generate a report first.", "warning");
    return;
  }

  const filters = _getFilters();
  const reportName = (REPORT_CONFIG[currentReportType]?.title || "Report").replace(/[^a-zA-Z0-9 ]/g, "");
  const fileName = `CHAYA_${currentReportType.toUpperCase()}_${filters.fromStr || "all"}_to_${filters.toStr || "all"}`;

  const cleanRows = currentReportData.map(r => {
    const o = { ...r };
    delete o._row;
    return o;
  });

  // Strategy 1: SheetJS (XLSX)
  if (typeof XLSX !== "undefined") {
    try {
      const ws = XLSX.utils.json_to_sheet(cleanRows);

      // Auto-fit column widths
      const colWidths = Object.keys(cleanRows[0] || {}).map(k => {
        const maxValLen = cleanRows.reduce((m, row) => Math.max(m, String(row[k] || "").length), k.length);
        return { wch: Math.min(Math.max(maxValLen + 3, 12), 40) };
      });
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, reportName.substring(0, 31));
      XLSX.writeFile(wb, `${fileName}.xlsx`);
      SGD.showToast("Excel spreadsheet downloaded successfully!", "success");
      return;
    } catch (e) {
      console.warn("SheetJS export failed, using XML spreadsheet fallback:", e);
    }
  }

  // Strategy 2: Native HTML/XML Spreadsheet Fallback (Opens directly in MS Excel)
  try {
    const headers = Object.keys(cleanRows[0]);
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="UTF-8"><style>th{background-color:#0d2157;color:#fff;font-weight:bold;text-align:center;} td{border:1px solid #ccc;}</style></head>
      <body>
        <h3>CHAYA ERP — ${REPORT_CONFIG[currentReportType]?.title || "Report"}</h3>
        <p>Period: ${filters.fromStr || "All"} to ${filters.toStr || "All"}</p>
        <table border="1">
          <thead><tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr></thead>
          <tbody>
            ${cleanRows.map(row => `<tr>${headers.map(h => `<td>${row[h] !== undefined ? row[h] : ""}</td>`).join("")}</tr>`).join("")}
          </tbody>
        </table>
      </body></html>`;

    const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${fileName}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    SGD.showToast("Excel file downloaded successfully!", "success");
  } catch (err) {
    console.error(err);
    SGD.showToast("Excel export error: " + err.message, "danger");
  }
};

// ── Export to CSV ──────────────────────────────────────────────────────────
window.exportToCSV = function () {
  if (!currentReportData || !currentReportData.length) {
    SGD.showToast("No data to export. Please generate a report first.", "warning");
    return;
  }
  try {
    const cleanRows = currentReportData.map(r => {
      const o = { ...r };
      delete o._row;
      return o;
    });

    const headers = Object.keys(cleanRows[0]);
    const csvLines = [
      headers.join(","),
      ...cleanRows.map(row => headers.map(h => {
        const v = row[h] !== undefined && row[h] !== null ? String(row[h]) : "";
        return v.includes(",") || v.includes('"') || v.includes("\n") ? `"${v.replace(/"/g, '""')}"` : v;
      }).join(","))
    ].join("\r\n");

    const blob = new Blob(["\uFEFF" + csvLines], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    const filters = _getFilters();
    a.href = url;
    a.download = `CHAYA_${currentReportType.toUpperCase()}_${filters.fromStr || "all"}_to_${filters.toStr || "all"}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    SGD.showToast("CSV file exported successfully!", "success");
  } catch (e) {
    SGD.showToast("CSV export failed: " + e.message, "danger");
  }
};

// ── Print ──────────────────────────────────────────────────────────────────
window.printReport = function () {
  window.print();
};
