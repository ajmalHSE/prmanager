/**
 * Firestore Database Service
 * Handles all database operations for units and pipe racks
 */

import { db } from './firebase.js';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    orderBy,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// ========== UNITS OPERATIONS ==========

/**
 * Subscribe to real-time units updates
 * @param {Function} callback - Called with array of units
 * @returns {Function} Unsubscribe function
 */
export function subscribeToUnits(callback) {
    const unitsRef = collection(db, 'units');

    return onSnapshot(unitsRef, (snapshot) => {
        const units = [];
        snapshot.forEach((doc) => {
            units.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(units);
    }, (error) => {
        console.error('Error subscribing to units:', error);
        callback([]);
    });
}

/**
 * Create a new unit (Admin only)
 * @param {string} unitNumber - Unit identifier (e.g., "542")
 * @param {string} name - Unit display name
 * @param {string} description - Optional description
 */
export async function createUnit(unitNumber, name, description = '') {
    try {
        await setDoc(doc(db, 'units', unitNumber), {
            unitNumber: unitNumber,
            name: name,
            description: description,
            createdAt: new Date().toISOString()
        });
        console.log('✅ Unit created:', unitNumber);
    } catch (error) {
        console.error('Error creating unit:', error);
        throw error;
    }
}

/**
 * Delete a unit (Admin only)
 * @param {string} unitId 
 */
export async function deleteUnit(unitId) {
    try {
        // Note: This doesn't delete subcollections automatically
        // In production, use Cloud Functions to delete subcollections
        await deleteDoc(doc(db, 'units', unitId));
        console.log('✅ Unit deleted:', unitId);
    } catch (error) {
        console.error('Error deleting unit:', error);
        throw error;
    }
}

/**
 * Get a single unit
 * @param {string} unitId 
 * @returns {Promise<object>}
 */
export async function getUnit(unitId) {
    try {
        const unitDoc = await getDoc(doc(db, 'units', unitId));
        if (unitDoc.exists()) {
            return {
                id: unitDoc.id,
                ...unitDoc.data()
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting unit:', error);
        throw error;
    }
}

// ========== PIPE RACKS OPERATIONS ==========

/**
 * Subscribe to real-time pipe racks updates for a unit
 * @param {string} unitId 
 * @param {Function} callback - Called with array of pipe racks
 * @returns {Function} Unsubscribe function
 */
export function subscribeToPipeRacks(unitId, callback) {
    const racksRef = collection(db, 'units', unitId, 'pipeRacks');

    return onSnapshot(racksRef, (snapshot) => {
        const racks = [];
        snapshot.forEach((doc) => {
            racks.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(racks);
    }, (error) => {
        console.error('Error subscribing to pipe racks:', error);
        callback([]);
    });
}

/**
 * Create a new pipe rack (Admin only)
 * @param {string} unitId 
 * @param {string} rackId - Rack identifier (e.g., "PR01")
 * @param {string} status - Initial status
 */
export async function createPipeRack(unitId, rackId, status = 'empty') {
    try {
        await setDoc(doc(db, 'units', unitId, 'pipeRacks', rackId), {
            rackId: rackId,
            status: status,
            lastUpdated: new Date().toISOString(),
            updatedBy: 'admin'
        });
        console.log('✅ Pipe rack created:', rackId);
    } catch (error) {
        console.error('Error creating pipe rack:', error);
        throw error;
    }
}

/**
 * Update pipe rack status
 * @param {string} unitId 
 * @param {string} rackId 
 * @param {string} status - New status
 * @param {string} userId - User making the update
 */
export async function updatePipeRackStatus(unitId, rackId, status, userId) {
    try {
        await updateDoc(doc(db, 'units', unitId, 'pipeRacks', rackId), {
            status: status,
            lastUpdated: new Date().toISOString(),
            updatedBy: userId
        });
        console.log('✅ Pipe rack updated:', rackId, 'to', status);
    } catch (error) {
        console.error('Error updating pipe rack:', error);
        throw error;
    }
}

/**
 * Delete a pipe rack (Admin only)
 * @param {string} unitId 
 * @param {string} rackId 
 */
export async function deletePipeRack(unitId, rackId) {
    try {
        await deleteDoc(doc(db, 'units', unitId, 'pipeRacks', rackId));
        console.log('✅ Pipe rack deleted:', rackId);
    } catch (error) {
        console.error('Error deleting pipe rack:', error);
        throw error;
    }
}

// ========== USERS OPERATIONS ==========

/**
 * Subscribe to real-time users updates (Admin only)
 * @param {Function} callback - Called with array of users
 * @returns {Function} Unsubscribe function
 */
export function subscribeToUsers(callback) {
    const usersRef = collection(db, 'users');

    return onSnapshot(usersRef, (snapshot) => {
        const users = [];
        snapshot.forEach((doc) => {
            users.push({
                id: doc.id,
                ...doc.data()
            });
        });
        callback(users);
    }, (error) => {
        console.error('Error subscribing to users:', error);
        callback([]);
    });
}

/**
 * Update user profile (Admin only)
 * @param {string} userId 
 * @param {object} updates 
 */
export async function updateUserProfile(userId, updates) {
    try {
        await updateDoc(doc(db, 'users', userId), updates);
        console.log('✅ User updated:', userId);
    } catch (error) {
        console.error('Error updating user:', error);
        throw error;
    }
}

/**
 * Delete user profile (Admin only)
 * Note: This only deletes Firestore data, not the auth account
 * @param {string} userId 
 */
export async function deleteUserProfile(userId) {
    try {
        await deleteDoc(doc(db, 'users', userId));
        console.log('✅ User profile deleted:', userId);
    } catch (error) {
        console.error('Error deleting user:', error);
        throw error;
    }
}
