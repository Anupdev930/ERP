/**
 * Inventory Management JavaScript
 */

let itemsData = [];
let currentSortColumn = 'itemName';
let sortAscending = true;
let itemModalInstance;
let deleteModalInstance;
let currentDeleteId = null;

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Modals
    itemModalInstance = new bootstrap.Modal(document.getElementById('itemModal'));
    deleteModalInstance = new bootstrap.Modal(document.getElementById('deleteModal'));

    // Event Listeners
    document.getElementById('searchItemInput').addEventListener('input', filterItems);
    document.getElementById('filterCategory').addEventListener('change', filterItems);
    document.getElementById('filterStatus').addEventListener('change', filterItems);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);

    // Initial Load
    loadItems();
});

async function loadItems() {
    try {
        if(typeof SGD !== 'undefined' && SGD.api) {
            SGD.showLoading();
            // Assuming SGD.api returns a Promise with data
            const res = await SGD.api('getItems'); 
            itemsData = res.data || [];
        } else {
            // Mock data if backend not ready
            itemsData = [
                { id: 1, itemCode: 'ITM-001', itemName: 'Fluted Panel Oak', category: 'Fluted Panel', hsn: '39259090', stock: 150, minStock: 50, unit: 'PCS', purchasePrice: 400, sellingPrice: 550, gst: 18, status: 'Active' },
                { id: 2, itemCode: 'ITM-002', itemName: 'UV Marble Sheet', category: 'UV Sheet', hsn: '3920', stock: 20, minStock: 30, unit: 'PCS', purchasePrice: 1200, sellingPrice: 1600, gst: 18, status: 'Active' },
                { id: 3, itemCode: 'ITM-003', itemName: 'Adhesive 5kg', category: 'Adhesive', hsn: '3506', stock: 0, minStock: 10, unit: 'KG', purchasePrice: 300, sellingPrice: 450, gst: 18, status: 'Inactive' }
            ];
        }
        updateStats();
        SGD.paginate('inventory', itemsData);
    } catch (error) {
        console.error("Error loading items:", error);
        if(typeof SGD !== 'undefined' && SGD.showToast) SGD.showToast('Error loading items', 'danger');
    } finally {
        if(typeof SGD !== 'undefined' && SGD.hideLoading) SGD.hideLoading();
    }
}

function updateStats() {
    const total = itemsData.length;
    const inStock = itemsData.filter(i => {
        const stock = i.stock !== undefined ? i.stock : (i.CurrentStock || 0);
        const minStock = i.minStock !== undefined ? i.minStock : (i.MinStock || 0);
        return stock > minStock;
    }).length;
    
    const lowStock = itemsData.filter(i => {
        const stock = i.stock !== undefined ? i.stock : (i.CurrentStock || 0);
        const minStock = i.minStock !== undefined ? i.minStock : (i.MinStock || 0);
        return stock > 0 && stock <= minStock;
    }).length;
    
    const outOfStock = itemsData.filter(i => {
        const stock = i.stock !== undefined ? i.stock : (i.CurrentStock || 0);
        return stock <= 0;
    }).length;

    document.getElementById('statTotalItems').textContent = total;
    document.getElementById('statInStock').textContent = inStock;
    document.getElementById('statLowStock').textContent = lowStock;
    document.getElementById('statOutOfStock').textContent = outOfStock;
}

function renderTable(data) {
    const tbody = document.getElementById('inventoryTableBody');
    tbody.innerHTML = '';

    if (data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" class="text-center text-muted py-4">No items found</td></tr>`;
        return;
    }

    data.forEach(item => {
        // Support both demo data format and backend data format
        const id = item.id || item.ItemID;
        const itemCode = item.itemCode || item.ItemID || '-';
        const itemName = item.itemName || item.ItemName || '';
        const category = item.category || item.Category || '';
        const hsn = item.hsn || item.HSNCode || '-';
        const stock = item.stock !== undefined ? item.stock : (item.CurrentStock || 0);
        const minStock = item.minStock !== undefined ? item.minStock : (item.MinStock || 0);
        const unit = item.unit || item.Unit || '';
        const purchasePrice = parseFloat(item.purchasePrice || item.PurchasePrice || 0).toFixed(2);
        const sellingPrice = parseFloat(item.sellingPrice || item.SellingPrice || 0).toFixed(2);
        const gst = item.gst || item.GSTPercent || 0;
        const status = item.status || item.Status || 'Active';

        // Determine stock status for row coloring
        let rowClass = '';
        if (stock <= 0) {
            rowClass = 'table-danger';
        } else if (stock <= minStock) {
            rowClass = 'table-warning';
        }

        const statusBadge = (status.toLowerCase() === 'active') 
            ? `<span class="badge bg-success">Active</span>` 
            : `<span class="badge bg-secondary">Inactive</span>`;

        const tr = document.createElement('tr');
        tr.className = rowClass;
        tr.innerHTML = `
            <td>${itemCode}</td>
            <td class="fw-medium">${itemName}</td>
            <td>${category}</td>
            <td>${hsn}</td>
            <td class="text-end fw-bold">${stock}</td>
            <td>${unit}</td>
            <td class="text-end">${purchasePrice}</td>
            <td class="text-end">${sellingPrice}</td>
            <td class="text-center">${gst}%</td>
            <td class="text-center">${statusBadge}</td>
            <td class="text-end">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal('${id}')"><i class="bi bi-pencil"></i></button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteItem('${id}')"><i class="bi bi-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Initialize pagination
SGD.initPagination('inventory', renderTable, { containerId: 'inventoryPaginationControls' });

function filterItems() {
    const q = document.getElementById('searchItemInput').value.toLowerCase();
    const cat = document.getElementById('filterCategory').value;
    const stat = document.getElementById('filterStatus').value;

    let filtered = itemsData.filter(item => {
        const matchesSearch = item.itemName.toLowerCase().includes(q) || (item.itemCode && item.itemCode.toLowerCase().includes(q));
        const matchesCat = cat === '' || item.category === cat;
        const matchesStat = stat === '' || item.status === stat;
        return matchesSearch && matchesCat && matchesStat;
    });

    // Apply Sorting
    filtered.sort((a, b) => {
        let valA = a[currentSortColumn];
        let valB = b[currentSortColumn];

        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return sortAscending ? -1 : 1;
        if (valA > valB) return sortAscending ? 1 : -1;
        return 0;
    });

    SGD.paginate('inventory', filtered);
}

function sortTable(column) {
    if (currentSortColumn === column) {
        sortAscending = !sortAscending;
    } else {
        currentSortColumn = column;
        sortAscending = true;
    }
    filterItems();
}

function openAddModal() {
    document.getElementById('itemForm').reset();
    document.getElementById('itemId').value = '';
    document.getElementById('itemModalLabel').textContent = 'Add New Item';
    itemModalInstance.show();
}

function openEditModal(id) {
    const item = itemsData.find(i => (i.id || i.ItemID) == id);
    if (!item) return;

    document.getElementById('itemId').value = item.id || item.ItemID;
    document.getElementById('itemName').value = item.itemName || item.ItemName || '';
    document.getElementById('itemCategory').value = item.category || item.Category || '';
    document.getElementById('itemHsn').value = item.hsn || item.HSNCode || '';
    document.getElementById('itemUnit').value = item.unit || item.Unit || '';
    document.getElementById('itemPurchasePrice').value = item.purchasePrice !== undefined ? item.purchasePrice : (item.PurchasePrice || 0);
    document.getElementById('itemSellingPrice').value = item.sellingPrice !== undefined ? item.sellingPrice : (item.SellingPrice || 0);
    document.getElementById('itemGst').value = item.gst !== undefined ? item.gst : (item.GSTPercent || 0);
    document.getElementById('itemStock').value = item.stock !== undefined ? item.stock : (item.CurrentStock || 0);
    document.getElementById('itemMinStock').value = item.minStock !== undefined ? item.minStock : (item.MinStock || 0);
    document.getElementById('itemStatus').value = item.status || item.Status || 'Active';
    document.getElementById('itemDescription').value = item.description || item.Description || '';
    
    document.getElementById('itemModalLabel').textContent = 'Edit Item';
    itemModalInstance.show();
}

async function saveItem() {
    const form = document.getElementById('itemForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const itemData = {
        ItemID: document.getElementById('itemId').value || null,
        ItemName: document.getElementById('itemName').value,
        Category: document.getElementById('itemCategory').value,
        HSNCode: document.getElementById('itemHsn').value,
        Unit: document.getElementById('itemUnit').value,
        PurchasePrice: parseFloat(document.getElementById('itemPurchasePrice').value),
        SellingPrice: parseFloat(document.getElementById('itemSellingPrice').value),
        GSTPercent: parseInt(document.getElementById('itemGst').value),
        CurrentStock: parseInt(document.getElementById('itemStock').value),
        MinStock: parseInt(document.getElementById('itemMinStock').value),
        Status: document.getElementById('itemStatus').value,
        Description: document.getElementById('itemDescription').value,
        
        // Keep lowercase for mock demo mode compatibility
        id: document.getElementById('itemId').value || null,
        itemName: document.getElementById('itemName').value
    };

    try {
        if(typeof SGD !== 'undefined' && SGD.api) {
            SGD.showLoading();
            await SGD.api('saveItem', itemData);
            SGD.showToast('Item saved successfully', 'success');
        } else {
            // Mock Save
            if (itemData.id) {
                const idx = itemsData.findIndex(i => i.id == itemData.id);
                if (idx >= 0) {
                    itemData.itemCode = itemsData[idx].itemCode;
                    itemsData[idx] = { ...itemsData[idx], ...itemData };
                }
            } else {
                itemData.id = Date.now();
                itemData.itemCode = `ITM-${Math.floor(Math.random()*1000)}`;
                itemsData.push(itemData);
            }
            alert("Item saved successfully (Mock)");
        }
        itemModalInstance.hide();
        loadItems(); // Refresh data
    } catch (error) {
        console.error("Error saving item", error);
        if(typeof SGD !== 'undefined' && SGD.showToast) SGD.showToast('Failed to save item', 'danger');
    } finally {
        if(typeof SGD !== 'undefined' && SGD.hideLoading) SGD.hideLoading();
    }
}

function deleteItem(id) {
    currentDeleteId = id;
    deleteModalInstance.show();
}

async function confirmDelete() {
    if (!currentDeleteId) return;

    try {
        if(typeof SGD !== 'undefined' && SGD.api) {
            SGD.showLoading();
            await SGD.api('deleteItem', { id: currentDeleteId });
            SGD.showToast('Item deleted successfully', 'success');
        } else {
            // Mock delete
            itemsData = itemsData.filter(i => i.id != currentDeleteId);
            alert("Item deleted successfully (Mock)");
        }
        deleteModalInstance.hide();
        currentDeleteId = null;
        loadItems();
    } catch (error) {
        console.error("Error deleting item", error);
        if(typeof SGD !== 'undefined' && SGD.showToast) SGD.showToast('Failed to delete item', 'danger');
    } finally {
        if(typeof SGD !== 'undefined' && SGD.hideLoading) SGD.hideLoading();
    }
}

// ==========================================
// CATEGORY MANAGEMENT
// ==========================================
let categoriesData = [];
let categoryModalInstance;

document.addEventListener('DOMContentLoaded', () => {
    // We already have a DOMContentLoaded, but we can have another or just let it run.
    categoryModalInstance = new bootstrap.Modal(document.getElementById('categoryModal'));
    loadCategories();
});

async function loadCategories() {
    try {
        if(typeof SGD !== 'undefined' && SGD.api) {
            const res = await SGD.api('getCategories');
            if (res && res.data) {
                categoriesData = res.data;
            }
        } else {
            // Mock categories
            categoriesData = ["Fluted Panel", "UV Sheet", "PVC Flooring", "Wallpaper", "Moulding", "Trim Profile", "Adhesive", "Wall Sticker", "Hardware", "Other"];
        }
        populateCategoryDropdowns();
    } catch(e) {
        console.error("Error loading categories", e);
    }
}

function populateCategoryDropdowns() {
    // Populate the dropdown in item modal
    const itemSelect = document.getElementById('itemCategory');
    if (itemSelect) {
        const currentVal = itemSelect.value;
        itemSelect.innerHTML = '<option value="">Select...</option>';
        categoriesData.forEach(cat => {
            itemSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        if (categoriesData.includes(currentVal)) {
            itemSelect.value = currentVal;
        }
    }
    
    // Populate filter dropdown
    const filterSelect = document.getElementById('filterCategory');
    if (filterSelect) {
        const currentVal = filterSelect.value;
        filterSelect.innerHTML = '<option value="">All Categories</option>';
        categoriesData.forEach(cat => {
            filterSelect.innerHTML += `<option value="${cat}">${cat}</option>`;
        });
        if (categoriesData.includes(currentVal)) {
            filterSelect.value = currentVal;
        }
    }
}

function manageCategories() {
    renderCategoryList();
    categoryModalInstance.show();
}

function renderCategoryList() {
    const list = document.getElementById('categoryList');
    list.innerHTML = '';
    
    if (categoriesData.length === 0) {
        list.innerHTML = '<li class="list-group-item text-center text-muted">No categories found</li>';
        return;
    }
    
    categoriesData.forEach(cat => {
        list.innerHTML += `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                ${cat}
                <button class="btn btn-sm btn-outline-danger" onclick="deleteCategory('${cat}')" title="Delete Category">
                    <i class="bi bi-trash"></i>
                </button>
            </li>
        `;
    });
}

async function addCategory() {
    const input = document.getElementById('newCategoryName');
    const newCat = input.value.trim();
    if (!newCat) {
        SGD.showToast('Please enter a category name', 'warning');
        return;
    }
    
    try {
        if(typeof SGD !== 'undefined' && SGD.api) {
            SGD.showLoading();
            const res = await SGD.api('saveCategory', { category: newCat });
            if (res && res.success) {
                SGD.showToast(res.message, 'success');
                await loadCategories();
                input.value = '';
                renderCategoryList();
            } else {
                SGD.showToast(res ? res.message : 'Error adding category', 'danger');
            }
        }
    } catch(e) {
        console.error(e);
        SGD.showToast('Error adding category', 'danger');
    } finally {
        if(typeof SGD !== 'undefined' && SGD.hideLoading) SGD.hideLoading();
    }
}

async function deleteCategory(catName) {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    
    try {
        if(typeof SGD !== 'undefined' && SGD.api) {
            SGD.showLoading();
            const res = await SGD.api('deleteCategory', { category: catName });
            if (res && res.success) {
                SGD.showToast(res.message, 'success');
                await loadCategories();
                renderCategoryList();
            } else {
                SGD.showToast(res ? res.message : 'Error deleting category', 'danger');
            }
        }
    } catch(e) {
        console.error(e);
        SGD.showToast('Error deleting category', 'danger');
    } finally {
        if(typeof SGD !== 'undefined' && SGD.hideLoading) SGD.hideLoading();
    }
}
// === IMPORT & EXPORT ===

function openImportModal() {
    document.getElementById('importFileInput').value = '';
    const modal = new bootstrap.Modal(document.getElementById('importModal'));
    modal.show();
}

function downloadSampleCSV() {
    const headers = ['ItemName', 'ItemCategory', 'HSNCode', 'Unit', 'PurchasePrice', 'SalesPrice', 'TaxRate', 'OpeningStock', 'LowStockAlert', 'Status'];
    const sample = ['Test Item', 'Other', '1234', 'Pcs', '100', '150', '18', '50', '10', 'Active'];
    
    const csvContent = headers.join(',') + '\n' + sample.join(',');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "Items_Import_Sample.csv");
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function exportItems() {
    if (!itemsData || itemsData.length === 0) {
        SGD.showToast('No items to export', 'warning');
        return;
    }
    
    const headers = ['ItemCode', 'ItemName', 'ItemCategory', 'HSNCode', 'Unit', 'PurchasePrice', 'SalesPrice', 'TaxRate', 'CurrentStock', 'OpeningStock', 'LowStockAlert', 'Status'];
    
    const rows = itemsData.map(item => {
        return headers.map(header => {
            let val = item[header] !== undefined ? item[header] : (item[header.toLowerCase()] !== undefined ? item[header.toLowerCase()] : '');
            val = String(val).replace(/"/g, '""');
            return `"${val}"`;
        }).join(',');
    });
    
    const csvContent = headers.join(',') + '\n' + rows.join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    
    let dateStr = "Export";
    if (typeof SGD !== 'undefined' && SGD.formatDate) {
        dateStr = SGD.formatDate(new Date().toISOString());
    }
    link.setAttribute("download", `Items_Export_${dateStr}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function parseCSVRow(str) {
    let result = [];
    let cur = '';
    let inQuote = false;
    for (let i = 0; i < str.length; i++) {
        let c = str[i];
        if (c === '"') {
            if (inQuote && str[i+1] === '"') {
                cur += '"'; i++;
            } else {
                inQuote = !inQuote;
            }
        } else if (c === ',' && !inQuote) {
            result.push(cur);
            cur = '';
        } else {
            cur += c;
        }
    }
    result.push(cur);
    return result.map(v => v.trim());
}

async function processImport() {
    const fileInput = document.getElementById('importFileInput');
    if (!fileInput.files || fileInput.files.length === 0) {
        if(typeof SGD !== 'undefined') SGD.showToast('Please select a CSV file first', 'warning');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = async function(e) {
        const text = e.target.result;
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
            if(typeof SGD !== 'undefined') SGD.showToast('The CSV file is empty or missing data rows.', 'danger');
            return;
        }
        
        const headers = parseCSVRow(lines[0]);
        const newItems = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVRow(lines[i]);
            let item = {};
            headers.forEach((header, index) => {
                item[header] = values[index] !== undefined ? values[index] : '';
            });
            
            if (item.ItemName) {
                newItems.push({
                    ItemName: item.ItemName,
                    ItemCategory: item.ItemCategory || 'Other',
                    HSNCode: item.HSNCode || '',
                    Unit: item.Unit || 'Pcs',
                    PurchasePrice: parseFloat(item.PurchasePrice) || 0,
                    SalesPrice: parseFloat(item.SalesPrice) || 0,
                    TaxRate: parseFloat(item.TaxRate) || 0,
                    OpeningStock: parseInt(item.OpeningStock) || 0,
                    LowStockAlert: parseInt(item.LowStockAlert) || 0,
                    Status: item.Status || 'Active'
                });
            }
        }
        
        if (newItems.length === 0) {
            if(typeof SGD !== 'undefined') SGD.showToast('No valid items found in CSV', 'danger');
            return;
        }
        
        try {
            if(typeof SGD !== 'undefined') SGD.showLoading();
            const res = await SGD.api('importItems', { items: newItems });
            
            if (res && res.success) {
                if(typeof SGD !== 'undefined') SGD.showToast(`Successfully imported ${newItems.length} items`, 'success');
                const modalEl = document.getElementById('importModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                if(modal) modal.hide();
                await loadItems();
            } else {
                if(typeof SGD !== 'undefined') SGD.showToast(res ? res.message : 'Error importing items', 'danger');
            }
        } catch(err) {
            console.error(err);
            if(typeof SGD !== 'undefined') SGD.showToast('Error importing items', 'danger');
        } finally {
            if(typeof SGD !== 'undefined') SGD.hideLoading();
        }
    };
    
    reader.onerror = function() {
        if(typeof SGD !== 'undefined') SGD.showToast('Error reading the file', 'danger');
    };
    
    reader.readAsText(file);
}
