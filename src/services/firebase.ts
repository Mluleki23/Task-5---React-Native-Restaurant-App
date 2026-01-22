import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyD6ueyXNssz1habWDD51lZ4wuGbivlcRy0",
  authDomain: "foodapp-a3cf8.firebaseapp.com",
  projectId: "foodapp-a3cf8",
  storageBucket: "foodapp-a3cf8.firebasestorage.app",
  messagingSenderId: "941175823113",
  appId: "1:941175823113:web:ae1a28f53d60ff906cd1d8",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
