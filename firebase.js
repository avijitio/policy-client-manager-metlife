// ================================================================
// firebase.js — Firebase Configuration
// আপনার Firebase Console থেকে config values এখানে বসান
// ================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCaXBcKzbe8wPrIbnZK8BnuoOAGAckObYs",
  authDomain: "policyclientmanager.firebaseapp.com",
  projectId: "policyclientmanager",
  storageBucket: "policyclientmanager.firebasestorage.app",
  messagingSenderId: "219890597440",
  appId: "1:219890597440:web:07343fa94e2a6a1c45a9a5",
  measurementId: "G-4NGSSVMTHG"
};

// Firebase Initialize
firebase.initializeApp(firebaseConfig);

// Services
const auth = firebase.auth();
const db = firebase.firestore();
// Storage: ImgBB ব্যবহার করা হচ্ছে (Firebase Storage এর পরিবর্তে)
