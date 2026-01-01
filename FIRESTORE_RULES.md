# Firestore Security Rules

Copy and paste these rules into your Firebase Console:

**Firebase Console → Firestore Database → Rules**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is authenticated
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Helper function to check if user is admin
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Helper function to check if user has access to a specific unit
    function hasUnitAccess(unitId) {
      return isSignedIn() && (
        isAdmin() ||
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.assignedUnitId == unitId
      );
    }
    
    // Users collection
    match /users/{userId} {
      // Anyone authenticated can read user profiles
      allow read: if isSignedIn();
      
      // Users can update their own profile (except role)
      allow update: if isSignedIn() && request.auth.uid == userId && 
                       request.resource.data.role == resource.data.role;
      
      // Only admins can create or delete users
      allow create, delete: if isAdmin();
      
      // Admins can update any user
      allow update: if isAdmin();
    }
    
    // Units collection
    match /units/{unitId} {
      // Anyone can read units (including guests via anonymous auth)
      allow read: if true;
      
      // Only admins can create or delete units
      allow create, delete: if isAdmin();
      
      // Only admins can update unit metadata
      allow update: if isAdmin();
      
      // Pipe racks subcollection
      match /pipeRacks/{rackId} {
        // Anyone can read pipe racks (including guests)
        allow read: if true;
        
        // Only admins can create or delete pipe racks
        allow create, delete: if isAdmin();
        
        // Admins or users assigned to this unit can update pipe rack status
        allow update: if hasUnitAccess(unitId);
      }
    }
  }
}
```

## Security Rules Explanation

### Users Collection

- **Read**: Any authenticated user can view user profiles
- **Create/Delete**: Only admins can create or delete users
- **Update**: Users can update their own profile (but not change their role), admins can update anyone

### Units Collection

- **Read**: Public read access (allows guest mode)
- **Create/Delete/Update**: Admin only

### Pipe Racks Subcollection

- **Read**: Public read access (allows guest mode)
- **Create/Delete**: Admin only
- **Update**: Admin OR user assigned to the parent unit

## Testing Security Rules

After applying the rules, test them:

1. **As Guest**:
   - ✅ Can read units and pipe racks
   - ❌ Cannot create, update, or delete anything

2. **As Regular User**:
   - ✅ Can read all units and pipe racks
   - ✅ Can update pipe racks in assigned unit
   - ❌ Cannot update pipe racks in other units
   - ❌ Cannot create/delete units or racks

3. **As Admin**:
   - ✅ Full access to everything

## Important Notes

1. **Anonymous Auth**: Guest login uses Firebase Anonymous Authentication, which still provides a `request.auth.uid`, so the rules work correctly.

2. **Performance**: The rules use `get()` calls to check user roles. This counts towards your Firestore read quota. For high-traffic apps, consider caching user roles in custom claims.

3. **First Admin**: The first admin user must be created manually in the Firebase Console as described in the README.

4. **Production**: These rules are suitable for production use, but consider adding rate limiting and additional validation for sensitive operations.
