/**
 * Login Page Component
 * Handles user authentication UI
 */

import { signInUser, guestLogin } from '../auth.js';

export function renderLoginPage() {
    const loginPage = document.getElementById('login-page');

    loginPage.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4">
            <div class="glass rounded-2xl p-8 w-full max-w-md fade-in">
                <!-- Logo and Title -->
                <div class="text-center mb-8">
                    <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                    </div>
                    <h1 class="text-3xl font-bold text-white mb-2">Pipe Rack Manager</h1>
                    <p class="text-gray-400">Construction Site Material Management</p>
                </div>

                <!-- Login Form -->
                <form id="login-form" class="space-y-6">
                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            required
                            placeholder="admin@example.com"
                            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            required
                            placeholder="••••••••"
                            class="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        />
                    </div>

                    <button 
                        type="submit" 
                        class="w-full btn-primary py-3 rounded-lg font-semibold text-white shadow-lg"
                    >
                        Sign In
                    </button>
                </form>

                <!-- Divider -->
                <div class="relative my-6">
                    <div class="absolute inset-0 flex items-center">
                        <div class="w-full border-t border-white/10"></div>
                    </div>
                    <div class="relative flex justify-center text-sm">
                        <span class="px-4 bg-slate-900 text-gray-400">or</span>
                    </div>
                </div>

                <!-- Guest Login Button -->
                <button 
                    id="guest-login-btn"
                    class="w-full btn-secondary py-3 rounded-lg font-semibold text-white shadow-lg flex items-center justify-center gap-2"
                >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    Continue as Guest (View Only)
                </button>

                <!-- Error Message -->
                <div id="login-error" class="hidden mt-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"></div>
            </div>
        </div>
    `;

    // Event Listeners
    const form = document.getElementById('login-form');
    const guestBtn = document.getElementById('guest-login-btn');
    const errorDiv = document.getElementById('login-error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorDiv.classList.add('hidden');

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const userData = await signInUser(email, password);
            console.log('✅ Signed in:', userData);
            // Auth state change will handle navigation
        } catch (error) {
            errorDiv.textContent = error.message || 'Invalid email or password';
            errorDiv.classList.remove('hidden');
        }
    });

    guestBtn.addEventListener('click', async () => {
        errorDiv.classList.add('hidden');
        try {
            const userData = await guestLogin();
            console.log('✅ Guest login:', userData);
            // Auth state change will handle navigation
        } catch (error) {
            errorDiv.textContent = 'Guest login failed. Please try again.';
            errorDiv.classList.remove('hidden');
        }
    });

    loginPage.classList.remove('hidden');
}
