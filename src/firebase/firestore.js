import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { db } from './config';

export const addDocument = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const setDocument = async (collectionName, docId, data) => {
  try {
    await setDoc(doc(db, collectionName, docId), {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() }, error: null };
    }
    return { data: null, error: 'Document not found' };
  } catch (error) {
    return { data: null, error: error.message };
  }
};

export const getDocuments = async (collectionName, conditions = []) => {
  try {
    let q = collection(db, collectionName);

    if (conditions.length > 0) {
      const constraints = conditions.map(condition => {
        if (condition.type === 'where') {
          return where(condition.field, condition.operator, condition.value);
        } else if (condition.type === 'orderBy') {
          return orderBy(condition.field, condition.direction || 'asc');
        }
        return null;
      }).filter(Boolean);

      q = query(q, ...constraints);
    }

    const querySnapshot = await getDocs(q);
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    return { data: documents, error: null };
  } catch (error) {
    return { data: [], error: error.message };
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId));
    return { error: null };
  } catch (error) {
    return { error: error.message };
  }
};

export const subscribeToDocument = (collectionName, docId, callback) => {
  const docRef = doc(db, collectionName, docId);
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    } else {
      callback(null);
    }
  });
};

export const subscribeToCollection = (collectionName, conditions = [], callback) => {
  let q = collection(db, collectionName);

  if (conditions.length > 0) {
    const constraints = conditions.map(condition => {
      if (condition.type === 'where') {
        return where(condition.field, condition.operator, condition.value);
      } else if (condition.type === 'orderBy') {
        return orderBy(condition.field, condition.direction || 'asc');
      }
      return null;
    }).filter(Boolean);

    q = query(q, ...constraints);
  }

  return onSnapshot(q, (querySnapshot) => {
    const documents = [];
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });
    callback(documents);
  });
};
