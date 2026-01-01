/**
 * Authentication Service
 * Handles user authentication with Firebase Auth
 */

import { auth, db } from './firebase.js';
import {
    signInWithEmailAndPassword,
    signInAnonymously,
    signOut,
    onAuthStateChanged,
    createUserWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

/**
 * Sign in with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user: object, role: string, assignedUnitId: string|null}>}
 */
export async function signInUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));

        if (!userDoc.exists()) {
            throw new Error('User profile not found. Please contact administrator.');
        }

        const userData = userDoc.data();

        return {
            uid: user.uid,
            email: user.email,
            role: userData.role || 'user',
            assignedUnitId: userData.assignedUnitId || null,
            displayName: userData.displayName || email
        };
    } catch (error) {
        console.error('Sign in error:', error);
        throw error;
    }
}

/**
 * Guest login using anonymous authentication
 * @returns {Promise<{user: object, role: string}>}
 */
export async function guestLogin() {
    try {
        const userCredential = await signInAnonymously(auth);
        const user = userCredential.user;

        return {
            uid: user.uid,
            email: 'guest@local',
            role: 'guest',
            assignedUnitId: null,
            displayName: 'Guest (Read Only)'
        };
    } catch (error) {
        console.error('Guest login error:', error);
        throw error;
    }
}

/**
 * Sign out current user
 */
export async function signOutUser() {
    try {
        await signOut(auth);
        console.log('✅ User signed out');
    } catch (error) {
        console.error('Sign out error:', error);
        throw error;
    }
}

/**
 * Create a new user account (Admin only)
 * Note: This creates the auth account. The admin must manually set the role in Firestore.
 * @param {string} email 
 * @param {string} password 
 * @param {string} role - 'admin' or 'user'
 * @param {string|null} assignedUnitId 
 * @param {string} displayName 
 */
export async function createUser(email, password, role, assignedUnitId, displayName) {
    try {
        // Note: In a production app, this should be done via Cloud Functions
        // For now, admin creates account and manually sets role in Firestore
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Create user profile in Firestore
        await setDoc(doc(db, 'users', user.uid), {
            email: email,
            role: role,
            assignedUnitId: assignedUnitId,
            displayName: displayName,
            createdAt: new Date().toISOString()
        });

        console.log('✅ User created:', email);
        return user;
    } catch (error) {
        console.error('Create user error:', error);
        throw error;
    }
}

/**
 * Listen to authentication state changes
 * @param {Function} callback - Called with user data or null
 */
export function onAuthChange(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            // Check if anonymous (guest)
            if (user.isAnonymous) {
                callback({
                    uid: user.uid,
                    email: 'guest@local',
                    role: 'guest',
                    assignedUnitId: null,
                    displayName: 'Guest (Read Only)'
                });
            } else {
                // Get user data from Firestore
                const userDoc = await getDoc(doc(db, 'users', user.uid));
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    callback({
                        uid: user.uid,
                        email: user.email,
                        role: userData.role || 'user',
                        assignedUnitId: userData.assignedUnitId || null,
                        displayName: userData.displayName || user.email
                    });
                } else {
                    callback(null);
                }
            }
        } else {
            callback(null);
        }
    });
}

/**
 * Get current user
 */
export function getCurrentUser() {
    return auth.currentUser;
}
