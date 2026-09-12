/**
 * app.js - Core Javascript for SGD ERP
 * Includes global configurations, API layer, UI helpers, and a Demo Data Engine.
 */

const SGD = {
    config: {
        API_URL: 'https://script.google.com/macros/s/AKfycbwjYasx-fhviaX1DLnQY-rm9vlbpsUfYMTdhuMnJKJ1klpnBNzIRGG_Ui1XB7Ao0QgYUw/exec',
        APP_NAME: 'SGD ERP',
        CURRENCY_SYMBOL: '₹',
        DEMO_MODE: false, // Set to true to use demo data without backend
        STATE_CODE: '19', // West Bengal
    },
    currentUser: null,

    // === AUTHENTICATION ===
    checkAuth: function() {
        const userStr = localStorage.getItem('sgd_user');
        if (!userStr || userStr === 'undefined') {
            this.logout();
            return false;
        }
        
        try {
            this.currentUser = JSON.parse(userStr);
            if (!this.currentUser || (!this.currentUser.username && !this.currentUser.Username)) {
                throw new Error("Invalid user object");
            }
            return true;
        } catch (e) {
            console.error('Auth Check Failed:', e);
            this.logout();
            return false;
        }
    },

    logout: function() {
        localStorage.removeItem('sgd_user');
        localStorage.removeItem('sgd_token');
        window.location.href = 'index.html';
    },

    getCurrentUser: function() {
        return this.currentUser;
    },

    setCurrentUserUI: function() {
        if (this.currentUser) {
            const nameEl = document.getElementById('userName');
            const displayEl = document.getElementById('currentUserDisplay');
            const roleEl = document.getElementById('userRole');
            
            const name = this.currentUser.fullName || this.currentUser.FullName;
            const role = this.currentUser.role || this.currentUser.Role;
            
            if (nameEl) nameEl.textContent = name;
            if (displayEl) displayEl.textContent = name;
            if (roleEl) roleEl.textContent = role;
        }
    },

    // === API LAYER ===
    api: async function(action, payload = {}) {
        if (this.config.DEMO_MODE || !this.config.API_URL) {
            return await this.handleDemoRequest(action, payload);
        }

        try {
            const token = localStorage.getItem('sgd_token') || '';
            const requestData = {
                action: action,
                token: token,
                params: payload
            };

            const response = await fetch(this.config.API_URL, {
                method: 'POST',
                body: JSON.stringify(requestData),
                headers: {
                    'Content-Type': 'text/plain'
                }
            });

            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            return data;
        } catch (error) {
            console.warn('API Error, falling back to demo data:', error.message);
            // Fallback to demo mode if API fails (backend not deployed yet)
            return await this.handleDemoRequest(action, payload);
        }
    },

    // === UI HELPERS ===
    initToastContainer: function() {
        if (!document.getElementById('toast-container')) {
            const container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
            container.style.zIndex = '1090';
            document.body.appendChild(container);
        }
    },

        // === UTILITIES ===


    showToast: function(message, type = 'success') {
        this.initToastContainer();
        const container = document.getElementById('toast-container');
        
        const toastId = 'toast-' + Date.now();
        const bgClass = type === 'success' ? 'bg-success text-white' : 
                        type === 'danger' ? 'bg-danger text-white' : 
                        type === 'warning' ? 'bg-warning text-dark' : 'bg-primary text-white';
        const icon = type === 'success' ? 'bi-check-circle' :
                     type === 'danger' ? 'bi-exclamation-octagon' :
                     type === 'warning' ? 'bi-exclamation-triangle' : 'bi-info-circle';

        const toastHtml = `
            <div id="${toastId}" class="toast align-items-center ${bgClass} border-0" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="d-flex">
                    <div class="toast-body">
                        <i class="bi ${icon} me-2"></i> ${message}
                    </div>
                    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', toastHtml);
        const toastEl = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastEl, { delay: 3000 });
        toast.show();
        
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    },

    showLoading: function() {
        if (!document.getElementById('page-loader')) {
            const loaderHtml = `
                <div id="page-loader" class="full-page-loader">
                    <div class="spinner"></div>
                    <div class="mt-3 text-primary fw-bold">Processing...</div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', loaderHtml);
        }
        
        // Disable all modal primary/danger buttons to explicitly prevent double clicks
        const buttons = document.querySelectorAll('.modal .btn-primary, .modal .btn-danger, .modal .btn-success, .btn-primary, .btn-danger');
        buttons.forEach(btn => {
            btn.classList.add('disabled-by-loader');
            btn.setAttribute('disabled', 'true');
        });
    },

    hideLoading: function() {
        const loader = document.getElementById('page-loader');
        if (loader) loader.remove();
        
        // Re-enable buttons
        const buttons = document.querySelectorAll('.disabled-by-loader');
        buttons.forEach(btn => {
            btn.classList.remove('disabled-by-loader');
            btn.removeAttribute('disabled');
        });
    },

    initConfirmModal: function() {
        if (!document.getElementById('confirmModal')) {
            const modalHtml = `
                <div class="modal fade" id="confirmModal" tabindex="-1" aria-hidden="true">
                    <div class="modal-dialog modal-sm modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-body text-center p-4">
                                <i class="bi bi-exclamation-circle text-warning mb-3" style="font-size: 3rem;"></i>
                                <h5 id="confirmTitle" class="mb-2">Are you sure?</h5>
                                <p id="confirmMessage" class="text-muted mb-4">This action cannot be undone.</p>
                                <div class="d-flex justify-content-center gap-2">
                                    <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                                    <button type="button" class="btn btn-primary" id="confirmBtn">Confirm</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHtml);
        }
    },

    showConfirm: function(title, message, btnType = 'primary') {
        this.initConfirmModal();
        return new Promise((resolve) => {
            const modalEl = document.getElementById('confirmModal');
            const bsModal = new bootstrap.Modal(modalEl);
            
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmMessage').textContent = message;
            
            const confirmBtn = document.getElementById('confirmBtn');
            confirmBtn.className = `btn btn-${btnType}`;
            
            const handleConfirm = () => {
                bsModal.hide();
                cleanup();
                resolve(true);
            };
            
            const handleCancel = () => {
                cleanup();
                resolve(false);
            };
            
            const cleanup = () => {
                confirmBtn.removeEventListener('click', handleConfirm);
                modalEl.removeEventListener('hidden.bs.modal', handleCancel);
            };
            
            confirmBtn.addEventListener('click', handleConfirm);
            modalEl.addEventListener('hidden.bs.modal', handleCancel);
            
            bsModal.show();
        });
    },

    // === FORMATTING ===
    formatCurrency: function(amount) {
        const val = parseFloat(amount) || 0;
        return this.config.CURRENCY_SYMBOL + ' ' + val.toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    },

    formatDate: function(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}-${month}-${year}`;
    },

    parseDate: function(str) {
        // Assume DD-MM-YYYY
        const parts = str.split('-');
        if (parts.length === 3) {
            return new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        }
        return new Date(str);
    },

    numberToWords: function(num) {
        // Simplified Indian numbering system word converter
        const a = ['','One ','Two ','Three ','Four ', 'Five ','Six ','Seven ','Eight ','Nine ','Ten ','Eleven ','Twelve ','Thirteen ','Fourteen ','Fifteen ','Sixteen ','Seventeen ','Eighteen ','Nineteen '];
        const b = ['', '', 'Twenty','Thirty','Forty','Fifty', 'Sixty','Seventy','Eighty','Ninety'];

        if ((num = num.toString()).length > 9) return 'overflow';
        let n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
        if (!n) return; let str = '';
        str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'Crore ' : '';
        str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'Lakh ' : '';
        str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'Thousand ' : '';
        str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'Hundred ' : '';
        str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
        return str.trim() + ' Only';
    },

    // === SIDEBAR ===
    initSidebar: function() {
        const sidebar = document.getElementById('sidebar');
        
        // Highlight active link based on current page
        const currentPath = window.location.pathname.split('/').pop() || 'dashboard.html';
        const navLinks = document.querySelectorAll('.sidebar .nav-link, .sidebar-nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href && currentPath.includes(href.replace('.html', ''))) {
                link.classList.add('active');
            }
        });
    },

    toggleSidebar: function() {
        const sidebar = document.getElementById('sidebar');
        if (!sidebar) return;
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('mobile-open');
            this.toggleSidebarOverlay();
        } else {
            sidebar.classList.toggle('collapsed');
        }
    },

    toggleSidebarOverlay: function() {
        let overlay = document.getElementById('sidebarOverlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'sidebarOverlay';
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
            overlay.addEventListener('click', () => {
                document.getElementById('sidebar').classList.remove('mobile-open');
                overlay.classList.remove('show');
            });
        }
        overlay.classList.toggle('show');
    },

    // === TABLE HELPERS ===
    renderTable: function(containerId, columns, data, actionsRenderer = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!data || data.length === 0) {
            this.renderEmptyState(containerId, 'No records found.');
            return;
        }

        let html = '<div class="table-responsive"><table class="table erp-table"><thead><tr>';
        
        columns.forEach(col => {
            html += `<th>${col.label}</th>`;
        });
        if (actionsRenderer) html += `<th class="text-end">Actions</th>`;
        
        html += '</tr></thead><tbody>';

        data.forEach(row => {
            html += '<tr>';
            columns.forEach(col => {
                let cellData = row[col.key];
                if (col.format === 'currency') cellData = this.formatCurrency(cellData);
                if (col.format === 'date') cellData = this.formatDate(cellData);
                if (col.format === 'badge') {
                    const statusClass = `badge-${String(cellData).toLowerCase()}`;
                    cellData = `<span class="erp-badge ${statusClass}">${cellData}</span>`;
                }
                html += `<td>${cellData !== undefined && cellData !== null ? cellData : '-'}</td>`;
            });

            if (actionsRenderer) {
                html += `<td class="text-end action-btns">${actionsRenderer(row)}</td>`;
            }
            html += '</tr>';
        });

        html += '</tbody></table></div>';
        container.innerHTML = html;
    },

    renderEmptyState: function(containerId, message = 'No data available', icon = 'bi-inbox') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi ${icon}"></i>
                    <h5>${message}</h5>
                </div>
            `;
        }
    },

    // === FORM HELPERS ===
    getFormData: function(formId) {
        const form = document.getElementById(formId);
        if (!form) return {};
        const formData = new FormData(form);
        const data = {};
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        return data;
    },

    setFormData: function(formId, data) {
        const form = document.getElementById(formId);
        if (!form || !data) return;
        
        Object.keys(data).forEach(key => {
            const input = form.elements[key];
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = !!data[key];
                } else {
                    input.value = data[key];
                }
            }
        });
    },

    clearForm: function(formId) {
        const form = document.getElementById(formId);
        if (form) form.reset();
    },

    // === PAGINATION UTILITY ===
    pagination: {},

    initPagination: function(key, renderFn, opts = {}) {
        this.pagination[key] = {
            currentPage: 1,
            pageSize: opts.defaultSize || 10,
            totalData: [],
            renderFn: renderFn,
            containerId: opts.containerId || key + 'PaginationControls'
        };
    },

    paginate: function(key, fullData) {
        const pg = this.pagination[key];
        if (!pg) return;
        pg.totalData = fullData;
        pg.currentPage = 1;
        this._renderPaginatedPage(key);
    },

    _renderPaginatedPage: function(key) {
        const pg = this.pagination[key];
        if (!pg) return;
        const start = (pg.currentPage - 1) * pg.pageSize;
        const end = start + pg.pageSize;
        const pageData = pg.totalData.slice(start, end);
        const totalPages = Math.max(1, Math.ceil(pg.totalData.length / pg.pageSize));

        // Call the original render function with sliced data
        pg.renderFn(pageData);

        // Render pagination controls
        this._renderPaginationControls(key, totalPages);
    },

    _renderPaginationControls: function(key, totalPages) {
        const pg = this.pagination[key];
        let container = document.getElementById(pg.containerId);
        if (!container) return;

        const total = pg.totalData.length;
        const start = total === 0 ? 0 : (pg.currentPage - 1) * pg.pageSize + 1;
        const end = Math.min(pg.currentPage * pg.pageSize, total);

        let pageBtns = '';
        // Prev
        pageBtns += `<li class="page-item ${pg.currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="SGD.goToPage('${key}', ${pg.currentPage - 1}); return false;">‹</a></li>`;
        // Page numbers (show max 5)
        let startPage = Math.max(1, pg.currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        if (endPage - startPage < 4) startPage = Math.max(1, endPage - 4);
        for (let i = startPage; i <= endPage; i++) {
            pageBtns += `<li class="page-item ${i === pg.currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="SGD.goToPage('${key}', ${i}); return false;">${i}</a></li>`;
        }
        // Next
        pageBtns += `<li class="page-item ${pg.currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="SGD.goToPage('${key}', ${pg.currentPage + 1}); return false;">›</a></li>`;

        container.innerHTML = `
            <div class="d-flex flex-wrap justify-content-between align-items-center mt-3 gap-2">
                <div class="d-flex align-items-center gap-2">
                    <span class="text-muted small">Show</span>
                    <select class="form-select form-select-sm" style="width:auto;" onchange="SGD.changePageSize('${key}', this.value)">
                        <option value="10" ${pg.pageSize===10?'selected':''}>10</option>
                        <option value="20" ${pg.pageSize===20?'selected':''}>20</option>
                        <option value="50" ${pg.pageSize===50?'selected':''}>50</option>
                        <option value="100" ${pg.pageSize===100?'selected':''}>100</option>
                        <option value="200" ${pg.pageSize===200?'selected':''}>200</option>
                    </select>
                    <span class="text-muted small">entries</span>
                    <span class="text-muted small ms-2">| Showing ${start} to ${end} of ${total}</span>
                </div>
                <nav><ul class="pagination pagination-sm mb-0">${pageBtns}</ul></nav>
            </div>
        `;
    },

    goToPage: function(key, page) {
        const pg = this.pagination[key];
        if (!pg) return;
        const totalPages = Math.max(1, Math.ceil(pg.totalData.length / pg.pageSize));
        if (page < 1 || page > totalPages) return;
        pg.currentPage = page;
        this._renderPaginatedPage(key);
    },

    changePageSize: function(key, size) {
        const pg = this.pagination[key];
        if (!pg) return;
        pg.pageSize = parseInt(size);
        pg.currentPage = 1;
        this._renderPaginatedPage(key);
    },


    // === DEMO DATA ENGINE ===
    demoData: {
        items: [
            {itemId: 'ITM-0001', itemName: 'Fluted Panel SGD937 Golden Line', category: 'Fluted Panel', hsnCode: '3925', unit: 'PCS', purchasePrice: 220, sellingPrice: 350, currentStock: 150, minStock: 20, gstPercent: 18, status: 'active'},
            {itemId: 'ITM-0002', itemName: 'Wallpaper Classic Floral 3D', category: 'Wallpaper', hsnCode: '4814', unit: 'ROLL', purchasePrice: 500, sellingPrice: 850, currentStock: 45, minStock: 10, gstPercent: 18, status: 'active'},
            {itemId: 'ITM-0003', itemName: 'Artificial Grass 35mm (SqFt)', category: 'Flooring', hsnCode: '5703', unit: 'SQFT', purchasePrice: 35, sellingPrice: 65, currentStock: 1200, minStock: 200, gstPercent: 18, status: 'active'},
            {itemId: 'ITM-0004', itemName: 'PVC Ceiling Panel Wooden Texture', category: 'PVC Panel', hsnCode: '3925', unit: 'SQFT', purchasePrice: 42, sellingPrice: 75, currentStock: 500, minStock: 100, gstPercent: 18, status: 'active'},
            {itemId: 'ITM-0005', itemName: 'WPC Louvers Dark Walnut', category: 'Louvers', hsnCode: '3925', unit: 'PCS', purchasePrice: 380, sellingPrice: 550, currentStock: 80, minStock: 20, gstPercent: 18, status: 'active'}
        ],
        parties: [
            {partyId: 'PTY-0001', partyName: 'Chaya Wallpaper & Interior', partyType: 'Customer', gstin: '19XXXXX1234A1Z5', phone: '9876543210', city: 'Kolkata', state: 'West Bengal', stateCode: '19', currentBalance: 75000, balanceType: 'Dr', status: 'active'},
            {partyId: 'PTY-0002', partyName: 'Roy Decorators', partyType: 'Customer', gstin: '19YYYYY5678B2Z6', phone: '9876543211', city: 'Howrah', state: 'West Bengal', stateCode: '19', currentBalance: 12500, balanceType: 'Dr', status: 'active'},
            {partyId: 'PTY-0003', partyName: 'Delhi Wall Coverings', partyType: 'Supplier', gstin: '07ZZZZZ9012C3Z7', phone: '9876543212', city: 'New Delhi', state: 'Delhi', stateCode: '07', currentBalance: 150000, balanceType: 'Cr', status: 'active'},
            {partyId: 'PTY-0004', partyName: 'Cash Customer', partyType: 'Customer', gstin: '', phone: '', city: '', state: 'West Bengal', stateCode: '19', currentBalance: 0, balanceType: 'Dr', status: 'active'}
        ],
        sales: [
            {saleId: 'SAL-0001', invoiceNo: 'SGD/26-27/001', invoiceDate: '2026-08-04', partyId: 'PTY-0001', partyName: 'Chaya Wallpaper & Interior', taxableAmount: 213559.32, cgst: 19220.34, sgst: 19220.34, igst: 0, totalAmount: 252000, amountPaid: 177000, balanceDue: 75000, paymentStatus: 'Partial', status: 'active'}
        ],
        purchases: [
            {purchaseId: 'PUR-0001', billNo: 'DWC-9872', billDate: '2026-08-01', partyId: 'PTY-0003', partyName: 'Delhi Wall Coverings', taxableAmount: 127118.64, cgst: 0, sgst: 0, igst: 22881.36, totalAmount: 150000, amountPaid: 0, balanceDue: 150000, paymentStatus: 'Unpaid', status: 'active'}
        ]
    },

    handleDemoRequest: async function(action, payload) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    let result = null;
                    switch (action) {
                        case 'getDashboardData':
                            result = this.demoGetDashboard();
                            break;
                        case 'getItems':
                            result = { success: true, data: this.demoData.items };
                            break;
                        case 'saveItem':
                            if (payload && payload.itemId) {
                                const idx = this.demoData.items.findIndex(i => i.itemId === payload.itemId);
                                if (idx >= 0) this.demoData.items[idx] = { ...this.demoData.items[idx], ...payload };
                            } else {
                                const newId = 'ITM-' + String(this.demoData.items.length + 1).padStart(4, '0');
                                this.demoData.items.push({ itemId: newId, ...payload, status: 'active' });
                            }
                            result = { success: true, message: 'Item saved successfully' };
                            break;
                        case 'deleteItem':
                            this.demoData.items = this.demoData.items.filter(i => i.itemId !== payload.itemId);
                            result = { success: true, message: 'Item deleted' };
                            break;
                        case 'getParties':
                            let parties = this.demoData.parties;
                            if (payload && payload.type) parties = parties.filter(p => p.partyType === payload.type);
                            result = { success: true, data: parties };
                            break;
                        case 'saveParty':
                            if (payload && payload.partyId) {
                                const idx = this.demoData.parties.findIndex(p => p.partyId === payload.partyId);
                                if (idx >= 0) this.demoData.parties[idx] = { ...this.demoData.parties[idx], ...payload };
                            } else {
                                const newId = 'PTY-' + String(this.demoData.parties.length + 1).padStart(4, '0');
                                this.demoData.parties.push({ partyId: newId, ...payload, status: 'active', currentBalance: 0, balanceType: 'Dr' });
                            }
                            result = { success: true, message: 'Party saved successfully' };
                            break;
                        case 'deleteParty':
                            this.demoData.parties = this.demoData.parties.filter(p => p.partyId !== payload.partyId);
                            result = { success: true, message: 'Party deleted' };
                            break;
                        case 'getPartyLedger':
                            result = { success: true, data: [] };
                            break;
                        case 'getSales':
                            result = { success: true, data: this.demoData.sales };
                            break;
                        case 'getSaleDetails':
                            const sale = this.demoData.sales.find(s => s.saleId === (payload.saleId || payload.id));
                            result = { success: true, data: { sale: sale || {}, items: [] } };
                            break;
                        case 'createSale':
                            const newSaleId = 'SAL-' + String(this.demoData.sales.length + 1).padStart(4, '0');
                            const invoiceNum = this.demoData.sales.length + 1;
                            const newInvoiceNo = 'SGD_' + String(invoiceNum).padStart(4, '0') + '_26-27';
                            this.demoData.sales.push({ saleId: newSaleId, invoiceNo: newInvoiceNo, ...payload, status: 'active' });
                            result = { success: true, data: { saleId: newSaleId, invoiceNo: newInvoiceNo }, message: 'Invoice created' };
                            break;
                        case 'cancelSale':
                            const saleIdx = this.demoData.sales.findIndex(s => s.saleId === payload.saleId);
                            if (saleIdx >= 0) this.demoData.sales[saleIdx].status = 'cancelled';
                            result = { success: true, message: 'Sale cancelled' };
                            break;
                        case 'getNextInvoiceNo':
                            const nextNum = this.demoData.sales.length + 1;
                            result = { success: true, data: { invoiceNo: 'SGD_' + String(nextNum).padStart(4, '0') + '_26-27' } };
                            break;
                        case 'getPurchases':
                            result = { success: true, data: this.demoData.purchases };
                            break;
                        case 'createPurchase':
                            const newPurId = 'PUR-' + String(this.demoData.purchases.length + 1).padStart(4, '0');
                            this.demoData.purchases.push({ purchaseId: newPurId, ...payload, status: 'active' });
                            result = { success: true, data: { purchaseId: newPurId }, message: 'Purchase recorded' };
                            break;
                        case 'getPurchaseDetails':
                            const purchase = this.demoData.purchases.find(p => p.purchaseId === (payload.purchaseId || payload.id));
                            result = { success: true, data: { purchase: purchase || {}, items: [] } };
                            break;
                        case 'cancelPurchase':
                            const purIdx = this.demoData.purchases.findIndex(p => p.purchaseId === payload.purchaseId);
                            if (purIdx >= 0) this.demoData.purchases[purIdx].status = 'cancelled';
                            result = { success: true, message: 'Purchase cancelled' };
                            break;
                        case 'recordPayment':
                            result = { success: true, message: 'Payment recorded' };
                            break;
                        case 'getPayments':
                            result = { success: true, data: [] };
                            break;
                        case 'getReportData':
                            result = this.demoGetReport(payload);
                            break;
                        case 'getSettings':
                            result = { success: true, data: { CompanyName: 'SGD', TradeName: 'SGD Interior & Wallpaper', State: 'West Bengal', StateCode: '19' } };
                            break;
                        case 'getInvoiceHTML':
                            result = { success: true, data: { html: '<div class="text-center p-5">Invoice preview (connect backend for full invoice)</div>' } };
                            break;
                        default:
                            result = { success: true, data: [], message: 'Demo mode - action: ' + action };
                    }
                    resolve(result);
                } catch (e) {
                    resolve({ success: false, message: e.message });
                }
            }, 200);
        });
    },

    demoGetReport: function(payload) {
        const type = payload.reportType || payload.type || 'salesReport';
        switch(type) {
            case 'salesReport':
                return { success: true, data: this.demoData.sales, summary: { totalSales: 252000, totalTax: 38440.68, totalReceived: 177000, totalOutstanding: 75000 } };
            case 'purchaseReport':
                return { success: true, data: this.demoData.purchases, summary: { totalPurchases: 150000, totalTax: 22881.36, totalPaid: 0, totalPayable: 150000 } };
            case 'stockReport':
                return { success: true, data: this.demoData.items, summary: { totalItems: this.demoData.items.length, totalStockValue: 0, totalSellingValue: 0 } };
            case 'outstandingReport':
                return { success: true, data: { receivables: this.demoData.parties.filter(p => p.balanceType === 'Dr' && p.currentBalance > 0), payables: this.demoData.parties.filter(p => p.balanceType === 'Cr' && p.currentBalance > 0) }, summary: { totalReceivable: 87500, totalPayable: 150000 } };
            default:
                return { success: true, data: [], summary: {} };
        }
    },

    demoGetDashboard: function() {
        const salesTotal = this.demoData.sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
        const purchasesTotal = this.demoData.purchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        
        let receivable = 0;
        let payable = 0;
        
        this.demoData.parties.forEach(p => {
            if (p.balanceType === 'Dr') receivable += (p.currentBalance || 0);
            if (p.balanceType === 'Cr') payable += (p.currentBalance || 0);
        });

        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const months = [];
        for (let i = 5; i >= 0; i--) {
            let d = new Date();
            d.setMonth(d.getMonth() - i);
            months.push(monthNames[d.getMonth()]);
        }

        return {
            success: true,
            data: {
                todaySales: salesTotal,
                monthSales: salesTotal,
                todayPurchases: purchasesTotal,
                monthPurchases: purchasesTotal,
                totalReceivables: receivable,
                totalPayables: payable,
                lowStockCount: this.demoData.items.filter(i => (i.currentStock || 0) <= (i.minStock || 0)).length,
                recentSales: this.demoData.sales.slice(0, 5).map(s => ({
                    InvoiceNo: s.invoiceNo,
                    InvoiceDate: s.invoiceDate,
                    PartyName: s.partyName,
                    TotalAmount: s.totalAmount,
                    Status: s.paymentStatus || 'Partial'
                })),
                lowStockItems: this.demoData.items.filter(i => (i.currentStock || 0) <= (i.minStock || 0)).slice(0, 5).map(i => ({
                    ItemName: i.itemName,
                    CurrentStock: i.currentStock,
                    MinStock: i.minStock
                })),
                chartData: {
                    months: months,
                    sales: [0, 0, 0, 0, 0, salesTotal],
                    purchases: [0, 0, 0, 0, 0, purchasesTotal],
                    topItems: {
                        labels: this.demoData.items.slice(0, 5).map(i => i.itemName),
                        data: this.demoData.items.slice(0, 5).map(i => i.currentStock || 0)
                    }
                }
            }
        };
    }
};

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', () => {
    // Detect if we're on the login page
    const currentPage = window.location.pathname.split('/').pop() || '';
    const isLoginPage = currentPage === 'index.html' || currentPage === '' || currentPage === '/';
    
    // Only check auth on non-login pages
    if (!isLoginPage) {
        if (!SGD.checkAuth()) {
            window.location.href = 'index.html';
            return;
        }
        SGD.initSidebar();
        SGD.initToastContainer();
        SGD.setCurrentUserUI();
    }
    
    // Add logout listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            SGD.logout();
        });
    }
});
