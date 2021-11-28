import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"
import { FIREBASE_API_KEY, FIREBASE_APP_ID } from "@env"

const firebaseConfig = {
    apiKey: FIREBASE_API_KEY,
    authDomain: "tinder-clone-f1922.firebaseapp.com",
    projectId: "tinder-clone-f1922",
    storageBucket: "tinder-clone-f1922.appspot.com",
    messagingSenderId: "842889152518",
    appId: FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

export { auth, db, storage }