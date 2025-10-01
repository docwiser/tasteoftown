import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCCb3DBvvgosNbPB0SPHJYkmTIt1RqHYDw",
  authDomain: "fareboard.onrender.com",
  databaseURL: "https://accessible-games-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "accessible-games",
  storageBucket: "accessible-games.firebasestorage.app",
  messagingSenderId: "741987481016",
  appId: "1:741987481016:web:ae5601b69d7cb22c5ccb4d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
