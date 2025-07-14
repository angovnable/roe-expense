// Firebase and logic placeholder
console.log("App.js loaded. Paste Firebase logic here.");
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDZV79Oqv0vO8ssquSr_le1w_Za0vJT6JE",
  authDomain: "roe-expense.firebaseapp.com",
  projectId: "roe-expense",
  storageBucket: "roe-expense.firebasestorage.app",
  messagingSenderId: "1009693087819",
  appId: "1:1009693087819:web:c4e3a256c7ead97a6e15ce",
  measurementId: "G-6YFC12KCFJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
