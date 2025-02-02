import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyC3x7tkeasBs7InU43phu9zC-lrNBPfpB0",
    authDomain: "test-4a6f3.firebaseapp.com",
    projectId: "test-4a6f3",
    storageBucket: "test-4a6f3.appspot.com",
    messagingSenderId: "858204908745",
    appId: "1:858204908745:web:c7e971437286ccb20db118"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a Firestore reference
const db = getFirestore(app);

export default db;
