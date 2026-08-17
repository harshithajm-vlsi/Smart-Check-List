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
  deleteDoc,
  onSnapshot, 
  collection, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

const MAIN_ADMIN_EMAIL = 'harshithajm70@gmail.com';

const INITIAL_DEMO_USERS = [
  {
    uid: 'owner-admin-harshitha',
    displayName: 'Harshitha',
    email: 'harshithajm70@gmail.com',
    photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'owner',
    gender: 'Female',
    bio: 'System Owner & Main Administrator 👑 | Full Platform Control',
    isDemo: false,
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
    gender: 'Male',
    bio: 'Stay hungry, stay foolish 🚀',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    lastLoginAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    lastActiveAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    isOnline: true,
    deviceInfo: 'Safari on macOS',
  }
];

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);
  const [authError, setAuthError] = useState(null);

  // Clear legacy saved accounts caches
  useEffect(() => {
    try {
      localStorage.removeItem('sa_remembered_accounts_v1');
      localStorage.removeItem('sa_active_user_id');
    } catch (e) {}
  }, []);

  // Sync users list for admin management
  const getStoredDemoUsers = () => {
    try {
      const stored = localStorage.getItem('sa_demo_users_v2');
      if (stored) {
        const parsed = JSON.parse(stored);
        const ownerExists = parsed.some(u => u.email?.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase());
        if (ownerExists) return parsed;
      }
    } catch (e) {}
    localStorage.setItem('sa_demo_users_v2', JSON.stringify(INITIAL_DEMO_USERS));
    return INITIAL_DEMO_USERS;
  };

  const updateDemoUsersList = (users) => {
    const uniqueMap = new Map();
    users.forEach(u => {
      if (u.email) {
        if (u.email.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase()) {
          uniqueMap.set(MAIN_ADMIN_EMAIL.toLowerCase(), { ...u, displayName: 'Harshitha', role: 'owner' });
        } else if (!uniqueMap.has(u.email.toLowerCase())) {
          uniqueMap.set(u.email.toLowerCase(), u);
        }
      }
    });
    const uniqueList = Array.from(uniqueMap.values());
    setAllUsers(uniqueList);
    localStorage.setItem('sa_demo_users_v2', JSON.stringify(uniqueList));
  };

  // Firebase Auth Observer (Source of Truth)
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
        if (user) {
          const isMainAdmin = user.email?.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase();
          const userRef = doc(db, 'users', user.uid);
          const snap = await getDoc(userRef);

          let userRole = isMainAdmin ? 'owner' : (snap.exists() ? snap.data().role || 'user' : 'user');
          let displayName = isMainAdmin ? 'Harshitha' : (user.displayName || user.email?.split('@')[0] || 'User');

          const userData = {
            uid: user.uid,
            displayName,
            email: user.email,
            photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=6366f1&color=fff`,
            role: userRole,
            isDemo: false,
            lastLoginAt: new Date().toISOString(),
            lastActiveAt: new Date().toISOString(),
            isOnline: true,
            deviceInfo: navigator.userAgent.includes('Mobile') ? 'Mobile Browser' : 'Desktop Browser'
          };

          if (!snap.exists()) {
            userData.createdAt = new Date().toISOString();
          } else if (snap.data().createdAt) {
            userData.createdAt = snap.data().createdAt;
          }

          await setDoc(userRef, userData, { merge: true });
          const finalUser = { ...userData, isAdmin: userRole === 'admin' || userRole === 'owner' };
          setCurrentUser(finalUser);
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });

      const usersQuery = query(collection(db, 'users'), orderBy('lastActiveAt', 'desc'));
      const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
        const usersList = snapshot.docs.map(doc => doc.data());
        updateDemoUsersList(usersList);
      }, (err) => {
        console.warn('Firestore users sync notice:', err);
      });

      return () => {
        unsubscribeAuth();
        unsubscribeUsers();
      };
    } else {
      const demoUsers = getStoredDemoUsers();
      updateDemoUsersList(demoUsers);
      setCurrentUser(null);
      setLoading(false);
    }
  }, [isFirebaseConfigured]);

  // Google Sign-In
  const loginWithGoogle = async () => {
    setAuthError(null);
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
      } catch (error) {
        console.error('Google Sign-In Error:', error);
        let msg = error.message || 'Google Sign-In failed.';
        setAuthError(msg);
        throw new Error(msg);
      }
    } else {
      const name = window.prompt("Google Account Name:", "Harshitha");
      if (!name) return null;
      const email = window.prompt("Google Email Address:", MAIN_ADMIN_EMAIL);
      if (!email) return null;
      
      const isMainAdmin = email.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase();
      const existingUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

      const newUser = existingUser ? {
        ...existingUser,
        lastLoginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        isOnline: true
      } : {
        uid: isMainAdmin ? 'owner-admin-harshitha' : `google-user-${Date.now()}`,
        displayName: isMainAdmin ? 'Harshitha' : name,
        email: email,
        photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(isMainAdmin ? 'Harshitha' : name)}&background=4285F4&color=fff`,
        role: isMainAdmin ? 'owner' : 'user',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        isOnline: true,
        deviceInfo: 'Google Sign-In'
      };

      const users = getStoredDemoUsers();
      updateDemoUsersList([newUser, ...users.filter(u => u.email.toLowerCase() !== email.toLowerCase())]);
      setCurrentUser({ ...newUser, isAdmin: newUser.role === 'admin' || newUser.role === 'owner' });
      return newUser;
    }
  };

  // Login with Email & Password
  const loginWithEmailPassword = async (emailOrUsername, password) => {
    setAuthError(null);
    if (!emailOrUsername || !password) {
      throw new Error('Please enter your email and password.');
    }

    const email = emailOrUsername.includes('@') ? emailOrUsername.trim() : `${emailOrUsername.trim()}@gmail.com`;

    if (isFirebaseConfigured && auth) {
      try {
        const res = await signInWithEmailAndPassword(auth, email, password);
        return res.user;
      } catch (err) {
        console.error('Login error:', err);
        const msg = err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' 
          ? 'Invalid email or password.' 
          : err.message;
        setAuthError(msg);
        throw new Error(msg);
      }
    } else {
      const users = getStoredDemoUsers();
      let match = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!match) {
        const isMainAdmin = email.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase();
        const newUid = isMainAdmin ? 'owner-admin-harshitha' : `demo-user-${Date.now()}`;
        const name = isMainAdmin ? 'Harshitha' : email.split('@')[0];
        match = {
          uid: newUid,
          displayName: name,
          email: email,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`,
          role: isMainAdmin ? 'owner' : 'user',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          isOnline: true,
          deviceInfo: 'Web Browser'
        };
        updateDemoUsersList([match, ...users.filter(u => u.email.toLowerCase() !== email.toLowerCase())]);
      }

      const activeUser = { ...match, isOnline: true, isAdmin: match.role === 'admin' || match.role === 'owner' };
      setCurrentUser(activeUser);
      return activeUser;
    }
  };

  // Register with Email & Password (Strict Unique Email Check)
  const registerWithEmailPassword = async (username, email, password, photoBase64 = null) => {
    setAuthError(null);
    if (!username || !email || !password) {
      throw new Error('Please complete all registration fields.');
    }

    const cleanEmail = email.trim().toLowerCase();

    const existing = allUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      const msg = `An account with email "${cleanEmail}" already exists. Please log in instead.`;
      setAuthError(msg);
      throw new Error(msg);
    }

    if (isFirebaseConfigured && auth) {
      try {
        const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const user = res.user;
        const photoURL = photoBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=fff`;

        await updateProfile(user, { displayName: username, photoURL });

        const isMainAdmin = cleanEmail === MAIN_ADMIN_EMAIL.toLowerCase();
        const userRole = isMainAdmin ? 'owner' : 'user';
        const userData = {
          uid: user.uid,
          displayName: isMainAdmin ? 'Harshitha' : username,
          email: cleanEmail,
          photoURL,
          role: userRole,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          isOnline: true,
          deviceInfo: 'Desktop Browser'
        };
        await setDoc(doc(db, 'users', user.uid), userData);
        return user;
      } catch (err) {
        console.error('Register error:', err);
        const msg = err.code === 'auth/email-already-in-use' 
          ? `An account with email "${cleanEmail}" is already registered. Please log in.` 
          : err.message;
        setAuthError(msg);
        throw new Error(msg);
      }
    } else {
      const isMainAdmin = cleanEmail === MAIN_ADMIN_EMAIL.toLowerCase();
      const newUid = isMainAdmin ? 'owner-admin-harshitha' : `demo-user-${Date.now()}`;
      const newUser = {
        uid: newUid,
        displayName: isMainAdmin ? 'Harshitha' : username,
        email: cleanEmail,
        photoURL: photoBase64 || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=6366f1&color=fff`,
        role: isMainAdmin ? 'owner' : 'user',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        isOnline: true,
        deviceInfo: 'Web Browser'
      };

      const users = getStoredDemoUsers();
      updateDemoUsersList([newUser, ...users.filter(u => u.email.toLowerCase() !== cleanEmail)]);
      setCurrentUser({ ...newUser, isAdmin: newUser.role === 'admin' || newUser.role === 'owner' });
      return newUser;
    }
  };

  // Update Profile
  const updateUserProfile = async ({ displayName, photoURL, bio, gender }) => {
    if (!currentUser) return;
    const isMainAdmin = currentUser.email?.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase();

    const updatedUser = {
      ...currentUser,
      displayName: isMainAdmin ? 'Harshitha' : (displayName !== undefined ? displayName : currentUser.displayName),
      ...(photoURL !== undefined && { photoURL }),
      ...(bio !== undefined && { bio }),
      ...(gender !== undefined && { gender }),
    };

    setCurrentUser(updatedUser);

    if (isFirebaseConfigured && db && auth?.currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          displayName: updatedUser.displayName,
          ...(photoURL !== undefined && { photoURL }),
          ...(bio !== undefined && { bio }),
          ...(gender !== undefined && { gender }),
        });
      } catch (e) {
        console.error('Failed to update Firestore profile:', e);
      }
    } else {
      const users = getStoredDemoUsers();
      updateDemoUsersList(users.map(u => u.uid === currentUser.uid ? updatedUser : u));
    }
  };

  // Logout current user session
  const logoutUser = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    if (currentUser) {
      const users = getStoredDemoUsers();
      updateDemoUsersList(users.map(u => u.uid === currentUser.uid ? { ...u, isOnline: false } : u));
    }
    setCurrentUser(null);
  };

  const isUserAdmin = 
    currentUser?.role === 'admin' || 
    currentUser?.role === 'owner' || 
    currentUser?.email?.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase() || 
    currentUser?.isAdmin;

  // Delete user account function (Main Admin action)
  const deleteUserAccount = async (targetUid) => {
    if (!isUserAdmin) {
      alert('Only Administrators can delete users.');
      return false;
    }

    const targetUser = allUsers.find(u => u.uid === targetUid);
    if (targetUser?.email?.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase() || targetUser?.role === 'owner') {
      alert('The Main System Owner account is protected and cannot be deleted.');
      return false;
    }

    if (!window.confirm(`Are you sure you want to delete user "${targetUser?.displayName || targetUid}"?`)) {
      return false;
    }

    if (isFirebaseConfigured && db) {
      try {
        await deleteDoc(doc(db, 'users', targetUid));
      } catch (err) {
        console.error('Failed to delete Firestore user:', err);
      }
    }

    const users = getStoredDemoUsers().filter(u => u.uid !== targetUid);
    updateDemoUsersList(users);

    if (currentUser?.uid === targetUid) {
      logoutUser();
    }
    return true;
  };

  const value = {
    currentUser,
    loading,
    allUsers,
    authError,
    rememberedAccounts: [],
    isFirebaseConfigured,
    isAdmin: isUserAdmin,
    isOwner: currentUser?.role === 'owner' || currentUser?.email?.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase(),
    loginWithGoogle,
    loginWithEmailPassword,
    registerWithEmailPassword,
    updateUserProfile,
    logoutUser,
    deleteUserAccount
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
