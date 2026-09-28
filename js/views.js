window.Views = {};
window.Views.dashboard = `<div class="content-area p-4">
        <!-- KPI Cards Row -->
        <div class="row g-4 mb-4">
          <div class="col-md-3">
            <div class="stat-card stat-card-orange">
              <div class="stat-icon-wrapper">
                <i class="bi bi-graph-up-arrow"></i>
              </div>
              <div class="stat-details">
                <div class="stat-value" id="kpiTodaySales">₹ 0.00</div>
                <div class="stat-title">Today's Sales</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card stat-card-green">
              <div class="stat-icon-wrapper">
                <i class="bi bi-calendar-check"></i>
              </div>
              <div class="stat-details">
                <div class="stat-value" id="kpiMonthSales">₹ 0.00</div>
                <div class="stat-title">This Month Sales</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card stat-card-cyan">
              <div class="stat-icon-wrapper">
                <i class="bi bi-cash-coin"></i>
              </div>
              <div class="stat-details">
                <div class="stat-value" id="kpiReceivable">₹ 0.00</div>
                <div class="stat-title">Outstanding Receivable</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card stat-card-purple">
              <div class="stat-icon-wrapper">
                <i class="bi bi-credit-card"></i>
              </div>
              <div class="stat-details">
                <div class="stat-value" id="kpiPayable">₹ 0.00</div>
                <div class="stat-title">Outstanding Payable</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions Row -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card border-0 shadow-sm">
              <div class="card-body p-3 d-flex gap-3 flex-wrap">
                <a href="sales.html" class="btn btn-success"><i class="bi bi-plus-lg me-2"></i>New Sale</a>
                <a href="purchase.html" class="btn btn-primary"><i class="bi bi-plus-lg me-2"></i>New Purchase</a>
                <a href="inventory.html" class="btn btn-outline-primary"><i class="bi bi-plus-lg me-2"></i>Add Item</a>
                <a href="parties.html" class="btn btn-outline-info"><i class="bi bi-plus-lg me-2"></i>Add Party</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Charts Row -->
        <div class="row g-4 mb-4">
          <div class="col-md-8">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-0 pt-3">
                <h6 class="mb-0 fw-bold">Sales vs Purchase (Last 6 Months)</h6>
              </div>
              <div class="card-body">
                <canvas id="salesPurchaseChart" height="300"></canvas>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-0 pt-3">
                <h6 class="mb-0 fw-bold">Top 5 Selling Items</h6>
              </div>
              <div class="card-body d-flex justify-content-center align-items-center">
                <canvas id="topItemsChart" height="300"></canvas>
              </div>
            </div>
          </div>
        </div>

        <!-- Tables Row -->
        <div class="row g-4">
          <div class="col-md-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold">Recent Sales</h6>
                <a href="sales.html" class="btn btn-sm btn-link text-decoration-none">View All</a>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Invoice No</th>
                        <th>Date</th>
                        <th>Party</th>
                        <th class="text-end">Amount</th>
                        <th class="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody id="recentSalesTableBody">
                      <!-- Rendered by JS -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-0 shadow-sm h-100">
              <div class="card-header bg-white border-0 pt-3 d-flex justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold">Low Stock Alert</h6>
                <a href="inventory.html" class="btn btn-sm btn-link text-decoration-none">Manage Inventory</a>
              </div>
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover align-middle mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Item</th>
                        <th class="text-end">Stock</th>
                        <th class="text-end">Min Level</th>
                        <th class="text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody id="lowStockTableBody">
                      <!-- Rendered by JS -->
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

`;
window.Views.inventory = `<div class="content-area p-4">
        <!-- Stats Row -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="stat-card stat-card-blue">
              <div class="stat-icon-wrapper">
                <i class="bi bi-box-seam"></i>
              </div>
              <div class="stat-details">
                <div class="stat-value" id="statTotalItems">0</div>
                <div class="stat-title">Total Items</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card stat-card-green">
              <div class="stat-icon-wrapper">
                <i class="bi bi-check-circle"></i>
              </div>
              <div class="stat-details">
                <div class="stat-value" id="statInStock">0</div>
                <div class="stat-title">In Stock</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card stat-card-orange">
              <div class="stat-icon-wrapper">
                <i class="bi bi-exclamation-circle"></i>
              </div>
              <div class="stat-details">
                <div class="stat-value" id="statLowStock">0</div>
                <div class="stat-title">Low Stock</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="stat-card stat-card-red">
              <div class="stat-icon-wrapper">
                <i class="bi bi-x-circle"></i>
              </div>
              <div class="stat-details">
                <div class="stat-value" id="statOutOfStock">0</div>
                <div class="stat-title">Out of Stock</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Table Card -->
        <div class="card border-0 shadow-sm">
          <div class="card-body">
            <!-- Toolbar -->
            <div class="row mb-3 g-2 align-items-center">
              <div class="col-md-3">
                <div class="input-group">
                  <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                  <input type="text" class="form-control" id="searchItemInput" placeholder="Search items...">
                </div>
              </div>
              <div class="col-md-2">
                <select class="form-select" id="filterCategory">
                  <option value="">All Categories</option>
                </select>
              </div>
              <div class="col-md-2">
                <select class="form-select" id="filterStatus">
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div class="col-md-5 text-md-end d-flex justify-content-md-end gap-2">
                <button class="btn btn-outline-secondary" onclick="exportItems()" title="Export to CSV">
                  <i class="bi bi-download"></i> <span class="d-none d-lg-inline">Export</span>
                </button>
                <button class="btn btn-outline-secondary" onclick="openImportModal()" title="Import from CSV">
                  <i class="bi bi-upload"></i> <span class="d-none d-lg-inline">Import</span>
                </button>
                <button class="btn btn-primary" onclick="openAddModal()">
                  <i class="bi bi-plus-lg"></i> Add Item
                </button>
              </div>
            </div>

            <!-- Table -->
            <div class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th style="cursor:pointer;" onclick="sortTable('itemCode')">Item Code <i class="bi bi-arrow-down-up small"></i></th>
                    <th style="cursor:pointer;" onclick="sortTable('itemName')">Item Name <i class="bi bi-arrow-down-up small"></i></th>
                    <th style="cursor:pointer;" onclick="sortTable('category')">Category <i class="bi bi-arrow-down-up small"></i></th>
                    <th>HSN</th>
                    <th class="text-end" style="cursor:pointer;" onclick="sortTable('stock')">Stock <i class="bi bi-arrow-down-up small"></i></th>
                    <th>Unit</th>
                    <th class="text-end">Pur. Price</th>
                    <th class="text-end">Sell Price</th>
                    <th class="text-center">GST%</th>
                    <th class="text-center">Status</th>
                    <th class="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody id="inventoryTableBody">
                  <!-- Rendered via JS -->
                </tbody>
              </table>
            </div>
            
            <!-- Pagination -->
            <div id="inventoryPaginationControls"></div>
          </div>
        </div>
      </div>

<div class="modal fade" id="itemModal" tabindex="-1" aria-labelledby="itemModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="itemModalLabel">Add New Item</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form id="itemForm">
            <input type="hidden" id="itemId" name="id">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Item Name <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="itemName" name="itemName" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Category <span class="text-danger">*</span></label>
                <div class="input-group">
                  <select class="form-select" id="itemCategory" name="category" required>
                    <option value="">Loading...</option>
                  </select>
                  <button class="btn btn-outline-secondary" type="button" onclick="manageCategories()" title="Manage Categories">
                    <i class="bi bi-gear"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-6">
                <label class="form-label">HSN/SAC Code</label>
                <input type="text" class="form-control" id="itemHsn" name="hsn">
              </div>
              <div class="col-md-6">
                <label class="form-label">Unit <span class="text-danger">*</span></label>
                <select class="form-select" id="itemUnit" name="unit" required>
                  <option value="">Select...</option>
                  <option value="PCS">PCS</option>
                  <option value="ROL">ROL</option>
                  <option value="SQF">SQF</option>
                  <option value="MTR">MTR</option>
                  <option value="BOX">BOX</option>
                  <option value="KG">KG</option>
                  <option value="LTR">LTR</option>
                  <option value="SET">SET</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Purchase Price <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">₹</span>
                  <input type="number" step="0.01" class="form-control" id="itemPurchasePrice" name="purchasePrice" required>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label">Selling Price <span class="text-danger">*</span></label>
                <div class="input-group">
                  <span class="input-group-text">₹</span>
                  <input type="number" step="0.01" class="form-control" id="itemSellingPrice" name="sellingPrice" required>
                </div>
              </div>
              <div class="col-md-4">
                <label class="form-label">GST % <span class="text-danger">*</span></label>
                <select class="form-select" id="itemGst" name="gst" required>
                  <option value="0">0%</option>
                  <option value="5">5%</option>
                  <option value="12">12%</option>
                  <option value="18" selected>18%</option>
                  <option value="28">28%</option>
                </select>
              </div>
              <div class="col-md-4">
                <label class="form-label">Current Stock</label>
                <input type="number" class="form-control" id="itemStock" name="stock" value="0">
              </div>
              <div class="col-md-4">
                <label class="form-label">Min Stock Level</label>
                <input type="number" class="form-control" id="itemMinStock" name="minStock" value="10">
              </div>
              <div class="col-md-4">
                <label class="form-label">Status</label>
                <select class="form-select" id="itemStatus" name="status">
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div class="col-12">
                <label class="form-label">Description</label>
                <textarea class="form-control" id="itemDescription" name="description" rows="2"></textarea>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="saveItem()">Save Item</button>
        </div>
      </div>
    </div>
  </div>

<div class="modal fade" id="deleteModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Confirm Delete</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          Are you sure you want to delete this item? This action cannot be undone.
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Delete</button>
        </div>
      </div>
    </div>
  </div>

<div class="modal fade" id="categoryModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Manage Categories</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="input-group mb-3">
            <input type="text" class="form-control" id="newCategoryName" placeholder="New Category Name">
            <button class="btn btn-primary" type="button" onclick="addCategory()">Add</button>
          </div>
          <ul class="list-group" id="categoryList">
            <li class="list-group-item text-center text-muted">Loading categories...</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

<div class="modal fade" id="importModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Import Items</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted small mb-4">
            Upload a CSV file to bulk import items. Download the sample file to see the required format.
          </p>
          <div class="d-flex justify-content-between mb-4">
            <button type="button" class="btn btn-outline-secondary btn-sm" onclick="downloadSampleCSV()">
              <i class="bi bi-file-earmark-arrow-down me-1"></i> Download Sample CSV
            </button>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Select CSV File</label>
            <input type="file" class="form-control" id="importFileInput" accept=".csv">
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          <button type="button" class="btn btn-primary" onclick="processImport()">Import Data</button>
        </div>
      </div>
    </div>
  </div>`;
window.Views.sales = `<div class="content-area p-4">
        
        <!-- VIEW 1: SALES LIST -->
        <div id="salesListView">
          <!-- Stats Row -->
          <div class="row g-3 mb-4">
            <div class="col-md-3">
              <div class="stat-card stat-card-blue">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-graph-up"></i>
                </div>
                <div class="stat-details">
                  <div class="stat-value" id="statTotalSales">₹ 0</div>
                  <div class="stat-title">Total Sales (Month)</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-card-pink">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-receipt"></i>
                </div>
                <div class="stat-details">
                  <div class="stat-value" id="statTotalInvoices">0</div>
                  <div class="stat-title">Total Invoices</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-card-green">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-check-circle"></i>
                </div>
                <div class="stat-details">
                  <div class="stat-value" id="statPaid">₹ 0</div>
                  <div class="stat-title">Paid Amount</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-card-red">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-exclamation-circle"></i>
                </div>
                <div class="stat-details">
                  <div class="stat-value" id="statUnpaid">₹ 0</div>
                  <div class="stat-title">Unpaid Balance</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Table Card -->
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <!-- Toolbar -->
              <div class="row mb-3 g-2 align-items-center">
                <div class="col-md-3">
                  <div class="input-group">
                    <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                    <input type="text" class="form-control" id="searchSaleInput" placeholder="Search invoices...">
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="input-group">
                    <span class="input-group-text bg-white"><i class="bi bi-calendar3"></i></span>
                    <input type="text" class="form-control" id="dateRangeFilter" placeholder="Select Date Range">
                  </div>
                </div>
                <div class="col-md-2">
                  <select class="form-select" id="filterSaleStatus">
                    <option value="">All Statuses</option>
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div class="col-md-3 text-md-end">
                  <button class="btn btn-success w-100" onclick="openNewSale()">
                    <i class="bi bi-plus-lg me-1"></i> New Sale
                  </button>
                </div>
              </div>

              <!-- Table -->
              <div class="table-responsive">
                <table class="table table-hover align-middle">
                  <thead class="table-light">
                    <tr>
                      <th>Invoice No</th>
                      <th>Date</th>
                      <th>Customer</th>
                      <th class="text-center">Items</th>
                      <th class="text-end">Total Amount</th>
                      <th class="text-end">Paid</th>
                      <th class="text-end">Balance</th>
                      <th class="text-center">Status</th>
                      <th class="text-end">Actions</th>
                    </tr>
                  </thead>
                  <tbody id="salesTableBody">
                    <!-- Rendered via JS -->
                  </tbody>
                </table>
              </div>
              <div id="salesPaginationControls"></div>
            </div>
          </div>
        </div>

        <!-- VIEW 2: CREATE NEW SALE -->
        <div id="createSaleView" class="d-none">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-0 pt-3 pb-0 d-flex justify-content-between align-items-center">
              <h5 class="fw-bold mb-0">Create Tax Invoice</h5>
              <button class="btn btn-outline-secondary btn-sm" onclick="closeNewSale()">
                <i class="bi bi-arrow-left me-1"></i> Back to List
              </button>
            </div>
            <div class="card-body">
              <form id="saleForm">
                <!-- Header -->
                <div class="row g-3 mb-4 border-bottom pb-3">
                  <div class="col-md-3">
                    <label class="form-label">Invoice No</label>
                    <input type="text" class="form-control bg-light" id="invoiceNo" readonly>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Invoice Date</label>
                    <input type="text" class="form-control flatpickr-date" id="invoiceDate" required>
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Due Date</label>
                    <input type="text" class="form-control flatpickr-date" id="dueDate">
                  </div>
                  <div class="col-md-3">
                    <label class="form-label">Vehicle/Transport No</label>
                    <input type="text" class="form-control" id="vehicleNo">
                  </div>
                </div>

                <!-- Customer Selection -->
                <div class="row g-3 mb-4 border-bottom pb-3">
                  <div class="col-md-6">
                    <label class="form-label">Select Customer <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <select class="form-select" id="customerId" required onchange="selectCustomer(this.value)">
                        <option value="">-- Search Customer --</option>
                        <!-- Loaded via JS -->
                      </select>
                      <button class="btn btn-outline-primary" type="button" onclick="openQuickAddPartyModal('Customer')" title="Add New Customer">
                        <i class="bi bi-person-plus-fill me-1"></i>Add
                      </button>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="bg-light p-3 rounded" id="customerDetailsBox" style="min-height: 85px;">
                      <span class="text-muted">Customer details will appear here...</span>
                    </div>
                  </div>
                </div>

                <!-- Items Table -->
                <div class="table-responsive mb-4">
                  <table class="table table-bordered align-middle" id="invoiceItemsTable">
                    <thead class="table-light">
                      <tr>
                        <th style="width: 25%">Item</th>
                        <th style="width: 8%">HSN</th>
                        <th style="width: 8%">Qty</th>
                        <th style="width: 8%">Unit</th>
                        <th style="width: 10%">Rate (₹)</th>
                        <th style="width: 8%">Disc(%)</th>
                        <th style="width: 10%">Taxable Value</th>
                        <th style="width: 8%">GST%</th>
                        <th style="width: 10%">Total Amount</th>
                        <th style="width: 5%"></th>
                      </tr>
                    </thead>
                    <tbody id="invoiceItemsBody">
                      <!-- Dynamic rows -->
                    </tbody>
                  </table>
                  <button type="button" class="btn btn-sm btn-primary" onclick="addItemRow()">
                    <i class="bi bi-plus-circle me-1"></i> Add Row
                  </button>
                </div>

                <!-- Totals Section -->
                <div class="row mb-4">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label class="form-label">Notes/Remarks</label>
                      <textarea class="form-control" id="saleNotes" rows="3"></textarea>
                    </div>
                    <div class="row g-2">
                      <div class="col-md-6">
                        <label class="form-label">Payment Mode</label>
                        <select class="form-select" id="paymentMode">
                          <option value="Credit">Credit / Unpaid</option>
                          <option value="Cash">Cash</option>
                          <option value="Bank">Bank Transfer / NEFT</option>
                          <option value="UPI">UPI</option>
                        </select>
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Amount Paid Now (₹)</label>
                        <input type="number" step="0.01" class="form-control" id="amountPaid" value="0" oninput="calculateInvoiceTotals()">
                      </div>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="card bg-light border-0">
                      <div class="card-body">
                        <table class="table table-sm table-borderless table-totals mb-0">
                          <tbody>
                            <tr>
                              <td class="text-end">Sub Total:</td>
                              <td class="text-end fw-bold" style="width: 150px;" id="lblSubTotal">₹ 0.00</td>
                            </tr>
                            <tr>
                              <td class="text-end">Overall Discount (%):</td>
                              <td class="text-end">
                                <input type="number" step="0.1" class="form-control form-control-sm text-end" id="overallDiscount" value="0" oninput="calculateInvoiceTotals()">
                              </td>
                            </tr>
                            <tr>
                              <td class="text-end text-danger">Total Discount:</td>
                              <td class="text-end fw-bold text-danger" id="lblTotalDiscount">-₹ 0.00</td>
                            </tr>
                            <tr>
                              <td class="text-end">Taxable Amount:</td>
                              <td class="text-end fw-bold" id="lblTaxableAmount">₹ 0.00</td>
                            </tr>
                            <tr>
                              <td class="text-end">Total CGST:</td>
                              <td class="text-end" id="lblTotalCGST">₹ 0.00</td>
                            </tr>
                            <tr>
                              <td class="text-end">Total SGST:</td>
                              <td class="text-end" id="lblTotalSGST">₹ 0.00</td>
                            </tr>
                            <tr>
                              <td class="text-end">Round Off:</td>
                              <td class="text-end" id="lblRoundOff">₹ 0.00</td>
                            </tr>
                            <tr class="border-top border-dark">
                              <td class="text-end fs-5 fw-bold text-primary">Grand Total:</td>
                              <td class="text-end fs-5 fw-bold text-primary" id="lblGrandTotal">₹ 0.00</td>
                            </tr>
                            <tr>
                              <td class="text-end text-danger">Balance Due:</td>
                              <td class="text-end text-danger fw-bold" id="lblBalanceDue">₹ 0.00</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-12 text-end">
                    <button type="button" class="btn btn-light me-2" onclick="closeNewSale()">Cancel</button>
                    <button type="button" class="btn btn-secondary me-2" onclick="saveSale(false)">Save Only</button>
                    <button type="button" class="btn btn-success" onclick="saveSale(true)"><i class="bi bi-printer me-1"></i> Save & Print</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

      </div>

<div class="modal fade" id="invoicePreviewModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl" id="invoiceModalDialog">
      <div class="modal-content">
        <div class="modal-header py-2">
          <div class="d-flex align-items-center gap-3 w-100">
            <h5 class="modal-title mb-0"><i class="bi bi-receipt me-2"></i>Invoice Preview</h5>
            <div class="d-flex align-items-center gap-2 ms-auto me-2">
              <span class="text-muted" style="font-size:12px;white-space:nowrap">Format:</span>
              <div class="invoice-theme-selector d-flex gap-1">
                <button class="inv-theme-btn active" data-theme="blue" onclick="setInvoiceTheme('blue',this)" title="Classic Blue" style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#0d2157,#1e88e5);border:2px solid #1565c0;cursor:pointer;outline:none"></button>
                <button class="inv-theme-btn" data-theme="green" onclick="setInvoiceTheme('green',this)" title="Forest Green" style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#1b5e20,#43a047);border:2px solid #2e7d32;cursor:pointer;outline:none"></button>
                <button class="inv-theme-btn" data-theme="dark" onclick="setInvoiceTheme('dark',this)" title="Elegant Dark" style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#212121,#424242);border:2px solid #333;cursor:pointer;outline:none"></button>
                <button class="inv-theme-btn" data-theme="minimal" onclick="setInvoiceTheme('minimal',this)" title="Minimal Grey" style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#546e7a,#90a4ae);border:2px solid #78909c;cursor:pointer;outline:none"></button>
                <button class="inv-theme-btn" data-theme="saffron" onclick="setInvoiceTheme('saffron',this)" title="Saffron (GST)" style="width:22px;height:22px;border-radius:50%;background:linear-gradient(135deg,#bf360c,#ff8f00);border:2px solid #e65100;cursor:pointer;outline:none"></button>
              </div>
              <div class="vr mx-1" style="opacity:0.2"></div>
              <button type="button" class="btn btn-sm btn-light" id="invoiceFullscreenBtn" onclick="toggleInvoiceFullscreen()" title="Toggle Fullscreen" style="padding:3px 8px;border:1px solid #dde3ee">
                <i class="bi bi-fullscreen" id="invoiceFullscreenIcon"></i>
              </button>
            </div>
          </div>
          <button type="button" class="btn-close ms-1" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body invoice-preview-container p-0" style="background:#f0f2f7">
          <div id="invoiceDocument" style="max-height:78vh;overflow-y:auto;">
            <!-- HTML generated by InvoiceGenerator will go here -->
          </div>
        </div>
        <div class="modal-footer py-2">
          <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal"><i class="bi bi-x-lg me-1"></i>Close</button>
          <button type="button" class="btn btn-outline-primary btn-sm" onclick="downloadCurrentPDF()"><i class="bi bi-download me-1"></i>Download PDF</button>
          <button type="button" class="btn btn-primary btn-sm" onclick="printCurrentInvoice()"><i class="bi bi-printer me-1"></i>Print</button>
        </div>
      </div>
    </div>
  </div>`;
window.Views.purchase = `<div class="content-area p-4">
        <!-- PAGE SPECIFIC CONTENT -->
        
        <!-- Top bar -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex gap-2 w-50">
                <input type="text" id="searchInput" class="form-control" placeholder="Search by Bill No, Supplier..." oninput="filterPurchases()">
                <input type="text" id="dateFilter" class="form-control" placeholder="Select Date Range">
            </div>
            <button class="btn btn-primary" onclick="openNewPurchase()">
                <i class="bi bi-plus-circle me-2"></i>New Purchase
            </button>
        </div>

        <!-- Stats mini cards -->
        <div class="row g-3 mb-4">
            <div class="col-md-3">
              <div class="stat-card stat-card-purple">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-cart"></i>
                </div>
                <div class="stat-details">
                  <div class="stat-value" id="statTotalPurchases">0</div>
                  <div class="stat-title">Total Purchases (Month)</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-card-cyan">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-currency-rupee"></i>
                </div>
                <div class="stat-details">
                  <div class="stat-value" id="statTotalAmount">₹ 0.00</div>
                  <div class="stat-title">Total Amount</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-card-green">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-check-circle"></i>
                </div>
                <div class="stat-details">
                  <div class="stat-value" id="statPaidAmount">₹ 0.00</div>
                  <div class="stat-title">Paid Amount</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-card-red">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-exclamation-circle"></i>
                </div>
                <div class="stat-details">
                  <div class="stat-value" id="statUnpaidAmount">₹ 0.00</div>
                  <div class="stat-title">Unpaid Balance</div>
                </div>
              </div>
            </div>
        </div>

        <!-- Purchase List Table -->
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Bill No</th>
                                <th>Date</th>
                                <th>Supplier</th>
                                <th>Total Amount</th>
                                <th>Paid</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="purchaseTableBody">
                            <!-- Rows rendered by JS -->
                        </tbody>
                    </table>
                </div>
                <div id="purchasePaginationControls"></div>
            </div>
        </div>

      </div>

<div class="modal fade" id="newPurchaseModal" tabindex="-1">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">New Purchase Entry</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="purchaseForm">
                    <div class="row mb-3">
                        <div class="col-md-3">
                            <label class="form-label">Supplier Bill No <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="billNo" required>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Bill Date <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="billDate" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Supplier <span class="text-danger">*</span></label>
                            <div class="input-group">
                                <select class="form-select" id="supplierSelect" onchange="selectSupplier(this.value)" required>
                                    <option value="">Select Supplier...</option>
                                    <!-- Populated by JS -->
                                </select>
                                <button class="btn btn-outline-primary" type="button" onclick="openQuickAddPartyModal('Supplier')" title="Add New Supplier">
                                    <i class="bi bi-person-plus-fill me-1"></i>Add
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <h6 class="mt-4 mb-3">Items</h6>
                    <div class="table-responsive mb-3">
                        <table class="table table-bordered table-sm" id="itemsTable">
                            <thead class="table-light">
                                <tr>
                                    <th width="25%">Item</th>
                                    <th width="10%">HSN</th>
                                    <th width="10%">Qty</th>
                                    <th width="10%">Unit</th>
                                    <th width="12%">Rate</th>
                                    <th width="8%">GST%</th>
                                    <th width="10%">Tax Amt</th>
                                    <th width="10%">Total</th>
                                    <th width="5%"></th>
                                </tr>
                            </thead>
                            <tbody id="itemsTableBody">
                                <!-- Dynamic rows -->
                            </tbody>
                        </table>
                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="addPurchaseItemRow()">
                            <i class="bi bi-plus"></i> Add Row
                        </button>
                    </div>

                    <div class="row">
                        <div class="col-md-6">
                            <div class="mb-3">
                                <label class="form-label">Notes</label>
                                <textarea class="form-control" id="purchaseNotes" rows="3"></textarea>
                            </div>
                            <div class="card bg-light">
                                <div class="card-body py-2">
                                    <h6 class="card-title">Payment Details</h6>
                                    <div class="row">
                                        <div class="col-md-6 mb-2">
                                            <label class="form-label mb-0 small">Payment Mode</label>
                                            <select class="form-select form-select-sm" id="paymentMode">
                                                <option value="Cash">Cash</option>
                                                <option value="Bank">Bank/UPI</option>
                                                <option value="Credit">Credit</option>
                                            </select>
                                        </div>
                                        <div class="col-md-6 mb-2">
                                            <label class="form-label mb-0 small">Amount Paid</label>
                                            <input type="number" class="form-control form-control-sm" id="amountPaid" value="0" oninput="calculatePurchaseTotals()">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <table class="table table-borderless text-end">
                                <tr>
                                    <td>Sub Total:</td>
                                    <th id="subTotal">₹ 0.00</th>
                                </tr>
                                <tr>
                                    <td>Total Tax:</td>
                                    <th id="totalTax">₹ 0.00</th>
                                </tr>
                                <tr class="fs-5 text-primary">
                                    <td>Grand Total:</td>
                                    <th id="grandTotal">₹ 0.00</th>
                                </tr>
                                <tr>
                                    <td>Balance Due:</td>
                                    <th class="text-danger" id="balanceDue">₹ 0.00</th>
                                </tr>
                            </table>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="savePurchase()">Save Purchase</button>
            </div>
        </div>
    </div>
  </div>

<div class="modal fade" id="viewPurchaseModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Purchase Details</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body" id="viewPurchaseContent">
                <!-- Content loaded dynamically -->
            </div>
        </div>
    </div>
  </div>`;
window.Views.parties = `<div class="content-area p-4">
        
        <!-- Top bar -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="d-flex gap-2 w-50">
                <input type="text" id="searchInput" class="form-control" placeholder="Search Party Code, Name, GSTIN..." oninput="filterParties()">
                <select id="typeFilter" class="form-select" onchange="filterParties()">
                    <option value="">All Types</option>
                    <option value="Customer">Customer</option>
                    <option value="Supplier">Supplier</option>
                    <option value="Both">Both</option>
                </select>
                <select id="statusFilter" class="form-select" onchange="filterParties()">
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>
            <button class="btn btn-primary" onclick="openAddPartyModal()">
                <i class="bi bi-plus-circle me-2"></i>Add Party
            </button>
        </div>

        <!-- Stats mini cards -->
        <div class="row g-3 mb-4">
            <div class="col-md-3">
              <div class="stat-card stat-card-blue">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-people"></i>
                </div>
                <div class="stat-details">
                  <div class="stat-value" id="statTotalParties">0</div>
                  <div class="stat-title">Total Parties</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-card-green">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-person-check"></i>
                </div>
                <div class="stat-details">
                  <div class="stat-value" id="statCustomers">0</div>
                  <div class="stat-title">Customers</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-card-purple">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-truck"></i>
                </div>
                <div class="stat-details">
                  <div class="stat-value" id="statSuppliers">0</div>
                  <div class="stat-title">Suppliers</div>
                </div>
              </div>
            </div>
            <div class="col-md-3">
              <div class="stat-card stat-card-orange">
                <div class="stat-icon-wrapper">
                  <i class="bi bi-wallet2"></i>
                </div>
                <div class="stat-details">
                  <div class="stat-value" id="statOutstanding">₹ 0.00</div>
                  <div class="stat-title">Total Outstanding</div>
                </div>
              </div>
            </div>
        </div>

        <!-- Parties List Table -->
        <div class="card shadow-sm">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Party Code</th>
                                <th>Name</th>
                                <th>Type</th>
                                <th>GSTIN</th>
                                <th>Phone</th>
                                <th>City</th>
                                <th>Balance</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="partiesTableBody">
                            <!-- Rows rendered by JS -->
                        </tbody>
                    </table>
                </div>
                <div id="partiesPaginationControls"></div>
            </div>
        </div>

      </div>

<div class="modal fade" id="partyModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="partyModalTitle">Add Party</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <form id="partyForm">
                    <input type="hidden" id="partyId">
                    
                    <h6 class="mb-3 text-primary">Basic Info</h6>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">Party Name <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="partyName" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Party Type <span class="text-danger">*</span></label>
                            <select class="form-select" id="partyType" required>
                                <option value="Customer">Customer</option>
                                <option value="Supplier">Supplier</option>
                                <option value="Both">Both</option>
                            </select>
                        </div>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label class="form-label">Contact Person</label>
                            <input type="text" class="form-control" id="contactPerson">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Phone <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="phone" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" id="email">
                        </div>
                    </div>

                    <h6 class="mb-3 mt-4 text-primary">Address Section</h6>
                    <div class="mb-3">
                        <label class="form-label">Address</label>
                        <textarea class="form-control" id="address" rows="2"></textarea>
                    </div>
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label class="form-label">City <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="city" required>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label">State <span class="text-danger">*</span></label>
                            <select class="form-select" id="state" onchange="onStateChange()" required>
                                <option value="">Select State...</option>
                                <!-- Populated by JS -->
                            </select>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">State Code</label>
                            <input type="text" class="form-control bg-light" id="stateCode" readonly>
                        </div>
                        <div class="col-md-2">
                            <label class="form-label">PIN Code</label>
                            <input type="text" class="form-control" id="pinCode">
                        </div>
                    </div>

                    <h6 class="mb-3 mt-4 text-primary">Tax Details Section</h6>
                    <div class="row mb-3">
                        <div class="col-md-6">
                            <label class="form-label">GSTIN</label>
                            <input type="text" class="form-control text-uppercase" id="gstin" maxlength="15">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">PAN</label>
                            <input type="text" class="form-control text-uppercase" id="pan" maxlength="10">
                        </div>
                    </div>

                    <h6 class="mb-3 mt-4 text-primary">Financial Section</h6>
                    <div class="row mb-3">
                        <div class="col-md-3">
                            <label class="form-label">Opening Balance</label>
                            <input type="number" class="form-control" id="openingBalance" value="0">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Balance Type</label>
                            <select class="form-select" id="balanceType">
                                <option value="Dr">Dr (Receivable)</option>
                                <option value="Cr">Cr (Payable)</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Credit Limit (₹)</label>
                            <input type="number" class="form-control" id="creditLimit" value="0">
                        </div>
                        <div class="col-md-3">
                            <label class="form-label">Credit Days</label>
                            <input type="number" class="form-control" id="creditDays" value="0">
                        </div>
                    </div>
                    
                    <div class="form-check form-switch mt-3">
                        <input class="form-check-input" type="checkbox" id="partyStatus" checked>
                        <label class="form-check-label" for="partyStatus">Active Status</label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveParty()">Save Party</button>
            </div>
        </div>
    </div>
  </div>

<div class="modal fade" id="ledgerModal" tabindex="-1">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <div class="d-flex align-items-center gap-2">
                    <h5 class="modal-title mb-0"><i class="bi bi-journal-text me-2"></i>Party Ledger: <span id="ledgerPartyName" class="text-primary fw-bold"></span></h5>
                    <button class="btn btn-xs btn-outline-primary ms-2" onclick="openPartyInReportsLedger()" style="font-size:12px;padding:2px 8px" title="Open full analytics report"><i class="bi bi-box-arrow-up-right me-1"></i>Full Report</button>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="d-flex gap-2">
                        <input type="text" id="ledgerDateFilter" class="form-control form-control-sm" style="width: 250px;" placeholder="Select Date Range">
                        <button class="btn btn-sm btn-outline-secondary" onclick="refreshLedger()">Filter</button>
                    </div>
                    <button class="btn btn-sm btn-outline-primary" onclick="printPartyStatement()">
                        <i class="bi bi-printer me-1"></i> Print Statement
                    </button>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-bordered table-sm">
                        <thead class="table-light">
                            <tr>
                                <th>Date</th>
                                <th>Particulars</th>
                                <th class="text-end">Debit (₹)</th>
                                <th class="text-end">Credit (₹)</th>
                                <th class="text-end">Balance (₹)</th>
                            </tr>
                        </thead>
                        <tbody id="ledgerTableBody">
                            <!-- Populated by JS -->
                        </tbody>
                        <tfoot class="table-light">
                            <tr>
                                <th colspan="4" class="text-end">Closing Balance:</th>
                                <th class="text-end" id="ledgerClosingBalance">₹ 0.00</th>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    </div>
  </div>`;
window.Views.reports = `<div class="content-area" style="padding:20px 24px">

  <!-- REPORT SELECTION AREA -->
  <div id="reportSelectionArea">
    <div class="page-header mb-4">
      <h4 class="page-title">Reports &amp; Analytics</h4>
      <span class="text-muted" style="font-size:13px">Select a report category to generate</span>
    </div>
    <div class="row g-3">

      <div class="col-md-3 col-sm-6">
        <div class="rpt-card" onclick="selectReport('sales')">
          <div class="rpt-card-icon" style="background:linear-gradient(135deg,#0d2157,#1565c0)"><i class="bi bi-graph-up-arrow"></i></div>
          <div class="rpt-card-body"><div class="rpt-card-title">Sales Report</div><div class="rpt-card-desc">Invoices, tax collected, outstanding by date &amp; party</div></div>
          <i class="bi bi-chevron-right rpt-card-arrow"></i>
        </div>
      </div>

      <div class="col-md-3 col-sm-6">
        <div class="rpt-card" onclick="selectReport('purchase')">
          <div class="rpt-card-icon" style="background:linear-gradient(135deg,#1b5e20,#2e7d32)"><i class="bi bi-cart3"></i></div>
          <div class="rpt-card-body"><div class="rpt-card-title">Purchase Report</div><div class="rpt-card-desc">Bills, tax paid, supplier balances by date</div></div>
          <i class="bi bi-chevron-right rpt-card-arrow"></i>
        </div>
      </div>

      <div class="col-md-3 col-sm-6">
        <div class="rpt-card" onclick="selectReport('stock')">
          <div class="rpt-card-icon" style="background:linear-gradient(135deg,#311b92,#5e35b1)"><i class="bi bi-box-seam"></i></div>
          <div class="rpt-card-body"><div class="rpt-card-title">Stock Report</div><div class="rpt-card-desc">Current inventory, valuation, low-stock alerts</div></div>
          <i class="bi bi-chevron-right rpt-card-arrow"></i>
        </div>
      </div>

      <div class="col-md-3 col-sm-6">
        <div class="rpt-card" onclick="selectReport('outstanding')">
          <div class="rpt-card-icon" style="background:linear-gradient(135deg,#7f2700,#bf360c)"><i class="bi bi-cash-coin"></i></div>
          <div class="rpt-card-body"><div class="rpt-card-title">Outstanding</div><div class="rpt-card-desc">Receivables &amp; payables across all parties</div></div>
          <i class="bi bi-chevron-right rpt-card-arrow"></i>
        </div>
      </div>

      <div class="col-md-3 col-sm-6">
        <div class="rpt-card" onclick="selectReport('gst')">
          <div class="rpt-card-icon" style="background:linear-gradient(135deg,#006064,#00838f)"><i class="bi bi-file-earmark-ruled"></i></div>
          <div class="rpt-card-body"><div class="rpt-card-title">GST Summary</div><div class="rpt-card-desc">Output vs input GST, net tax payable/refund</div></div>
          <i class="bi bi-chevron-right rpt-card-arrow"></i>
        </div>
      </div>

      <div class="col-md-3 col-sm-6">
        <div class="rpt-card" onclick="selectReport('pnl')">
          <div class="rpt-card-icon" style="background:linear-gradient(135deg,#880e4f,#ad1457)"><i class="bi bi-currency-rupee"></i></div>
          <div class="rpt-card-body"><div class="rpt-card-title">Profit &amp; Loss</div><div class="rpt-card-desc">Revenue vs cost, gross profit summary</div></div>
          <i class="bi bi-chevron-right rpt-card-arrow"></i>
        </div>
      </div>

      <div class="col-md-3 col-sm-6">
        <div class="rpt-card" onclick="selectReport('ledger')">
          <div class="rpt-card-icon" style="background:linear-gradient(135deg,#37474f,#607d8b)"><i class="bi bi-journal-text"></i></div>
          <div class="rpt-card-body"><div class="rpt-card-title">Party Ledger</div><div class="rpt-card-desc">All transactions for a selected party</div></div>
          <i class="bi bi-chevron-right rpt-card-arrow"></i>
        </div>
      </div>

      <div class="col-md-3 col-sm-6">
        <div class="rpt-card" onclick="selectReport('lowstock')">
          <div class="rpt-card-icon" style="background:linear-gradient(135deg,#e65100,#fb8c00)"><i class="bi bi-exclamation-triangle"></i></div>
          <div class="rpt-card-body"><div class="rpt-card-title">Low Stock Alert</div><div class="rpt-card-desc">Items below minimum stock threshold</div></div>
          <i class="bi bi-chevron-right rpt-card-arrow"></i>
        </div>
      </div>

      <div class="col-md-3 col-sm-6">
        <div class="rpt-card" onclick="selectReport('daybook')">
          <div class="rpt-card-icon" style="background:linear-gradient(135deg,#004d40,#00796b)"><i class="bi bi-calendar2-week"></i></div>
          <div class="rpt-card-body"><div class="rpt-card-title">Day Book</div><div class="rpt-card-desc">Daily chronological record of sales, purchases &amp; cash flows</div></div>
          <i class="bi bi-chevron-right rpt-card-arrow"></i>
        </div>
      </div>

      <div class="col-md-3 col-sm-6">
        <div class="rpt-card" onclick="selectReport('hsn')">
          <div class="rpt-card-icon" style="background:linear-gradient(135deg,#4a148c,#7b1fa2)"><i class="bi bi-tags"></i></div>
          <div class="rpt-card-body"><div class="rpt-card-title">HSN Tax Summary</div><div class="rpt-card-desc">HSN-wise breakdown of taxable values &amp; GST slabs</div></div>
          <i class="bi bi-chevron-right rpt-card-arrow"></i>
        </div>
      </div>

    </div>
  </div>

  <!-- REPORT DISPLAY AREA -->
  <div id="reportDisplayArea" style="display:none">

    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-sm btn-outline-secondary" onclick="backToReportSelection()"><i class="bi bi-arrow-left me-1"></i>Back</button>
        <div>
          <h5 class="mb-0" id="currentReportTitle" style="font-weight:700;color:#0d2157"></h5>
          <div class="text-muted" id="currentReportSubtitle" style="font-size:12px"></div>
        </div>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-success" onclick="exportToExcel()"><i class="bi bi-file-earmark-excel me-1"></i>Excel</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="exportToCSV()"><i class="bi bi-filetype-csv me-1"></i>CSV</button>
        <button class="btn btn-sm btn-outline-secondary" onclick="printReport()"><i class="bi bi-printer me-1"></i>Print</button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="erp-card mb-3">
      <div class="erp-card-body" style="padding:14px 20px">
        <form id="reportFilterForm" class="row g-2 align-items-end" onsubmit="event.preventDefault();generateReport()">
          <div class="col-auto" id="dateFromCol">
            <label class="form-label mb-1" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#607d8b">From</label>
            <input type="text" class="form-control form-control-sm" id="reportDateFrom" placeholder="DD-MM-YYYY" autocomplete="off" style="width:130px">
          </div>
          <div class="col-auto" id="dateToCol">
            <label class="form-label mb-1" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#607d8b">To</label>
            <input type="text" class="form-control form-control-sm" id="reportDateTo" placeholder="DD-MM-YYYY" autocomplete="off" style="width:130px">
          </div>
          <div class="col-md-3" id="partyFilterCol" style="display:none">
            <label class="form-label mb-1" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#607d8b">Party</label>
            <select class="form-select form-select-sm" id="reportParty"><option value="">All Parties</option></select>
          </div>
          <div class="col-md-2" id="itemFilterCol" style="display:none">
            <label class="form-label mb-1" style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:#607d8b">Item</label>
            <input type="text" class="form-control form-control-sm" id="reportItem" placeholder="Search...">
          </div>
          <div class="col-auto">
            <button type="submit" class="btn btn-primary btn-sm px-3"><i class="bi bi-play-fill me-1"></i>Generate</button>
          </div>
          <div class="col-auto ms-auto">
            <div class="btn-group btn-group-sm">
              <button type="button" class="btn btn-outline-secondary" onclick="setQuickRange('today')">Today</button>
              <button type="button" class="btn btn-outline-secondary" onclick="setQuickRange('week')">Week</button>
              <button type="button" class="btn btn-outline-secondary" onclick="setQuickRange('month')">Month</button>
              <button type="button" class="btn btn-outline-secondary" onclick="setQuickRange('quarter')">Quarter</button>
              <button type="button" class="btn btn-outline-secondary" onclick="setQuickRange('year')">Year</button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="row g-3 mb-3" id="reportSummaryCards"></div>

    <!-- Main Table -->
    <div class="erp-card" id="reportMainCard">
      <div class="erp-card-header">
        <span class="erp-card-title" id="reportTableTitle"><i class="bi bi-table me-2"></i>Report Data</span>
        <span class="badge" id="reportRowCount" style="font-size:11px;background:#e8f0fe;color:#1565c0">0 records</span>
      </div>
      <div class="erp-card-body p-0">
        <div class="table-responsive" id="reportTableContainer">
          <div class="text-center py-5 text-muted"><i class="bi bi-bar-chart" style="font-size:40px;opacity:.25"></i><p class="mt-2 mb-0">Click Generate to load report data</p></div>
        </div>
      </div>
    </div>

    <!-- Secondary Table -->
    <div class="erp-card mt-3" id="secondaryReportContainer" style="display:none">
      <div class="erp-card-header">
        <span class="erp-card-title" id="secondaryReportTitle">Secondary Data</span>
        <span class="badge" id="secondaryRowCount" style="font-size:11px;background:#e8f0fe;color:#1565c0">0 records</span>
      </div>
      <div class="erp-card-body p-0">
        <div class="table-responsive" id="secondaryReportTableContainer"></div>
      </div>
    </div>

  </div>
</div>`;
window.Views.users = `<div class="content-area" style="padding: 20px 24px;">
  <!-- Header / Toolbar -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="page-title mb-1" style="font-weight: 700; color: #0d2157;"><i class="bi bi-people me-2"></i>User &amp; Access Management</h4>
      <span class="text-muted" style="font-size: 13px;">Manage staff roles and granular module-level permissions</span>
    </div>
    <div>
      <button class="btn btn-primary btn-sm px-3" id="btnAddUser" onclick="openAddUserModal()">
        <i class="bi bi-person-plus-fill me-1"></i> Add New User
      </button>
    </div>
  </div>

  <!-- Search Filter Card -->
  <div class="erp-card mb-3">
    <div class="erp-card-body py-2 px-3">
      <div class="row g-2 align-items-center">
        <div class="col-md-5">
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
            <input type="text" class="form-control" id="searchUserInput" placeholder="Search by name, username, role...">
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select form-select-sm" id="filterUserRole" onchange="filterUsers()">
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
            <option value="Staff">Staff</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- Users Table Card -->
  <div class="erp-card">
    <div class="erp-card-header d-flex justify-content-between align-items-center">
      <span class="erp-card-title"><i class="bi bi-shield-check me-2"></i>System Users &amp; Permissions</span>
      <span class="badge" id="userCountBadge" style="background:#e8f0fe; color:#1565c0; font-size:11px;">0 users</span>
    </div>
    <div class="erp-card-body p-0">
      <div class="table-responsive">
        <table class="erp-table mb-0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Username</th>
              <th>Role</th>
              <th>Module Access (Permissions)</th>
              <th>Contact</th>
              <th>Status</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody id="usersTableBody">
            <tr><td colspan="8" class="text-center text-muted py-5"><span class="spinner-border spinner-border-sm me-2"></span>Loading users...</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<!-- Add / Edit User Modal with Granular RBAC Permissions Matrix -->
<div class="modal fade" id="userModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg">
      <div class="modal-header py-3" style="background: linear-gradient(90deg, #f5f8ff 0%, #fff 100%);">
        <h5 class="modal-title mb-0" id="userModalTitle" style="font-weight: 700; color: #0d2157;">
          <i class="bi bi-person-gear me-2 text-primary"></i>Add User
        </h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body p-4">
        <form id="userForm" onsubmit="event.preventDefault(); saveUser();">
          <input type="hidden" id="userId">
          
          <div class="row g-3">
            <div class="col-md-6">
              <label class="form-label small fw-bold">Full Name <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm" id="userFullName" required placeholder="e.g. Ramesh Sharma">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold">Username <span class="text-danger">*</span></label>
              <input type="text" class="form-control form-control-sm" id="formUserName" required placeholder="e.g. ramesh123" autocomplete="off">
            </div>

            <div class="col-md-6" id="passwordGroup">
              <label class="form-label small fw-bold">Password <span class="text-danger">*</span></label>
              <input type="password" class="form-control form-control-sm" id="userPassword" required minlength="4" placeholder="Min 4 characters" autocomplete="new-password">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold">System Role <span class="text-danger">*</span></label>
              <select class="form-select form-select-sm" id="formUserRole" required onchange="onUserRoleChange(this.value)">
                <option value="Staff">Staff</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <div class="col-md-6">
              <label class="form-label small fw-bold">Email</label>
              <input type="email" class="form-control form-control-sm" id="userEmail" placeholder="e.g. user@chayainterior.com">
            </div>
            <div class="col-md-6">
              <label class="form-label small fw-bold">Phone Number</label>
              <input type="text" class="form-control form-control-sm" id="userPhone" placeholder="10-digit mobile">
            </div>

            <div class="col-md-6" id="statusGroup" style="display: none;">
              <label class="form-label small fw-bold">Status <span class="text-danger">*</span></label>
              <select class="form-select form-select-sm" id="userStatus">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <!-- Dynamic Module Permissions Matrix -->
          <div class="mt-4 border-top pt-3">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="mb-0 fw-bold" style="color:#0d2157;">
                <i class="bi bi-shield-lock me-1 text-primary"></i> Module Access &amp; Permissions
              </h6>
              <div class="btn-group btn-group-sm" id="permQuickButtons">
                <button type="button" class="btn btn-outline-secondary btn-xs py-0 px-2" style="font-size:11px" onclick="setAllPerms(true)">Check All</button>
                <button type="button" class="btn btn-outline-secondary btn-xs py-0 px-2" style="font-size:11px" onclick="setAllPerms(false)">Clear All</button>
                <button type="button" class="btn btn-outline-primary btn-xs py-0 px-2" style="font-size:11px" onclick="applyRoleDefaultPerms()">Reset to Role</button>
              </div>
            </div>
            <p class="text-muted small mb-2" id="permSubText">Configure what this user can Read, Create/Edit, and Delete across each ERP module.</p>
            
            <div class="alert alert-info py-2 px-3 small d-none" id="adminRoleNotice">
              <i class="bi bi-info-circle me-1"></i> <strong>Admin Role:</strong> Admins automatically have unrestricted full access across all modules, settings, and user management.
            </div>

            <div class="table-responsive border rounded" id="permTableContainer">
              <table class="table table-sm table-hover align-middle text-center mb-0">
                <thead class="table-light">
                  <tr style="font-size: 12px;">
                    <th class="text-start ps-3" style="width: 34%;">Module</th>
                    <th style="width: 22%;"><i class="bi bi-eye text-primary me-1"></i> View / Read</th>
                    <th style="width: 22%;"><i class="bi bi-pencil-square text-warning me-1"></i> Create / Edit</th>
                    <th style="width: 22%;"><i class="bi bi-trash text-danger me-1"></i> Delete</th>
                  </tr>
                </thead>
                <tbody style="font-size: 13px;">
                  <!-- Inventory -->
                  <tr>
                    <td class="text-start ps-3 fw-medium"><i class="bi bi-box-seam me-2 text-primary"></i>Inventory</td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_inventory_read" checked></td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_inventory_edit" checked></td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_inventory_delete"></td>
                  </tr>
                  <!-- Sales -->
                  <tr>
                    <td class="text-start ps-3 fw-medium"><i class="bi bi-graph-up-arrow me-2 text-success"></i>Sales</td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_sales_read" checked></td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_sales_edit" checked></td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_sales_delete"></td>
                  </tr>
                  <!-- Purchase -->
                  <tr>
                    <td class="text-start ps-3 fw-medium"><i class="bi bi-cart3 me-2 text-info"></i>Purchase</td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_purchase_read" checked></td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_purchase_edit" checked></td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_purchase_delete"></td>
                  </tr>
                  <!-- Parties -->
                  <tr>
                    <td class="text-start ps-3 fw-medium"><i class="bi bi-people me-2 text-warning"></i>Parties</td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_parties_read" checked></td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_parties_edit" checked></td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_parties_delete"></td>
                  </tr>
                  <!-- Reports -->
                  <tr>
                    <td class="text-start ps-3 fw-medium"><i class="bi bi-file-earmark-bar-graph me-2 text-danger"></i>Reports</td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_reports_read" checked></td>
                    <td><input type="checkbox" class="form-check-input perm-cb" id="perm_reports_edit" title="Export / Print"></td>
                    <td class="text-muted small">—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4 pt-2 border-top">
            <button type="button" class="btn btn-secondary btn-sm px-3" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary btn-sm px-4" id="btnSaveUser">
              <i class="bi bi-check2-circle me-1"></i>Save User
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>

<!-- Reset Password Modal -->
<div class="modal fade" id="resetPasswordModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-sm modal-dialog-centered">
    <div class="modal-content border-0 shadow">
      <div class="modal-header py-2" style="background: linear-gradient(90deg, #f5f8ff 0%, #fff 100%);">
        <h6 class="modal-title mb-0 fw-bold" style="color: #0d2157;"><i class="bi bi-key me-2 text-warning"></i>Reset Password</h6>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body p-3">
        <form id="resetPasswordForm" onsubmit="event.preventDefault(); submitResetPassword();">
          <input type="hidden" id="resetUserId">
          <div class="mb-3">
            <label class="form-label small fw-bold">New Password <span class="text-danger">*</span></label>
            <input type="password" class="form-control form-control-sm" id="newPassword" required minlength="4" placeholder="Min 4 characters">
          </div>
          <div class="d-flex justify-content-end gap-2">
            <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-danger btn-sm px-3">Reset Password</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</div>`;

