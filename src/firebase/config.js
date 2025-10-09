import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
const firebaseConfig = {
apiKey: "AIzaSyAaKzPcw-PUnc6sfTJ4gxWGVqTHpPjKAMw",
authDomain: "order.tasteoftown.in",
projectId: "tasteoftowndelivery",
storageBucket: "tasteoftowndelivery.firebasestorage.app",
messagingSenderId: "359575199115",
appId: "1:359575199115:web:21afa375ab832d0b5e238e",
measurementId: "G-9C0ESVF2KH"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
