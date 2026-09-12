/**
 * User Management JavaScript
 */

let usersData = [];
let userModalInstance;
let resetPasswordModalInstance;

document.addEventListener('DOMContentLoaded', () => {
    userModalInstance = new bootstrap.Modal(document.getElementById('userModal'));
    resetPasswordModalInstance = new bootstrap.Modal(document.getElementById('resetPasswordModal'));
    
    document.getElementById('searchUserInput').addEventListener('input', filterUsers);
    
    loadUsers();
});

async function loadUsers() {
    try {
        if(typeof SGD !== 'undefined' && SGD.api) {
            SGD.showLoading();
            const res = await SGD.api('getUsers');
            if(res && res.data) {
                usersData = res.data;
            }
        }
        renderUsers(usersData);
    } catch(e) {
        console.error("Error loading users", e);
        SGD.showToast('Error loading users', 'danger');
    } finally {
        if(typeof SGD !== 'undefined' && SGD.hideLoading) SGD.hideLoading();
    }
}

function renderUsers(data) {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';
    
    if(!data || data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No users found</td></tr>';
        return;
    }
    
    data.forEach(u => {
        const id = u.UserID || u.id || '-';
        const name = u.FullName || u.name || '-';
        const username = u.Username || u.username || '-';
        const role = u.Role || u.role || '-';
        const email = u.Email || u.email || '-';
        const phone = u.Phone || u.phone || '-';
        const status = u.Status || u.status || 'active';
        
        let statusBadge = '<span class="badge bg-success">Active</span>';
        if(status === 'inactive') statusBadge = '<span class="badge bg-danger">Inactive</span>';
        
        tbody.innerHTML += `
            <tr>
                <td>${id}</td>
                <td><strong>${name}</strong></td>
                <td>${username}</td>
                <td><span class="badge bg-info text-dark">${role}</span></td>
                <td>${email}</td>
                <td>${phone}</td>
                <td>${statusBadge}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary me-1" title="Edit User" onclick="openEditUserModal('${id}')"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-sm btn-outline-warning me-1" title="Reset Password" onclick="openResetPasswordModal('${id}')"><i class="bi bi-key"></i></button>
                    <button class="btn btn-sm btn-outline-danger" title="Deactivate User" onclick="deleteUser('${id}')"><i class="bi bi-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

function filterUsers() {
    const q = document.getElementById('searchUserInput').value.toLowerCase();
    const filtered = usersData.filter(u => {
        const name = (u.FullName || '').toLowerCase();
        const uname = (u.Username || '').toLowerCase();
        const role = (u.Role || '').toLowerCase();
        return name.includes(q) || uname.includes(q) || role.includes(q);
    });
    renderUsers(filtered);
}

function openAddUserModal() {
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('formUserName').readOnly = false;
    document.getElementById('passwordGroup').style.display = 'block';
    document.getElementById('userPassword').required = true;
    document.getElementById('statusGroup').style.display = 'none';
    document.getElementById('userModalTitle').textContent = 'Add User';
    userModalInstance.show();
}

function openEditUserModal(id) {
    const user = usersData.find(u => (u.UserID || u.id) == id);
    if(!user) return;
    
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = user.UserID || user.id;
    document.getElementById('userFullName').value = user.FullName || '';
    document.getElementById('formUserName').value = user.Username || '';
    document.getElementById('formUserName').readOnly = true;
    document.getElementById('formUserRole').value = user.Role || 'Staff';
    document.getElementById('userEmail').value = user.Email || '';
    document.getElementById('userPhone').value = user.Phone || '';
    
    document.getElementById('passwordGroup').style.display = 'none';
    document.getElementById('userPassword').required = false;
    
    document.getElementById('statusGroup').style.display = 'block';
    document.getElementById('userStatus').value = user.Status || 'active';
    
    document.getElementById('userModalTitle').textContent = 'Edit User';
    userModalInstance.show();
}

async function saveUser() {
    const form = document.getElementById('userForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const id = document.getElementById('userId').value;
    const isEdit = !!id;
    
    const userData = {
        FullName: document.getElementById('userFullName').value,
        Role: document.getElementById('formUserRole').value,
        Email: document.getElementById('userEmail').value,
        Phone: document.getElementById('userPhone').value
    };
    
    try {
        SGD.showLoading();
        let res;
        if(isEdit) {
            userData.UserID = id;
            userData.Status = document.getElementById('userStatus').value;
            res = await SGD.api('updateUser', userData);
        } else {
            userData.Username = document.getElementById('formUserName').value;
            userData.Password = document.getElementById('userPassword').value;
            res = await SGD.api('createUser', userData);
        }
        
        if(res && res.success) {
            SGD.showToast(res.message, 'success');
            userModalInstance.hide();
            await loadUsers();
        } else {
            SGD.showToast(res ? res.message : 'Error saving user', 'danger');
        }
    } catch(e) {
        console.error(e);
        SGD.showToast('Error saving user', 'danger');
    } finally {
        SGD.hideLoading();
    }
}

function openResetPasswordModal(id) {
    document.getElementById('resetPasswordForm').reset();
    document.getElementById('resetUserId').value = id;
    resetPasswordModalInstance.show();
}

async function submitResetPassword() {
    const form = document.getElementById('resetPasswordForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const id = document.getElementById('resetUserId').value;
    const newPassword = document.getElementById('newPassword').value;
    
    if(!confirm('Are you sure you want to reset the password for this user?')) return;
    
    try {
        SGD.showLoading();
        const res = await SGD.api('adminResetPassword', { userId: id, newPassword: newPassword });
        if(res && res.success) {
            SGD.showToast('Password reset successfully', 'success');
            resetPasswordModalInstance.hide();
        } else {
            SGD.showToast(res ? res.message : 'Error resetting password', 'danger');
        }
    } catch(e) {
        console.error(e);
        SGD.showToast('Error resetting password', 'danger');
    } finally {
        SGD.hideLoading();
    }
}

async function deleteUser(id) {
    if(!confirm('Are you sure you want to deactivate this user? They will no longer be able to log in.')) return;
    
    try {
        SGD.showLoading();
        const res = await SGD.api('deleteUser', { userId: id });
        if(res && res.success) {
            SGD.showToast('User deactivated', 'success');
            await loadUsers();
        } else {
            SGD.showToast(res ? res.message : 'Error deactivating user', 'danger');
        }
    } catch(e) {
        console.error(e);
        SGD.showToast('Error deactivating user', 'danger');
    } finally {
        SGD.hideLoading();
    }
}
