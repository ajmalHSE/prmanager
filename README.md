# Pipe Rack Manager - Construction Site Material Management

A real-time construction site material and pipe rack management system built with vanilla JavaScript, Firebase, and Tailwind CSS.

## Features

✅ **Three-tier Authentication**
- **Admin**: Full access to create/delete units, pipe racks, and manage users
- **User**: Can update pipe racks in their assigned unit only
- **Guest**: Read-only access via anonymous authentication

✅ **Real-time Synchronization**
- Instant updates across all connected devices using Firestore `onSnapshot`
- Live sync indicator showing connection status

✅ **Color-coded Visual Status**
- 🟢 **Green**: Empty
- 🔴 **Red**: No Space
- ⚫ **Grey**: Ground Not Ready

✅ **Premium UI/UX**
- Modern glassmorphism design
- Smooth animations and transitions
- Fully responsive (mobile, tablet, desktop)

## Project Structure

```
pipe-rack-manager/
├── index.html              # Main HTML file
├── style.css               # Custom styles and animations
├── app.js                  # Main application controller
├── src/
│   ├── firebase.js         # Firebase configuration
│   ├── auth.js             # Authentication service
│   ├── firestore.js        # Firestore database operations
│   └── components/
│       ├── LoginPage.js        # Login interface
│       ├── MainDashboard.js    # Units grid view
│       ├── UnitDetailView.js   # Pipe racks grid view
│       └── AdminPanel.js       # User management
└── README.md
```

## Setup Instructions

### 1. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Your project is already configured with the credentials in `src/firebase.js`
3. Enable **Authentication**:
   - Go to Authentication → Sign-in method
   - Enable **Email/Password** provider
   - Enable **Anonymous** provider (for guest login)
4. Enable **Firestore Database**:
   - Go to Firestore Database → Create database
   - Start in **test mode** (we'll add security rules next)
   - Choose a location closest to your users

### 2. Firestore Security Rules

Copy the security rules from `FIRESTORE_RULES.md` and paste them in:
- Firebase Console → Firestore Database → Rules tab

### 3. Create First Admin User

Since this is the first setup:

1. Open `index.html` in your browser
2. The app will load with the login page
3. Click "Continue as Guest" to explore read-only mode
4. To create an admin account:
   - Go to Firebase Console → Authentication → Users
   - Click "Add user"
   - Enter email and password (e.g., `admin@example.com` / `admin123`)
   - Copy the User UID
   - Go to Firestore Database → Start collection
   - Collection ID: `users`
   - Document ID: [paste the User UID]
   - Fields:
     ```
     email: admin@example.com
     role: admin
     displayName: Admin User
     assignedUnitId: null
     createdAt: [current timestamp]
     ```
   - Click Save

5. Now you can login with `admin@example.com` and your password!

### 4. Running the Application

Simply open `index.html` in a modern web browser. No build process required!

**For development:**
- Use a local server for better performance:
  ```bash
  # Python 3
  python -m http.server 8000
  
  # Node.js (if installed)
  npx serve
  ```
- Then open `http://localhost:8000`

## Usage Guide

### Admin Workflow

1. **Login** with admin credentials
2. **Create Units**: Click "Add Unit" button
3. **Create Users**: Click "Manage Users" → Fill form → Assign unit to regular users
4. **Navigate to Unit**: Click on a unit card
5. **Add Pipe Racks**: Click "Add Pipe Rack" button
6. **Update Status**: Click on a pipe rack → Select new status

### User Workflow

1. **Login** with user credentials
2. **View Dashboard**: See all units (but can only access assigned unit)
3. **Navigate to Assigned Unit**: Click on your unit
4. **Update Pipe Rack Status**: Click rack → Select status

### Guest Workflow

1. **Click "Continue as Guest"** on login page
2. **Browse**: View all units and pipe racks in read-only mode
3. **No modifications allowed**

## Real-time Synchronization

The app uses Firestore's `onSnapshot` listeners for instant updates:

- Open the app in **two browser windows**
- Login as admin in one, user in another
- Update a pipe rack status in one window
- See the change **instantly** appear in the other window!

## Firestore Data Structure

```
firestore/
├── users/
│   └── {userId}/
│       ├── email: string
│       ├── role: "admin" | "user"
│       ├── assignedUnitId: string | null
│       ├── displayName: string
│       └── createdAt: timestamp
│
└── units/
    └── {unitNumber}/
        ├── unitNumber: string
        ├── name: string
        ├── description: string
        ├── createdAt: timestamp
        └── pipeRacks/ (subcollection)
            └── {rackId}/
                ├── rackId: string
                ├── status: "empty" | "no-space" | "ground-not-ready"
                ├── lastUpdated: timestamp
                └── updatedBy: string
```

## Technologies Used

- **Frontend**: Vanilla JavaScript (ES6 Modules)
- **Styling**: Tailwind CSS (CDN)
- **Backend**: Firebase Authentication + Firestore
- **Real-time**: Firestore onSnapshot listeners

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari
- Mobile browsers (iOS Safari, Chrome Mobile)

## Troubleshooting

### "Firebase SDK not loaded"
- Check your internet connection
- Ensure Firebase CDN URLs are accessible

### "Permission denied" errors
- Verify Firestore security rules are correctly applied
- Check user role in Firestore `users` collection

### Real-time updates not working
- Check browser console for errors
- Verify Firestore connection in Network tab
- Ensure you're not blocking WebSocket connections

## Future Enhancements

- [ ] Export data to Excel/PDF
- [ ] Advanced filtering and search
- [ ] Email notifications for status changes
- [ ] Mobile app (React Native)
- [ ] Offline support with Firestore persistence

## License

MIT License - feel free to use for your construction projects!

## Support

For issues or questions, check the browser console for error messages and verify your Firebase configuration.
