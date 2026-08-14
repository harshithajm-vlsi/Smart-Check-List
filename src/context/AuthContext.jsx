import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  isFirebaseConfigured, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from '../config/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

// Default demo users list for multi-user simulation
const INITIAL_DEMO_USERS = [
  {
    uid: 'demo-admin-1',
    displayName: 'Harshitha (Owner)',
    email: 'harshitha@admin.smartalarm.com',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginAt: new Date().toISOString(),
    lastActiveAt: new Date().toISOString(),
    isOnline: true,
    deviceInfo: 'Chrome on Windows 11',
  },
  {
    uid: 'demo-user-2',
    displayName: 'Alex Rivers',
    email: 'alex.rivers@gmail.com',
    photoURL: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isOnline: true,
    deviceInfo: 'Safari on macOS',
  },
  {
    uid: 'demo-user-3',
    displayName: 'Sarah Chen',
    email: 'sarah.chen@tech.org',
    photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    isOnline: false,
    deviceInfo: 'Firefox on Linux',
  },
  {
    uid: 'demo-user-4',
    displayName: 'David Miller',
    email: 'dmiller99@yahoo.com',
    photoURL: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'user',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
    isOnline: false,
    deviceInfo: 'Chrome Mobile on Android',
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [authError, setAuthError] = useState(null);

  // Initialize demo users in localStorage if needed
  const getStoredDemoUsers = () => {
    try {
      const stored = localStorage.getItem('sa_demo_users_v2');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    localStorage.setItem('sa_demo_users_v2', JSON.stringify(INITIAL_DEMO_USERS));
    return INITIAL_DEMO_USERS;
  };

  const updateDemoUsersList = (users) => {
    setAllUsers(users);
    localStorage.setItem('sa_demo_users_v2', JSON.stringify(users));
  };

  // Listen to Auth State
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Sync user to Firestore
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);

          let userRole = 'user';
          if (snap.exists()) {
            userRole = snap.data().role || 'user';
          } else if (user.email && (user.email.includes('admin') || user.email.includes('harshitha'))) {
            userRole = 'admin';
          }

          const userData = {
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email)}&background=6366f1&color=fff`,
            role: userRole,
            lastLoginAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            isOnline: true,
            deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser'
          };

          if (!snap.exists()) {
            userData.createdAt = new Date().toISOString();
          }

          await setDoc(userRef, userData, { merge: true });
          setCurrentUser({ ...userData, isAdmin: userRole === 'admin' });
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });

      // Realtime listener for all users for Admin
      const usersQuery = query(collection(db, 'users'), orderBy('lastActiveAt', 'desc'));
      const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const usersList = snapshot.docs.map(doc => doc.data());
        setAllUsers(usersList);
      }, (err) => {
        console.warn('Firestore users sync notice:', err);
      });

      return () => {
        unsubscribeAuth();
        unsubscribeUsers();
      };
    } else {
      // Demo Mode Auth setup
      const demoUsers = getStoredDemoUsers();
      setAllUsers(demoUsers);

      const activeUserId = localStorage.getItem('sa_active_user_id') || demoUsers[0].uid;
      const foundUser = demoUsers.find(u => u.uid === activeUserId) || demoUsers[0];

      // Update current user's online/active timestamp
      const updatedUser = {
        ...foundUser,
        isOnline: true,
        lastActiveAt: new Date().toISOString(),
        isAdmin: foundUser.role === 'admin'
      };

      setCurrentUser(updatedUser);

      // Save updated active status to list
      const updatedUsersList = demoUsers.map(u => u.uid === updatedUser.uid ? updatedUser : u);
      updateDemoUsersList(updatedUsersList);

      setLoading(false);
    }
  }, [isFirebaseConfigured]);

  // Heartbeat / Active status updater
  useEffect(() => {
    if (!currentUser) return;

    const interval = setInterval(async () => {
      const nowIso = new Date().toISOString();
      if (isFirebaseConfigured && db && auth?.currentUser) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          await updateDoc(userRef, { lastActiveAt: nowIso, isOnline: true });
        } catch (e) {
          console.warn('Heartbeat update failed:', e);
        }
      } else {
        // Demo mode heartbeat update
        setAllUsers(prev => {
          const next = prev.map(u => u.uid === currentUser.uid ? { ...u, lastActiveAt: nowIso, isOnline: true } : u);
          localStorage.setItem('sa_demo_users_v2', JSON.stringify(next));
          return next;
        });
      }
    }, 30000); // every 30 seconds

    return () => clearInterval(interval);
  }, [currentUser, isFirebaseConfigured]);

  // Google Sign-In Function
  const loginWithGoogle = async () => {
    setAuthError(null);
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      } catch (error) {
        console.error('Google Sign-In Error:', error);
        let msg = error.message || 'Google Sign-In failed.';
        if (error.code === 'auth/unauthorized-domain') {
          msg = 'Domain not authorized. Please add "localhost" to Authorized Domains in Firebase Console > Auth > Settings.';
        } else if (error.code === 'auth/operation-not-allowed') {
          msg = 'Google provider is disabled in Firebase. Please enable Google Sign-In under Firebase Console > Auth > Sign-in method.';
        } else if (error.code === 'auth/popup-closed-by-user') {
          msg = 'Google Sign-In popup was closed before completion.';
        } else if (error.code === 'auth/popup-blocked') {
          msg = 'Google Sign-In popup was blocked by your browser. Please allow popups for this site.';
        }
        setAuthError(msg);
        throw new Error(msg);
      }
    } else {
      // Demo Mode Google login helper
      const name = window.prompt("Google Account Name:", currentUser?.displayName || "Google User");
      if (!name) return null;
      const email = window.prompt("Google Email Address:", currentUser?.email || "user@gmail.com");
      if (!email) return null;
      
      const newUid = `google-user-${Date.now()}`;
      const newUser = {
        uid: newUid,
        displayName: name,
        email: email,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=4285F4&color=fff`,
        role: email.includes('admin') ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        isOnline: true,
        deviceInfo: 'Google Account Sign-In'
      };

      const users = getStoredDemoUsers();
      const nextList = [newUser, ...users];
      updateDemoUsersList(nextList);
      switchDemoUser(newUid);
      return newUser;
    }
  };

  // Username/Email + Password Login
  const loginWithEmailPassword = async (emailOrUsername, password) => {
    setAuthError(null);
    if (!emailOrUsername || !password) {
      throw new Error('Please enter username/email and password.');
    }

    if (isFirebaseConfigured && auth) {
      try {
        // Ensure format is email if username passed
        const email = emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@smartalarm.app`;
        const res = await signInWithEmailAndPassword(auth, email, password);
        return res.user;
      } catch (err) {
        console.error('Login error:', err);
        const msg = err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' 
          ? 'Invalid username/email or password.' 
          : err.message;
        setAuthError(msg);
        throw new Error(msg);
      }
    } else {
      // Demo mode lookup or creation
      const users = getStoredDemoUsers();
      let match = users.find(u => 
        u.email.toLowerCase() === emailOrUsername.toLowerCase() || 
        u.displayName.toLowerCase() === emailOrUsername.toLowerCase()
      );

      if (!match) {
        // Auto register in demo mode if credentials provided
        const newUid = `demo-user-${Date.now()}`;
        const name = emailOrUsername.split('@')[0];
        match = {
          uid: newUid,
          displayName: name,
          email: emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@gmail.com`,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
          role: emailOrUsername.includes('admin') ? 'admin' : 'user',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          isOnline: true,
          deviceInfo: 'Web Browser'
        };
        const nextList = [match, ...users];
        updateDemoUsersList(nextList);
      }

      switchDemoUser(match.uid);
      return match;
    }
  };

  // Register with Username, Email & Password
  const registerWithEmailPassword = async (username, email, password) => {
    setAuthError(null);
    if (!username || !email || !password) {
      throw new Error('Please complete all registration fields.');
    }

    if (isFirebaseConfigured && auth) {
      try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await updateProfile(user, { displayName: username });

        // Save to Firestore
        const userRef = doc(db, 'users', user.uid);
        const userRole = email.includes('admin') || username.toLowerCase().includes('admin') ? 'admin' : 'user';
        const userData = {
          uid: user.uid,
          displayName: username,
          email: email,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=fff`,
          role: userRole,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          isOnline: true,
          deviceInfo: 'Desktop Browser'
        };
        await setDoc(userRef, userData);
        return user;
      } catch (err) {
        console.error('Register error:', err);
        const msg = err.code === 'auth/email-already-in-use' ? 'Email address is already registered.' : err.message;
        setAuthError(msg);
        throw new Error(msg);
      }
    } else {
      const users = getStoredDemoUsers();
      const newUid = `demo-user-${Date.now()}`;
      const newUser = {
        uid: newUid,
        displayName: username,
        email: email,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=fff`,
        role: email.includes('admin') || username.toLowerCase().includes('admin') ? 'admin' : 'user',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        isOnline: true,
        deviceInfo: 'Web Browser'
      };

      const nextList = [newUser, ...users];
      updateDemoUsersList(nextList);
      switchDemoUser(newUid);
      return newUser;
    }
  };

  // Demo Switch Account helper (for quick multi-user testing)
  const switchDemoUser = (userId) => {
    const users = getStoredDemoUsers();
    const target = users.find(u => u.uid === userId);
    if (target) {
      localStorage.setItem('sa_active_user_id', target.uid);
      const updated = {
        ...target,
        isOnline: true,
        lastLoginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        isAdmin: target.role === 'admin'
      };
      setCurrentUser(updated);

      const nextList = users.map(u => u.uid === target.uid ? updated : u);
      updateDemoUsersList(nextList);
    }
  };

  // Add custom simulated Google User in Demo Mode
  const addSimulatedGoogleUser = (name, email) => {
    const users = getStoredDemoUsers();
    const newUser = {
      uid: `demo-user-${Date.now()}`,
      displayName: name || 'Google User',
      email: email || `user_${Math.floor(Math.random()*1000)}@gmail.com`,
      photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=3b82f6&color=fff`,
      role: email?.includes('admin') ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      isOnline: true,
      deviceInfo: 'Chrome Browser'
    };

    const nextList = [newUser, ...users];
    updateDemoUsersList(nextList);
    switchDemoUser(newUser.uid);
  };

  // Toggle user admin role (For Admin Page)
  const toggleUserRole = async (targetUid) => {
    if (!currentUser?.isAdmin) return;

    if (isFirebaseConfigured && db) {
      try {
        const userRef = doc(db, 'users', targetUid);
        const targetDoc = await getDoc(userRef);
        if (targetDoc.exists()) {
          const currentRole = targetDoc.data().role;
          const newRole = currentRole === 'admin' ? 'user' : 'admin';
          await updateDoc(userRef, { role: newRole });
        }
      } catch (e) {
        console.error('Failed to update role in Firestore:', e);
      }
    } else {
      const users = getStoredDemoUsers();
      const nextList = users.map(u => {
        if (u.uid === targetUid) {
          const newRole = u.role === 'admin' ? 'user' : 'admin';
          return { ...u, role: newRole };
        }
        return u;
      });
      updateDemoUsersList(nextList);

      if (currentUser.uid === targetUid) {
        const updatedSelf = nextList.find(u => u.uid === targetUid);
        setCurrentUser({ ...updatedSelf, isAdmin: updatedSelf.role === 'admin' });
      }
    }
  };

  // Logout Function
  const logoutUser = async () => {
    if (isFirebaseConfigured && auth) {
      if (currentUser && db) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userRef, { isOnline: false, lastActiveAt: new Date().toISOString() });
        } catch (e) {
          console.warn(e);
        }
      }
      await signOut(auth);
    } else {
      if (currentUser) {
        const users = getStoredDemoUsers();
        const nextList = users.map(u => u.uid === currentUser.uid ? { ...u, isOnline: false } : u);
        updateDemoUsersList(nextList);
      }
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    loading,
    allUsers,
    authError,
    isFirebaseConfigured,
    isAdmin: currentUser?.role === 'admin' || currentUser?.isAdmin,
    loginWithGoogle,
    loginWithEmailPassword,
    registerWithEmailPassword,
    logoutUser,
    switchDemoUser,
    addSimulatedGoogleUser,
    toggleUserRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
