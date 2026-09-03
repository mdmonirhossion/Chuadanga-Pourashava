import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAvvl5foVriZPb9abrIT7oaSFTOFDht5GI",
  authDomain: "chuadanga-pourashava-store.firebaseapp.com",
  projectId: "chuadanga-pourashava-store",
  storageBucket: "chuadanga-pourashava-store.firebasestorage.app",
  messagingSenderId: "1056993561695",
  appId: "1:1056993561695:web:5d87c5d98530edea31dfea",
  measurementId: "G-QZ6TFDQ63R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let analytics = null;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (e) {
    console.log("Firebase analytics un supported", e);
  }
}

export { app, auth, googleProvider, signInWithPopup, analytics };
