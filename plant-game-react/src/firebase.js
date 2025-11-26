import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAKvyD0SV7kUX5UciilZ0bk2F08wkf0T7g",
    authDomain: "planttycoon-c9dc0.firebaseapp.com",
    projectId: "planttycoon-c9dc0",
    storageBucket: "planttycoon-c9dc0.firebasestorage.app",
    messagingSenderId: "49910703062",
    appId: "1:49910703062:web:60c410e51c98714f3bfa77",
    measurementId: "G-NY5W0YD0SX"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Logout failed:", error);
        throw error;
    }
};

export const saveGameData = async (userId, data) => {
    try {
        await setDoc(doc(db, "users", userId), {
            savedAt: new Date().toISOString(),
            gameData: data
        });
        return true;
    } catch (error) {
        console.error("Save failed:", error);
        return false;
    }
};

export const loadGameData = async (userId) => {
    try {
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().gameData;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Load failed:", error);
        throw error;
    }
};
