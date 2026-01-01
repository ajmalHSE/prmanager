/**
 * Main Dashboard Component
 * Displays grid of units with real-time updates
 */

import { subscribeToUnits, createUnit, deleteUnit } from '../firestore.js';

let unitsUnsubscribe = null;
let currentUserData = null;

export function renderMainDashboard(userData) {
    currentUserData = userData;
    const dashboard = document.getElementById('main-dashboard');

    dashboard.innerHTML = `
        <!-- Header -->
        <header class="glass border-b border-white/10">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                            </svg>
                        </div>
                        <div>
                            <h1 class="text-xl font-bold text-white">Pipe Rack Manager</h1>
                            <p class="text-sm text-gray-400">${userData.displayName}</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <!-- Real-time Sync Indicator -->
                        <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span class="text-sm text-green-400">Live</span>
                        </div>
                        
                        <!-- Role Badge -->
                        <span class="badge badge-${userData.role}">${userData.role}</span>
                        
                        <!-- Admin Controls -->
                        ${userData.role === 'admin' ? `
                            <button id="manage-users-btn" class="btn-secondary px-4 py-2 rounded-lg text-sm">
                                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                </svg>
                                Manage Users
                            </button>
                            <button id="add-unit-btn" class="btn-primary px-4 py-2 rounded-lg text-sm">
                                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Add Unit
                            </button>
                        ` : ''}
                        
                        <!-- Logout Button -->
                        <button id="logout-btn" class="btn-secondary px-4 py-2 rounded-lg text-sm">
                            <svg class="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-white mb-2">Units Overview</h2>
                <p class="text-gray-400">Select a unit to view and manage pipe racks</p>
            </div>

            <!-- Units Grid -->
            <div id="units-grid" class="units-grid">
                <!-- Will be populated by JavaScript -->
            </div>

            <!-- Empty State -->
            <div id="empty-state" class="hidden text-center py-16">
                <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <h3 class="text-xl font-semibold text-gray-400 mb-2">No Units Yet</h3>
                <p class="text-gray-500">Create your first unit to get started</p>
            </div>
        </main>
    `;

    dashboard.classList.remove('hidden');

    // Subscribe to real-time units updates
    unitsUnsubscribe = subscribeToUnits((units) => {
        renderUnitsGrid(units);
    });

    // Event Listeners
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', handleLogout);

    if (userData.role === 'admin') {
        const addUnitBtn = document.getElementById('add-unit-btn');
        const manageUsersBtn = document.getElementById('manage-users-btn');

        addUnitBtn.addEventListener('click', handleAddUnit);
        manageUsersBtn.addEventListener('click', () => {
            // Import and show admin panel
            import('./AdminPanel.js').then(module => {
                module.showAdminPanel(userData);
            });
        });
    }
}

function renderUnitsGrid(units) {
    const grid = document.getElementById('units-grid');
    const emptyState = document.getElementById('empty-state');

    if (units.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    grid.innerHTML = units.map(unit => `
        <div class="glass rounded-xl p-6 card-hover cursor-pointer" data-unit-id="${unit.id}">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-xl font-bold text-white mb-1">${unit.name}</h3>
                    <p class="text-sm text-gray-400">Unit ${unit.unitNumber}</p>
                </div>
                ${currentUserData.role === 'admin' ? `
                    <button class="delete-unit-btn text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition" data-unit-id="${unit.id}" onclick="event.stopPropagation()">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                    </button>
                ` : ''}
            </div>
            
            ${unit.description ? `<p class="text-gray-400 text-sm mb-4">${unit.description}</p>` : ''}
            
            <div class="flex items-center gap-2 text-sm">
                <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <span class="text-gray-300">Click to view pipe racks</span>
            </div>
        </div>
    `).join('');

    // Add click handlers
    grid.querySelectorAll('[data-unit-id]').forEach(card => {
        if (!card.classList.contains('delete-unit-btn')) {
            card.addEventListener('click', () => {
                const unitId = card.dataset.unitId;
                showUnitDetail(unitId);
            });
        }
    });

    // Delete button handlers
    grid.querySelectorAll('.delete-unit-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const unitId = btn.dataset.unitId;
            if (confirm('Are you sure you want to delete this unit? This action cannot be undone.')) {
                try {
                    await deleteUnit(unitId);
                } catch (error) {
                    alert('Error deleting unit: ' + error.message);
                }
            }
        });
    });
}

async function handleAddUnit() {
    const unitNumber = prompt('Enter Unit Number (e.g., 550):');
    if (!unitNumber) return;

    const name = prompt('Enter Unit Name (e.g., Unit 550):');
    if (!name) return;

    const description = prompt('Enter Description (optional):') || '';

    try {
        await createUnit(unitNumber, name, description);
    } catch (error) {
        alert('Error creating unit: ' + error.message);
    }
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        import('../auth.js').then(module => {
            module.signOutUser();
        });
    }
}

function showUnitDetail(unitId) {
    // Import and show unit detail view
    import('./UnitDetailView.js').then(module => {
        module.showUnitDetailView(unitId, currentUserData);
    });
}

export function hideMainDashboard() {
    const dashboard = document.getElementById('main-dashboard');
    dashboard.classList.add('hidden');

    // Unsubscribe from real-time updates
    if (unitsUnsubscribe) {
        unitsUnsubscribe();
        unitsUnsubscribe = null;
    }
}
