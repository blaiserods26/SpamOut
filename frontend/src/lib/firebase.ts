// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnpLvcB1d2PpwmHBe34xhG2sC52NJGmWk",
  authDomain: "spamout-codebreakers.firebaseapp.com",
  projectId: "spamout-codebreakers",
  storageBucket: "spamout-codebreakers.firebasestorage.app",
  messagingSenderId: "1001890221211",
  appId: "1:1001890221211:web:40beb4c892f770db744a3e",
  measurementId: "G-7MN0JSH1YX",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
