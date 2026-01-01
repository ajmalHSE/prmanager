/**
 * Main Application Controller
 * Handles app initialization, routing, and auth state management
 */

import { onAuthChange } from './src/auth.js';
import { renderLoginPage } from './src/components/LoginPage.js';
import { renderMainDashboard, hideMainDashboard } from './src/components/MainDashboard.js';

// App State
let currentUser = null;

// Initialize App
function initApp() {
    console.log('🚀 Pipe Rack Manager initializing...');

    // Hide loading screen after a short delay
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
    }, 1000);

    // Listen to authentication state changes
    onAuthChange((userData) => {
        if (userData) {
            // User is signed in
            currentUser = userData;
            console.log('✅ User authenticated:', userData);
            showDashboard(userData);
        } else {
            // User is signed out
            currentUser = null;
            console.log('👤 No user authenticated');
            showLogin();
        }
    });
}

function showLogin() {
    // Hide all views
    hideAllViews();

    // Show login page
    renderLoginPage();
}

function showDashboard(userData) {
    // Hide all views
    hideAllViews();

    // Show main dashboard
    renderMainDashboard(userData);
}

function hideAllViews() {
    document.getElementById('login-page').classList.add('hidden');
    document.getElementById('main-dashboard').classList.add('hidden');
    document.getElementById('unit-detail-view').classList.add('hidden');
    document.getElementById('admin-panel').classList.add('hidden');
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export for debugging
window.app = {
    currentUser: () => currentUser,
    version: '1.0.0'
};

console.log('📦 App module loaded');
