import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Parse stored or environment Firebase configuration
const getStoredFirebaseConfig = () => {
  try {
    const customConfig = localStorage.getItem('sa_firebase_config');
    if (customConfig) {
      const parsed = JSON.parse(customConfig);
      if (parsed.apiKey && parsed.apiKey !== 'YOUR_FIREBASE_API_KEY') {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored Firebase config', e);
  }

  const envConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  if (envConfig.apiKey && envConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' && envConfig.projectId) {
    return envConfig;
  }

  return null;
};

const firebaseConfig = getStoredFirebaseConfig();

let app = null;
let auth = null;
let db = null;
let googleProvider = null;
let isFirebaseConfigured = false;

if (firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY') {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    isFirebaseConfigured = true;
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
  }
}

export { 
  app, 
  auth, 
  db, 
  googleProvider, 
  isFirebaseConfigured, 
  signInWithPopup, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
};

// Smart Helper to parse pasted Firebase config string or object
export const saveFirebaseCredentials = (config) => {
  if (typeof config === 'string') {
    try {
      // Extract key-value pairs if user pasted JS object snippet
      const apiKeyMatch = config.match(/apiKey:\s*["']([^"']+)["']/);
      const authDomainMatch = config.match(/authDomain:\s*["']([^"']+)["']/);
      const projectIdMatch = config.match(/projectId:\s*["']([^"']+)["']/);
      const storageBucketMatch = config.match(/storageBucket:\s*["']([^"']+)["']/);
      const messagingSenderIdMatch = config.match(/messagingSenderId:\s*["']([^"']+)["']/);
      const appIdMatch = config.match(/appId:\s*["']([^"']+)["']/);

      if (apiKeyMatch && projectIdMatch) {
        const parsedConfig = {
          apiKey: apiKeyMatch[1],
          authDomain: authDomainMatch ? authDomainMatch[1] : `${projectIdMatch[1]}.firebaseapp.com`,
          projectId: projectIdMatch[1],
          storageBucket: storageBucketMatch ? storageBucketMatch[1] : `${projectIdMatch[1]}.appspot.com`,
          messagingSenderId: messagingSenderIdMatch ? messagingSenderIdMatch[1] : '',
          appId: appIdMatch ? appIdMatch[1] : ''
        };
        localStorage.setItem('sa_firebase_config', JSON.stringify(parsedConfig));
        window.location.reload();
        return true;
      }
    } catch (e) {
      console.error('Pasted config parse error:', e);
    }
  }

  // Fallback direct object save
  localStorage.setItem('sa_firebase_config', JSON.stringify(config));
  window.location.reload();
  return true;
};

export const clearFirebaseCredentials = () => {
  localStorage.removeItem('sa_firebase_config');
  window.location.reload();
};
