/**
 * Admin Panel Component
 * User management interface for admins
 */

import { subscribeToUsers, updateUserProfile, deleteUserProfile } from '../firestore.js';
import { createUser } from '../auth.js';
import { subscribeToUnits } from '../firestore.js';

let usersUnsubscribe = null;
let unitsUnsubscribe = null;
let availableUnits = [];

export function showAdminPanel(userData) {
    const modalsContainer = document.getElementById('modals-container');

    modalsContainer.innerHTML = `
        <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div class="glass rounded-2xl p-6 w-full max-w-4xl my-8 fade-in">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold text-white">User Management</h2>
                    <button id="close-admin-panel" class="text-gray-400 hover:text-white transition">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <!-- Create User Form -->
                <div class="glass rounded-xl p-6 mb-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Create New User</h3>
                    <form id="create-user-form" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                            <input type="email" id="user-email" required placeholder="user@example.com" 
                                   class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
                            <input type="text" id="user-display-name" required placeholder="John Doe" 
                                   class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input type="password" id="user-password" required placeholder="••••••••" 
                                   class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-300 mb-2">Role</label>
                            <select id="user-role" required 
                                    class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        
                        <div id="unit-assignment-container" class="md:col-span-2">
                            <label class="block text-sm font-medium text-gray-300 mb-2">Assigned Unit (for Users)</label>
                            <select id="user-assigned-unit" 
                                    class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                                <option value="">None (Admin only)</option>
                            </select>
                        </div>
                        
                        <div class="md:col-span-2">
                            <button type="submit" class="btn-primary px-6 py-2 rounded-lg w-full">
                                Create User Account
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Users List -->
                <div class="glass rounded-xl p-6">
                    <h3 class="text-lg font-semibold text-white mb-4">Existing Users</h3>
                    <div id="users-list" class="space-y-3">
                        <!-- Will be populated by JavaScript -->
                    </div>
                </div>
            </div>
        </div>
    `;

    // Subscribe to units for dropdown
    unitsUnsubscribe = subscribeToUnits((units) => {
        availableUnits = units;
        updateUnitsDropdown();
    });

    // Subscribe to users
    usersUnsubscribe = subscribeToUsers((users) => {
        renderUsersList(users);
    });

    // Event Listeners
    const closeBtn = document.getElementById('close-admin-panel');
    closeBtn.addEventListener('click', hideAdminPanel);

    const createUserForm = document.getElementById('create-user-form');
    createUserForm.addEventListener('submit', handleCreateUser);

    const roleSelect = document.getElementById('user-role');
    roleSelect.addEventListener('change', toggleUnitAssignment);
}

function updateUnitsDropdown() {
    const select = document.getElementById('user-assigned-unit');
    if (!select) return;

    const currentValue = select.value;
    select.innerHTML = '<option value="">None (Admin only)</option>';

    availableUnits.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit.id;
        option.textContent = unit.name;
        select.appendChild(option);
    });

    if (currentValue) {
        select.value = currentValue;
    }
}

function toggleUnitAssignment() {
    const role = document.getElementById('user-role').value;
    const container = document.getElementById('unit-assignment-container');

    if (role === 'user') {
        container.classList.remove('hidden');
    } else {
        container.classList.add('hidden');
    }
}

async function handleCreateUser(e) {
    e.preventDefault();

    const email = document.getElementById('user-email').value;
    const displayName = document.getElementById('user-display-name').value;
    const password = document.getElementById('user-password').value;
    const role = document.getElementById('user-role').value;
    const assignedUnitId = document.getElementById('user-assigned-unit').value || null;

    if (role === 'user' && !assignedUnitId) {
        alert('Please assign a unit for regular users');
        return;
    }

    try {
        await createUser(email, password, role, assignedUnitId, displayName);
        alert('User created successfully! They can now login with their email and password.');

        // Reset form
        document.getElementById('create-user-form').reset();
    } catch (error) {
        alert('Error creating user: ' + error.message);
    }
}

function renderUsersList(users) {
    const list = document.getElementById('users-list');

    if (users.length === 0) {
        list.innerHTML = '<p class="text-gray-400 text-center py-4">No users yet</p>';
        return;
    }

    list.innerHTML = users.map(user => {
        const unit = availableUnits.find(u => u.id === user.assignedUnitId);
        const unitName = unit ? unit.name : 'N/A';

        return `
            <div class="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-1">
                        <h4 class="text-white font-semibold">${user.displayName || user.email}</h4>
                        <span class="badge badge-${user.role}">${user.role}</span>
                    </div>
                    <p class="text-sm text-gray-400">${user.email}</p>
                    ${user.assignedUnitId ? `<p class="text-sm text-gray-400">Assigned: ${unitName}</p>` : ''}
                    <p class="text-xs text-gray-500 mt-1">Created: ${new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div class="flex gap-2">
                    <button class="edit-user-btn text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-blue-500/10 transition"
                            data-user-id="${user.id}"
                            title="Edit User">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                        </svg>
                    </button>
                    <button class="delete-user-btn text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition"
                            data-user-id="${user.id}"
                            data-user-email="${user.email}"
                            title="Delete User">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    // Add event listeners
    list.querySelectorAll('.edit-user-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const userId = btn.dataset.userId;
            const user = users.find(u => u.id === userId);
            if (user) {
                showEditUserModal(user);
            }
        });
    });

    list.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const userId = btn.dataset.userId;
            const email = btn.dataset.userEmail;

            if (confirm(`Are you sure you want to delete user ${email}? This will only remove their profile, not their authentication account.`)) {
                try {
                    await deleteUserProfile(userId);
                    alert('User profile deleted. Note: Their authentication account still exists and should be manually deleted in Firebase Console.');
                } catch (error) {
                    alert('Error deleting user: ' + error.message);
                }
            }
        });
    });
}

function showEditUserModal(user) {
    const modalsContainer = document.getElementById('modals-container');

    // Create a nested modal
    const editModal = document.createElement('div');
    editModal.className = 'fixed inset-0 flex items-center justify-center z-[60] p-4';
    editModal.style.background = 'rgba(0, 0, 0, 0.5)';

    editModal.innerHTML = `
        <div class="glass rounded-xl p-6 w-full max-w-md fade-in">
            <h3 class="text-xl font-bold text-white mb-4">Edit User: ${user.displayName}</h3>
            
            <form id="edit-user-form" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-2">Role</label>
                    <select id="edit-user-role" class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>User</option>
                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                
                <div id="edit-unit-assignment">
                    <label class="block text-sm font-medium text-gray-300 mb-2">Assigned Unit</label>
                    <select id="edit-user-assigned-unit" class="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white">
                        <option value="">None</option>
                        ${availableUnits.map(unit => `
                            <option value="${unit.id}" ${user.assignedUnitId === unit.id ? 'selected' : ''}>${unit.name}</option>
                        `).join('')}
                    </select>
                </div>
                
                <div class="flex gap-3">
                    <button type="button" id="cancel-edit-btn" class="flex-1 btn-secondary py-2 rounded-lg">Cancel</button>
                    <button type="submit" class="flex-1 btn-primary py-2 rounded-lg">Save Changes</button>
                </div>
            </form>
        </div>
    `;

    modalsContainer.appendChild(editModal);

    // Event listeners
    const form = editModal.querySelector('#edit-user-form');
    const cancelBtn = editModal.querySelector('#cancel-edit-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newRole = editModal.querySelector('#edit-user-role').value;
        const newAssignedUnit = editModal.querySelector('#edit-user-assigned-unit').value || null;

        try {
            await updateUserProfile(user.id, {
                role: newRole,
                assignedUnitId: newAssignedUnit
            });
            alert('User updated successfully!');
            editModal.remove();
        } catch (error) {
            alert('Error updating user: ' + error.message);
        }
    });

    cancelBtn.addEventListener('click', () => {
        editModal.remove();
    });
}

export function hideAdminPanel() {
    const modalsContainer = document.getElementById('modals-container');
    modalsContainer.innerHTML = '';

    // Unsubscribe
    if (usersUnsubscribe) {
        usersUnsubscribe();
        usersUnsubscribe = null;
    }
    if (unitsUnsubscribe) {
        unitsUnsubscribe();
        unitsUnsubscribe = null;
    }
}
