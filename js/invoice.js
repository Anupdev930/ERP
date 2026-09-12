/**
 * Invoice Generator Utility
 */
class InvoiceGenerator {
    
    generate(saleData, parties, items) {
        // Mock matching data if complex references are not fully wired in saleData yet
        const custName = saleData.customerName || saleData.PartyName || 'Unknown Customer';
        const customer = parties?.find(p => (p.name || p.PartyName) === custName) || {
            name: custName,
            address: 'Customer Address',
            state: saleData.partyStateCode || 'State',
            gstin: saleData.partyGSTIN || 'URD',
            phone: 'N/A'
        };

        const html = `
            <div style="font-family: Arial, sans-serif; color: #000; font-size: 14px; max-width: 800px; margin: 0 auto; border: 1px solid #000;">
                
                ${this.getHeader(saleData)}
                ${this.getPartyDetails(customer)}
                ${this.getItemsTable(saleData, items)}
                ${this.getTotalsSection(saleData)}
                ${this.getFooter(saleData)}

            </div>
        `;
        return html;
    }

    getHeader(data) {
        return `
        <div style="text-align: center; border-bottom: 1px solid #000; padding: 5px;">
            <strong style="font-size: 18px;">TAX INVOICE</strong>
        </div>
        <div style="display: flex; border-bottom: 1px solid #000;">
            <div style="flex: 1; padding: 10px; border-right: 1px solid #000;">
                <h3 style="margin: 0 0 5px 0; color: #1a5276;">SGD Interior & Wallpaper</h3>
                <p style="margin: 0; font-size: 12px;">123 Business Street, Sector V, Kolkata, West Bengal - 700091</p>
                <p style="margin: 0; font-size: 12px;"><strong>GSTIN:</strong> 19ABCDE1234F1Z5</p>
                <p style="margin: 0; font-size: 12px;"><strong>Phone:</strong> +91 98765 43210 | <strong>Email:</strong> info@sgd.com</p>
            </div>
            <div style="flex: 1; padding: 10px; font-size: 13px;">
                <table style="width: 100%;">
                    <tr><td><strong>Invoice No:</strong></td><td style="text-align: right;">${data.invoiceNo || data.InvoiceNo || 'N/A'}</td></tr>
                    <tr><td><strong>Date:</strong></td><td style="text-align: right;">${SGD.formatDate(data.date || data.InvoiceDate || '')}</td></tr>
                    <tr><td><strong>Vehicle No:</strong></td><td style="text-align: right;">${data.vehicleNo || data.TransportVehicleNo || '-'}</td></tr>
                    <tr><td><strong>Place of Supply:</strong></td><td style="text-align: right;">${data.placeOfSupply || data.PlaceOfSupply || 'West Bengal (19)'}</td></tr>
                </table>
            </div>
        </div>`;
    }

    getPartyDetails(customer) {
        return `
        <div style="padding: 10px; border-bottom: 1px solid #000; background-color: #f9f9f9;">
            <strong style="font-size: 14px; text-decoration: underline;">BILL TO:</strong>
            <table style="width: 100%; margin-top: 5px; font-size: 13px;">
                <tr>
                    <td style="width: 50%;"><strong>${customer.name || customer.PartyName || 'N/A'}</strong></td>
                    <td style="width: 50%;"><strong>GSTIN:</strong> ${customer.gstin || customer.GSTIN || 'URD'}</td>
                </tr>
                <tr>
                    <td>${customer.address || customer.Address || ''}</td>
                    <td><strong>Phone:</strong> ${customer.phone || customer.Phone || 'N/A'}</td>
                </tr>
                <tr>
                    <td>${customer.state || customer.State || 'N/A'}</td>
                    <td></td>
                </tr>
            </table>
        </div>`;
    }

    getItemsTable(data, allItems) {
        // Mock items if empty
        const items = data.items && data.items.length > 0 ? data.items : [
            { desc: 'Fluted Panel', hsn: '3925', qty: 10, unit: 'PCS', rate: 500, disc: 0, taxable: 5000, cgst: 450, sgst: 450, total: 5900 }
        ];

        // Check if this is an IGST invoice
        const isIgst = items.some(i => parseFloat(i.igstAmount || i.IGSTAmount || 0) > 0);

        let rowsHTML = '';
        items.forEach((item, index) => {
            const itemName = item.desc || item.itemName || item.ItemName || '-';
            const hsn = item.hsn || item.HSNCode || '-';
            const qty = item.qty !== undefined ? item.qty : (item.Quantity || 0);
            const unit = item.unit || item.Unit || '';
            const rate = parseFloat(item.rate !== undefined ? item.rate : (item.Rate || 0));
            const taxable = parseFloat(item.taxable !== undefined ? item.taxable : (item.taxableValue || item.TaxableValue || 0));
            const cgst = parseFloat(item.cgst !== undefined ? item.cgst : (item.cgstAmount || item.CGSTAmount || 0));
            const sgst = parseFloat(item.sgst !== undefined ? item.sgst : (item.sgstAmount || item.SGSTAmount || 0));
            const igst = parseFloat(item.igst !== undefined ? item.igst : (item.igstAmount || item.IGSTAmount || 0));
            const total = parseFloat(item.total !== undefined ? item.total : (item.totalAmount || item.TotalAmount || 0));
            const gstPercent = parseFloat(item.gstPercent !== undefined ? item.gstPercent : (item.GSTPercent || 0));
            
            let taxHTML = '';
            if (isIgst) {
                taxHTML = `<td style="padding: 5px; border-right: 1px solid #000;" colspan="2">${igst.toFixed(2)}<br><small>(${gstPercent}%)</small></td>`;
            } else {
                taxHTML = `
                <td style="padding: 5px; border-right: 1px solid #000;">${cgst.toFixed(2)}<br><small>(${gstPercent/2}%)</small></td>
                <td style="padding: 5px; border-right: 1px solid #000;">${sgst.toFixed(2)}<br><small>(${gstPercent/2}%)</small></td>`;
            }

            rowsHTML += `
            <tr style="text-align: center; border-bottom: 1px solid #eee;">
                <td style="padding: 5px; border-right: 1px solid #000;">${index + 1}</td>
                <td style="padding: 5px; border-right: 1px solid #000; text-align: left;">${itemName}</td>
                <td style="padding: 5px; border-right: 1px solid #000;">${hsn}</td>
                <td style="padding: 5px; border-right: 1px solid #000;">${qty} ${unit}</td>
                <td style="padding: 5px; border-right: 1px solid #000;">${rate.toFixed(2)}</td>
                <td style="padding: 5px; border-right: 1px solid #000;">${taxable.toFixed(2)}</td>
                ${taxHTML}
                <td style="padding: 5px; text-align: right;">${total.toFixed(2)}</td>
            </tr>`;
        });

        const taxHeaders = isIgst ? 
            `<th style="padding: 5px; border-right: 1px solid #000; width: 20%;" colspan="2">IGST</th>` : 
            `<th style="padding: 5px; border-right: 1px solid #000; width: 10%;">CGST</th>
             <th style="padding: 5px; border-right: 1px solid #000; width: 10%;">SGST</th>`;

        return `
        <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #000; font-size: 13px;">
            <thead>
                <tr style="background-color: #f1f1f1; border-bottom: 1px solid #000; border-top: 1px solid #000;">
                    <th style="padding: 5px; border-right: 1px solid #000; width: 5%;">Sr</th>
                    <th style="padding: 5px; border-right: 1px solid #000; width: 25%;">Description of Goods</th>
                    <th style="padding: 5px; border-right: 1px solid #000; width: 10%;">HSN/SAC</th>
                    <th style="padding: 5px; border-right: 1px solid #000; width: 10%;">Qty</th>
                    <th style="padding: 5px; border-right: 1px solid #000; width: 10%;">Rate</th>
                    <th style="padding: 5px; border-right: 1px solid #000; width: 10%;">Taxable</th>
                    ${taxHeaders}
                    <th style="padding: 5px; text-align: right; width: 10%;">Total</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHTML}
            </tbody>
        </table>`;
    }

    getTotalsSection(data) {
        let gt = parseFloat(data.grandTotal || data.TotalAmount || data.GrandTotal || 0);
        let sub = parseFloat(data.SubTotal !== undefined ? data.SubTotal : (data.subTotal !== undefined ? data.subTotal : (gt > 0 ? gt - 900 : 0)));
        let cgst = parseFloat(data.CGSTAmount !== undefined ? data.CGSTAmount : (data.cgstAmount !== undefined ? data.cgstAmount : 0));
        let sgst = parseFloat(data.SGSTAmount !== undefined ? data.SGSTAmount : (data.sgstAmount !== undefined ? data.sgstAmount : 0));
        let igst = parseFloat(data.IGSTAmount !== undefined ? data.IGSTAmount : (data.igstAmount !== undefined ? data.igstAmount : 0));
        let round = parseFloat(data.RoundOff !== undefined ? data.RoundOff : (data.roundOff || 0));
        
        let amountWords = this.numberToWords(Math.round(gt));
        
        let taxRows = '';
        if (igst > 0) {
            taxRows = `<tr><td style="padding: 5px 10px;">IGST:</td><td style="padding: 5px 10px; text-align: right;">${igst.toFixed(2)}</td></tr>`;
        } else {
            taxRows = `
            <tr><td style="padding: 5px 10px;">CGST:</td><td style="padding: 5px 10px; text-align: right;">${cgst.toFixed(2)}</td></tr>
            <tr><td style="padding: 5px 10px;">SGST:</td><td style="padding: 5px 10px; text-align: right;">${sgst.toFixed(2)}</td></tr>`;
        }

        return `
        <div style="display: flex; border-bottom: 1px solid #000;">
            <div style="flex: 2; padding: 10px; border-right: 1px solid #000;">
                <p style="margin: 0 0 10px 0; font-size: 13px;"><strong>Amount in Words:</strong><br>INR ${amountWords}.</p>
                <div style="margin-top: 20px; font-size: 12px;">
                    <strong>Bank Details:</strong><br>
                    Bank Name: HDFC Bank<br>
                    A/C No: 50200012345678<br>
                    IFSC Code: HDFC0001234<br>
                    Branch: Salt Lake, Kolkata
                </div>
            </div>
            <div style="flex: 1; padding: 0;">
                <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
                    <tr><td style="padding: 5px 10px;">Sub Total:</td><td style="padding: 5px 10px; text-align: right;">${sub.toFixed(2)}</td></tr>
                    ${taxRows}
                    <tr><td style="padding: 5px 10px;">Round Off:</td><td style="padding: 5px 10px; text-align: right;">${round.toFixed(2)}</td></tr>
                    <tr style="background-color: #f1f1f1; border-top: 1px solid #000; border-bottom: 1px solid #000;">
                        <td style="padding: 8px 10px;"><strong>GRAND TOTAL:</strong></td>
                        <td style="padding: 8px 10px; text-align: right;"><strong>${gt.toFixed(2)}</strong></td>
                    </tr>
                </table>
            </div>
        </div>`;
    }

    getFooter(data) {
        return `
        <div style="display: flex; height: 120px;">
            <div style="flex: 1; padding: 10px; border-right: 1px solid #000; font-size: 11px;">
                <strong>Terms & Conditions:</strong>
                <ol style="margin-top: 5px; padding-left: 15px;">
                    <li>Goods once sold will not be taken back.</li>
                    <li>Interest @18% p.a. will be charged if payment is delayed.</li>
                    <li>Subject to Kolkata jurisdiction only.</li>
                </ol>
            </div>
            <div style="flex: 1; padding: 10px; position: relative;">
                <div style="position: absolute; bottom: 30px; left: 10px; text-align: center; width: 45%;">
                    <hr style="border: 0; border-top: 1px dashed #000;">
                    <span style="font-size: 12px;">Customer Signature</span>
                </div>
                <div style="position: absolute; bottom: 30px; right: 10px; text-align: center; width: 45%;">
                    <hr style="border: 0; border-top: 1px dashed #000;">
                    <span style="font-size: 12px;">For SGD Interior & Wallpaper</span>
                </div>
            </div>
        </div>
        <div style="text-align: center; padding: 5px; font-size: 10px; border-top: 1px solid #000; background: #eee;">
            This is a Computer Generated Invoice.
        </div>`;
    }

    numberToWords(num) {
        if(typeof SGD !== 'undefined' && SGD.numberToWords) return SGD.numberToWords(num);
        // Simple fallback
        const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
        const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];
        if ((num = num.toString()).length > 9) return 'overflow';
        let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return;
        let str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
        str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
        return str.trim() ? str.trim() + ' Only' : 'Zero Only';
    }
}
