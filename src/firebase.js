import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your exact Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDe-KiS3uWSoqYKftPamRwY5I4QK0pheAM",
  authDomain: "crit-finder-ver.firebaseapp.com",
  projectId: "crit-finder-ver",
  storageBucket: "crit-finder-ver.firebasestorage.app",
  messagingSenderId: "882056806702",
  appId: "1:882056806702:web:1e93a4a46d2d670c1ebabf",
  measurementId: "G-3H2Z1SL1NG"
};

// 1. Initialize the core Firebase App
const app = initializeApp(firebaseConfig);

// 2. Initialize and export Auth and Firestore so our pages can use them!
export const auth = getAuth(app);
export const db = getFirestore(app);

// 3. Set up the Google Login Provider
const googleProvider = new GoogleAuthProvider();

// 4. Create and export the login helper function
export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Error signing in with Google:", error);
    throw error;
  }
};

// 5. Create and export the logout helper function
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
};