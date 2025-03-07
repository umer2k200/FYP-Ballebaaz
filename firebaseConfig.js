// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import {getAuth} from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCh2W2kywxf5PL1Mm7rEaTNnaaSIdFxWqY",
  authDomain: "ballebaaz-74803.firebaseapp.com",
  projectId: "ballebaaz-74803",
  storageBucket: "ballebaaz-74803.appspot.com",
  messagingSenderId: "123796617820",
  appId: "1:123796617820:web:3f8da698be150016104499",
  measurementId: "G-PXCFT158K0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
isSupported().then((supported) => {
    if (supported) {
      const analytics = getAnalytics(app);
    }
  });

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };