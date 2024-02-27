// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "mern-blog-1651d.firebaseapp.com",
  projectId: "mern-blog-1651d",
  storageBucket: "mern-blog-1651d.appspot.com",
  messagingSenderId: "657233597529",
  appId: "1:657233597529:web:2a79d99c0b30ae6cdfcd48",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
