import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyCV5Mn6BZXmA1dvshbBRCJ7zqT7lcZzMp4",
    authDomain: "streakmaster-app.firebaseapp.com",
    projectId: "streakmaster-app",
    storageBucket: "streakmaster-app.firebasestorage.app",
    messagingSenderId: "812773039515",
    appId: "1:812773039515:web:e70a541b6499dc1bb5553e",
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;

// Connect to emulators in development
if (window.location.hostname === "localhost") {
  connectFirestoreEmulator(db, "localhost", 8080);
  connectAuthEmulator(auth, "http://localhost:9099");
}