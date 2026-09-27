/**
 * SGD ERP — User & Dynamic Permissions Management (RBAC)
 * Admin only: Staff and Manager cannot view or modify users.
 * Supports granular module-level permissions: Read, Edit, Delete for Inventory, Sales, Purchase, Parties, Reports.
 */

let usersData = [];
let userModalInstance = null;
let resetPasswordModalInstance = null;

const MODULES_LIST = ["inventory", "sales", "purchase", "parties", "reports"];

window.initUsers = function () {
  // Security guard: Only Admin can access Users module
  const currentUser = SGD.getCurrentUser();
  const role = currentUser ? (currentUser.Role || currentUser.role || "").toLowerCase() : "";
  if (role !== "admin") {
    SGD.showToast("Access Denied: Only Admin can manage users.", "danger");
    SGD.navigate("dashboard");
    return;
  }

  const userModalEl = document.getElementById("userModal");
  if (userModalEl) {
    userModalInstance = bootstrap.Modal.getOrCreateInstance(userModalEl);
  }
  const resetEl = document.getElementById("resetPasswordModal");
  if (resetEl) {
    resetPasswordModalInstance = bootstrap.Modal.getOrCreateInstance(resetEl);
  }

  const searchInput = document.getElementById("searchUserInput");
  if (searchInput) {
    searchInput.addEventListener("input", filterUsers);
  }

  loadUsers();
};

async function loadUsers() {
  try {
    SGD.showLoading();
    const res = await SGD.api("getUsers");
    if (res && res.data) {
      usersData = res.data;
    } else {
      usersData = [];
    }
    renderUsers(usersData);
  } catch (e) {
    console.error("Error loading users", e);
    SGD.showToast("Error loading users: " + (e.message || e), "danger");
  } finally {
    SGD.hideLoading();
  }
}

function renderUsers(data) {
  const tbody = document.getElementById("usersTableBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const badgeEl = document.getElementById("userCountBadge");
  if (badgeEl) badgeEl.textContent = `${data ? data.length : 0} users`;

  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-5"><i class="bi bi-people" style="font-size:32px;opacity:.3"></i><p class="mt-2 mb-0">No users found</p></td></tr>';
    return;
  }

  data.forEach((u) => {
    const id = u.UserID || u.id || "-";
    const name = u.FullName || u.name || "-";
    const username = u.Username || u.username || "-";
    const roleRaw = u.Role || u.role || "Staff";
    const roleLower = roleRaw.toLowerCase();
    const email = u.Email || u.email || "—";
    const phone = u.Phone || u.phone || "—";
    const status = (u.Status || u.status || "active").toLowerCase();

    // Parse permissions
    let perms = u.permissions || u.Permissions;
    if (typeof perms === "string") {
      try { perms = JSON.parse(perms); } catch (e) { perms = null; }
    }

    // Role badge
    let roleBadge = '<span class="erp-badge badge-primary">Staff</span>';
    if (roleLower === "admin") roleBadge = '<span class="erp-badge badge-paid">Admin</span>';
    else if (roleLower === "manager") roleBadge = '<span class="erp-badge badge-partial">Manager</span>';

    // Permissions summary representation
    let permsHTML = "";
    if (roleLower === "admin") {
      permsHTML = '<span class="badge bg-success" style="font-size:11px"><i class="bi bi-shield-fill-check me-1"></i>Full Access (All Modules)</span>';
    } else if (perms) {
      const pills = [];
      const shortMap = { inventory: "Inv", sales: "Sale", purchase: "Pur", parties: "Party", reports: "Rpt" };
      MODULES_LIST.forEach((m) => {
        const mp = perms[m];
        if (mp && (mp.read || mp.edit || mp.delete)) {
          let ops = [];
          if (mp.read) ops.push("R");
          if (mp.edit) ops.push("E");
          if (mp.delete) ops.push("D");
          pills.push(`<span class="badge bg-light text-dark border me-1 mb-1" style="font-size:10px">${shortMap[m]}: ${ops.join("/")}</span>`);
        }
      });
      permsHTML = pills.length ? pills.join("") : '<span class="text-muted small">No access assigned</span>';
    } else {
      permsHTML = roleLower === "manager"
        ? '<span class="badge bg-light text-secondary border">Default Manager (Read/Edit)</span>'
        : '<span class="badge bg-light text-secondary border">Default Staff (Read)</span>';
    }

    let statusBadge = status === "active"
      ? '<span class="text-success small fw-bold"><i class="bi bi-check-circle-fill me-1"></i>Active</span>'
      : '<span class="text-danger small fw-bold"><i class="bi bi-x-circle-fill me-1"></i>Inactive</span>';

    const isCurrentAdmin = (username === "admin" || (u.UserID && u.UserID === "USR-001"));

    tbody.innerHTML += `
      <tr>
        <td class="fw-bold" style="color:#0d2157">${id}</td>
        <td><strong>${name}</strong></td>
        <td><code>${username}</code></td>
        <td>${roleBadge}</td>
        <td style="max-width:280px">${permsHTML}</td>
        <td class="small text-muted">${email}<br>${phone}</td>
        <td>${statusBadge}</td>
        <td class="text-end">
          <button class="btn btn-sm btn-outline-primary me-1" title="Edit User & Permissions" onclick="openEditUserModal('${id}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-warning me-1" title="Reset Password" onclick="openResetPasswordModal('${id}')">
            <i class="bi bi-key"></i>
          </button>
          ${!isCurrentAdmin ? `
            <button class="btn btn-sm btn-outline-danger" title="Deactivate User" onclick="deleteUser('${id}')">
              <i class="bi bi-person-x"></i>
            </button>
          ` : `
            <button class="btn btn-sm btn-outline-secondary" disabled title="Primary Admin cannot be deactivated">
              <i class="bi bi-lock"></i>
            </button>
          `}
        </td>
      </tr>
    `;
  });
}

function filterUsers() {
  const q = (document.getElementById("searchUserInput")?.value || "").toLowerCase();
  const roleFilter = (document.getElementById("filterUserRole")?.value || "").toLowerCase();

  const filtered = usersData.filter((u) => {
    const name = (u.FullName || "").toLowerCase();
    const uname = (u.Username || "").toLowerCase();
    const role = (u.Role || u.role || "").toLowerCase();

    const matchesQ = !q || name.includes(q) || uname.includes(q) || role.includes(q);
    const matchesRole = !roleFilter || role === roleFilter;

    return matchesQ && matchesRole;
  });

  renderUsers(filtered);
}

// ── Role & Permission Matrix Controls ──────────────────────────────────────
window.onUserRoleChange = function (role) {
  const r = (role || "").toLowerCase();
  const notice = document.getElementById("adminRoleNotice");
  const quickBtns = document.getElementById("permQuickButtons");
  const subText = document.getElementById("permSubText");
  const checkboxes = document.querySelectorAll(".perm-cb");

  if (r === "admin") {
    if (notice) notice.classList.remove("d-none");
    if (quickBtns) quickBtns.style.display = "none";
    if (subText) subText.style.display = "none";
    checkboxes.forEach((cb) => {
      cb.checked = true;
      cb.disabled = true;
    });
  } else {
    if (notice) notice.classList.add("d-none");
    if (quickBtns) quickBtns.style.display = "";
    if (subText) subText.style.display = "";
    checkboxes.forEach((cb) => {
      cb.disabled = false;
    });
    applyRoleDefaultPerms();
  }
};

window.setAllPerms = function (state) {
  const role = (document.getElementById("formUserRole")?.value || "").toLowerCase();
  if (role === "admin") return;
  document.querySelectorAll(".perm-cb").forEach((cb) => {
    cb.checked = !!state;
  });
};

window.applyRoleDefaultPerms = function () {
  const role = (document.getElementById("formUserRole")?.value || "Staff").toLowerCase();
  if (role === "admin") {
    document.querySelectorAll(".perm-cb").forEach((cb) => {
      cb.checked = true;
      cb.disabled = true;
    });
    return;
  }

  // Manager defaults: Read (All) + Edit (All), Delete (None)
  if (role === "manager") {
    MODULES_LIST.forEach((m) => {
      _setCb(`perm_${m}_read`, true);
      _setCb(`perm_${m}_edit`, true);
      _setCb(`perm_${m}_delete`, false);
    });
    return;
  }

  // Staff defaults: Read (Inventory, Sales, Parties), Edit (Sales), others unchecked
  if (role === "staff") {
    _setCb("perm_inventory_read", true);
    _setCb("perm_inventory_edit", false);
    _setCb("perm_inventory_delete", false);

    _setCb("perm_sales_read", true);
    _setCb("perm_sales_edit", true);
    _setCb("perm_sales_delete", false);

    _setCb("perm_purchase_read", false);
    _setCb("perm_purchase_edit", false);
    _setCb("perm_purchase_delete", false);

    _setCb("perm_parties_read", true);
    _setCb("perm_parties_edit", false);
    _setCb("perm_parties_delete", false);

    _setCb("perm_reports_read", false);
    _setCb("perm_reports_edit", false);
  }
};

function _setCb(id, val) {
  const el = document.getElementById(id);
  if (el) el.checked = !!val;
}

function _readCb(id) {
  const el = document.getElementById(id);
  return el ? !!el.checked : false;
}

// ── Open Modals ────────────────────────────────────────────────────────────
window.openAddUserModal = function () {
  document.getElementById("userForm").reset();
  document.getElementById("userId").value = "";
  document.getElementById("formUserName").readOnly = false;
  document.getElementById("passwordGroup").style.display = "block";
  document.getElementById("userPassword").required = true;
  document.getElementById("statusGroup").style.display = "none";
  document.getElementById("userModalTitle").innerHTML = '<i class="bi bi-person-plus-fill me-2 text-primary"></i>Add New User';

  document.getElementById("formUserRole").value = "Staff";
  onUserRoleChange("Staff");

  if (!userModalInstance) {
    userModalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById("userModal"));
  }
  userModalInstance.show();
};

window.openEditUserModal = function (id) {
  const user = usersData.find((u) => (u.UserID || u.id) == id);
  if (!user) return;

  document.getElementById("userForm").reset();
  document.getElementById("userId").value = user.UserID || user.id;
  document.getElementById("userFullName").value = user.FullName || user.name || "";
  document.getElementById("formUserName").value = user.Username || user.username || "";
  document.getElementById("formUserName").readOnly = true;

  const roleRaw = user.Role || user.role || "Staff";
  const r = roleRaw.toLowerCase();
  const formRoleVal = r === "admin" ? "Admin" : (r === "manager" ? "Manager" : "Staff");
  document.getElementById("formUserRole").value = formRoleVal;

  document.getElementById("userEmail").value = user.Email || user.email || "";
  document.getElementById("userPhone").value = user.Phone || user.phone || "";

  document.getElementById("passwordGroup").style.display = "none";
  document.getElementById("userPassword").required = false;

  document.getElementById("statusGroup").style.display = "block";
  document.getElementById("userStatus").value = (user.Status || user.status || "active").toLowerCase();

  document.getElementById("userModalTitle").innerHTML = `<i class="bi bi-person-gear me-2 text-primary"></i>Edit User: ${user.FullName || user.Username}`;

  onUserRoleChange(formRoleVal);

  // If user has saved custom permissions, populate them
  let perms = user.permissions || user.Permissions;
  if (typeof perms === "string") {
    try { perms = JSON.parse(perms); } catch (e) { perms = null; }
  }

  if (perms && r !== "admin") {
    MODULES_LIST.forEach((m) => {
      const mp = perms[m] || {};
      _setCb(`perm_${m}_read`, mp.read);
      _setCb(`perm_${m}_edit`, mp.edit);
      if (m !== "reports") {
        _setCb(`perm_${m}_delete`, mp.delete);
      }
    });
  }

  if (!userModalInstance) {
    userModalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById("userModal"));
  }
  userModalInstance.show();
};

// ── Save User ──────────────────────────────────────────────────────────────
window.saveUser = async function () {
  const form = document.getElementById("userForm");
  if (!form || !form.checkValidity()) {
    if (form) form.reportValidity();
    return;
  }

  const id = document.getElementById("userId").value;
  const isEdit = !!id;
  const role = document.getElementById("formUserRole").value;
  const isAdmin = (role || "").toLowerCase() === "admin";

  // Build permissions object
  const permissions = {
    inventory: {
      read: isAdmin ? true : _readCb("perm_inventory_read"),
      edit: isAdmin ? true : _readCb("perm_inventory_edit"),
      delete: isAdmin ? true : _readCb("perm_inventory_delete"),
    },
    sales: {
      read: isAdmin ? true : _readCb("perm_sales_read"),
      edit: isAdmin ? true : _readCb("perm_sales_edit"),
      delete: isAdmin ? true : _readCb("perm_sales_delete"),
    },
    purchase: {
      read: isAdmin ? true : _readCb("perm_purchase_read"),
      edit: isAdmin ? true : _readCb("perm_purchase_edit"),
      delete: isAdmin ? true : _readCb("perm_purchase_delete"),
    },
    parties: {
      read: isAdmin ? true : _readCb("perm_parties_read"),
      edit: isAdmin ? true : _readCb("perm_parties_edit"),
      delete: isAdmin ? true : _readCb("perm_parties_delete"),
    },
    reports: {
      read: isAdmin ? true : _readCb("perm_reports_read"),
      edit: isAdmin ? true : _readCb("perm_reports_edit"),
      delete: false,
    },
  };

  const userData = {
    FullName: document.getElementById("userFullName").value.trim(),
    Role: role,
    Email: document.getElementById("userEmail").value.trim(),
    Phone: document.getElementById("userPhone").value.trim(),
    Permissions: JSON.stringify(permissions),
    permissions: permissions,
  };

  const btn = document.getElementById("btnSaveUser");
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Saving...';
  }

  try {
    SGD.showLoading();
    let res;
    if (isEdit) {
      userData.UserID = id;
      userData.id = id;
      userData.Status = document.getElementById("userStatus").value;
      res = await SGD.api("updateUser", userData);
    } else {
      userData.Username = document.getElementById("formUserName").value.trim();
      userData.Password = document.getElementById("userPassword").value;
      res = await SGD.api("createUser", userData);
    }

    if (res && res.success) {
      SGD.showToast(res.message || "User saved successfully", "success");
      if (userModalInstance) userModalInstance.hide();
      await loadUsers();
    } else {
      SGD.showToast(res ? res.message : "Error saving user", "danger");
    }
  } catch (e) {
    console.error(e);
    SGD.showToast("Error saving user: " + (e.message || e), "danger");
  } finally {
    SGD.hideLoading();
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-check2-circle me-1"></i>Save User';
    }
  }
};

// ── Reset Password ─────────────────────────────────────────────────────────
window.openResetPasswordModal = function (id) {
  document.getElementById("resetPasswordForm").reset();
  document.getElementById("resetUserId").value = id;
  if (!resetPasswordModalInstance) {
    resetPasswordModalInstance = bootstrap.Modal.getOrCreateInstance(document.getElementById("resetPasswordModal"));
  }
  resetPasswordModalInstance.show();
};

window.submitResetPassword = async function () {
  const form = document.getElementById("resetPasswordForm");
  if (!form || !form.checkValidity()) {
    if (form) form.reportValidity();
    return;
  }

  const id = document.getElementById("resetUserId").value;
  const newPassword = document.getElementById("newPassword").value;

  if (!confirm("Are you sure you want to reset the password for this user?")) return;

  try {
    SGD.showLoading();
    const res = await SGD.api("adminResetPassword", {
      userId: id,
      newPassword: newPassword,
    });
    if (res && res.success) {
      SGD.showToast("Password reset successfully", "success");
      if (resetPasswordModalInstance) resetPasswordModalInstance.hide();
    } else {
      SGD.showToast(res ? res.message : "Error resetting password", "danger");
    }
  } catch (e) {
    console.error(e);
    SGD.showToast("Error resetting password: " + (e.message || e), "danger");
  } finally {
    SGD.hideLoading();
  }
};

// ── Deactivate User ────────────────────────────────────────────────────────
window.deleteUser = async function (id) {
  if (!confirm("Are you sure you want to deactivate this user? They will no longer be able to log in.")) return;

  try {
    SGD.showLoading();
    const res = await SGD.api("deleteUser", { userId: id });
    if (res && res.success) {
      SGD.showToast("User deactivated successfully", "success");
      await loadUsers();
    } else {
      SGD.showToast(res ? res.message : "Error deactivating user", "danger");
    }
  } catch (e) {
    console.error(e);
    SGD.showToast("Error deactivating user: " + (e.message || e), "danger");
  } finally {
    SGD.hideLoading();
  }
};
