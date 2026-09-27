/**
 * SGD ERP — Invoice Generator
 * Supports 5 visual themes. Theme is set via window.currentInvoiceTheme.
 * All colors are explicit inline styles — no browser link/default colors bleed in.
 */

/* ── Theme Definitions ── */
const INVOICE_THEMES = {
  blue: {
    name: "Classic Blue",
    hdrGrad: "linear-gradient(120deg,#0d2157 0%,#1565c0 55%,#1e88e5 100%)",
    hdrText: "#ffffff",
    hdrSub: "rgba(255,255,255,0.75)",
    hdrMeta: "rgba(255,255,255,0.65)",
    accent: "#1565c0",
    accentLight: "#e8f0fe",
    accentText: "#0d2157",
    tableHdr: "linear-gradient(90deg,#0d2157 0%,#1565c0 100%)",
    tableHdrText: "#ffffff",
    rowEven: "#f5f7fd",
    rowHover: "#e8f0fe",
    totalBg: "linear-gradient(90deg,#0d2157,#1565c0)",
    totalText: "#ffffff",
    sectionLabel: "#1565c0",
    partyBg: "#f8faff",
    partyBorder: "#dde8fa",
    footerBg: "linear-gradient(90deg,#0d2157,#1565c0)",
    footerText: "#ffffff",
    cgBg: "linear-gradient(90deg,#0d2157,#1565c0)",
    cgText: "#ffffff",
  },
  green: {
    name: "Forest Green",
    hdrGrad: "linear-gradient(120deg,#1b3a1f 0%,#2e7d32 55%,#43a047 100%)",
    hdrText: "#ffffff",
    hdrSub: "rgba(255,255,255,0.75)",
    hdrMeta: "rgba(255,255,255,0.65)",
    accent: "#2e7d32",
    accentLight: "#e8f5e9",
    accentText: "#1b3a1f",
    tableHdr: "linear-gradient(90deg,#1b3a1f 0%,#2e7d32 100%)",
    tableHdrText: "#ffffff",
    rowEven: "#f1f8f2",
    rowHover: "#c8e6c9",
    totalBg: "linear-gradient(90deg,#1b3a1f,#2e7d32)",
    totalText: "#ffffff",
    sectionLabel: "#2e7d32",
    partyBg: "#f1f8f2",
    partyBorder: "#c8e6c9",
    footerBg: "linear-gradient(90deg,#1b3a1f,#2e7d32)",
    footerText: "#ffffff",
    cgBg: "linear-gradient(90deg,#1b3a1f,#2e7d32)",
    cgText: "#ffffff",
  },
  dark: {
    name: "Elegant Dark",
    hdrGrad: "linear-gradient(120deg,#121212 0%,#2c2c2c 55%,#424242 100%)",
    hdrText: "#f5f5f5",
    hdrSub: "rgba(255,255,255,0.65)",
    hdrMeta: "rgba(255,255,255,0.5)",
    accent: "#424242",
    accentLight: "#f5f5f5",
    accentText: "#121212",
    tableHdr: "linear-gradient(90deg,#1a1a1a 0%,#3d3d3d 100%)",
    tableHdrText: "#f5f5f5",
    rowEven: "#fafafa",
    rowHover: "#eeeeee",
    totalBg: "linear-gradient(90deg,#1a1a1a,#3d3d3d)",
    totalText: "#f5f5f5",
    sectionLabel: "#424242",
    partyBg: "#f9f9f9",
    partyBorder: "#ddd",
    footerBg: "linear-gradient(90deg,#1a1a1a,#3d3d3d)",
    footerText: "#f5f5f5",
    cgBg: "linear-gradient(90deg,#1a1a1a,#3d3d3d)",
    cgText: "#f5f5f5",
  },
  minimal: {
    name: "Minimal Grey",
    hdrGrad: "linear-gradient(120deg,#37474f 0%,#546e7a 55%,#78909c 100%)",
    hdrText: "#ffffff",
    hdrSub: "rgba(255,255,255,0.75)",
    hdrMeta: "rgba(255,255,255,0.6)",
    accent: "#546e7a",
    accentLight: "#eceff1",
    accentText: "#263238",
    tableHdr: "linear-gradient(90deg,#37474f 0%,#607d8b 100%)",
    tableHdrText: "#ffffff",
    rowEven: "#f5f7f8",
    rowHover: "#eceff1",
    totalBg: "linear-gradient(90deg,#37474f,#607d8b)",
    totalText: "#ffffff",
    sectionLabel: "#546e7a",
    partyBg: "#f9fafb",
    partyBorder: "#cfd8dc",
    footerBg: "linear-gradient(90deg,#37474f,#607d8b)",
    footerText: "#ffffff",
    cgBg: "linear-gradient(90deg,#37474f,#607d8b)",
    cgText: "#ffffff",
  },
  saffron: {
    name: "Saffron GST",
    hdrGrad: "linear-gradient(120deg,#7f2700 0%,#bf360c 40%,#e65100 70%,#ff8f00 100%)",
    hdrText: "#ffffff",
    hdrSub: "rgba(255,255,255,0.8)",
    hdrMeta: "rgba(255,255,255,0.65)",
    accent: "#bf360c",
    accentLight: "#fff3e0",
    accentText: "#7f2700",
    tableHdr: "linear-gradient(90deg,#7f2700 0%,#bf360c 100%)",
    tableHdrText: "#ffffff",
    rowEven: "#fff8f5",
    rowHover: "#ffe0d0",
    totalBg: "linear-gradient(90deg,#7f2700,#bf360c)",
    totalText: "#ffffff",
    sectionLabel: "#bf360c",
    partyBg: "#fffaf7",
    partyBorder: "#ffe0cc",
    footerBg: "linear-gradient(90deg,#7f2700,#bf360c)",
    footerText: "#ffffff",
    cgBg: "linear-gradient(90deg,#7f2700,#bf360c)",
    cgText: "#ffffff",
  },
};

// Currently active theme key
window.currentInvoiceTheme = window.currentInvoiceTheme || "blue";

// Called by the theme selector buttons in the modal
window.setInvoiceTheme = function (themeKey, btn) {
  window.currentInvoiceTheme = themeKey;
  // Update active state on buttons
  document
    .querySelectorAll(".inv-theme-btn")
    .forEach((b) => {
      b.style.boxShadow = "";
      b.style.transform = "";
    });
  if (btn) {
    btn.style.boxShadow = "0 0 0 3px #fff, 0 0 0 5px " + (INVOICE_THEMES[themeKey]?.accent || "#333");
    btn.style.transform = "scale(1.18)";
  }
  // Re-render current invoice if one is open
  if (window._lastInvoiceData) {
    const gen = new InvoiceGenerator();
    const html = gen.generate(
      window._lastInvoiceData.sale,
      window._lastInvoiceData.parties,
      window._lastInvoiceData.items,
    );
    const invoiceDoc = document.getElementById("invoiceDocument");
    if (invoiceDoc) {
      invoiceDoc.setAttribute("data-html", html);
      let iframe = invoiceDoc.querySelector("iframe.inv-frame");
      if (!iframe) {
        iframe = document.createElement("iframe");
        iframe.className = "inv-frame";
        iframe.style.cssText = "width:100%;border:none;min-height:700px;display:block;";
        invoiceDoc.innerHTML = "";
        invoiceDoc.appendChild(iframe);
      }
      iframe.srcdoc = html;
    }
  }
};

class InvoiceGenerator {
  generate(saleData, parties, items) {
    // Cache last data for theme switching
    window._lastInvoiceData = { sale: saleData, parties, items };

    const t = INVOICE_THEMES[window.currentInvoiceTheme] || INVOICE_THEMES.blue;

    const custName = saleData.customerName || saleData.PartyName || "Unknown Customer";
    const customer = parties?.find(
      (p) => (p.name || p.PartyName) === custName,
    ) || {
      name: custName,
      address: saleData.partyAddress || "Customer Address",
      state: saleData.partyStateCode || "West Bengal (19)",
      gstin: saleData.partyGSTIN || "URD",
      phone: saleData.partyPhone || "N/A",
    };

    const paymentStatus = saleData.paymentStatus || saleData.PaymentStatus || "Partial";

    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tax Invoice</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;font-size:13px;color:#1a1a2e;background:#f4f6fb;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  a{color:inherit!important;text-decoration:none!important}
  .inv-wrap{max-width:860px;margin:16px auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 6px 28px rgba(0,0,0,0.10)}
  @media print{body{background:#fff}.inv-wrap{margin:0;border-radius:0;box-shadow:none;max-width:100%}.no-print{display:none!important}}
</style>
</head>
<body>
<div class="inv-wrap">
  ${this._header(saleData, t, paymentStatus)}
  ${this._parties(customer, saleData, t)}
  ${this._itemsTable(saleData, t)}
  ${this._totals(saleData, t)}
  ${this._footer(saleData, t)}
  <div style="text-align:center;padding:8px;font-size:10.5px;color:${t.cgText};background:${t.cgBg};letter-spacing:0.4px">
    &#10003; This is a Computer Generated Invoice &nbsp;|&nbsp; SGD Interior &amp; Wallpaper, Kolkata
  </div>
</div>
</body>
</html>`;
  }

  _header(data, t, paymentStatus) {
    const statusStyles = {
      Paid:    "background:#d4edda;color:#155724;",
      Unpaid:  "background:#f8d7da;color:#721c24;",
      Partial: "background:#fff3cd;color:#856404;",
    };
    const badgeStyle = statusStyles[paymentStatus] || statusStyles.Partial;

    const invNo   = data.invoiceNo   || data.InvoiceNo   || "N/A";
    const invDate = data.date        || data.InvoiceDate  || "";
    const pos     = data.placeOfSupply || data.PlaceOfSupply || "West Bengal (19)";
    const veh     = data.vehicleNo   || data.TransportVehicleNo || "—";

    return `
<div style="background:${t.hdrGrad};padding:26px 30px 20px;position:relative;overflow:hidden">
  <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:rgba(255,255,255,0.05)"></div>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;position:relative;z-index:1">
    <div>
      <div style="color:${t.hdrText};font-size:22px;font-weight:800;margin-bottom:3px;letter-spacing:-0.3px">&#127968; SGD Interior &amp; Wallpaper</div>
      <div style="color:${t.hdrSub};font-size:11.5px;margin-bottom:6px">Premium Wallpaper &amp; Interior Decoration</div>
      <div style="color:${t.hdrSub};font-size:11.5px;line-height:1.7">
        Sector V, Salt Lake, Kolkata, West Bengal — 700091<br>
        Phone: +91 98765 43210 &nbsp;|&nbsp; Email: info@sgd.com
      </div>
      <div style="margin-top:7px;color:#ffd54f;font-size:11.5px;font-weight:600;letter-spacing:0.2px">
        GSTIN: 19ABCDE1234F1Z5 &nbsp;|&nbsp; State Code: 19
      </div>
    </div>
    <div style="text-align:right">
      <div style="display:inline-block;background:rgba(255,255,255,0.15);border:1.5px solid rgba(255,255,255,0.35);color:${t.hdrText};font-size:14px;font-weight:800;letter-spacing:3px;padding:6px 16px;border-radius:6px;margin-bottom:14px;text-transform:uppercase">
        Tax Invoice
      </div>
      <table style="color:${t.hdrText};font-size:12px;margin-left:auto">
        <tr>
          <td style="color:${t.hdrMeta};padding-right:12px;padding-bottom:4px">Invoice No</td>
          <td style="font-weight:700;color:${t.hdrText}">${invNo}</td>
        </tr>
        <tr>
          <td style="color:${t.hdrMeta};padding-right:12px;padding-bottom:4px">Date</td>
          <td style="font-weight:600;color:${t.hdrText}">${invDate}</td>
        </tr>
        <tr>
          <td style="color:${t.hdrMeta};padding-right:12px;padding-bottom:4px">Place of Supply</td>
          <td style="font-weight:600;color:${t.hdrText}">${pos}</td>
        </tr>
        <tr>
          <td style="color:${t.hdrMeta};padding-right:12px;padding-bottom:4px">Vehicle No</td>
          <td style="font-weight:600;color:${t.hdrText}">${veh}</td>
        </tr>
        <tr>
          <td style="color:${t.hdrMeta};padding-right:12px">Payment</td>
          <td><span style="display:inline-block;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:700;letter-spacing:0.4px;text-transform:uppercase;${badgeStyle}">${paymentStatus}</span></td>
        </tr>
      </table>
    </div>
  </div>
</div>`;
  }

  _parties(customer, data, t) {
    const cName  = customer.name    || customer.PartyName || "N/A";
    const cAddr  = customer.address || customer.Address   || "—";
    const cState = customer.state   || customer.State     || "—";
    const cGstin = customer.gstin   || customer.GSTIN     || "URD";
    const cPhone = customer.phone   || customer.Phone     || "N/A";
    const trans  = data.transporter || data.Transporter   || "—";
    const eway   = data.eWayBill    || data.EWayBill      || "—";

    const labelStyle = `font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${t.sectionLabel};border-bottom:1.5px solid ${t.sectionLabel};padding-bottom:3px;margin-bottom:8px;display:inline-block`;
    const nameStyle  = `font-size:14px;font-weight:700;color:#0d1b2e;margin-bottom:4px`;
    const detStyle   = `font-size:11.5px;color:#444;line-height:1.8`;
    const boldStyle  = `font-weight:600;color:#222`;

    return `
<div style="display:flex;border-bottom:1.5px solid ${t.partyBorder};background:${t.partyBg}">
  <div style="flex:1;padding:16px 22px;border-right:1.5px solid ${t.partyBorder}">
    <div style="${labelStyle}">Bill To</div>
    <div style="${nameStyle}">${cName}</div>
    <div style="${detStyle}">
      ${cAddr}<br>
      ${cState}<br>
      <span style="${boldStyle}">GSTIN:</span> ${cGstin}<br>
      <span style="${boldStyle}">Phone:</span> ${cPhone}
    </div>
  </div>
  <div style="flex:1;padding:16px 22px">
    <div style="${labelStyle}">Ship To</div>
    <div style="${nameStyle}">${cName}</div>
    <div style="${detStyle}">
      ${cAddr}<br>
      ${cState}<br>
      <span style="${boldStyle}">Transporter:</span> ${trans}<br>
      <span style="${boldStyle}">E-Way Bill:</span> ${eway}
    </div>
  </div>
</div>`;
  }

  _itemsTable(data, t) {
    const items =
      data.items && data.items.length > 0
        ? data.items
        : [{ desc: "Sample Item", hsn: "3925", qty: 1, unit: "PCS", rate: 100, disc: 0, taxable: 100, cgst: 9, sgst: 9, total: 118, gstPercent: 18 }];

    const isIgst = items.some((i) => parseFloat(i.igstAmount || i.IGSTAmount || i.igst || 0) > 0);

    let fTaxable = 0, fCgst = 0, fSgst = 0, fIgst = 0, fTotal = 0;

    const rows = items.map((item, idx) => {
      const name    = item.desc     || item.itemName    || item.ItemName    || "—";
      const hsn     = item.hsn      || item.HSNCode     || "—";
      const qty     = item.qty      !== undefined ? item.qty  : (item.Quantity || 0);
      const unit    = item.unit     || item.Unit        || "";
      const rate    = parseFloat(item.rate    !== undefined ? item.rate    : (item.Rate    || 0));
      const disc    = parseFloat(item.disc    !== undefined ? item.disc    : (item.discount || item.Discount || 0));
      const taxable = parseFloat(item.taxable !== undefined ? item.taxable : (item.taxableValue || item.TaxableValue || 0));
      const cgst    = parseFloat(item.cgst    !== undefined ? item.cgst    : (item.cgstAmount   || item.CGSTAmount   || 0));
      const sgst    = parseFloat(item.sgst    !== undefined ? item.sgst    : (item.sgstAmount   || item.SGSTAmount   || 0));
      const igst    = parseFloat(item.igst    !== undefined ? item.igst    : (item.igstAmount   || item.IGSTAmount   || 0));
      const total   = parseFloat(item.total   !== undefined ? item.total   : (item.totalAmount  || item.TotalAmount  || 0));
      const gstPct  = parseFloat(item.gstPercent !== undefined ? item.gstPercent : (item.GSTPercent || 0));

      fTaxable += taxable; fCgst += cgst; fSgst += sgst; fIgst += igst; fTotal += total;

      const rowBg   = idx % 2 === 1 ? t.rowEven : "#fff";
      const numStyle = `text-align:right;padding:9px 10px;color:#1a2340;font-variant-numeric:tabular-nums`;
      const cellC    = `text-align:center;padding:9px 10px;color:#1a2340`;

      const taxCells = isIgst
        ? `<td style="${numStyle}">${igst.toFixed(2)}<br><span style="font-size:10px;color:#777">(${gstPct}%)</span></td>`
        : `<td style="${numStyle}">${cgst.toFixed(2)}<br><span style="font-size:10px;color:#777">(${(gstPct/2).toFixed(1)}%)</span></td>
           <td style="${numStyle}">${sgst.toFixed(2)}<br><span style="font-size:10px;color:#777">(${(gstPct/2).toFixed(1)}%)</span></td>`;

      return `<tr style="background:${rowBg};border-bottom:1px solid #edf0f7">
        <td style="${cellC}">${idx + 1}</td>
        <td style="padding:9px 10px;color:#1a2340;font-weight:600">${name}${disc > 0 ? `<br><span style="font-size:10.5px;color:${t.sectionLabel}">Disc: ${disc.toFixed(2)}</span>` : ""}</td>
        <td style="${cellC}">${hsn}</td>
        <td style="${cellC}">${qty} ${unit}</td>
        <td style="${numStyle}">${rate.toFixed(2)}</td>
        <td style="${numStyle}">${taxable.toFixed(2)}</td>
        ${taxCells}
        <td style="${numStyle};font-weight:700">${total.toFixed(2)}</td>
      </tr>`;
    }).join("");

    const thStyle = `background:${t.tableHdr};color:${t.tableHdrText};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.4px;padding:11px 10px;text-align:center;border:none`;
    const taxThs  = isIgst
      ? `<th style="${thStyle}">IGST</th>`
      : `<th style="${thStyle}">CGST</th><th style="${thStyle}">SGST</th>`;
    const taxFtCells = isIgst
      ? `<td style="text-align:right;padding:9px 10px;font-weight:700;color:#1a2340">${fIgst.toFixed(2)}</td>`
      : `<td style="text-align:right;padding:9px 10px;font-weight:700;color:#1a2340">${fCgst.toFixed(2)}</td>
         <td style="text-align:right;padding:9px 10px;font-weight:700;color:#1a2340">${fSgst.toFixed(2)}</td>`;

    return `
<table style="width:100%;border-collapse:collapse">
  <thead>
    <tr>
      <th style="${thStyle};width:4%">#</th>
      <th style="${thStyle};width:28%;text-align:left">Description of Goods</th>
      <th style="${thStyle};width:9%">HSN/SAC</th>
      <th style="${thStyle};width:9%">Qty</th>
      <th style="${thStyle};width:9%">Rate (&#8377;)</th>
      <th style="${thStyle};width:10%">Taxable (&#8377;)</th>
      ${taxThs}
      <th style="${thStyle};width:11%;text-align:right">Total (&#8377;)</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
  <tfoot>
    <tr style="background:${t.accentLight};border-top:2px solid ${t.accent}">
      <td colspan="5" style="text-align:right;padding:9px 10px;font-weight:700;font-size:12px;color:${t.accentText};letter-spacing:0.5px">TOTAL</td>
      <td style="text-align:right;padding:9px 10px;font-weight:700;color:${t.accentText}">${fTaxable.toFixed(2)}</td>
      ${taxFtCells}
      <td style="text-align:right;padding:9px 10px;font-weight:800;color:${t.accentText}">${fTotal.toFixed(2)}</td>
    </tr>
  </tfoot>
</table>`;
  }

  _totals(data, t) {
    const gt   = parseFloat(data.grandTotal   || data.TotalAmount   || data.GrandTotal   || 0);
    const sub  = parseFloat(data.SubTotal     !== undefined ? data.SubTotal   : (data.subTotal !== undefined ? data.subTotal : (data.taxableAmount || data.TaxableAmount || gt)));
    const disc = parseFloat(data.discountAmount || data.DiscountAmount || data.totalDiscount || data.TotalDiscount || 0);
    const cgst = parseFloat(data.CGSTAmount   !== undefined ? data.CGSTAmount : (data.cgstAmount || 0));
    const sgst = parseFloat(data.SGSTAmount   !== undefined ? data.SGSTAmount : (data.sgstAmount || 0));
    const igst = parseFloat(data.IGSTAmount   !== undefined ? data.IGSTAmount : (data.igstAmount || 0));
    const round= parseFloat(data.RoundOff     !== undefined ? data.RoundOff   : (data.roundOff  || 0));
    const words = this._numberToWords(Math.round(gt));

    const labelStyle = `font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${t.sectionLabel};border-bottom:1.5px solid ${t.sectionLabel};padding-bottom:3px;margin-bottom:8px;display:inline-block`;
    const rowStyle   = `display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #eee;font-size:13px`;
    const valStyle   = `font-weight:600;color:#1a2340;font-variant-numeric:tabular-nums`;
    const lblStyle   = `color:#555`;

    const taxRows = igst > 0
      ? `<div style="${rowStyle}"><span style="${lblStyle}">IGST</span><span style="${valStyle}">&#8377; ${igst.toFixed(2)}</span></div>`
      : `<div style="${rowStyle}"><span style="${lblStyle}">CGST</span><span style="${valStyle}">&#8377; ${cgst.toFixed(2)}</span></div>
         <div style="${rowStyle}"><span style="${lblStyle}">SGST</span><span style="${valStyle}">&#8377; ${sgst.toFixed(2)}</span></div>`;

    const discRow = disc > 0
      ? `<div style="${rowStyle}"><span style="color:#c62828">Discount (—)</span><span style="font-weight:600;color:#c62828">&#8377; ${disc.toFixed(2)}</span></div>`
      : "";

    const roundRow = round !== 0
      ? `<div style="${rowStyle}"><span style="${lblStyle}">Round Off</span><span style="${valStyle}">&#8377; ${round >= 0 ? "+" : ""}${round.toFixed(2)}</span></div>`
      : "";

    return `
<div style="display:flex;border-top:1.5px solid ${t.partyBorder}">
  <div style="flex:1.4;padding:18px 22px;border-right:1.5px solid ${t.partyBorder}">
    <div style="${labelStyle}">Amount in Words</div>
    <div style="font-size:12.5px;font-weight:700;color:#0d1b2e;margin-bottom:14px;line-height:1.5">INR ${words}</div>

    <div style="${labelStyle};margin-top:10px">Bank Details</div>
    <table style="font-size:12px;color:#444">
      <tr><td style="color:#888;padding-right:10px;padding-bottom:3px">Bank Name</td><td style="font-weight:600;color:#1a2340">HDFC Bank</td></tr>
      <tr><td style="color:#888;padding-right:10px;padding-bottom:3px">Account No</td><td style="font-weight:600;color:#1a2340">50200012345678</td></tr>
      <tr><td style="color:#888;padding-right:10px;padding-bottom:3px">IFSC Code</td><td style="font-weight:600;color:#1a2340">HDFC0001234</td></tr>
      <tr><td style="color:#888;padding-right:10px">Branch</td><td style="font-weight:600;color:#1a2340">Salt Lake, Kolkata</td></tr>
    </table>
  </div>
  <div style="flex:1;padding:18px 22px">
    <div style="${rowStyle}"><span style="${lblStyle}">Sub Total</span><span style="${valStyle}">&#8377; ${sub.toFixed(2)}</span></div>
    ${discRow}
    ${taxRows}
    ${roundRow}
    <div style="margin-top:8px;border-radius:6px;overflow:hidden">
      <div style="display:flex;justify-content:space-between;padding:10px 14px;background:${t.totalBg}">
        <span style="font-size:14px;font-weight:800;color:${t.totalText}">Grand Total</span>
        <span style="font-size:14px;font-weight:800;color:${t.totalText}">&#8377; ${gt.toFixed(2)}</span>
      </div>
    </div>
  </div>
</div>`;
  }

  _footer(data, t) {
    const labelStyle = `font-size:10px;font-weight:800;letter-spacing:1.5px;text-transform:uppercase;color:${t.sectionLabel};border-bottom:1.5px solid ${t.sectionLabel};padding-bottom:3px;margin-bottom:8px;display:inline-block`;

    return `
<div style="display:flex;border-top:1.5px solid ${t.partyBorder}">
  <div style="flex:1;padding:16px 22px;border-right:1.5px solid ${t.partyBorder}">
    <div style="${labelStyle}">Terms &amp; Conditions</div>
    <ol style="padding-left:16px;font-size:11.5px;color:#555;line-height:1.85;margin:0">
      <li>Goods once sold will not be taken back.</li>
      <li>Interest @18% p.a. will be charged if payment is delayed beyond due date.</li>
      <li>Subject to Kolkata jurisdiction only.</li>
      <li>E.&amp;O.E. — All disputes subject to Kolkata jurisdiction.</li>
    </ol>
  </div>
  <div style="flex:1;padding:16px 22px;display:flex;flex-direction:column;justify-content:space-between">
    <div style="${labelStyle}">Authorised Signatory</div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:8px">
      <div style="text-align:center;width:45%">
        <div style="border-top:1.5px dashed #999;padding-top:6px;font-size:11px;color:#666;margin-top:36px">Customer Signature</div>
      </div>
      <div style="text-align:center;width:45%">
        <div style="border-top:1.5px dashed #999;padding-top:6px;font-size:11px;color:#666;margin-top:36px">For SGD Interior &amp; Wallpaper</div>
      </div>
    </div>
  </div>
</div>`;
  }

  _numberToWords(num) {
    if (typeof SGD !== "undefined" && SGD.numberToWords) return SGD.numberToWords(num);
    const a = ["","One ","Two ","Three ","Four ","Five ","Six ","Seven ","Eight ","Nine ","Ten ","Eleven ","Twelve ","Thirteen ","Fourteen ","Fifteen ","Sixteen ","Seventeen ","Eighteen ","Nineteen "];
    const b = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
    if ((num = num.toString()).length > 9) return "overflow";
    let n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return "Zero Only";
    let s = "";
    s += n[1]!=0 ? (a[+n[1]]||b[n[1][0]]+" "+a[n[1][1]])+"Crore " : "";
    s += n[2]!=0 ? (a[+n[2]]||b[n[2][0]]+" "+a[n[2][1]])+"Lakh " : "";
    s += n[3]!=0 ? (a[+n[3]]||b[n[3][0]]+" "+a[n[3][1]])+"Thousand " : "";
    s += n[4]!=0 ? (a[+n[4]]||b[n[4][0]]+" "+a[n[4][1]])+"Hundred " : "";
    s += n[5]!=0 ? (s!=""?"and ":"")+(a[+n[5]]||b[n[5][0]]+" "+a[n[5][1]]) : "";
    return s.trim() ? s.trim()+" Only" : "Zero Only";
  }
}
