import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDQ2CcJsizO6vBOIn4HME4KDqBpIj9WWDw",
    authDomain: "test-4a6f3.firebaseapp.com",
    projectId: "test-4a6f3",
    storageBucket: "test-4a6f3.appspot.com",
    messagingSenderId: "858204908745",
    appId: "1:858204908745:web:5ead316bb955b3120db118"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a Firestore reference
const db = getFirestore(app);

// Leader profile editing writes to Firestore/Storage straight from the browser, so it needs
// a Firebase identity: boc-server mints a custom token whose uid is the BOC user id, and the
// Storage rules scope uploads to LeaderPhotos/<uid>/. See our-team/leaderAuth.ts.
export const auth = getAuth(app);
export const storage = getStorage(app);

export default db;
