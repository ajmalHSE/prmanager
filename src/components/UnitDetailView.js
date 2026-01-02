/**
 * Unit Detail View Component
 * Displays pipe racks grid for a specific unit with color-coded status
 */

import { subscribeToPipeRacks, createPipeRack, updatePipeRackStatus, deletePipeRack, getUnit } from '../firestore.js';

let racksUnsubscribe = null;
let currentUnitId = null;
let currentUserData = null;
let currentUnit = null;

// Status configuration with colors
const STATUS_CONFIG = {
    'empty': { label: 'Empty', color: '#10b981', icon: '✓', textColor: 'text-white' },
    '50-full': { label: '50% Full', color: '#f59e0b', icon: '◐', textColor: 'text-white' },
    '75-full': { label: '75% Full', color: '#f97316', icon: '◕', textColor: 'text-white' },
    'no-space': { label: 'No Space', color: '#ef4444', icon: '✕', textColor: 'text-white' },
    'ground-not-ready': { label: 'Ground Not Ready', color: '#facc15', icon: '⚠', textColor: 'text-black' }
};

export async function showUnitDetailView(unitId, userData) {
    currentUnitId = unitId;
    currentUserData = userData;

    // Check if user has permission to view this unit
    if (userData.role === 'user' && userData.assignedUnitId !== unitId) {
        alert('Access Denied: You can only view your assigned unit.');
        return;
    }

    // Get unit data
    currentUnit = await getUnit(unitId);
    if (!currentUnit) {
        alert('Unit not found');
        return;
    }

    // Hide dashboard, show detail view
    const dashboard = document.getElementById('main-dashboard');
    const detailView = document.getElementById('unit-detail-view');

    dashboard.classList.add('hidden');

    detailView.innerHTML = `
        <!-- Header -->
        <header class="glass border-b border-white/10">
            <div class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <button id="back-btn" class="p-2 rounded-lg hover:bg-white/10 transition text-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                            </svg>
                        </button>
                        <div>
                            <h1 class="text-xl font-bold text-white">${currentUnit.name}</h1>
                            <p class="text-sm text-gray-400">Unit ${currentUnit.unitNumber}</p>
                        </div>
                    </div>
                    
                    <div class="flex items-center gap-3">
                        <!-- Real-time Sync Indicator -->
                        <div class="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                            <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span class="text-sm text-green-400">Live</span>
                        </div>
                        
                        ${userData.role === 'admin' ? `
                            <button id="add-rack-btn" class="btn-primary px-4 py-2 rounded-lg text-sm">
                                <svg class="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Add Pipe Rack
                            </button>
                        ` : ''}
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content -->
        <main class="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div class="mb-3">
                <h2 class="text-xl font-bold text-white mb-1">Pipe Racks</h2>
                <p class="text-sm text-gray-400">
                    ${userData.role === 'guest' ? 'View-only mode' : 'Click a rack to update its status'}
                </p>
            </div>

            <!-- Status Legend - Compact and beautiful -->
            <div class="flex flex-wrap gap-2 mb-4">
                ${Object.entries(STATUS_CONFIG).map(([key, config]) => `
                    <div class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md glass text-xs">
                        <div class="w-3 h-3 rounded-sm" style="background: ${config.color}"></div>
                        <span class="text-gray-300 font-medium">${config.label}</span>
                    </div>
                `).join('')}
            </div>

            <!-- Pipe Racks Grid -->
            <div id="racks-grid" class="racks-grid">
                <!-- Will be populated by JavaScript -->
            </div>

            <!-- Empty State -->
            <div id="empty-racks-state" class="hidden text-center py-16">
                <svg class="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                <h3 class="text-xl font-semibold text-gray-400 mb-2">No Pipe Racks Yet</h3>
                <p class="text-gray-500">Add your first pipe rack to get started</p>
            </div>
        </main>
    `;

    detailView.classList.remove('hidden');

    // Subscribe to real-time pipe racks updates
    racksUnsubscribe = subscribeToPipeRacks(unitId, (racks) => {
        console.log(`📦 Racks for ${unitId}:`, racks); // DEBUG LOG
        renderRacksGrid(racks);
    });

    // Event Listeners
    const backBtn = document.getElementById('back-btn');
    backBtn.addEventListener('click', hideUnitDetailView);

    if (userData.role === 'admin') {
        const addRackBtn = document.getElementById('add-rack-btn');
        addRackBtn.addEventListener('click', handleAddRack);
    }
}

function renderRacksGrid(racks) {
    const grid = document.getElementById('racks-grid');
    const emptyState = document.getElementById('empty-racks-state');

    if (racks.length === 0) {
        grid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        return;
    }

    grid.classList.remove('hidden');
    emptyState.classList.add('hidden');

    grid.innerHTML = racks.map(rack => {
        const config = STATUS_CONFIG[rack.status] || STATUS_CONFIG['empty'];
        const lastUpdated = new Date(rack.lastUpdated);
        const canEdit = currentUserData.role !== 'guest';
        const note = rack.statusNote || '';

        return `
            <div class="glass rounded-lg overflow-hidden card-hover ${canEdit ? 'cursor-pointer' : 'cursor-default'} shadow-lg" 
                 data-rack-id="${rack.id}"
                 data-status="${rack.status}">
                <!-- Rack Header - Super compact -->
                <div class="px-2 py-1.5 border-b border-white/10 flex items-center justify-between bg-black/20">
                    <h3 class="text-xs font-bold text-white">${rack.rackId}</h3>
                    ${currentUserData.role === 'admin' ? `
                        <button class="delete-rack-btn text-red-400 hover:text-red-300 p-0.5 rounded hover:bg-red-500/10 transition" 
                                data-rack-id="${rack.id}" 
                                onclick="event.stopPropagation()">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                            </svg>
                        </button>
                    ` : ''}
                </div>

                <!-- Status Block - Optimized for notes -->
                <div class="h-[80px] flex flex-col items-center justify-center transition-all duration-300 px-2 ${config.textColor}" 
                     style="background: ${config.color}">
                    <div class="text-center">
                        <div class="text-xl leading-none mb-1">${config.icon}</div>
                        <div class="text-[9px] font-bold uppercase tracking-wider">${config.label}</div>
                    </div>
                    ${note ? `
                        <div class="mt-1.5 text-[8px] leading-[1.2] font-semibold italic text-center w-full break-words opacity-90">
                            ${note}
                        </div>
                    ` : ''}
                </div>

                <!-- Footer - Minimal -->
                <div class="px-1.5 py-1 bg-black/30 text-[8px] text-gray-400 text-center relative">
                    <div class="truncate">${lastUpdated.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
            </div>
        `;
    }).join('');

    // Add click handlers for status update
    if (currentUserData.role !== 'guest') {
        grid.querySelectorAll('[data-rack-id]').forEach(card => {
            if (!card.classList.contains('delete-rack-btn')) {
                card.addEventListener('click', () => {
                    const rackId = card.dataset.rackId;
                    const currentStatus = card.dataset.status;
                    const rackData = racks.find(r => r.id === rackId);
                    showStatusModal(rackId, currentStatus, rackData?.statusNote || '');
                });
            }
        });
    }

    // Delete button handlers
    if (currentUserData.role === 'admin') {
        grid.querySelectorAll('.delete-rack-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const rackId = btn.dataset.rackId;
                if (confirm('Are you sure you want to delete this pipe rack?')) {
                    try {
                        await deletePipeRack(currentUnitId, rackId);
                    } catch (error) {
                        alert('Error deleting rack: ' + error.message);
                    }
                }
            });
        });
    }
}

function showStatusModal(rackId, currentStatus, initialNote = '') {
    const modalsContainer = document.getElementById('modals-container');
    let selectedStatus = currentStatus;

    modalsContainer.innerHTML = `
        <div class="modal-backdrop fixed inset-0 flex items-center justify-center z-50 p-4">
            <div class="glass rounded-2xl p-6 w-full max-w-md fade-in">
                <h3 class="text-xl font-bold text-white mb-4">Update Status: ${rackId}</h3>
                
                <div class="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    ${Object.entries(STATUS_CONFIG).map(([key, config]) => `
                        <button class="status-btn w-full flex items-center gap-3 p-3 rounded-lg border-2 transition ${key === selectedStatus ? 'border-white/30 bg-white/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'
        }" data-status="${key}">
                            <div class="w-6 h-6 rounded" style="background: ${config.color}"></div>
                            <div class="flex-1 text-left">
                                <div class="text-white text-sm font-semibold">${config.label}</div>
                            </div>
                            <div class="check-indicator ${key === selectedStatus ? '' : 'hidden'} text-green-400 text-xs whitespace-nowrap">✓ Selected</div>
                        </button>
                    `).join('')}
                </div>

                <!-- Note Field -->
                <div id="note-container" class="mt-4 ${selectedStatus === 'ground-not-ready' ? '' : 'hidden'}">
                    <label class="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Reason for Ground Not Ready</label>
                    <textarea id="status-note" class="w-full bg-black/20 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-gray-600" 
                              placeholder="Type the reason here (e.g., obstruction, material in ground...)" rows="3">${initialNote}</textarea>
                </div>

                <div class="mt-6 flex gap-3">
                    <button id="cancel-status-btn" class="flex-1 btn-secondary py-2 rounded-lg text-sm">Cancel</button>
                    <button id="save-status-btn" class="flex-1 btn-primary py-2 rounded-lg text-sm shadow-lg shadow-blue-500/20">Save Changes</button>
                </div>
            </div>
        </div>
    `;

    const statusButtons = modalsContainer.querySelectorAll('.status-btn');
    const noteContainer = modalsContainer.querySelector('#note-container');
    const noteInput = modalsContainer.querySelector('#status-note');

    statusButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            selectedStatus = btn.dataset.status;

            // Update UI selection
            statusButtons.forEach(b => {
                const isSelected = b.dataset.status === selectedStatus;
                b.classList.toggle('border-white/30', isSelected);
                b.classList.toggle('bg-white/10', isSelected);
                b.classList.toggle('border-white/10', !isSelected);
                b.classList.toggle('bg-white/5', !isSelected);
                b.querySelector('.check-indicator').classList.toggle('hidden', !isSelected);
            });

            // Toggle note field
            if (selectedStatus === 'ground-not-ready') {
                noteContainer.classList.remove('hidden');
            } else {
                noteContainer.classList.add('hidden');
            }
        });
    });

    modalsContainer.querySelector('#cancel-status-btn').addEventListener('click', closeModal);

    modalsContainer.querySelector('#save-status-btn').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        const noteValue = selectedStatus === 'ground-not-ready' ? noteInput.value.trim() : '';

        console.log('📝 Saving status change:', { rackId, status: selectedStatus, note: noteValue }); // DEBUG LOG

        try {
            btn.disabled = true;
            btn.innerHTML = '<span class="animate-pulse">Saving...</span>';

            await updatePipeRackStatus(currentUnitId, rackId, selectedStatus, currentUserData.uid, noteValue);
            closeModal();
        } catch (error) {
            console.error('❌ Error saving status:', error);
            alert('Error updating status: ' + error.message);
            btn.disabled = false;
            btn.innerHTML = 'Save Changes';
        }
    });
}

function closeModal() {
    const modalsContainer = document.getElementById('modals-container');
    if (modalsContainer) modalsContainer.innerHTML = '';
}

async function handleAddRack() {
    const rackId = prompt('Enter Pipe Rack ID (e.g., PR01):');
    if (!rackId) return;

    try {
        await createPipeRack(currentUnitId, rackId, 'empty');
    } catch (error) {
        alert('Error creating pipe rack: ' + error.message);
    }
}

export function hideUnitDetailView() {
    const detailView = document.getElementById('unit-detail-view');
    const dashboard = document.getElementById('main-dashboard');

    detailView.classList.add('hidden');
    dashboard.classList.remove('hidden');

    // Unsubscribe from real-time updates
    if (racksUnsubscribe) {
        racksUnsubscribe();
        racksUnsubscribe = null;
    }
}
