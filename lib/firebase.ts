import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAOSGD-OCXXckiDUME1oqHKrhq68Ix2w8Q",
  authDomain: "nip-chip-order-app.firebaseapp.com",
  projectId: "nip-chip-order-app",
  storageBucket: "nip-chip-order-app.firebasestorage.app",
  messagingSenderId: "290430572391",
  appId: "1:290430572391:web:0a73c4291ac488857841c2",
  measurementId: "G-C2X10G0G8S"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
